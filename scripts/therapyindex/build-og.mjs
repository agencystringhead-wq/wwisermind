/**
 * Builds the Therapy Index share images (1200 x 630 JPEG), light style with a title and no imagery:
 *   public/images/therapyindex/og/{hub,methodology,profile,city-<slug>}.jpg
 * Run with: node scripts/therapyindex/build-og.mjs
 *
 * Text is set in Inter (fetched from Google Fonts at render time, so run it online) and rendered by headless
 * Chromium from the playwright dev dependency. The images carry titles only, no numbers, so a new monthly snapshot
 * does not make them stale. City names come from the committed snapshots.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright';

const ROOT = process.cwd();
const IMG = path.join(ROOT, 'public', 'images', 'therapyindex');
const OUT = path.join(IMG, 'og');
fs.mkdirSync(OUT, { recursive: true });

// City names from the committed snapshots, listed in the order markets.ts lists the markets (Houston, Austin, Denver).
const order = [...fs.readFileSync(path.join(ROOT, 'lib', 'therapyindex', 'markets.ts'), 'utf8').matchAll(/slug: '([a-z-]+)'/g)].map((m) => m[1]);
const cities = fs
  .readdirSync(path.join(ROOT, 'data', 'therapyindex'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'therapyindex', f), 'utf8')))
  .sort((a, b) => order.indexOf(a.market.slug) - order.indexOf(b.market.slug))
  .map((s) => ({ name: s.market.city, slug: s.market.city.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));

const cards = [
  { file: 'hub', title: 'Who therapy patients actually find', sub: `${cities.map((c) => c.name).join(', ')}`.replace(/, ([^,]*)$/, ' and $1') },
  ...cities.map((c) => ({ file: `city-${c.slug}`, title: `${c.name} therapist rankings`, sub: 'Who patients find on Google and in AI answers' })),
  { file: 'methodology', title: 'How the Therapy Index works', sub: 'Sources, scoring and eligibility' },
  { file: 'profile', title: 'Practice profile', sub: 'Google Maps, Google search and AI visibility' },
];

/** Light style, as on the site: white ground, a soft grey band along the foot, black title, brand-blue wordmark. No imagery. */
const html = (card) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=JetBrains+Mono&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; position: relative; overflow: hidden; background: #ffffff; font-family: Inter, 'Segoe UI', Arial, sans-serif; color: #0c0c0c; }
  .band { position: absolute; left: 0; right: 0; bottom: 0; height: 150px; background: #f5f5f5; }
  .wrap { position: absolute; inset: 0; padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; }
  .brand { display: flex; align-items: baseline; gap: 14px; }
  .brand b { font-size: 34px; font-weight: 600; letter-spacing: -0.03em; }
  .brand span { font-size: 22px; color: #5a5a5a; }
  h1 { font-size: 80px; font-weight: 600; letter-spacing: -0.045em; line-height: 1; max-width: 900px; }
  p { margin-top: 22px; font-size: 30px; color: #5a5a5a; max-width: 800px; line-height: 1.3; letter-spacing: -0.01em; }
  .foot { display: flex; justify-content: space-between; align-items: center; font-size: 24px; color: #5a5a5a; }
  .foot i { font-style: normal; color: #146ef5; font-weight: 600; }
</style></head><body>
<div class="band"></div>
<div class="wrap">
  <div class="brand"><b>Therapy Index</b><span>by wwisermind</span></div>
  <div><h1>${card.title}</h1><p>${card.sub}</p></div>
  <div class="foot"><span>wwisermind.com/therapyindex</span><i>Independent research</i></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
for (const card of cards) {
  const tmp = path.join(os.tmpdir(), `ti-og-${card.file}.html`);
  fs.writeFileSync(tmp, html(card));
  await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const png = await page.screenshot({ type: 'png' });
  const jpg = await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
  fs.writeFileSync(path.join(OUT, `${card.file}.jpg`), jpg);
  console.log(`${card.file}.jpg  ${(jpg.length / 1024).toFixed(0)} KB`);
  fs.unlinkSync(tmp);
}
await browser.close();
