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
