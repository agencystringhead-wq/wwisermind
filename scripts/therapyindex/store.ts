import fs from 'node:fs';
import path from 'node:path';

/* Raw API responses, cached one file per call at data/therapyindex/raw/<market>/<date>/<kind>__<key>.json.
   A call that already has a file is never sent (or paid for) again. raw/ is gitignored. */

export type Kind = 'maps' | 'organic' | 'gmb' | 'lighthouse' | 'ai-chatgpt' | 'ai-claude';

export const DATA_DIR = path.join(process.cwd(), 'data', 'therapyindex');
export const RAW_DIR = path.join(DATA_DIR, 'raw');

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export type RawReader = { read(kind: Kind, key: string): any | null };

export class RawStore implements RawReader {
  readonly dir: string;

  constructor(market: string, date: string, root: string = RAW_DIR) {
    this.dir = path.join(root, market, date);
  }

  private file(kind: Kind, key: string): string {
    return path.join(this.dir, `${kind}__${slugify(key)}.json`);
  }

  has(kind: Kind, key: string): boolean {
    return fs.existsSync(this.file(kind, key));
  }

  read(kind: Kind, key: string): any | null {
    const f = this.file(kind, key);
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
  }

  write(kind: Kind, key: string, response: unknown): void {
    fs.mkdirSync(this.dir, { recursive: true });
    fs.writeFileSync(this.file(kind, key), JSON.stringify(response, null, 1));
  }
}

/** Newest date folder cached for a market, or null. */
export function latestRawDate(market: string, root: string = RAW_DIR): string | null {
  const dir = path.join(root, market);
  if (!fs.existsSync(dir)) return null;
  const dates = fs.readdirSync(dir).filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d)).sort();
  return dates.length ? dates[dates.length - 1] : null;
}
