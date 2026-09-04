/* The list of services as slugs, and the one way to spell a link to one.

   On its own, with no imports, so both lib/site.ts (the nav) and lib/services.ts (the
   pages) can read it: services.ts draws the homepage's case-study data from site.ts, so
   site.ts cannot import services.ts back without the two loading in a circle. */

/** Every service the site sells, in nav order. The page list, the type the nav links are
    checked against, and the order the related cards fall back to all come from this. */
export const SERVICE_SLUGS = [
  'one-week-website',
  'custom-website-design',
  'website-hosting',
  'website-care-plans',
  'local-seo',
  'seo-audit',
  'one-time-seo',
  'ongoing-seo',
  'copywriting',
  'meta-ads',
  'ai-search-optimization',
  'ai-website-design',
  'ai-chatbot',
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

/** `/services/<slug>`. A slug outside SERVICE_SLUGS is a type error, so the nav cannot
    point at a page that does not exist. */
export function serviceHref(slug: ServiceSlug): string {
  return `/services/${slug}`;
}
