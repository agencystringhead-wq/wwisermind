/* Fails the build when the published crisis data has drifted from its source.

   It regenerates public/data/crisis-resources.json in memory from lib/crisis-resources.json and
   compares it with the committed file. They must match exactly, or stale numbers could ship to the
   site and to every practice using the help now widget. Run first by `npm run build`.

   To fix a mismatch: run `npm run crisis:data`, then commit public/data/crisis-resources.json. */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { publicPath, root, serialize, sourcePath, toPublished } from './crisis-data-shared.mjs';

const rel = (file) => path.relative(root, file).split(path.sep).join('/');
const FIX = 'Fix: run `npm run crisis:data`, then commit public/data/crisis-resources.json.';

function fail(lines) {
  console.error(`\ncheck-crisis-data: FAILED\n${lines.map((line) => `  ${line}`).join('\n')}\n  ${FIX}\n`);
  process.exit(1);
}

/** What differs, in terms an editor can act on: entries added, removed or changed. */
function describe(expected, actual) {
  const lines = [];
  if (expected.updated !== actual.updated) {
    lines.push(`"updated" is ${actual.updated} in the public file but ${expected.updated} in the source.`);
  }
  const groups = (data) => [
    ['national', data.national ?? []],
    ...Object.entries(data.states ?? {}).map(([code, list]) => [`states.${code}`, list]),
  ];
  const want = new Map(groups(expected));
  const have = new Map(groups(actual));
  for (const name of new Set([...want.keys(), ...have.keys()])) {
    const a = new Map((want.get(name) ?? []).map((entry) => [entry.id, entry]));
    const b = new Map((have.get(name) ?? []).map((entry) => [entry.id, entry]));
    for (const id of a.keys()) {
      if (!b.has(id)) lines.push(`${name}: "${id}" is in the source but missing from the public file.`);
      else if (JSON.stringify(a.get(id)) !== JSON.stringify(b.get(id))) {
        lines.push(`${name}: "${id}" differs between the source and the public file.`);
      }
    }
    for (const id of b.keys()) {
      if (!a.has(id)) lines.push(`${name}: "${id}" is in the public file but not published by the source (removed, or needsCheck).`);
    }
  }
  return lines;
}

let source;
try {
  source = JSON.parse(await readFile(sourcePath, 'utf8'));
} catch (error) {
  fail([`Cannot read ${rel(sourcePath)}: ${error.message}`]);
}

const expected = toPublished(source);

let text;
try {
  text = await readFile(publicPath, 'utf8');
} catch {
  fail([`${rel(publicPath)} does not exist.`]);
}

/* A checkout on Windows may turn line endings into CRLF; the content is what matters. */
const actualText = text.replace(/\r\n/g, '\n');
if (actualText === serialize(expected)) {
  console.log(`check-crisis-data: ok (${expected.national.length} national resources, public file matches the source)`);
} else {
  let detail;
  try {
    detail = describe(expected, JSON.parse(actualText));
  } catch {
    detail = [`${rel(publicPath)} is not valid JSON.`];
  }
  fail([
    `${rel(publicPath)} does not match what ${rel(sourcePath)} publishes.`,
    ...(detail.length ? detail : ['The content is the same but the formatting differs.']),
  ]);
}
