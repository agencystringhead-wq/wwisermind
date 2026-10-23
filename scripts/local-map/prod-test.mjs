/**
 * Runs one real Local Map Assessment through the live site's pages in a real browser, and reports what each function invocation used:
 *   node scripts/local-map/prod-test.mjs "Practice name" "City or ZIP" you@example.com [baseUrl]
 * It types into the real search flow (Turnstile included), picks the first listing, runs the scan and waits for the report. Every
 * /api/local-map response carries an x-lm-trace header with that invocation's outside request count and D1 query count; the script collects them.
 * Spends real money (about $0.09) and sends the real emails to the address you give.
 */
import { chromium } from 'playwright';

const [practice, where, email, base = 'https://wwisermind.com'] = process.argv.slice(2);
if (!practice || !where || !email) throw new Error('usage: node prod-test.mjs "Practice name" "City or ZIP" email [baseUrl]');

const calls = [];
const browser = await chromium.launch(process.env.HEADED ? { headless: false, channel: 'chrome' } : { headless: true });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
page.on('response', async (res) => {
  const url = res.url();
  if (!url.includes('/api/local-map/')) return;
  const trace = res.headers()['x-lm-trace'] ?? '';
  const m = Object.fromEntries(trace.split(';').map((kv) => kv.split('=')));
  let hurry = false;
  let status = '';
  if (url.includes('/status')) {
    const body = await res.text().catch(() => '');
    hurry = body.includes('"hurry":true');
    status = (/"status":"(\w+)"/.exec(body.slice(0, 40)) ?? [])[1] ?? '';
  }
  calls.push({ at: Date.now(), http: res.status(), fn: m.fn ?? url.split('/api/local-map/')[1].split('?')[0], fetches: Number(m.fetches ?? NaN), queries: Number(m.queries ?? NaN), wallMs: Number(m.wallMs ?? NaN), phase: m.phase ?? '', status, hurry });
});

const t0 = Date.now();
await page.goto(`${base}/free-tools/local-map-assessment/start/?${new URLSearchParams({ practice, where })}`, { waitUntil: 'networkidle' });
await page.getByRole('heading', { name: /Is one of these|We could not find/ }).waitFor({ timeout: 60000 });
const listings = await page.getByRole('button', { name: 'This is my practice' }).count();
if (!listings) throw new Error('no listings found');
console.log(`Found ${listings} listing(s). Picking the first.`);
console.log('Listing:', (await page.locator('ul li').first().innerText()).replace(/\n+/g, ' | ').slice(0, 200));
await page.getByRole('button', { name: 'This is my practice' }).first().click();
await page.getByRole('heading', { name: /Check the details/ }).waitFor();
console.log('Keywords:', (await page.locator('input[aria-label^="Search term"]').evaluateAll((els) => els.map((e) => e.value))).join(', '));
await page.getByRole('button', { name: 'Continue' }).click();
await page.getByRole('heading', { name: /Where should we send/ }).waitFor();
await page.fill('input[name=firstName]', 'Smoke');
await page.fill('input[name=email]', email);
console.log('WAITING FOR YOU: click the Turnstile check in the Chrome window (up to 20 minutes)');
await page.waitForFunction(() => document.querySelector('[name=cf-turnstile-response]')?.value, null, { timeout: 20 * 60_000 });
console.log('Turnstile passed, starting the scan');
const startedAt = Date.now();
await page.getByRole('button', { name: 'Run my report' }).click();
await page.waitForURL(/report/, { timeout: 60000 });
const reportUrl = page.url();
console.log('Report URL:', reportUrl);
await page.getByRole('heading', { name: 'Where the gaps are' }).waitFor({ timeout: 12 * 60_000 });
const doneAt = Date.now();
const overall = await page.locator('[aria-label^="Visibility score"]').first().getAttribute('aria-label');
const notice = await page.locator('text=checks did not finish').count();

const summary = {};
for (const c of calls) {
  const key = c.fn === 'status' ? `status (${c.status || 'n/a'})` : c.fn;
  const s = (summary[key] ??= { n: 0, fetchesMax: 0, queriesMax: 0, wallMax: 0, non200: 0 });
  s.n++;
  if (c.http !== 200) s.non200++;
  s.fetchesMax = Math.max(s.fetchesMax, c.fetches || 0);
  s.queriesMax = Math.max(s.queriesMax, c.queries || 0);
  s.wallMax = Math.max(s.wallMax, c.wallMs || 0);
}
console.log(`\nFinished: ${overall}, ${notice ? 'some checks missing' : 'all checks finished'}`);
console.log(`Time from "Run my report" to the report: ${Math.round((doneAt - startedAt) / 1000)} s (whole flow ${Math.round((doneAt - t0) / 1000)} s)`);
console.log(`Invocations: ${calls.length}, polls: ${calls.filter((c) => c.fn === 'status').length}, errors (non-200 except expected 404/429): ${calls.filter((c) => c.http >= 500).length}`);
console.log('Per function (outside requests / D1 queries are the highest any single invocation used; the limits are 50 and 50):');
for (const [k, v] of Object.entries(summary)) console.log(`  ${k.padEnd(22)} x${String(v.n).padStart(3)}  outside requests max ${v.fetchesMax}   D1 queries max ${v.queriesMax}   wall max ${v.wallMax} ms${v.non200 ? `   non-200: ${v.non200}` : ''}`);
const worst = calls.reduce((a, c) => ((c.fetches || 0) > (a.fetches || 0) ? c : a), calls[0]);
console.log(`Highest outside-request count: ${worst.fetches} (${worst.fn}, phase ${worst.phase || worst.status})`);
const q = calls.reduce((a, c) => ((c.queries || 0) > (a.queries || 0) ? c : a), calls[0]);
console.log(`Highest D1 query count: ${q.queries} (${q.fn}, phase ${q.phase || q.status})`);
console.log('ID:', new URL(reportUrl).searchParams.get('id'));
await browser.close();
