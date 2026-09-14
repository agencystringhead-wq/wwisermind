/* The two audiences as slugs, and the one way to spell a link to one — on its own, with
   no imports, for the same reason lib/service-slugs.ts is: lib/site.ts (the nav) needs
   the link, and lib/audiences.ts reads the case studies out of lib/services.ts, which
   reads the homepage's figures out of lib/site.ts. This file lets the nav point at the
   pages without the three loading in a circle. */

export const AUDIENCE_SLUGS = ['group-practices', 'solo-practices'] as const;

export type AudienceSlug = (typeof AUDIENCE_SLUGS)[number];

/** `/who-we-help/<slug>`. A slug outside AUDIENCE_SLUGS is a type error. */
export function audienceHref(slug: AudienceSlug): string {
  return `/who-we-help/${slug}`;
}
