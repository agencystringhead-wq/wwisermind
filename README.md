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
3. Apply `migrations/0003_local_map_cells.sql` as well (`npx wrangler d1 execute wwisermind-scorecard --remote --file=migrations/0003_local_map_cells.sql`).
4. The tool is built for the Workers **free** plan (10 ms CPU and 50 outside requests per invocation); see "Free plan limits" below.

### How a scan runs

`start` posts all 100 checks (25 points x 4 search terms, `depth 20`, standard queue) to DataForSEO in one request, plus your own reviews and
posts tasks, saves the task ids and returns the report id. It processes no results. The report page then polls `status` every 3 seconds (every
0.4 s while the last answer says `hurry`), and **each poll does one kind of work**, chosen from the report's state in `lm_reports.status`:

| State | What one poll does |
| --- | --- |
| `scanning` | Asks for the results of up to 8 waiting tasks **by their id** (`FETCH_PER_POLL`, fewest tries first), keeps the first 20 results of each finished one as one small row in `lm_cells`, and ticks them off in the same D1 batch. Once half the grid is in, one poll instead picks the eight likeliest competitors from the cells and asks for their reviews and posts. |
| `selecting` | Reads the cells once, picks the final four, asks for any reviews and posts not asked for yet. |
| `profiles` | Collects reviews and posts (the same 8-fetch allowance). Late ones wait 20 seconds, then the report is built without them. |
| `building` | Reads the cells once, scores, builds the gap table and the fixes, stores the finished report. |
| `done` | Nothing: the stored report text is returned as it is, never parsed. |

Collecting never uses DataForSEO's "tasks ready" list: it forgets a task once its results are read, so a read that was not saved would lose the task. Asking by id works again and again, and a task counts as collected only once its results are saved (cell rows and task list are one D1 batch, one transaction). A scan with no progress for 5 minutes of polling is flagged: the visitor sees "Taking longer than usual" and wwisermind gets a `STALLED` alert email.

The scan moves only while a poll arrives, so a visitor who closes the tab and opens the report link again resumes where they stopped. Timeouts count
only time the page was polling (`timings.act`), not time spent away. The visitor is emailed the link when the scan starts, and again when the
report is done (the second email goes out when the scan finishes, which needs the page to be open).
Failed or timed-out checks are kept as missing: the report is built if 60% or more finished (the map shows "?" for the rest), otherwise
the visitor sees a friendly retry that re-posts only the missing checks (twice per report at most).

### Free plan limits and logging

| Function | Outside requests | D1 queries | Heavy work |
| --- | --- | --- | --- |
| `lookup` | 1 (DataForSEO live) | 3 | parse one 30 KB response |
| `geocode` | 1 (OpenStreetMap) | 2 | none |
| `start` | 6 (Turnstile, 3 to DataForSEO, 2 emails) | 9 | build 100 task bodies, parse one 60 KB answer |
| `status`, collecting | at most 11 (ready lists plus 8 fetches) | at most about 14 | parse at most 8 responses of about 40 KB |
| `status`, pick and build steps | 3 or none | 6 to 22 | read about 170 KB of small cell rows once |
| `status`, done | 0 | 1 | none |
| `retry` | 1 | 3 | none |

Every invocation logs a `begin` line and an `end` line (JSON with `"lm":true`, the function, report id, phase, outside requests, D1 queries and
wall time), and sends the same counts back in an `x-lm-trace` response header. **A `begin` line with no matching `end` is an invocation that was killed**,
and says which function and phase it was (CPU limit). An `error` line carries the counts and a `tooManySubrequests` flag. `end-near-limit` is logged when
either count passes 35 of 50. CPU time cannot be read from inside a Worker; use the Pages project's Functions metrics in the Cloudflare dashboard
(Workers & Pages > wwisermind > Metrics), or `npm run localmap:test`, which prints CPU, outside requests and D1 queries for every invocation.

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
- Checked against the live API on 2026-10-23 with real reports: the lookup, the Maps grid, the reviews and the posts endpoints all
  work as written. Actual cost is $0.092 per report (lookup $0.002, 100 grid tasks $0.06, reviews and posts for you and up to eight
  candidate competitors $0.03). Collecting a finished task is free. Timing at standard priority: first results after 8 s, the grid
  complete after 2 to 2.5 minutes, the whole report in about 2 minutes 40 seconds (it was 4 minutes before reviews and posts were
  asked for in parallel). `npm run localmap:smoke -- "Practice name" "City"` repeats the test (it spends real money).
