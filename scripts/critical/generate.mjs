/**
 * Works out each page's critical CSS: the rules that style what is on screen without scrolling,
 * on a phone (412x823) and on a desktop (1440x900), and records them with the page's stylesheet
 * list in scripts/critical/data.json. `scripts/critical/apply.mjs` (run by `npm run build`) inlines
 * them and loads the full stylesheets without blocking the first paint.
 *
 * Needs a browser, so it is run by hand, not by the Cloudflare build:
 *   npm run build && npm run critical
 * then commit data.json. A page whose stylesheet list no longer matches any recorded variant is left
 * alone by apply.mjs (it keeps its normal blocking CSS), so a stale data.json costs speed, never looks.
 * `--only <regex>` records just the matching routes; a recording is always added as a variant beside the
 * existing ones (`--fresh` starts over). Check a deployment with `npm run critical:check -- <url>`.
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';

const OUT = path.resolve('out');
const SKIP = [/^\/therapyindex\//, /^\/404/, /^\/free-tools\/website-scorecard-for-therapists\/r\//];
const VIEWPORTS = [
  { width: 412, height: 823, mobile: true },
  { width: 1440, height: 900, mobile: false },
];
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.webm': 'video/webm', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.txt': 'text/plain', '.xml': 'application/xml' };

/* `--url https://some.pages.dev` crawls a deployment instead of the local out/. Cloudflare's build
   names its stylesheets differently from a local build (same rules, different chunking), and
   apply.mjs only trusts a page whose stylesheet names match, so data.json for the live site has to be
   recorded from a Cloudflare build of the same code: deploy a preview, then
     node scripts/critical/generate.mjs --url https://<preview>.pages.dev
   (the page list still comes from the local out/, so build locally first). The deployment must not
   already have critical CSS in it, or what is recorded is the half-loaded page. */
/* `--only <regex>` records just the routes that match and keeps every other route's entry in data.json as it is.
   Use it when a deployment already has critical CSS inlined on most pages (recording those would capture the
   half-loaded page) and only some pages, such as ones whose address changed, are missing it. */
const only = process.argv.includes('--only') ? new RegExp(process.argv[process.argv.indexOf('--only') + 1]) : null;
const remote = process.argv.includes('--url') ? process.argv[process.argv.indexOf('--url') + 1].replace(/\/$/, '') : null;
const server = http.createServer((req, res) => {
  let f = path.join(OUT, decodeURIComponent(req.url.split('?')[0]));
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
if (!remote) await new Promise((r) => server.listen(0, r));
const base = remote ?? `http://localhost:${server.address().port}`;

const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (e.name !== '_next') walk(p); }
    else if (e.name === 'index.html') {
      const rel = path.relative(OUT, path.dirname(p)).split(path.sep).join('/');
      const route = rel ? `/${rel}/` : '/';
      if (!SKIP.some((s) => s.test(route)) && (!only || only.test(route))) pages.push(route);
    }
  }
})(OUT);

/* Runs in the page. Returns the rules whose selector matches something on screen. */
function collect(vh) {
  /* Blocks wholly below the fold. Until the full stylesheets arrive they are unstyled, and an
     unstyled next/image "fill" picture is position:absolute with nothing to hold it, so it would
     paint over the top of the page. apply.mjs hides these (display:none) until the CSS has loaded,
     and their rules are not part of the critical CSS. Everything else on the page is, including
     elements that are display:none or off to the side in their own block. */
  const below = [];
  const belowEls = [];
  const mainEl = document.querySelector('main');
  const consider = (parent, selector, depth) => {
    [...parent.children].forEach((child, i) => {
      const sel = `${selector}>:nth-child(${i + 1})`;
      const r = child.getBoundingClientRect();
      if (r.top >= vh && getComputedStyle(child).position !== 'fixed') { below.push(sel); belowEls.push(child); }
      else if (r.bottom > vh && depth < 3) consider(child, sel, depth + 1);
    });
  };
  if (mainEl) consider(mainEl, 'main', 0);
  const footer = document.querySelector('body > footer');
  if (footer && footer.getBoundingClientRect().top >= vh) { below.push('body>footer'); belowEls.push(footer); }
  const onScreen = [...document.querySelectorAll('*')].filter((e) => !belowEls.some((b) => b.contains(e)));
  const all = [document.documentElement, document.head, ...onScreen];
  const dynamic = /:(hover|focus|focus-visible|focus-within|active|visited|target|checked|disabled)\b/;
  const pseudoEl = /::?(before|after|first-line|first-letter|placeholder|selection|marker|backdrop|-webkit-[a-z-]+|-moz-[a-z-]+)/g;
  const matches = (selectorText) => {
    for (const part of selectorText.split(/,(?![^(]*\))/)) {
      const s = part.trim();
      if (!s || dynamic.test(s)) continue;
      const bare = s.replace(pseudoEl, '').trim() || '*';
      try { if (all.some((e) => e.matches(bare))) return true; } catch { /* a selector this browser cannot match */ }
    }
    return false;
  };
  const out = [];
  const animations = new Set();
  const walk = (rules, key, wrap) => {
    [...rules].forEach((r, i) => {
      const k = [...key, i];
      if (r.type === 1) {
        if (!matches(r.selectorText)) return;
        const names = r.style.animationName;
        if (names && names !== 'none') names.split(',').forEach((n) => animations.add(n.trim()));
        out.push({ k, css: wrap ? `${wrap}{${r.cssText}}` : r.cssText });
      } else if (r.type === 4) walk(r.cssRules, k, `@media ${r.conditionText || r.media.mediaText}`);
      else if (r.type === 12) walk(r.cssRules, k, `@supports ${r.conditionText}`);
      else if (r.type === 5) out.push({ k, css: r.cssText });
      else if (r.type === 7) out.push({ k, css: r.cssText, animation: r.name });
    });
  };
  [...document.styleSheets].forEach((sheet, si) => { if (sheet.ownerNode && sheet.ownerNode.id === 'inter-face') return; try { walk(sheet.cssRules, [si], ''); } catch { /* a sheet from another origin */ } });
  return { rules: out.filter((o) => !o.animation || animations.has(o.animation)), below };
}

const browser = await chromium.launch({ channel: 'chrome' });
const data = {};
let done = 0;
for (const route of pages) {
  const picked = new Map();
  let belowSets = [];
  let sheets = [];
  for (const vp of VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height }, isMobile: vp.mobile, deviceScaleFactor: 1 });
    await page.goto(base + route, { waitUntil: 'load' });
    await page.waitForTimeout(600);
    sheets = await page.evaluate(() => [...document.querySelectorAll('link[rel="stylesheet"]')].map((l) => l.getAttribute('href')));
    const got = await page.evaluate(collect, vp.height);
    for (const r of got.rules) picked.set(r.k.join('.'), r);
    belowSets.push(new Set(got.below));
    await page.close();
  }
  const sorted = [...picked.values()].sort((a, b) => {
    for (let i = 0; i < Math.max(a.k.length, b.k.length); i++) { const d = (a.k[i] ?? -1) - (b.k[i] ?? -1); if (d) return d; }
    return 0;
  });
  const hide = [...belowSets[0]].filter((sel) => belowSets.every((set) => set.has(sel)));
  data[route] = { sheets, css: sorted.map((r) => r.css).join(''), hide };
  if (++done % 10 === 0) console.log(`${done}/${pages.length}`);
}
await browser.close();
if (!remote) server.close();

/* Identical blocks are stored once. A route can carry several variants (recordings with different
   stylesheet lists: the build names one stylesheet differently from one build to the next); a new
   recording is added beside the others, or replaces the one with the same stylesheet list. `--fresh`
   starts from nothing. A route that no longer exists in out/ (an old address) is dropped. */
const MAX_VARIANTS = 4;
const prior = !process.argv.includes('--fresh') && fs.existsSync('scripts/critical/data.json') ? JSON.parse(fs.readFileSync('scripts/critical/data.json', 'utf8')) : null;
const blocks = prior ? { ...prior.blocks } : {};
const routes = {};
const here = new Set();
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) { if (e.name !== '_next') walk(p); } else if (e.name === 'index.html') { const rel = path.relative(OUT, path.dirname(p)).split(path.sep).join('/'); here.add(rel ? `/${rel}/` : '/'); } } })(OUT);
if (prior) {
  for (const [route, entry] of Object.entries(prior.routes)) if (here.has(route)) routes[route] = Array.isArray(entry) ? [...entry] : [entry];
}
for (const [route, { sheets, css, hide }] of Object.entries(data)) {
  const id = crypto.createHash('sha1').update(css).digest('hex').slice(0, 10);
  blocks[id] = css;
  const variants = (routes[route] ?? []).filter((v) => JSON.stringify(v.sheets) !== JSON.stringify(sheets));
  variants.push({ sheets, block: id, hide });
  routes[route] = variants.slice(-MAX_VARIANTS);
}
/* drop blocks no variant uses any more */
const usedBlocks = new Set(Object.values(routes).flat().map((v) => v.block));
for (const id of Object.keys(blocks)) if (!usedBlocks.has(id)) delete blocks[id];
fs.writeFileSync('scripts/critical/data.json', JSON.stringify({ routes, blocks }));
const bytes = Object.values(blocks).reduce((n, c) => n + c.length, 0);
console.log(`${pages.length} pages recorded, ${Object.keys(routes).length} routes, ${Object.keys(blocks).length} distinct blocks, ${(bytes / 1024).toFixed(0)} KB`);
