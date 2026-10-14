/* Every internal URL on the site, in one place.

   The rules: lowercase, hyphens only, a trailing slash on every path (next.config sets
   trailingSlash, so the static export writes folder/index.html), the audience word on commercial
   pages, and short flat top-level URLs for the pages that sell. The hubs (/services/, /pricing/,
   /blog/) and the company pages stay simple.

   It has no imports of its own, so lib/site.ts, lib/services.ts, the pricing data files and the
   components can all read it without loading in a circle.

   A page is moved by changing its value here and its folder under app/. docs/url-map.md has the
   full old to new map, and public/_redirects sends every old address to its new one. */

export type Route = `/${string}`;

/** A path with a section id on the end: `/contact/#book-a-call`. */
const hash = (path: Route, id: string) => `${path}#${id}` as const;

/** A path with a query string on the end: `/contact/?plan=care-plus`. */
const query = (path: Route, params: Record<string, string>) =>
  `${path}?${new URLSearchParams(params).toString()}` as const;

/* --- the service pages: one flat keyword URL each ------------------------------------------ */

/** Keyed by the slug the service has in lib/services.ts, which stays the identity of a service
    in the data. The value is where its page lives. */
export const SERVICE_PATHS = {
  'one-week-website': '/one-week-website-for-therapists/',
  'custom-website-design': '/therapist-website-design/',
  'website-hosting': '/therapist-website-hosting/',
  'website-care-plans': '/therapist-website-maintenance/',
  'local-seo': '/local-seo-for-therapists/',
  'seo-audit': '/seo-audit-for-therapists/',
  'one-time-seo': '/one-time-seo-for-therapists/',
  'ongoing-seo': '/seo-for-therapists/',
  copywriting: '/therapist-website-copywriting/',
  'meta-ads': '/meta-ads-for-therapists/',
  'ai-search-optimization': '/ai-search-optimization-for-therapists/',
  'ai-website-design': '/ai-website-design-for-therapists/',
  'ai-chatbot': '/ai-chatbot-for-therapists/',
} as const satisfies Record<string, Route>;

export type ServiceKey = keyof typeof SERVICE_PATHS;

/** The service pages' folder names under app/, without the slashes. */
export const SERVICE_PARAMS = Object.values(SERVICE_PATHS).map((path) => path.replaceAll('/', ''));

/** The service whose page lives at this folder name, if any. */
export const serviceKeyForParam = (param: string): ServiceKey | undefined =>
  (Object.keys(SERVICE_PATHS) as ServiceKey[]).find(
    (key) => SERVICE_PATHS[key].replaceAll('/', '') === param,
  );

/* --- the pricing pages: the "packages" and "pricing" variants of the keyword URLs ---------- */

const pricing = {
  hub: '/pricing/',
  hyperGrowth: '/therapist-marketing-packages/',
  oneWeekWebsite: '/one-week-therapist-website/',
  customWebsite: '/custom-therapist-website-design/',
  carePlans: '/therapy-website-care-plans/',
  seoAudit: '/seo-audit-pricing-for-therapists/',
  oneTimeSeo: '/one-time-seo-pricing-for-therapists/',
  seo: '/seo-packages-for-therapists/',
  localSeo: '/local-seo-packages-for-therapists/',
} as const satisfies Record<string, Route>;

/** Which pricing page prices which service, and back. A service with no pricing page of its own
    has no entry. Each page links to the other with descriptive text. */
export const SERVICE_PRICING = {
  'one-week-website': pricing.oneWeekWebsite,
  'custom-website-design': pricing.customWebsite,
  'website-care-plans': pricing.carePlans,
  'local-seo': pricing.localSeo,
  'seo-audit': pricing.seoAudit,
  'one-time-seo': pricing.oneTimeSeo,
  'ongoing-seo': pricing.seo,
} as const satisfies Partial<Record<ServiceKey, Route>>;

/* --- everything else ------------------------------------------------------------------- */

export const routes = {
  home: '/',
  about: '/about/',
  process: '/process/',
  results: '/results/',
  reviews: '/reviews/',
  faq: '/faq/',
  contact: '/contact/',
  contactBook: '/contact/#book-a-call',
  contactForm: '/contact/#contact-form',
  blog: '/blog/',
  rss: '/rss.xml',

  services: {
    hub: '/services/',
    /** The page for a service, from its slug in lib/services.ts. */
    page: (key: ServiceKey): Route => SERVICE_PATHS[key],
  },

  pricing,

  /** `/blog/<slug>/` */
  blogPost: (slug: string): Route => `/blog/${slug}/`,
  /** `/blog/category/<slug>/` */
  blogCategory: (slug: string): Route => `/blog/category/${slug}/`,
  /** `/who-we-help/<slug>/` */
  audience: (slug: string): Route => `/who-we-help/${slug}/`,

  /** A section of the homepage: `/#our-story`. */
  homeSection: (id: string) => hash('/', id),
  /** A section of a page: `/pricing/#local-seo`. */
  section: hash,
  /** A page with a query string: the contact form's `?plan=` and `?service=`. */
  withQuery: query,
} as const;

/** Every page that is a route of its own, for the sitemap and llms.txt: the pages that are not
    generated from a list (services, blog posts, categories and audiences are added from their data). */
export const STATIC_PAGES: Route[] = [
  routes.home,
  routes.about,
  routes.process,
  routes.results,
  routes.reviews,
  routes.faq,
  routes.contact,
  routes.blog,
  routes.services.hub,
  ...Object.values(pricing),
];
