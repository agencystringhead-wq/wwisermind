/**
 * Check of the Good Faith Estimate lead function with no credentials and no network:   npm run gfe:test
 * The Pages Function runs as written against an in-memory SQLite database made strict like D1 (scripts/local-map/fake-d1.mts), with
 * Turnstile and Resend answered by a pretend fetch. It checks the validation, the daily limit, what is stored, the two emails, the
 * per-invocation counts, and that nothing about a client could reach the server. It also builds a PDF from dummy data to check the maths.
 */
import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { onRequestPost } from '../../functions/api/gfe/lead.ts';
import type { LmCtx, LmEnv } from '../../lib/local-map/server/env.ts';
import { strictD1 } from '../local-map/fake-d1.mts';
import { buildGfePdf } from '../../lib/gfe/pdf.ts';
import { priceRows, sessionsFor, validate } from '../../lib/gfe/estimate.ts';
import { sampleEstimate } from './sample.mts';

const realLog = console.log;
console.log = (...a: unknown[]) => (typeof a[0] === 'string' && a[0].startsWith('{"lm"') ? undefined : realLog(...a));

let failed = 0;
const check = (name: string, ok: boolean, extra = '') => {
  if (!ok) failed++;
  realLog(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? `  (${extra})` : ''}`);
};

/* --- pretend Turnstile and Resend ---------------------------------------------------------------- */
const sent: { to: string[]; subject: string; html: string }[] = [];
const outbound: string[] = [];
let turnstileOk = true;
globalThis.fetch = (async (input: any, init?: any) => {
  const url = String(input);
  outbound.push(`${url} ${typeof init?.body === 'string' ? init.body : ''}`);
  if (url.includes('turnstile')) return new Response(JSON.stringify({ success: turnstileOk }));
  if (url.includes('resend.com')) {
    sent.push(JSON.parse(init.body));
    return new Response('{}', { status: 200 });
  }
  throw new Error(`unexpected outside request: ${url}`);
}) as typeof fetch;

const sqlite = new DatabaseSync(':memory:');
for (const m of ['0002_local_map.sql', '0004_gfe.sql']) sqlite.exec(fs.readFileSync(path.join(process.cwd(), 'migrations', m), 'utf8'));
const env: LmEnv = { DB: strictD1(sqlite) as any, RESEND_API_KEY: 'k', TURNSTILE_SECRET_KEY: 's', SITE_ORIGIN: 'https://wwisermind.com' };
const pending: Promise<unknown>[] = [];
const call = async (body: unknown, ip = '1.2.3.4') => {
  const req = new Request('https://wwisermind.com/api/gfe/lead', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'cf-connecting-ip': ip },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
  const ctx: LmCtx = { request: req, env, waitUntil: (p) => void pending.push(p) };
  const res = await onRequestPost(ctx);
  await Promise.all(pending.splice(0));
  return res;
};
const good = { firstName: 'Dana', email: 'Dana@Example.com', practice: 'Dana Reyes Counseling', city: 'Austin', turnstileToken: 'tok', company: '' };

/* --- the function ---------------------------------------------------------------------------------- */
let res = await call('not json');
check('bad JSON is a 400', res.status === 400);
res = await call({ ...good, company: 'spam inc' });
check('the hidden field catches bots', res.status === 400);
res = await call({ ...good, email: 'nope' });
check('a bad email is refused', res.status === 400);
res = await call({ ...good, city: '' });
check('a missing city is refused', res.status === 400);
turnstileOk = false;
res = await call(good);
check('a failed Turnstile check is refused', res.status === 400 && (await res.json()).error === 'turnstile');
check('nothing stored after refusals', sqlite.prepare('SELECT COUNT(*) AS n FROM gfe_leads').get()!.n === 0);
turnstileOk = true;

sent.length = 0;
outbound.length = 0;
const leakBody = { ...good, clientName: 'Jamie Quinn', clientDob: '1990-04-12', clientAddress: '88 Alder Street', clientPhone: '(555) 010-0199', clientEmail: 'jamie.quinn@example.com', diagnosis: 'F41.1', fee: 175, rows: [{ code: '90837' }] };
res = await call(leakBody);
const trace = res.headers.get('x-lm-trace') ?? '';
check('a good request succeeds', res.status === 200 && (await res.json()).ok === true, trace);
const row = sqlite.prepare('SELECT * FROM gfe_leads').get() as any;
check('the lead is stored with lowercase email', row.email === 'dana@example.com' && row.practice === 'Dana Reyes Counseling' && row.city === 'Austin');
check('both emails went out and were marked', row.notified === 1 && row.welcomed === 1);
check('alert goes to admin@wwisermind.com', sent.some((m) => m.to[0] === 'admin@wwisermind.com' && /GFE tool lead/.test(m.subject)));
check('therapist gets the link back to the tool', sent.some((m) => m.to[0] === 'dana@example.com' && m.html.includes('https://wwisermind.com/free-tools/good-faith-estimate/')));
const everything = JSON.stringify(sqlite.prepare('SELECT * FROM gfe_leads').all()) + sent.map((m) => m.html + m.subject).join('') + outbound.join('');
check('client name, date of birth, diagnosis and fees never reach storage, emails or any outside request', !/Jamie|Quinn|1990-04-12|F41\.1|175|Alder|010-0199|jamie\.quinn/.test(everything));
check('outside requests: 3 (Turnstile + 2 emails), D1 queries: 3 before the response (1 more after)', /fetches=3;queries=3/.test(trace), trace);

let last = 200;
for (let i = 0; i < 12 && last === 200; i++) last = (await call(good, '9.9.9.9')).status;
check('the daily limit stops the 11th download from one connection', last === 429);
console.log = realLog;

/* --- the maths ------------------------------------------------------------------------------------ */
check('12 months weekly is 52 sessions', sessionsFor('weekly', 12) === 52);
check('6 months every 2 weeks is 13 sessions', sessionsFor('biweekly', 6) === 13);
check('4 months monthly is 4 sessions', sessionsFor('monthly', 4) === 4);
const sample = sampleEstimate();
check('the sample validates', Object.keys(validate(sample)).length === 0, JSON.stringify(validate(sample)));
const priced = priceRows(sample.rows);
check('line totals and grand total add up in cents', priced.totalCents === 20000 + 17500 * 12 + 9000 * 4 && priced.lines.length === 3, String(priced.totalCents));
check('a half-filled row is flagged', priceRows([{ id: 'x', code: '90837', fee: '', sessions: '3' }]).incomplete);
check('a bad NPI and TIN are caught', Boolean(validate({ ...sample, npi: '123', tin: '12' }).npi) && Boolean(validate({ ...sample, npi: '123', tin: '12' }).tin));

const { bytes, fileName } = await buildGfePdf(sample);
check('a PDF is produced', Buffer.from(bytes).subarray(0, 5).toString() === '%PDF-' && bytes.length > 3000, `${bytes.length} bytes, ${fileName}`);
const odd = await buildGfePdf({ ...sample, clientName: 'Zoë “Zed” O’Brien 王', practiceName: 'Café — Counseling' });
check('unusual characters do not break the PDF', odd.bytes.length > 3000);

if (process.argv.includes('--write-sample')) {
  const out = process.argv[process.argv.indexOf('--write-sample') + 1];
  fs.writeFileSync(out, bytes);
  realLog(`wrote ${out}`);
}
realLog(failed ? `\n${failed} check(s) failed` : '\nAll checks passed');
process.exit(failed ? 1 : 0);
