/**

 * Runs after `next build` (next.config.mjs calls it when the build process exits, so it happens
 * whichever command starts the build — Cloudflare runs `npx next build`). For every page that has an entry in data.json whose stylesheet list still
 * matches, puts that page's critical CSS in the <head> and loads the full stylesheets without
 * blocking the first paint (media="print" until they have arrived, then "all"). A page with no entry,
 * or whose stylesheets changed since data.json was made, is left exactly as built.
 */
import fs from 'node:fs';
import path from 'node:path';

const OUT = path.resolve('out');
const dataFile = path.resolve('scripts/critical/data.json');
if (!fs.existsSync(dataFile)) {
  console.log('critical-css: no data.json, skipped');
  process.exit(0);
}
const { routes, blocks } = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
const LINK = /<link rel="stylesheet" href="([^"]+)"( data-precedence="[^"]*")?\/>/g;

let applied = 0;
let stale = 0;
for (const [route, { sheets, block, hide }] of Object.entries(routes)) {
  const file = path.join(OUT, route, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('data-critical')) continue; // already done
  const links = [...html.matchAll(LINK)];
  if (links.length !== sheets.length || links.some((m, i) => m[1] !== sheets[i])) {
    stale++;
    continue;
  }
  html = html.replace(LINK, (m, href, precedence) => `<link rel="stylesheet" href="${href}" media="print"${precedence ?? ''}/>`);
  /* Until every full stylesheet has loaded, what is below the fold is hidden (see generate.mjs). The
     script marks <html data-cp>, then removes it when the sheets are in (or after 4s, whatever happens).
     With no JavaScript the mark is never set and the <noscript> sheets load normally. */
  const hideCss = hide.length ? `html[data-cp] :is(${hide.join(',')}){display:none!important}` : '';
  const script = `<script>(function(d){d.setAttribute('data-cp','');var l=d.ownerDocument.querySelectorAll('link[rel=stylesheet][media=print]'),n=l.length,t;function f(){clearTimeout(t);d.removeAttribute('data-cp')}function g(k){k.media='all';if(!--n)f()}t=setTimeout(function(){for(var i=0;i<l.length;i++)l[i].media='all';f()},4000);for(var i=0;i<l.length;i++)(function(k){k.addEventListener('load',function(){g(k)});k.addEventListener('error',function(){g(k)})})(l[i])})(document.documentElement)</script>`;
  const first = html.indexOf('<link rel="stylesheet"');
  html = html.slice(0, first) + `<style data-critical>${blocks[block]}${hideCss}</style>` + html.slice(first);
  const afterLinks = html.lastIndexOf('media="print"');
  const end = html.indexOf('/>', afterLinks) + 2;
  html = html.slice(0, end) + script + html.slice(end);
  html = html.replace('</head>', `<noscript>${sheets.map((s) => `<link rel="stylesheet" href="${s}"/>`).join('')}</noscript></head>`);
  fs.writeFileSync(file, html);
  applied++;
}
console.log(`critical-css: ${applied} pages updated, ${stale} left as built (stylesheet list changed since data.json)`);
