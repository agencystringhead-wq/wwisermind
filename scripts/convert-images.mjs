/**
 * Converts every png/jpg/jpeg dropped in /images into webp inside /public/images.
 * Run with: npm run images
 * Existing webp files are only rebuilt when the source is newer.
 */
import { readdir, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SRC_DIR = path.resolve('images');
const OUT_DIR = path.resolve('public/images');
const EXT = new Set(['.png', '.jpg', '.jpeg']);
const SKIP_DIRS = new Set(['designframes']); // reference screenshots, not site assets
const QUALITY = 90;

async function newer(src, out) {
  try {
    const [a, b] = await Promise.all([stat(src), stat(out)]);
    return a.mtimeMs > b.mtimeMs;
  } catch {
    return true;
  }
}

async function walk(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const rel = path.join(base, entry.name);
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) {
        console.log(`skip  ${rel}/ (reference folder)`);
        continue;
      }
      await walk(abs, rel);
      continue;
    }
    const ext = path.extname(entry.name).toLowerCase();
    if (!EXT.has(ext)) continue;

    const out = path.join(OUT_DIR, rel.slice(0, -ext.length) + '.webp');
    await mkdir(path.dirname(out), { recursive: true });
    if (!(await newer(abs, out))) {
      console.log(`skip  ${rel} (up to date)`);
      continue;
    }
    await sharp(abs).webp({ quality: QUALITY }).toFile(out);
    const { size } = await stat(out);
    console.log(`webp  ${rel} -> ${path.relative(process.cwd(), out)} (${(size / 1024).toFixed(1)} kB)`);
  }
}

await mkdir(OUT_DIR, { recursive: true });
await walk(SRC_DIR);
console.log('image conversion complete');
