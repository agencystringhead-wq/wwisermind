import fs from 'node:fs';
import path from 'node:path';
import type { Snapshot } from './types';

/** Server-only: reads the committed snapshots (data/therapyindex/<market>.json) at build time. */
export function getSnapshots(): Snapshot[] {
  const dir = path.join(process.cwd(), 'data', 'therapyindex');
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .sort()
    .map((f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) as Snapshot);
}
