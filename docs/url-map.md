# URL map

Two folders: `/services/` says what we do, `/pricing/` says what it costs, and a service and its pricing
twin share one slug. Every internal URL comes from `lib/routes.ts`. Each URL is lowercase, hyphenated and
ends in a slash (`trailingSlash: true` in `next.config.mjs`, so the export writes `folder/index.html`).
Every old address 301s straight to its new one in `public/_redirects`, with and without the trailing slash.

Check the build with `npm run build && node scripts/check-links.mjs`.

## Service pages

The slug in `lib/services.ts` stays each service's identity in the data. Only its URL moved.

| Original | Briefly live (top-level) | New |
| --- | --- | --- |
| `/services/one-week-website` | `/one-week-website-for-therapists/` | `/services/one-week-website-for-therapists/` |
| `/services/custom-website-design` | `/therapist-website-design/` | `/services/custom-website-design-for-therapists/` |
| `/services/website-care-plans` | `/therapist-website-maintenance/` | `/services/wordpress-care-plans-for-therapists/` |
| `/services/seo-audit` | `/seo-audit-for-therapists/` | `/services/seo-audit-for-therapists/` |
| `/services/one-time-seo` | `/one-time-seo-for-therapists/` | `/services/one-time-seo-for-therapists/` |
| `/services/ongoing-seo` | `/seo-for-therapists/` | `/services/seo-for-therapists/` |
| `/services/local-seo` | `/local-seo-for-therapists/` | `/services/local-seo-for-therapists/` |
| `/services/website-hosting` | `/therapist-website-hosting/` | `/services/website-hosting-for-therapists/` (derived) |
| `/services/copywriting` | `/therapist-website-copywriting/` | `/services/copywriting-for-therapists/` (derived) |
| `/services/meta-ads` | `/meta-ads-for-therapists/` | `/services/meta-ads-for-therapists/` |
| `/services/ai-search-optimization` | `/ai-search-optimization-for-therapists/` | `/services/ai-search-optimization-for-therapists/` |
| `/services/ai-website-design` | `/ai-website-design-for-therapists/` | `/services/ai-website-design-for-therapists/` |
| `/services/ai-chatbot` | `/ai-chatbot-for-therapists/` | `/services/ai-chatbot-for-therapists/` |

`/services/` is a hub page listing every service and linking to its pricing twin.

## Pricing pages

| Original | Briefly live (top-level) | New |
| --- | --- | --- |
| `/pricing` | | `/pricing/` (hub, kept) |
| `/pricing/website-design` | `/one-week-therapist-website/` | `/pricing/one-week-website-for-therapists/` |
| `/pricing/custom-website` | `/custom-therapist-website-design/` | `/pricing/custom-website-design-for-therapists/` |
| `/pricing/care-plans` | `/therapy-website-care-plans/` | `/pricing/wordpress-care-plans-for-therapists/` |
| `/pricing/seo-audit` | `/seo-audit-pricing-for-therapists/` | `/pricing/seo-audit-for-therapists/` |
| `/pricing/one-time-seo` | `/one-time-seo-pricing-for-therapists/` | `/pricing/one-time-seo-for-therapists/` |
| `/pricing/seo` | `/seo-packages-for-therapists/` | `/pricing/seo-for-therapists/` |
| `/pricing/local-seo` | `/local-seo-packages-for-therapists/` | `/pricing/local-seo-for-therapists/` |
| `/pricing/hyper-growth` | `/therapist-marketing-packages/` | `/pricing/hyper-growth-marketing-for-therapists/` |

## Pages that did not move (trailing slash added)

`/` `/about/` `/process/` `/results/` `/reviews/` `/faq/` `/contact/` `/blog/` `/blog/<slug>/`
`/blog/category/<slug>/` `/who-we-help/group-practices/` `/who-we-help/solo-practices/`

Not created, because no such page exists today: `/tools/` and `/tools/<slug>/` (the Tools menu links to
sections of the homepage), `/work/` (the existing equivalent is `/results/`), `/privacy-policy/`, `/terms/`.

## Topics without a twin

Pricing page, no service page: Hyper Growth Marketing.

Service page, no pricing page: website hosting, copywriting, Meta ads, AI search optimization, AI website
design, AI chatbot.

## Slugs worth a second look

| Page | Chosen | Alternatives |
| --- | --- | --- |
| WordPress care plans service | `/services/wordpress-care-plans-for-therapists/` | `/services/website-care-plans-for-therapists/`, `/services/website-maintenance-for-therapists/` |
| Website hosting service | `/services/website-hosting-for-therapists/` | `/services/therapist-website-hosting-for-therapists/`, `/services/managed-hosting-for-therapists/` |
| Copywriting service | `/services/copywriting-for-therapists/` | `/services/website-copywriting-for-therapists/`, `/services/therapist-copywriting-for-therapists/` |

The care plans service page describes care for the static sites we build, while the pricing page is for
WordPress sites only. The slug follows the brief's instruction to share one slug, but the two pages are not
quite the same product.

## Titles changed

Service titles are now `{Service} for Therapists | wwisermind` (the old ones used an em dash).
Pricing titles are now `{Service} Pricing for Therapists | {price hook} | wwisermind`. No H1 was changed:
the crawl found no two pages sharing a title or an H1.
