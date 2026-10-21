/**
 * Builds the Therapy Index share images (1200 x 630 JPEG) from the generated background images and a title:
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

/** light = cream background art with dark text; dark = near-black art with white text */
const cards = [
  { file: 'hub', bg: 'hub-hero.webp', tone: 'light', position: 'right bottom', label: 'Therapy Index', title: 'Who therapy patients actually find', sub: `${cities.map((c) => c.name).join(', ')}`.replace(/, ([^,]*)$/, ' and $1') },
  ...cities.map((c) => ({ file: `city-${c.slug}`, bg: `city-${c.slug}.webp`, tone: 'dark', position: 'center top', label: 'Therapy Index', title: `${c.name} therapist rankings`, sub: 'Who patients find on Google and in AI answers' })),
  { file: 'methodology', bg: 'header.webp', tone: 'light', position: 'right bottom', label: 'Therapy Index', title: 'How the Therapy Index works', sub: 'Sources, scoring and eligibility' },
  { file: 'profile', bg: 'closing.webp', tone: 'light', position: 'center bottom', label: 'Therapy Index', title: 'Practice profile', sub: 'Google Maps, Google search and AI visibility' },
];

const html = (card) => {
  const bg = pathToFileURL(path.join(IMG, card.bg)).href;
  const dark = card.tone === 'dark';
  const ink = dark ? '#f6f4ef' : '#0c0c0c';
  const muted = dark ? '#a9a59c' : '#5d5b57';
  const veil = dark
    ? 'linear-gradient(90deg, rgba(3,4,9,0.82) 0%, rgba(3,4,9,0.35) 60%, rgba(3,4,9,0) 100%)'
    : 'linear-gradient(90deg, rgba(244,241,235,0.96) 0%, rgba(244,241,235,0.7) 45%, rgba(244,241,235,0) 80%)';
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&family=JetBrains+Mono&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; position: relative; overflow: hidden; background: ${dark ? '#030409' : '#f4f1eb'}; font-family: Inter, 'Segoe UI', Arial, sans-serif; color: ${ink}; }
  .bg { position: absolute; inset: 0; background: url('${bg}') ${card.position} / cover no-repeat; }
  .veil { position: absolute; inset: 0; background: ${veil}; }
  .wrap { position: absolute; inset: 0; padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; }
  .chip { display: inline-flex; font-family: 'JetBrains Mono', monospace; font-size: 20px; letter-spacing: 0.04em; text-transform: uppercase; line-height: 1; }
  .chip b { background: #146ef5; color: #fff; padding: 11px 12px; font-weight: 400; }
  .chip span { background: ${dark ? 'rgba(255,255,255,0.14)' : '#e6e1d8'}; color: ${ink}; padding: 11px 16px; }
  h1 { font-size: 78px; font-weight: 600; letter-spacing: -0.045em; line-height: 0.98; max-width: 760px; }
  p { margin-top: 22px; font-size: 28px; color: ${muted}; max-width: 700px; line-height: 1.3; letter-spacing: -0.01em; }
  .foot { font-family: 'JetBrains Mono', monospace; font-size: 20px; letter-spacing: 0.04em; text-transform: uppercase; color: ${muted}; }
</style></head><body>
<div class="bg"></div><div class="veil"></div>
<div class="wrap">
  <div class="chip"><b>TI</b><span>${card.label}</span></div>
  <div><h1>${card.title}</h1><p>${card.sub}</p></div>
  <div class="foot">wwisermind.com</div>
</div></body></html>`;
};

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
