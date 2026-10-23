# Wisermind

Marketing site for Wisermind, built frame by frame from the supplied design screenshots.

- **Stack:** Next.js 15 (App Router) · React 19 · TypeScript · CSS Modules
- **Container:** 1300px site-wide (`--container-width`, `.container`)
- **Type:** Inter — body 15px/400, headings 700 (see `app/globals.css`)
- **Images:** source png/jpg live in a local `images/` folder (git-ignored — build material
  only). `npm run images` converts them to WebP into `public/images/`, which *is* committed
  and is what the site serves. Components only ever reference `.webp`.

See [PROJECT-MEMORY.md](PROJECT-MEMORY.md) for the design measurements, tokens and a
per-frame build log.

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run images   # images/*.{png,jpg} -> public/images/*.webp
npm run build    # static export to out/
```

## Deploying

The site is fully static (`output: 'export'` in `next.config.mjs`).

| Cloudflare Pages setting | Value |
| --- | --- |
| Framework preset | Next.js (Static HTML Export) |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node version | 20 or newer |

Don't run `npm run build` while `npm run dev` is running — they share `.next` and the dev
server starts throwing module-not-found errors. Stop dev, `rm -rf .next`, then build.

## website scorecard (tool with a backend)

`/tools/website-scorecard-for-therapists/` scans a therapist's website, asks a short quiz and
returns a private report. The site stays a static export; the server side lives in Cloudflare
Pages Functions (`functions/api/scorecard/`), with the logic shared from `lib/scorecard/`.

| File | What it does |
| --- | --- |
| `lib/scorecard/rules.ts` | **Every weight, threshold, tier, quiz question and fix sentence.** Tune here. |
| `lib/scorecard/score.ts` | Turns scan + answers into a report. No numbers of its own. |
| `lib/scorecard/scan.ts`, `analyze.ts` | The scanner (homepage + up to 3 pages, sitemap, robots, PageSpeed). |
| `functions/api/scorecard/scan.ts` | `POST` streams scan progress. Caches 24 h per site, 5 live scans per IP per hour. |
| `functions/api/scorecard/submit.ts` | `POST` checks Turnstile, scores, saves, sends both emails, returns `{ id }`. |
| `functions/api/scorecard/result/[id].ts` | `GET` returns the stored report. |
| `components/scorecard/` | The tool UI and the report page. |
| `migrations/0001_scorecard.sql` | D1 schema: `reports`, `leads`, `scan_cache`, `rate_limits`. |

### One-time setup

1. **D1 database.** `npx wrangler d1 create wwisermind-scorecard`, then apply the schema with
   `npx wrangler d1 execute wwisermind-scorecard --remote --file=migrations/0001_scorecard.sql`. In the Pages
   dashboard (Settings > Bindings) bind it as `DB` for Production, and for Preview if you want pull request previews to
   work (a second database is fine). Bindings live in the dashboard, not in the repo (see `wrangler.example.toml`).
2. **Bindings and variables** (Pages > Settings, set for Production and Preview). Names are in `.env.example`.
   - Secrets: `PSI_API_KEY` (Google PageSpeed Insights API), `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`.
   - Build variable (public): `NEXT_PUBLIC_TURNSTILE_SITE_KEY`.
   - Optional: `LEAD_NOTIFY_EMAIL`, `RESEND_FROM`, `SITE_ORIGIN` (defaults are in the code: `wwisermind.com`, `admin@wwisermind.com`, `scorecard@wwisermind.com`).
   - The sending domain (`wwisermind.com`) must be verified in Resend.
3. **Turnstile.** Create a widget in the Cloudflare dashboard for `wwisermind.com`.
4. Leave `NEXT_PUBLIC_LOCAL_MAP_TOOL_URL` empty until the local map tool exists. When set, reports for practices
   with an office show a line pointing to it.

Nothing secret is in the repo. `.dev.vars` and `.env*.local` are git-ignored.

### Run it locally

```bash
cp .env.example .dev.vars           # add TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA for testing
npx wrangler d1 migrations apply wwisermind-scorecard --local -c wrangler.example.toml
npm run build                       # writes out/
npx wrangler pages dev out --d1 DB=local-scorecard
```

On `localhost` the form falls back to Cloudflare's always-pass Turnstile test key. Try the scanner alone with
`npm run scorecard:scan -- yourpractice.com` (set `PSI_API_KEY` to include the speed checks).

### Tuning the rules

Edit `lib/scorecard/rules.ts`: `CATEGORIES[].weight` (share of the overall score), `CHECKS[].weight` and
`QUESTIONS[].weight` (share inside a category), each option's `score` (0 to 1), `THRESHOLDS`, `FAIL_BELOW`
(what counts as a gap) and `TIERS`. Then run `npm run scorecard:check`, which also flags em dashes, AI-jargon words and
any mention of reviews or testimonials. Stored reports keep the score they were made with; bump `RULES_VERSION`
when a change makes old and new scores not comparable.

### Notes

- Reports live at `/tools/website-scorecard-for-therapists/r/<id>/`. One static shell page serves them all through the
  `200` rewrite in `public/_redirects`; ids are 128-bit random and the page is `noindex`.
- Pages Functions on the free plan allow 10 ms of CPU per request. The scan is mostly waiting on the network, but if
  scans fail with CPU errors in the logs, the Workers Paid plan lifts that limit.
- The scan reports "we couldn't find X", never "you don't have X": keyword checks can miss things.

## local map assessment (the real tool behind /local-map-assessment/)

`/local-map-assessment/` is the landing page. Its search box hands the practice name and city or ZIP to
`/local-map-assessment/start/`, which runs the tool: lookup, confirm, details (with Turnstile), then
`/local-map-assessment/report/?id=<id>`, which shows the progress screen while the scan runs and the report when it is done.
Same architecture as the scorecard: a static export plus Cloudflare Pages Functions, the same D1 database (binding `DB`).

| File | What it does |
| --- | --- |
| `lib/local-map/rules.ts` | **Every number and sentence**: credit by rank, radius options, limits, timeouts, gap thresholds, fix text. Tune here. |
| `lib/local-map/report.ts`, `grid.ts` | Pure: the 25-point grid, ranks, scores, leaderboard, gap table, why bullets and ranked fixes. |
| `lib/local-map/server/` | DataForSEO client, the stepped scan (`pipeline.ts`), limits, emails. |
| `functions/api/local-map/` | `lookup` (POST), `geocode` (GET), `start` (POST), `status` (GET, also does the scan's work), `retry` (POST). |
| `components/local-map/flow/` | The start flow, the progress screen, the report page and its maps. |
| `migrations/0002_local_map.sql` | `lm_reports`, `lm_leads`, `lm_cost_log`, `lm_limits`. |

### One-time setup

1. Apply the migration to the existing database: `npx wrangler d1 migrations apply wwisermind-scorecard --remote`
   (no new binding: it uses `DB`).
2. In the Pages dashboard (Settings > Variables and Secrets, Production and Preview) add the secrets `DATAFORSEO_LOGIN` and
   `DATAFORSEO_PASSWORD`. `RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `LEAD_NOTIFY_EMAIL`, `RESEND_FROM`, `SITE_ORIGIN` and
   `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are the scorecard's and are shared. Optionally set `NEXT_PUBLIC_LOCAL_MAP_TOOL_URL=/local-map-assessment/`.
3. Use the Workers Paid plan. A status poll parses a few hundred KB of stored results and makes up to ~32 outside calls; the free
   plan's 10 ms of CPU per request is likely to be too little.

### How a scan runs

`start` posts all 100 checks (25 points x 4 search terms, `depth 20`, standard queue) to DataForSEO in one request and returns the
report id at once. The report page then polls `status` every 3 seconds; each poll collects up to 30 finished tasks, and one poll at a
time works on a report (`lock_until`). When the grid is in, the four practices that appear in the top three most often are chosen and
reviews and posts tasks are posted for them and for you; when those are in, the report is built and the "ready" email goes out.
Failed or timed-out checks are kept as missing: the report is built if 60% or more finished (the map shows "?" for the rest), otherwise
the visitor sees a friendly retry that re-posts only the missing checks (twice per report at most).

Limits: 3 reports a day per IP and per email, 20 lookups a day per IP, 7-day cache per place + centre + keywords + radius.

### Watching spend and speed

```sql
select sum(cost) from lm_cost_log;                                   -- total USD, as DataForSEO reports it
select step, count(*), round(avg(ms)), round(sum(cost), 4) from lm_cost_log group by step;
select id, total_cost, (finished_at - created_at) / 1000 as seconds from lm_reports where status = 'done' order by created_at desc;
select timings_json from lm_reports order by created_at desc limit 5;  -- posted, firstReady, gridDone, profilesPosted, finished (unix ms)
```

`rules.ts` has `DFS_PRIORITY` (1 standard, 2 high). Compare `finished_at - created_at` over a few real reports before changing it.

### Try it without credentials

```bash
npm run localmap:test            # the whole backend against a pretend DataForSEO and an in-memory database
npm run localmap:dev             # a local backend on :8788 with the same pretend data; then:
NEXT_PUBLIC_LOCAL_MAP_API=http://localhost:8788 npm run dev
```

### Notes

- Report pages and the start page are `noindex`. Reports are private by an unguessable id; the id is not secret from anyone it is shared with.
- Maps use OpenStreetMap tiles softened to grey, like the Therapy Index map: CARTO's free tiles now need an API key.
- The reviews and posts endpoints (`business_data/google/reviews`, `my_business_updates`) were written from DataForSEO's documentation and
  not yet run against the live API (the Maps SERP shapes were checked against `data/therapyindex/raw`). A failure there is not fatal: those
  gap rows show "n/a". Check `lm_cost_log.note` after the first real report.
