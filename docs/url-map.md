# URL map

Every internal URL now comes from `lib/routes.ts`. Each URL is lowercase, hyphenated and ends in a slash
(`trailingSlash: true` in `next.config.mjs`, so the export writes `folder/index.html`). Every old address
301s straight to its new one in `public/_redirects`, with and without the trailing slash.

Check the build with `npm run build && node scripts/check-links.mjs`.

## Pricing pages

| Old | New |
| --- | --- |
| `/pricing` | `/pricing/` (hub, kept) |
| `/pricing/hyper-growth` | `/therapist-marketing-packages/` |
| `/pricing/website-design` | `/one-week-therapist-website/` |
| `/pricing/custom-website` | `/custom-therapist-website-design/` |
| `/pricing/care-plans` | `/therapy-website-care-plans/` |
| `/pricing/seo-audit` | `/seo-audit-pricing-for-therapists/` (changed from the brief, see conflicts) |
| `/pricing/one-time-seo` | `/one-time-seo-pricing-for-therapists/` (changed from the brief, see conflicts) |
| `/pricing/seo` | `/seo-packages-for-therapists/` |
| `/pricing/local-seo` | `/local-seo-packages-for-therapists/` |

## Service pages

The slug in `lib/services.ts` stays each service's identity in the data. Only its URL moved.

| Old | New | Main keyword |
| --- | --- | --- |
| `/services/one-week-website` | `/one-week-website-for-therapists/` | one week website for therapists |
| `/services/custom-website-design` | `/therapist-website-design/` | therapist website design |
| `/services/website-hosting` | `/therapist-website-hosting/` | therapist website hosting |
| `/services/website-care-plans` | `/therapist-website-maintenance/` | therapist website maintenance |
| `/services/local-seo` | `/local-seo-for-therapists/` | local SEO for therapists |
| `/services/seo-audit` | `/seo-audit-for-therapists/` | SEO audit for therapists |
| `/services/one-time-seo` | `/one-time-seo-for-therapists/` | one-time SEO for therapists |
| `/services/ongoing-seo` | `/seo-for-therapists/` | SEO for therapists |
| `/services/copywriting` | `/therapist-website-copywriting/` | therapist website copywriting |
| `/services/meta-ads` | `/meta-ads-for-therapists/` | Meta ads for therapists |
| `/services/ai-search-optimization` | `/ai-search-optimization-for-therapists/` | AI search optimization for therapists |
| `/services/ai-website-design` | `/ai-website-design-for-therapists/` | AI website design for therapists |
| `/services/ai-chatbot` | `/ai-chatbot-for-therapists/` | AI chatbot for therapists |

`/services/` is a new hub page that lists every service and links to its pricing page. It did not exist
before: only `/services/<slug>` pages did.

## Pages that did not move (trailing slash added)

`/` `/about/` `/process/` `/results/` `/reviews/` `/faq/` `/contact/` `/blog/` `/blog/<slug>/`
`/blog/category/<slug>/` `/who-we-help/group-practices/` `/who-we-help/solo-practices/`

Not created, because no such page exists today: `/tools/<slug>/` (the Tools menu links to sections of the
homepage), `/work/` (the existing equivalent is `/results/`), `/privacy-policy/` and `/terms/`.

## Keyword conflicts

A service page and a pricing page that target one keyword. The service page keeps the clean keyword URL and
the pricing page takes the "pricing" or "packages" variant. Each links to the other with descriptive text
(the breadcrumb row's right-hand link).

| Keyword | Service page | Pricing page |
| --- | --- | --- |
| SEO audit | `/seo-audit-for-therapists/` | `/seo-audit-pricing-for-therapists/` |
| one-time SEO | `/one-time-seo-for-therapists/` | `/one-time-seo-pricing-for-therapists/` |
| SEO / ongoing SEO, AEO and GEO | `/seo-for-therapists/` | `/seo-packages-for-therapists/` |
| local SEO | `/local-seo-for-therapists/` | `/local-seo-packages-for-therapists/` |
| one-week website | `/one-week-website-for-therapists/` | `/one-week-therapist-website/` |
| custom website design | `/therapist-website-design/` | `/custom-therapist-website-design/` |
| website care | `/therapist-website-maintenance/` | `/therapy-website-care-plans/` |

The brief's map gave the SEO audit and one-time SEO pricing pages the clean keyword URLs, which are the ones
the conflict rule gives to the service pages. The rule won: the pricing pages got the "pricing" variant.
The one-week website pair is still close, see the flagged slugs.

No service page, pricing page or other page shares a title tag or an H1 (`scripts/check-links.mjs` checks this).

## Flagged slugs

| Page | Chosen | Alternatives |
| --- | --- | --- |
| One-week website service | `/one-week-website-for-therapists/` | `/therapist-website-in-one-week/`, `/fast-therapist-website/` |
| Website care service | `/therapist-website-maintenance/` | `/therapist-website-care/`, `/therapist-website-updates-and-backups/` |
| Meta ads service | `/meta-ads-for-therapists/` | `/facebook-ads-for-therapists/`, `/facebook-and-instagram-ads-for-therapists/` |
| SEO audit pricing | `/seo-audit-pricing-for-therapists/` | `/seo-audit-packages-for-therapists/`, the brief's `/seo-audit-for-therapists/` |
| One-time SEO pricing | `/one-time-seo-pricing-for-therapists/` | `/one-time-seo-packages-for-therapists/`, the brief's `/one-time-seo-for-therapists/` |
| Copywriting service | `/therapist-website-copywriting/` | `/copywriting-for-therapists/`, `/therapist-copywriter/` |
