/* Crawls the static export in out/: every internal link must land on a page in the build, with its
   trailing slash and not on an old URL; every page must have exactly one canonical that matches its
   own address; titles and H1s must be unique; every _redirects destination must be a real page.
   Run after `npm run build`. */
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const OUT = 'out';
const ORIGIN = 'https://wwisermind.pages.dev';

const walk = (dir) =>
  readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });

const files = walk(OUT);
const pages = files.filter((f) => f.endsWith('.html') && !f.endsWith('404.html') && !f.includes(`${sep}404${sep}`) && !f.includes(`${sep}_next${sep}`));
const urlOf = (file) => {
  const rel = relative(OUT, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/index\.html$/, '');
};
const known = new Set(pages.map(urlOf));
const assets = new Set(files.map((f) => '/' + relative(OUT, f).split(sep).join('/')));

const OLD = [/^\/pricing\/[a-z-]+\/?$/, /^\/services\/[a-z-]+\/?$/];
const problems = [];
const titles = new Map();
const h1s = new Map();

for (const file of pages) {
  const url = urlOf(file);
  const html = readFileSync(file, 'utf8');

  const canon = [...html.matchAll(/<link rel="canonical" href="([^"]+)"/g)].map((m) => m[1]);
  if (canon.length !== 1) problems.push(`${url}: ${canon.length} canonical tags`);
  else if (canon[0] !== ORIGIN + url) problems.push(`${url}: canonical is ${canon[0]}`);

  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1];
  if (!title) problems.push(`${url}: no title`);
  else titles.set(title, [...(titles.get(title) || []), url]);

  const h1 = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gs)].map((m) => m[1].replace(/<[^>]+>/g, '').trim());
  if (h1.length !== 1 && url !== '/') problems.push(`${url}: ${h1.length} h1 tags`);
  if (h1[0]) h1s.set(h1[0], [...(h1s.get(h1[0]) || []), url]);

  for (const m of html.matchAll(/<a [^>]*href="([^"]+)"/g)) {
    const raw = m[1];
    if (/^(https?:|mailto:|tel:|#)/.test(raw)) {
      if (raw.startsWith(ORIGIN)) problems.push(`${url}: absolute self link ${raw}`);
      continue;
    }
    const path = raw.split('#')[0].split('?')[0];
    if (!path.startsWith('/')) continue;
    if (OLD.some((re) => re.test(path)) && !known.has(path.endsWith('/') ? path : path + '/'))
      problems.push(`${url}: old URL ${raw}`);
    else if (assets.has(path)) continue;
    else if (!path.endsWith('/')) problems.push(`${url}: link without trailing slash ${raw}`);
    else if (!known.has(path)) problems.push(`${url}: link to missing page ${raw}`);
  }

  // Old addresses inside structured data and metadata.
  for (const m of html.matchAll(/https:\/\/wwisermind\.pages\.dev(\/[^"\<\s]*)/g)) {
    const path = m[1].split('#')[0];
    if (/^\/(services|pricing)\/[a-z-]+/.test(path) && !known.has(path)) problems.push(`${url}: stale absolute URL ${m[0]}`);
  }
}

for (const [t, urls] of titles) if (urls.length > 1) problems.push(`duplicate title "${t}": ${urls.join(', ')}`);
for (const [t, urls] of h1s) if (urls.length > 1) problems.push(`duplicate h1 "${t}": ${urls.join(', ')}`);

// Redirects: every destination is a real page, no destination is itself an origin (no chains).
const redirects = readFileSync(join('public', '_redirects'), 'utf8')
  .split('\n')
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => l.trim().split(/\s+/));
const sources = new Set(redirects.map(([from]) => from));
for (const [from, to, code] of redirects) {
  if (code !== '301') problems.push(`redirect ${from}: not a 301`);
  if (!known.has(to)) problems.push(`redirect ${from} -> ${to}: destination is not a page`);
  if (sources.has(to)) problems.push(`redirect ${from} -> ${to}: chain`);
  if (known.has(from)) problems.push(`redirect ${from}: the source is still a live page`);
}

console.log(`${pages.length} pages, ${redirects.length} redirects checked`);
if (problems.length) {
  console.log(problems.join('\n'));
  process.exit(1);
}
console.log('No problems.');
