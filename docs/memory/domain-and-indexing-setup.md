---
name: domain-and-indexing-setup
description: How wwisermind.com indexing is already configured (sitemap, robots, pages.dev noindex, www redirect) and the pitfalls when auditing it.
metadata:
  type: project
---

Verified live on 2026-10-21; nothing needed changing:
- `app/robots.ts` writes `Sitemap: https://wwisermind.com/sitemap.xml`. `siteConfig.url` in `lib/site.ts` is `https://wwisermind.com`, and every canonical, og:url and JSON-LD URL is built from it via `absUrl`.
- `app/sitemap.ts` + `lib/sitemap.ts` list 58 URLs, all on the apex, all returning 200. Blog posts use their own `updatedAt` as lastmod; every other page gets the build date (no per-page change date exists in the data). Coming-soon freebies/tools and draft pages are left out because they are noindex.
- `public/_headers` sends `X-Robots-Tag: noindex` for `wwisermind.pages.dev` and its preview URLs; pages there also canonicalize to wwisermind.com. No redirect from pages.dev: `_redirects` can't match on host, and a Pages Function would run on every request (100k/day free limit) and block previewing on the production .pages.dev address. Offer it only if the user insists, scoped to the exact host.
- www and http both 301 to https://wwisermind.com (http://www takes two hops).
- The one remaining `pages.dev` string in the repo is `https://evolvetherapy.pages.dev/` in `lib/results.ts`: a client's site in the Results showcase. Do not "fix" it to wwisermind.com.

**Why:** a request to "fix indexing" turned out to be fully done already; the useful work was verifying, not editing.
**How to apply:** check live robots.txt, sitemap.xml, headers and redirects first. When scripting checks on Windows, write temp files to the scratchpad (not /tmp, which Python can't see), strip `\r` from files Python writes before looping them in bash, and don't `curl -w` with `\n` inside double quotes in loops. See [[pages-dev-deploy-lag]] for fresh-deploy delays.
