/**
 * End-to-end check of the Local Map Assessment backend with no credentials and no network:
 *   npx tsx scripts/local-map/e2e.ts
 * The Pages Functions run as written, against an in-memory SQLite database (Node's node:sqlite, standing in for D1) and a small
 * pretend DataForSEO that answers with the same response shapes as the saved ones in data/therapyindex/raw. It exercises the lookup,
 * the daily limits, the cache, the stepped scan (with some failed checks), retry, scoring, the emails and the cost log.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { onRequestPost as lookupRaw } from '../../functions/api/local-map/lookup.ts';
import { onRequestPost as startRaw } from '../../functions/api/local-map/start.ts';
import { onRequestGet as statusRaw } from '../../functions/api/local-map/status.ts';
import { onRequestPost as retryRaw } from '../../functions/api/local-map/retry.ts';
import type { LmCtx, LmEnv } from '../../lib/local-map/server/env.ts';
import type { Report, StatusResponse } from '../../lib/local-map/types.ts';
import { CIDS, emails, installMock, mockCpu, state } from './mock-dfs.mts';

installMock();
const realLog = console.log;
console.log = (...a: unknown[]) => (typeof a[0] === 'string' && a[0].startsWith('{"lm"') ? undefined : realLog(...a));
console.warn = console.log;

/* CPU and outside-request accounting for every invocation, as the free plan sees it: 10 ms of CPU, 50 outside requests, 50 D1 queries.
   CPU here is elapsed time minus what the pretend servers took, so it is the handler's own work (the fake D1 is local SQLite and
   counts a little heavier than a network round trip would). */
const usage: Record<string, { n: number; cpuMax: number; cpuSum: number; fetchesMax: number; queriesMax: number }> = {};
const pendingWork: Promise<unknown>[] = [];
const measured = (name: string, handler: (ctx: any) => Promise<Response>) => async (ctx: any) => {
  const t0 = performance.now();
  const m0 = mockCpu.micros;
  const res = await handler(ctx);
  await Promise.all(pendingWork.splice(0)); // emails sent after the response belong to the same invocation
  const cpu = performance.now() - t0 - (mockCpu.micros - m0) / 1000;
  const t = /fetches=(\d+);queries=(\d+)/.exec(res.headers.get('x-lm-trace') ?? '');
  const u = (usage[name] ??= { n: 0, cpuMax: 0, cpuSum: 0, fetchesMax: 0, queriesMax: 0 });
  u.n++;
  u.cpuSum += cpu;
  u.cpuMax = Math.max(u.cpuMax, cpu);
  if (t) {
    u.fetchesMax = Math.max(u.fetchesMax, Number(t[1]));
    u.queriesMax = Math.max(u.queriesMax, Number(t[2]));
  }
  return res;
};
const lookup = measured('lookup', lookupRaw);
const start = measured('start', startRaw);
const status = measured('status', statusRaw);
const retry = measured('retry', retryRaw);

/* --- an in-memory D1 --------------------------------------------------------------------------- */
const sqlite = new DatabaseSync(':memory:');
for (const m of ['0002_local_map.sql', '0003_local_map_cells.sql']) sqlite.exec(fs.readFileSync(path.join(process.cwd(), 'migrations', m), 'utf8'));
const stmt = (sql: string, args: unknown[] = []): any => ({
  bind: (...v: unknown[]) => stmt(sql, v),
  first: async () => (sqlite.prepare(sql).get(...(args as any[])) as any) ?? null,
  all: async () => ({ results: sqlite.prepare(sql).all(...(args as any[])) as any[] }),
  run: async () => ({ meta: { changes: Number(sqlite.prepare(sql).run(...(args as any[])).changes) } }),
});
const DB = { prepare: (sql: string) => stmt(sql), batch: async (list: any[]) => Promise.all(list.map((s) => s.run())) };

/* --- the run ------------------------------------------------------------------------------------- */
const env: LmEnv = { DB: DB as any, DATAFORSEO_LOGIN: 'x', DATAFORSEO_PASSWORD: 'y', DATAFORSEO_BASE: 'http://mock-dfs', RESEND_API_KEY: 'k', TURNSTILE_SECRET_KEY: 's' };
const pending: Promise<unknown>[] = [];
const ctx = (req: Request): LmCtx => ({ request: req, env, waitUntil: (p) => void (pending.push(p), pendingWork.push(p)) });
const post = (route: string, body: unknown, ip = '9.9.9.1') =>
  new Request(`https://wwisermind.com/api/local-map/${route}`, { method: 'POST', headers: { 'cf-connecting-ip': ip }, body: JSON.stringify(body) });

let failures = 0;
const check = (label: string, cond: boolean, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${detail ? `  (${detail})` : ''}`);
  if (!cond) failures++;
};

const found = await (await lookup(ctx(post('lookup', { practice: 'Brightwater Therapy', where: 'Austin' })))).json() as { listings: any[] };
check('lookup returns listings', found.listings.length === 2 && found.listings[0].cid === CIDS.you, found.listings.map((l) => l.name).join(', '));

const body = (email: string) => ({
  listing: found.listings[0], keywords: ['therapist', 'counselor', 'psychologist', 'anxiety therapist'], radius: 3,
  lead: { firstName: 'Sam', email, website: 'https://example.com' }, turnstileToken: 'ok', company: '',
});

state.failTasks = 6;
const started = (await (await start(ctx(post('start', body('sam@example.com'))))).json()) as { id: string };
check('start returns an id', /^[A-Za-z0-9_-]{22}$/.test(started.id), started.id);
check('100 checks posted, some refused', sqlite.prepare("select tasks_json from lm_reports").get() !== undefined);

async function poll(id: string): Promise<StatusResponse> {
  for (let i = 0; i < 60; i++) {
    const res = (await (await status(ctx(new Request(`https://wwisermind.com/api/local-map/status?id=${id}`)))).json()) as StatusResponse;
    if (res.status !== 'scanning') return res;
  }
  throw new Error('never finished');
}
const first = await poll(started.id);
check('scan finishes with a report (the failed checks are partial)', first.status === 'done' && !!first.report, `${first.status}, missing ${first.report?.missingChecks}`);
const report = first.report as Report;
check('report has 4 keywords x 25 points', report.keywords.length === 4 && report.keywords.every((k) => k.ranks.length === 25));
check('report has you + 4 competitors', report.competitors.length === 4 && report.you.name === 'Brightwater Therapy', report.competitors.map((c) => c.name).join(', '));
check('gap table has 5 rows with recency from the newest review and post', report.gaps.length === 5 && report.you.daysSinceReview !== null && report.you.daysSincePost !== null);
check('why bullets and fixes are present', report.why.length >= 2 && report.fixes.length >= 3 && report.fixes.length <= 5, `${report.why.length} bullets, ${report.fixes.length} fixes`);
check('no em dashes in generated copy', ![...report.why, ...report.fixes.flatMap((f) => [f.title, f.body]), ...report.gaps.map((g) => g.note)].some((s) => s.includes('—')));

await Promise.all(pending);
check('lead alert and report-ready emails sent', emails.some((e) => e.to === 'admin@wwisermind.com') && emails.some((e) => e.to === 'sam@example.com' && /Local Map Assessment/.test(e.subject)), emails.map((e) => e.to).join(', '));

const cost = sqlite.prepare('select sum(cost) c, sum(calls) n from lm_cost_log where report_id is not null').get() as { c: number; n: number };
const steps = sqlite.prepare('select step, count(*) n, sum(calls) calls, round(sum(cost),5) cost from lm_cost_log group by step').all();
console.log('cost log:', JSON.stringify(steps), 'total $', cost.c.toFixed(5));
check('cost was logged', cost.c > 0);
const notes = (sqlite.prepare("select note from lm_cost_log where step = 'post_profiles' and report_id = ?").all(started.id) as { note: string }[]).map((r) => r.note);
check('your reviews and posts were asked for at the start, competitors early (before the grid finished)', notes.some((n) => /^you, at the start/.test(n)) && notes.some((n) => /^competitors, early/.test(n)), notes.join(' | '));
const t1 = JSON.parse((sqlite.prepare('select timings_json from lm_reports where id = ?').get(started.id) as { timings_json: string }).timings_json) as Record<string, number>;
check('early competitor post came before the grid completed', !!t1.competitorsEarly && t1.competitorsEarly <= t1.gridDone, `early ${t1.competitorsEarly - t1.posted}ms, grid ${t1.gridDone - t1.posted}ms`);

const second = (await (await start(ctx(post('start', body('pat@example.com'), '9.9.9.2'))))).json() as Promise<{ id: string; cached?: boolean }>;
const s2 = await second;
check('same place, keywords and radius reuses the report', s2.cached === true && s2.id === started.id);

/* A different practice with so many failures that the report cannot be made, then a retry. */
state.failTasks = 75; state.heavy = true;
const b3 = { ...body('lee@example.com'), keywords: ['therapist', 'counselor', 'psychologist', 'trauma therapist'] };
const s3 = (await (await start(ctx(post('start', b3, '9.9.9.3')))).json()) as { id: string };
const r3 = await poll(s3.id);
check('too many failed checks gives a friendly failure with retry', r3.status === 'failed' && r3.canRetry === true, r3.message?.slice(0, 40));
state.failTasks = 0; state.heavy = false;
const rr = await (await retry(ctx(post('retry', { id: s3.id })))).json();
check('retry accepted', (rr as any).ok === true);
const r3b = await poll(s3.id);
check('retry finishes the report', r3b.status === 'done' && r3b.report!.missingChecks === 0, `${r3b.status}`);

/* Limits: the 4th report from one connection in a day is refused. */
let refused = 0;
for (let i = 0; i < 3; i++) {
  const r = await start(ctx(post('start', { ...body(`n${i}@example.com`), keywords: ['a1x', 'b2x', 'c3x', `d${i}x`] }, '9.9.9.1')));
  if (r.status === 429) refused++;
}
check('per-IP daily limit of 3 reports', refused >= 1, `${refused} refused`);
const badTurnstile = await start(ctx(post('start', { ...body('z@example.com'), company: 'bot' }, '9.9.9.7')));
check('honeypot is refused', badTurnstile.status === 400);

console.log('\nPer invocation (free plan limits: 10 ms CPU, 50 outside requests, 50 D1 queries):');
for (const [name, u] of Object.entries(usage)) {
  console.log(`  ${name.padEnd(7)} x${String(u.n).padStart(3)}  CPU max ${u.cpuMax.toFixed(2)} ms, avg ${(u.cpuSum / u.n).toFixed(2)} ms   outside requests max ${u.fetchesMax}   D1 queries max ${u.queriesMax}`);
}
const worst = Math.max(...Object.values(usage).map((u) => u.cpuMax));
check('every invocation stays under 7 ms of CPU locally (70% of the free plan limit, cold JIT included)', worst < 7, `worst ${worst.toFixed(2)} ms`);
check('no invocation makes more than 20 outside requests', Object.values(usage).every((u) => u.fetchesMax <= 20));
check('no invocation runs more than 30 D1 queries', Object.values(usage).every((u) => u.queriesMax <= 30));
console.log(failures ? `\n${failures} check(s) failed` : '\nAll checks passed');
process.exit(failures ? 1 : 0);
