/**
 * One real report against the live DataForSEO API, for checking the endpoints and the true cost:
 *   npx tsx scripts/local-map/smoke.mts "Practice name" "City or ZIP"
 * Reads DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD from .env.local. Runs the real pipeline over an in-memory SQLite database; sends no email.
 * Spends real money (about $0.077 at standard priority). Prints timing, the cost log and a short look at any endpoint that failed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { liveMapsSearch } from '../../lib/local-map/server/dfs.ts';
import type { LmEnv } from '../../lib/local-map/server/env.ts';
import { toListing } from '../../lib/local-map/server/parse.ts';
import { loadStatus, startScan } from '../../lib/local-map/server/pipeline.ts';
import { defaultKeywords } from '../../lib/local-map/rules.ts';

const [practice = 'Brightwater Therapy', where = 'Austin TX'] = process.argv.slice(2);

const dotenv = Object.fromEntries(
  fs.readFileSync('.env.local', 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
);
if (!dotenv.DATAFORSEO_LOGIN || !dotenv.DATAFORSEO_PASSWORD) throw new Error('DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD missing from .env.local');

const sqlite = new DatabaseSync(':memory:');
sqlite.exec(fs.readFileSync(path.join(process.cwd(), 'migrations', '0002_local_map.sql'), 'utf8'));
const stmt = (sql: string, args: unknown[] = []): any => ({
  bind: (...v: unknown[]) => stmt(sql, v),
  first: async () => (sqlite.prepare(sql).get(...(args as any[])) as any) ?? null,
  all: async () => ({ results: sqlite.prepare(sql).all(...(args as any[])) as any[] }),
  run: async () => ({ meta: { changes: Number(sqlite.prepare(sql).run(...(args as any[])).changes) } }),
});
const env: LmEnv = {
  DB: { prepare: (sql: string) => stmt(sql), batch: async (list: any[]) => Promise.all(list.map((s) => s.run())) } as any,
  DATAFORSEO_LOGIN: dotenv.DATAFORSEO_LOGIN,
  DATAFORSEO_PASSWORD: dotenv.DATAFORSEO_PASSWORD,
};

/* Watch the reviews and posts endpoints (the ones not checked against real responses): print the status and a short body, once each. */
const realFetch = globalThis.fetch;
const shown = new Set<string>();
globalThis.fetch = (async (input: any, init?: any) => {
  const res = await realFetch(input, init);
  const url = String(input?.url ?? input).replace('https://api.dataforseo.com/v3/', '');
  const kind = /reviews|my_business_updates/.test(url) ? url.replace(/\/[a-z0-9-]{20,}$/i, '/<id>') : '';
  if (kind && !shown.has(kind)) {
    shown.add(kind);
    const text = await res.clone().text();
    console.log(`\n[${init?.method ?? 'GET'} ${kind}] HTTP ${res.status}\n${text.slice(0, 700)}\n`);
  }
  return res;
}) as typeof fetch;

const started = Date.now();
console.log(`Looking up "${practice}" near "${where}"…`);
const found = await liveMapsSearch(env, `${practice} ${where}`, 10);
const listings = found.items.filter((it) => it?.type === 'maps_search' && it.title && (it.cid || it.place_id)).map(toListing);
console.log(listings.slice(0, 4).map((l) => `  - ${l.name} | ${l.address} | cid ${l.cid} | ${l.lat},${l.lng} | ${l.rating}★ ${l.reviews} reviews, ${l.photos} photos`).join('\n'));
const listing = listings[0];
if (!listing || listing.lat === null || listing.lng === null) throw new Error('No usable listing found');
console.log(`Using: ${listing.name}  (lookup cost $${found.cost})\n`);

const id = 'SMOKE_' + 'x'.repeat(16);
await startScan(env, {
  id,
  listing,
  keywords: defaultKeywords(listing.category, listing.additionalCategories),
  radiusMiles: 3,
  centre: { lat: listing.lat, lng: listing.lng },
  cacheKey: 'smoke',
});
console.log('Posted. Polling every 5 seconds…');

let last = '';
for (;;) {
  const s = await loadStatus(env, id, true);
  const line = `${s?.status} ${s?.progress.checksDone}/${s?.progress.checksTotal} checks, ${s?.progress.pointsDone}/25 points  (${Math.round((Date.now() - started) / 1000)}s)`;
  if (line !== last) console.log(line);
  last = line;
  if (s?.status === 'done' || s?.status === 'failed') {
    console.log('\nFinal status:', s.status);
    if (s.report) {
      const r = s.report;
      console.log(`Overall ${r.overall}/100, missing checks ${r.missingChecks}`);
      console.log('Competitors:', r.competitors.map((c) => `${c.name} (reviews ${c.reviews}, photos ${c.photos}, last review ${c.daysSinceReview}d, last post ${c.daysSincePost}d)`).join('\n             '));
      console.log('You:', JSON.stringify(r.you));
      console.log('Gaps:', r.gaps.map((g) => `${g.label}: ${g.you} vs ${g.top} (${g.gap})`).join(' | '));
    }
    break;
  }
  if (Date.now() - started > 12 * 60_000) {
    console.log('Gave up after 12 minutes');
    break;
  }
  await new Promise((r) => setTimeout(r, 5000));
}

const total = sqlite.prepare('select round(sum(cost), 5) as cost from lm_cost_log where report_id is not null').get() as { cost: number };
console.log('\nCost log by step (USD as DataForSEO reports it):');
for (const r of sqlite.prepare('select step, count(*) as rows_, sum(calls) as calls, sum(tasks) as tasks, round(sum(cost), 5) as cost, max(ms) as max_ms, group_concat(distinct note) as notes from lm_cost_log where report_id is not null group by step').all() as any[]) {
  console.log(`  ${String(r.step).padEnd(14)} calls ${String(r.calls).padStart(4)}  tasks ${String(r.tasks).padStart(4)}  cost $${r.cost}  slowest call ${r.max_ms}ms  ${r.notes ? 'notes: ' + String(r.notes).slice(0, 160) : ''}`);
}
const row = sqlite.prepare('select total_cost, timings_json from lm_reports').get() as { total_cost: number; timings_json: string };
console.log(`Report total_cost $${row.total_cost}, plus lookup $${found.cost} = $${(row.total_cost + found.cost).toFixed(5)}`);
const t = JSON.parse(row.timings_json) as Record<string, number>;
console.log('Timings (seconds after posting):', Object.fromEntries(Object.entries(t).map(([k, v]) => [k, Math.round((v - t.posted) / 1000)])));
void total;
