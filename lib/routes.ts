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

/* --- the service pages: /services/<keyword>-for-therapists/ ------------------------------------- */

/** Keyed by the slug the service has in lib/services.ts, which stays the identity of a service
    in the data. The value is where its page lives. */
export const SERVICE_PATHS = {
  'one-week-website': '/services/one-week-website-for-therapists/',
  'custom-website-design': '/services/custom-website-design-for-therapists/',
  'website-hosting': '/services/website-hosting-for-therapists/',
  'website-care-plans': '/services/wordpress-care-plans-for-therapists/',
  'local-seo': '/services/local-seo-for-therapists/',
  'seo-audit': '/services/seo-audit-for-therapists/',
  'one-time-seo': '/services/one-time-seo-for-therapists/',
  'ongoing-seo': '/services/seo-for-therapists/',
  copywriting: '/services/copywriting-for-therapists/',
  'meta-ads': '/services/meta-ads-for-therapists/',
  'ai-search-optimization': '/services/ai-search-optimization-for-therapists/',
  'ai-website-design': '/services/ai-website-design-for-therapists/',
  'ai-chatbot': '/services/ai-chatbot-for-therapists/',
} as const satisfies Record<string, Route>;

export type ServiceKey = keyof typeof SERVICE_PATHS;

/** The last folder of each service page, for generateStaticParams. */
export const SERVICE_PARAMS = Object.values(SERVICE_PATHS).map((path) => path.split('/')[2]);

/** The service whose page lives at this folder name, if any. */
export const serviceKeyForParam = (param: string): ServiceKey | undefined =>
  (Object.keys(SERVICE_PATHS) as ServiceKey[]).find((key) => SERVICE_PATHS[key].split('/')[2] === param);

/* --- the pricing pages: /pricing/<same slug>/, mirroring the service pages ------------------ */

const pricing = {
  hub: '/pricing/',
  hyperGrowth: '/pricing/hyper-growth-marketing-for-therapists/',
  oneWeekWebsite: '/pricing/one-week-website-for-therapists/',
  customWebsite: '/pricing/custom-website-design-for-therapists/',
  carePlans: '/pricing/wordpress-care-plans-for-therapists/',
  seoAudit: '/pricing/seo-audit-for-therapists/',
  oneTimeSeo: '/pricing/one-time-seo-for-therapists/',
  seo: '/pricing/seo-for-therapists/',
  localSeo: '/pricing/local-seo-for-therapists/',
} as const satisfies Record<string, Route>;

/** Which pricing page is each service's twin, and back. A service with no pricing page of its own
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

/* --- the free-tools hub, the freebie pages and the tool pages -------------------------------- */

/** Keyed by the slug in lib/freebies.ts: the page's address. Every download, template and tool sits
    under /free-tools/. (They used to be under /freebies/ and /tools/; public/_redirects sends every
    old address here.) */
export const FREEBIE_PATHS = {
  '2027-full-caseload-plan-for-therapists': '/free-tools/2027-full-caseload-plan-for-therapists/',
  'ai-visibility-report': '/free-tools/ai-visibility-report/',
  'website-scorecard-for-therapists': '/free-tools/website-scorecard-for-therapists/',
  'good-faith-estimate': '/free-tools/good-faith-estimate/',
  'psychology-today-profile-kit-for-therapists':
    '/free-tools/psychology-today-profile-kit-for-therapists/',
  'google-business-profile-checklist-for-therapists':
    '/free-tools/google-business-profile-checklist-for-therapists/',
  'social-media-posts-for-therapists': '/free-tools/social-media-posts-for-therapists/',
  'business-card-template-for-therapists': '/free-tools/business-card-template-for-therapists/',
  'email-signature-for-therapists': '/free-tools/email-signature-for-therapists/',
} as const satisfies Record<string, Route>;

export type FreebieKey = keyof typeof FREEBIE_PATHS;

/** The freebies that have a page folder of their own under app/free-tools/, so the shared [slug] page
    leaves them out: the tools, not the downloads. */
export const TOOL_PAGE_KEYS: FreebieKey[] = [
  'ai-visibility-report',
  'website-scorecard-for-therapists',
  'good-faith-estimate',
];

/* --- everything else ------------------------------------------------------------------- */

export const routes = {
  home: '/',
  about: '/about/',
  process: '/process/',
  results: '/results/',
  reviews: '/reviews/',
  faq: '/faq/',
  contact: '/contact/',
  contactBook: '/contact/#book',
  contactForm: '/contact/#contact-form',
  /** The free Local Map Assessment landing page. It has its own header and footer (see usesOwnChrome in lib/site.ts). */
  localMapAssessment: '/free-tools/local-map-assessment/',
  blog: '/blog/',
  rss: '/rss.xml',

  services: {
    hub: '/services/',
    /** The page for a service, from its slug in lib/services.ts. */
    page: (key: ServiceKey): Route => SERVICE_PATHS[key],
    oneWeekWebsite: SERVICE_PATHS['one-week-website'],
    customWebsite: SERVICE_PATHS['custom-website-design'],
    hosting: SERVICE_PATHS['website-hosting'],
    carePlans: SERVICE_PATHS['website-care-plans'],
    localSeo: SERVICE_PATHS['local-seo'],
    seoAudit: SERVICE_PATHS['seo-audit'],
    oneTimeSeo: SERVICE_PATHS['one-time-seo'],
    seo: SERVICE_PATHS['ongoing-seo'],
    copywriting: SERVICE_PATHS.copywriting,
    metaAds: SERVICE_PATHS['meta-ads'],
    aiSearch: SERVICE_PATHS['ai-search-optimization'],
    aiWebsite: SERVICE_PATHS['ai-website-design'],
    aiChatbot: SERVICE_PATHS['ai-chatbot'],
  },

  pricing,

  /** The five category hubs (lib/categories.ts). The free-resources hub is the one /free-tools/ hub:
      /freebies/, /tools/ and /free-resources-for-therapists/ all redirect to it. */
  hubs: {
    websiteDesign: '/website-design-for-therapists/',
    marketing: '/marketing-for-therapists/',
    ai: '/ai-services-for-therapists/',
    whoWeHelp: '/who-we-help/',
    freeResources: '/free-tools/',
  },

  freebies: {
    hub: '/free-tools/',
    fullCaseloadPlan: FREEBIE_PATHS['2027-full-caseload-plan-for-therapists'],
    psychologyTodayKit: FREEBIE_PATHS['psychology-today-profile-kit-for-therapists'],
    googleBusinessProfile: FREEBIE_PATHS['google-business-profile-checklist-for-therapists'],
    socialMediaPosts: FREEBIE_PATHS['social-media-posts-for-therapists'],
    businessCard: FREEBIE_PATHS['business-card-template-for-therapists'],
    emailSignature: FREEBIE_PATHS['email-signature-for-therapists'],
    page: (key: FreebieKey): Route => FREEBIE_PATHS[key],
  },

  tools: {
    aiVisibilityReport: FREEBIE_PATHS['ai-visibility-report'],
    websiteScorecard: FREEBIE_PATHS['website-scorecard-for-therapists'],
    goodFaithEstimate: FREEBIE_PATHS['good-faith-estimate'],
    /** The public helpline directory, and the install page for the help now widget. */
    crisisResources: '/free-tools/crisis-resources/',
    helpNowWidget: '/free-tools/crisis-resources/help-now-widget/',
  },

  /* The footer's bottom row. The legal pages share one template (components/legal/LegalPage.tsx)
     and read their words from lib/legal.ts. */
  privacyPolicy: '/privacy-policy/',
  termsAndConditions: '/terms-and-conditions/',
  cookiePolicy: '/cookie-policy/',
  refer: '/refer-wwisermind/',
  sitemap: '/sitemap/',
  /** The machine-readable one, written by app/sitemap.ts. */
  sitemapXml: '/sitemap.xml',

  /** `/blog/<slug>/` */
  blogPost: (slug: string): Route => `/blog/${slug}/`,
  /** `/blog/category/<slug>/` */
  blogCategory: (slug: string): Route => `/blog/category/${slug}/`,
  /** `/free-tools/crisis-resources/<state>/`, the state's full lowercase name. */
  crisisState: (slug: string): Route => `/free-tools/crisis-resources/${slug}/`,
  /** `/who-we-help/<slug>/` */
  audience: (slug: string): Route => `/who-we-help/${slug}/`,

  /** The Therapy Index: the hub, the methodology page, a city report and a practice profile. */
  therapyIndex: {
    hub: '/therapyindex/',
    methodology: '/therapyindex/methodology/',
    market: (state: string, city: string): Route => `/therapyindex/${state}/${city}/`,
    practice: (state: string, city: string, practice: string): Route => `/therapyindex/${state}/${city}/${practice}/`,
  },

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
  routes.freebies.hub,
  ...Object.values(pricing),
];
