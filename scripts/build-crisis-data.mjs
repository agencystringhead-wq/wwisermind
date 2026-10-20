/* Publishes lib/crisis-resources.json for outside sites: the help now widget fetches it from
   https://wwisermind.com/data/crisis-resources.json.

   Copies the file to public/data/crisis-resources.json and drops every entry marked
   `needsCheck: true` (national and state), so nothing unverified is ever public. The copy is
   generated but COMMITTED: Cloudflare's build did not run the `prebuild` hook, so a gitignored copy
   never shipped. Runs before `dev` and `build` (see package.json), so a local build refreshes it;
   commit the result whenever lib/crisis-resources.json changes. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'lib/crisis-resources.json');
const target = path.join(root, 'public/data/crisis-resources.json');

const data = JSON.parse(await readFile(source, 'utf8'));
const checked = (list) => list.filter((entry) => entry.needsCheck !== true);

const published = {
  updated: data.updated,
  national: checked(data.national),
  states: Object.fromEntries(
    Object.entries(data.states).map(([code, list]) => [code, checked(list)]),
  ),
};

await mkdir(path.dirname(target), { recursive: true });
await writeFile(target, `${JSON.stringify(published)}\n`);

const dropped = data.national.length - published.national.length;
console.log(
  `crisis data: ${published.national.length} national resources published, ${dropped} held back (needsCheck)`,
);
