/**
 * Pre-launch checks on a finished build (run `npm run build` first): every Therapy Index page has a unique title, description and
 * canonical, an og:image and twitter:image that exist, robots set correctly for its type (profiles are noindex below the score bar
 * unless an AI named them), no missing images, and the sitemap lists indexable pages only.
 * Run with: npm run therapyindex:check
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = 'out';
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') pages.push(p);
  }
})(path.join(OUT, 'therapyindex'));

const get = (h, re) => (h.match(re) || [])[1] ?? null;
const titles = new Map(), descs = new Map(), canon = new Map();
const problems = [];
const kinds = { hub: 0, city: 0, methodology: 0, profile: 0 };
const robots = {};
const missingFiles = new Set();
const snaps = Object.fromEntries(['houston-tx', 'austin-tx', 'denver-co'].map((s) => [s, JSON.parse(fs.readFileSync(`data/therapyindex/${s}.json`, 'utf8'))]));
const bySlug = {};
for (const s of Object.values(snaps)) for (const p of s.practices) bySlug[`${s.market.stateSlug}/${s.market.city.toLowerCase()}/${p.slug}`] = p;

for (const file of pages) {
  const rel = path.relative(path.join(OUT, 'therapyindex'), path.dirname(file)).split(path.sep).join('/');
  const h = fs.readFileSync(file, 'utf8');
  const kind = rel === '' ? 'hub' : rel === 'methodology' ? 'methodology' : rel.split('/').length === 2 ? 'city' : 'profile';
  kinds[kind]++;
  const title = get(h, /<title>([^<]*)<\/title>/);
  const desc = get(h, /<meta name="description" content="([^"]*)"/);
  const can = get(h, /<link rel="canonical" href="([^"]*)"/);
  const ogImg = get(h, /<meta property="og:image" content="([^"]*)"/);
  const twImg = get(h, /<meta name="twitter:image" content="([^"]*)"/);
  const twCard = get(h, /<meta name="twitter:card" content="([^"]*)"/);
  const robot = get(h, /<meta name="robots" content="([^"]*)"/);
  const url = `/therapyindex/${rel}${rel ? '/' : ''}`;
  for (const [name, val, map] of [['title', title, titles], ['description', desc, descs], ['canonical', can, canon]]) {
    if (!val) problems.push(`${url}: missing ${name}`);
    else { if (!map.has(val)) map.set(val, []); map.get(val).push(url); }
  }
  if (can !== `https://wwisermind.com${url}`) problems.push(`${url}: canonical ${can}`);
  if (!ogImg || !twImg) problems.push(`${url}: missing og:image or twitter:image (${ogImg} / ${twImg})`);
  if (twCard !== 'summary_large_image') problems.push(`${url}: twitter:card ${twCard}`);
  for (const img of [ogImg, twImg]) {
    if (img) { const f = path.join(OUT, img.replace('https://wwisermind.com', '')); if (!fs.existsSync(f)) missingFiles.add(img); }
  }
  // robots expectation
  let expect = 'indexable';
  if (kind === 'profile') {
    const p = bySlug[rel];
    expect = p && (p.visibilityScore >= 10 || p.aiMentions.chatgpt + p.aiMentions.claude > 0) ? 'indexable' : 'noindex';
  }
  const actual = robot && /noindex/.test(robot) ? 'noindex' : 'indexable';
  if (actual !== expect) problems.push(`${url}: robots ${robot} but expected ${expect}`);
  if (kind === 'profile') {
    const city = rel.split('/')[1];
    robots[city] ??= { indexable: 0, noindex: 0 };
    robots[city][actual]++;
  }
  // broken local images: <img src>, srcset and CSS url() in this html
  for (const m of h.matchAll(/(?:src|href)="(\/(?:images|_next\/static\/media)\/[^"?#]+)"/g)) {
    if (!fs.existsSync(path.join(OUT, decodeURIComponent(m[1])))) missingFiles.add(m[1]);
  }
}
// css url() images
for (const f of fs.readdirSync(path.join(OUT, '_next/static/css')).filter((x) => x.endsWith('.css'))) {
  const css = fs.readFileSync(path.join(OUT, '_next/static/css', f), 'utf8');
  for (const m of css.matchAll(/url\(["']?(\/images\/[^"')]+)["']?\)/g)) {
    if (!fs.existsSync(path.join(OUT, m[1]))) missingFiles.add(`${m[1]} (css ${f})`);
  }
}
const dup = (m) => [...m.entries()].filter(([, v]) => v.length > 1);
console.log('pages', pages.length, JSON.stringify(kinds));
console.log('unique titles', titles.size, 'dups', dup(titles).length, '| unique descriptions', descs.size, 'dups', dup(descs).length, '| unique canonicals', canon.size, 'dups', dup(canon).length);
console.log('profile indexing by city', JSON.stringify(robots));
console.log('missing image files:', [...missingFiles]);
console.log('problems:', problems.length); problems.slice(0, 15).forEach((x) => console.log(' -', x));
dup(titles).slice(0, 3).forEach(([t, v]) => console.log(' dup title:', t, v.length));

const sm = fs.readFileSync(path.join(OUT, 'sitemap.xml'), 'utf8');
const urls = [...sm.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]).filter((u) => u.includes('/therapyindex'));
const prof = urls.filter((u) => u.split('/').length > 7);
console.log('sitemap therapyindex urls', urls.length, '| hub/cities/methodology', urls.length - prof.length, '| profiles', prof.length);
let noindexInMap = 0;
for (const u of urls) {
  const rel = u.replace('https://wwisermind.com/therapyindex/', '').replace(/\/$/, '');
  const f = path.join(OUT, 'therapyindex', rel, 'index.html');
  if (fs.existsSync(f) && /noindex/.test(fs.readFileSync(f, 'utf8').match(/<meta name="robots" content="([^"]*)"/)?.[1] ?? '')) noindexInMap++;
}
console.log('noindex pages listed in sitemap:', noindexInMap);
