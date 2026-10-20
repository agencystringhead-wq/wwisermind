/* Publishes lib/crisis-resources.json for outside sites: the help now widget fetches it from
   https://wwisermind.com/data/crisis-resources.json.

   Writes public/data/crisis-resources.json with every `needsCheck: true` entry removed (the rule
   lives in crisis-data-shared.mjs). The copy is generated but COMMITTED, because Cloudflare's build
   did not run npm pre-hooks and a gitignored copy never shipped. `npm run build` checks that the
   committed copy matches (check-crisis-data.mjs) and fails if it does not.

   After editing lib/crisis-resources.json, run `npm run crisis:data` and commit both files.
   `npm run dev` runs this first, so a dev session keeps the copy fresh too. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { publicPath, serialize, sourcePath, toPublished } from './crisis-data-shared.mjs';

const data = JSON.parse(await readFile(sourcePath, 'utf8'));
const published = toPublished(data);

await mkdir(path.dirname(publicPath), { recursive: true });
await writeFile(publicPath, serialize(published));

const held = data.national.length - published.national.length;
console.log(
  `crisis data: ${published.national.length} national resources published, ${held} held back (needsCheck)`,
);
