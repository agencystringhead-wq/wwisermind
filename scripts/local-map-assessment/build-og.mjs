/**
 * Builds the Local Map Assessment share image (1200 x 630 JPEG): public/images/local-map-assessment/og.jpg
 * Run with: node scripts/local-map-assessment/build-og.mjs   (online: Inter comes from Google Fonts at render time)
 * Dark ground like the page's hero, the title, and a 5 x 5 dot grid in the report's four colours. Titles only, no numbers.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright';

const OUT = path.join(process.cwd(), 'public', 'images', 'local-map-assessment');
fs.mkdirSync(OUT, { recursive: true });

const tones = { g: '#1f9d55', a: '#f0a500', r: '#e5484d', n: '#9aa1ab' };
const ranks = [12, 8, 10, 16, 15, 5, 4, 5, 8, 15, 1, 1, 2, 7, 12, 1, 1, 1, 4, 11, 1, 1, 1, 1, 11];
const dots = ranks
  .map((r) => {
    const c = r <= 3 ? tones.g : r <= 10 ? tones.a : tones.r;
    return `<span style="background:${c}">${r}</span>`;
  })
  .join('');

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600&display=block" rel="stylesheet">
<style>
  * { margin: 0; box-sizing: border-box; }
  body { width: 1200px; height: 630px; position: relative; overflow: hidden; background: #0b0d12; font-family: Inter, 'Segoe UI', Arial, sans-serif; color: #f3f5f9; }
  .glow { position: absolute; inset: 0; background: radial-gradient(620px 460px at 92% 0%, rgba(20,110,245,0.4), transparent 70%), radial-gradient(420px 320px at 0% 100%, rgba(247,255,137,0.10), transparent 70%); }
  .wrap { position: absolute; inset: 0; padding: 64px 72px; display: flex; flex-direction: column; justify-content: space-between; }
  .brand { font-size: 34px; font-weight: 600; letter-spacing: -0.03em; }
  .brand span { color: #b4bccb; font-weight: 500; font-size: 22px; margin-left: 12px; }
  h1 { font-size: 76px; font-weight: 600; letter-spacing: -0.045em; line-height: 1.02; max-width: 640px; }
  p { margin-top: 22px; font-size: 28px; color: #b4bccb; max-width: 600px; line-height: 1.3; letter-spacing: -0.01em; }
  .foot { font-size: 24px; color: #b4bccb; }
  .foot b { color: #f7ff89; font-weight: 600; }
  .map { position: absolute; right: 72px; top: 115px; width: 380px; height: 400px; border-radius: 22px; background: #eef1ec; padding: 16px; display: grid; grid-template-columns: repeat(5, 1fr); box-shadow: 0 30px 80px rgba(0,0,0,0.5); }
  .map span { display: grid; place-items: center; width: 52px; height: 52px; margin: auto; border-radius: 50%; color: #fff; font-weight: 600; font-size: 20px; box-shadow: 0 0 0 3px #fff; }
</style></head><body>
<div class="glow"></div>
<div class="map">${dots}</div>
<div class="wrap">
  <div class="brand">wwisermind<span>Local Map Assessment</span></div>
  <div><h1>See who outranks you on Google Maps</h1><p>A free report for therapists, in under 4 minutes.</p></div>
  <div class="foot"><b>Free</b> · wwisermind.com/free-tools/local-map-assessment</div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
const tmp = path.join(os.tmpdir(), 'lma-og.html');
fs.writeFileSync(tmp, html);
await page.goto(pathToFileURL(tmp).href, { waitUntil: 'networkidle' });
await page.evaluate(() => document.fonts.ready);
const png = await page.screenshot({ type: 'png' });
const jpg = await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toBuffer();
fs.writeFileSync(path.join(OUT, 'og.jpg'), jpg);
console.log(`og.jpg  ${(jpg.length / 1024).toFixed(0)} KB`);
fs.unlinkSync(tmp);
await browser.close();
