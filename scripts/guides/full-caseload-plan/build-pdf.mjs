/* Builds the 2027 Full-Caseload Plan PDF from guide.html (same folder) and the cover preview used
   on the site. Run with `npm run guide:pdf`.

   Writes:
     public/guides/wwisermind-2027-full-caseload-plan.pdf
     public/images/full-caseload-plan-cover.webp   (page 1, 900px wide)

   The cover is rendered by printing the PDF's first page to a PNG through the same Chromium, so it
   always matches the PDF. Needs Playwright's Chromium: `npx playwright install chromium`. */
import { mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';
import sharp from 'sharp';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../..');
const guideHtml = path.join(here, 'guide.html');
const pdfOut = path.join(root, 'public/guides/wwisermind-2027-full-caseload-plan.pdf');
const coverOut = path.join(root, 'public/images/full-caseload-plan-cover.webp');

await mkdir(path.dirname(pdfOut), { recursive: true });

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 816, height: 1056 }, deviceScaleFactor: 2 });
  await page.goto(pathToFileURL(guideHtml).href, { waitUntil: 'load' });

  /* Wait for every <img> to finish, and fail loudly on a broken one. */
  const broken = await page.evaluate(async () => {
    const imgs = [...document.images];
    await Promise.all(
      imgs.map((img) =>
        img.complete ? null : new Promise((resolve) => { img.onload = img.onerror = resolve; }),
      ),
    );
    await document.fonts.ready;
    return imgs.filter((img) => !img.naturalWidth).map((img) => img.getAttribute('src'));
  });
  if (broken.length) throw new Error(`Images failed to load: ${broken.join(', ')}`);

  await page.pdf({
    path: pdfOut,
    width: '8.5in',
    height: '11in',
    printBackground: true,
    preferCSSPageSize: true,
  });

  /* Page 1 as the cover, in print layout so any screen-only margin around the pages is gone: screenshot the first page-sized slice of the document at 2x. */
  await page.emulateMedia({ media: 'print' });
  const shot = await page.screenshot({ clip: { x: 0, y: 0, width: 816, height: 1056 } });
  await sharp(shot).resize({ width: 900 }).webp({ quality: 90 }).toFile(coverOut);
} finally {
  await browser.close();
}

const pdfSize = (await stat(pdfOut)).size;
console.log(`PDF   ${(pdfSize / 1024 / 1024).toFixed(2)} MB  ${path.relative(root, pdfOut)}`);
console.log(`Cover ${((await stat(coverOut)).size / 1024).toFixed(0)} KB  ${path.relative(root, coverOut)}`);
if (pdfSize > 6 * 1024 * 1024) console.warn('PDF is over 6 MB: re-encode the images in img/ smaller and rebuild.');
