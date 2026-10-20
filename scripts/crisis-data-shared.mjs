/* The one rule for turning lib/crisis-resources.json into the public file, shared by the script that
   writes it (build-crisis-data.mjs) and the one that checks it (check-crisis-data.mjs), so the two
   can never disagree about what "published" means.

   Published = the same data with every entry marked `needsCheck: true` removed, national and state. */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const sourcePath = path.join(root, 'lib/crisis-resources.json');
export const publicPath = path.join(root, 'public/data/crisis-resources.json');

const checked = (list) => list.filter((entry) => entry.needsCheck !== true);

export function toPublished(data) {
  return {
    updated: data.updated,
    national: checked(data.national),
    states: Object.fromEntries(
      Object.entries(data.states).map(([code, list]) => [code, checked(list)]),
    ),
  };
}

/** The exact text of the public file: one line of JSON and a final newline. */
export const serialize = (published) => `${JSON.stringify(published)}\n`;
