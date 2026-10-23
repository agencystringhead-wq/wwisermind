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

/* Inter goes inline with the critical CSS, as a data URI, so the first paint already has it: with the
   file fetched separately it arrives a moment after the first paint on a slow connection, and the swap
   from the stand-in font re-wraps text (a few pixels of layout shift, whatever the stand-in's metrics).
   `block` here, not `swap`: a data URI is ready within a frame or two, and `swap` would paint the
   first frame in the stand-in font anyway, which is the shift again. The block period is that
   instant, not the seconds a network font can take. The face lives in one place, the
   <style id="inter-face"> in the layout's head, and this swaps its text for the data-URI copy:
   declared twice, the browser would switch from the inline copy to the file one when the
   stylesheets landed and show the stand-in for a frame while it did. */
const fontFile = path.resolve('public/fonts/inter-latin-v1.woff2');
const FACE = '@font-face{font-family:Inter;src:url(/fonts/inter-latin-v1.woff2) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}';
const FACE_INLINE = fs.existsSync(fontFile)
  ? `@font-face{font-family:Inter;src:url(data:font/woff2;base64,${fs.readFileSync(fontFile).toString('base64')}) format("woff2");font-weight:100 900;font-style:normal;font-display:block}`
  : FACE;

let applied = 0;
const stale = [];
for (const [route, { sheets, block, hide }] of Object.entries(routes)) {
  const file = path.join(OUT, route, 'index.html');
  if (!fs.existsSync(file)) continue;
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('data-critical')) continue; // already done
  const links = [...html.matchAll(LINK)];
  if (links.length !== sheets.length || links.some((m, i) => m[1] !== sheets[i])) {
    stale.push(route);
    continue;
  }
  html = html.replace(LINK, (m, href, precedence) => `<link rel="stylesheet" href="${href}" media="print"${precedence ?? ''}/>`);
  /* Until every full stylesheet has loaded, what is below the fold is hidden (see generate.mjs). The
     script marks <html data-cp>, then removes it when the sheets are in, or after 2 seconds whatever
     happens: slow or failing stylesheets never leave the page with blocks missing.
     With no JavaScript the mark is never set and the <noscript> sheets load normally. */
  const hideCss = hide.length ? `html[data-cp] :is(${hide.join(',')}){display:none!important}` : '';
  const script = `<script>(function(d){d.setAttribute('data-cp','');var l=d.ownerDocument.querySelectorAll('link[rel=stylesheet][media=print]'),n=l.length,t;function f(){clearTimeout(t);d.removeAttribute('data-cp')}function g(k){k.media='all';if(!--n)f()}t=setTimeout(function(){for(var i=0;i<l.length;i++)l[i].media='all';f()},2000);for(var i=0;i<l.length;i++)(function(k){k.addEventListener('load',function(){g(k)});k.addEventListener('error',function(){g(k)})})(l[i])})(document.documentElement)</script>`;
  html = html.replace(`<style id="inter-face">${FACE}</style>`, `<style id="inter-face">${FACE_INLINE}</style>`);
  const first = html.indexOf('<link rel="stylesheet"');
  html = html.slice(0, first) + `<style data-critical>${blocks[block]}${hideCss}</style>` + html.slice(first);
  const afterLinks = html.lastIndexOf('media="print"');
  const end = html.indexOf('/>', afterLinks) + 2;
  html = html.slice(0, end) + script + html.slice(end);
  html = html.replace('</head>', `<noscript>${sheets.map((s) => `<link rel="stylesheet" href="${s}"/>`).join('')}</noscript></head>`);
  fs.writeFileSync(file, html);
  applied++;
}
console.log(`critical-css: ${applied} pages updated, ${stale.length} left as built`);

/* A stale data.json costs speed, never looks, so the build carries on — but it says so loudly, because
   a silent fallback means the pages are quietly back to blocking on every stylesheet. Set
   CRITICAL_STRICT=1 (or run with --strict) to make it fail the build instead. */
if (stale.length) {
  const bar = '='.repeat(88);
  const lines = [
    '',
    bar,
    `  WARNING: scripts/critical/data.json IS STALE for ${stale.length} of ${Object.keys(routes).length} pages.`,
    '  Their stylesheets are not the ones it was recorded from, so they are built WITHOUT inlined critical',
    '  CSS and block the first paint on every stylesheet again (slower, but looks the same).',
    `  First stale pages: ${stale.slice(0, 5).join('  ')}${stale.length > 5 ? '  ...' : ''}`,
    '  To fix: deploy a preview of this code, then',
    '    node scripts/critical/generate.mjs --url https://<preview>.pages.dev',
    '  and commit scripts/critical/data.json (see the notes at the top of generate.mjs).',
    bar,
    '',
  ];
  console.warn(lines.join('\n'));
  if (process.env.CRITICAL_STRICT === '1' || process.argv.includes('--strict')) process.exit(1);
}
