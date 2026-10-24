/**
 * Lists every page that is falling back to blocking CSS on a deployment:
 *   npm run critical:check -- https://wwisermind.com
 * It fetches each route recorded in scripts/critical/data.json and looks for the inlined
 * <style data-critical>. Exits 1 if any page lacks it, so it can gate a release or run after a deploy.
 * A page without it still looks the same, but waits on every stylesheet before its first paint.
 */
import fs from 'node:fs';

const base = (process.argv[2] ?? 'https://wwisermind.com').replace(/\/$/, '');
const { routes } = JSON.parse(fs.readFileSync(new URL('./data.json', import.meta.url), 'utf8'));
const paths = Object.keys(routes);
const missing = [];

let next = 0;
async function worker() {
  while (next < paths.length) {
    const route = paths[next++];
    try {
      const res = await fetch(`${base}${route}?cc=${Date.now()}`, { redirect: 'follow' });
      const html = await res.text();
      if (res.status !== 200) missing.push(`${route} (HTTP ${res.status})`);
      else if (!html.includes('<style data-critical>')) missing.push(route);
    } catch (error) {
      missing.push(`${route} (${error.message})`);
    }
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

console.log(`${base}: ${paths.length - missing.length} of ${paths.length} recorded pages have critical CSS inlined`);
if (missing.length) {
  console.log(`FALLING BACK to blocking CSS (${missing.length}):`);
  for (const route of missing.sort()) console.log(`  ${route}`);
  process.exit(1);
}
