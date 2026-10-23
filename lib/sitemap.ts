import { audiences } from '@/lib/audiences';
import { getAllPosts, getCategories } from '@/lib/blog';
import { getStatesWithData } from '@/lib/crisis-resources';
import { freebiePath, freebies, isLive } from '@/lib/freebies';
import { routes, SERVICE_PATHS } from '@/lib/routes';
import { categoryHubs, serviceCategoryIds } from '@/lib/categories';
import { services, type ServiceCategory } from '@/lib/services';
import { getTool, tools } from '@/lib/tools';
import { INDEXABLE } from '@/lib/therapyindex/config';
import { getMarketViews, indexableProfiles } from '@/lib/therapyindex/data';

/* ==========================================================================
   The one list behind both sitemaps: the human page at /sitemap/ (grouped links) and the XML
   file at /sitemap.xml (app/sitemap.ts). A page is added once, here or in the data module it
   already lives in, and shows up in both.

   Read from data wherever a data module has it: the services, the audiences, the freebies and
   the blog. Only what has no data source is spelled out below: the main pages, the eight
   pricing pages' labels and the studio and legal pages.

   Server-only: the blog reads the file system.
   ========================================================================== */

/** The tools and freebies still marked "Soon" are left out of both sitemaps, because their pages
    are sent noindex and a sitemap must not list a page that asks not to be indexed. Flip this to
    true on the day they launch. */
export const INCLUDE_COMING_SOON = false;

/** How many of the newest posts the human page lists under Blog. The XML file lists them all. */
const BLOG_POSTS_ON_PAGE = 20;

export type SitemapLink = {
  label: string;
  href: string;
  /** False for a link that is not a page of its own (an anchor on /contact/) or is not HTML
      (/sitemap.xml): shown on the human page, left out of the XML file. */
  xml?: boolean;
  children?: SitemapLink[];
};

export type SitemapGroup = { title: string; links: SitemapLink[] };

const link = (label: string, href: string, xml = true): SitemapLink => ({ label, href, xml });

/** Group titles as the human page prints them. */
const CATEGORY_TITLES: Record<ServiceCategory, string> = {
  'website-design': 'Website design',
  marketing: 'Marketing',
  ai: 'AI services',
};

const servicesIn = (category: ServiceCategory): SitemapLink[] =>
  services
    .filter((service) => service.category === category && !service.draft)
    .map((service) => link(service.name, SERVICE_PATHS[service.slug]));

/** A tool marked "hidden" in lib/tools.ts is in no sitemap, whatever its own page says. */
const hiddenToolRoutes = new Set<string>(
  tools.filter((tool) => tool.status === 'hidden').map((tool) => tool.route),
);

const liveFreebies = freebies.filter(
  (freebie) =>
    (INCLUDE_COMING_SOON || isLive(freebie)) && !hiddenToolRoutes.has(freebiePath(freebie)),
);

export function sitemapGroups(): SitemapGroup[] {
  const posts = getAllPosts();

  return [
    {
      title: 'Main',
      links: [
        link('Home', routes.home),
        link('Results', routes.results),
        link('Reviews', routes.reviews),
        link('Contact', routes.contact),
        link('Book a free call', routes.contactBook, false),
        link('All services', routes.services.hub),
      ],
    },
    ...serviceCategoryIds.map((category) => ({
      title: CATEGORY_TITLES[category],
      links: [
        /* the category's hub first, then each service in it */
        link(`All ${categoryHubs[category].name.toLowerCase()}`, categoryHubs[category].route),
        ...servicesIn(category),
      ],
    })),
    {
      title: 'Pricing',
      links: [
        link('All pricing', routes.pricing.hub),
        link('Hyper Growth Marketing', routes.pricing.hyperGrowth),
        link('One-Week Website', routes.pricing.oneWeekWebsite),
        link('Custom Website Design', routes.pricing.customWebsite),
        link('WordPress Care Plans', routes.pricing.carePlans),
        link('SEO Audit', routes.pricing.seoAudit),
        link('One-Time SEO', routes.pricing.oneTimeSeo),
        link('Ongoing SEO, AEO & GEO', routes.pricing.seo),
        link('Local SEO Packages', routes.pricing.localSeo),
      ],
    },
    {
      title: 'Who we help',
      links: [
        link('Who we help', routes.hubs.whoWeHelp),
        ...audiences.map((audience) => link(audience.name, routes.audience(audience.slug))),
      ],
    },
    {
      title: 'Free resources',
      links: [
        link('Free resources', routes.freebies.hub),
        ...liveFreebies.map((freebie) => link(freebie.title, freebiePath(freebie))),
        link(getTool('local-map-assessment').name, getTool('local-map-assessment').route),
        link(getTool('crisis-resources').name, getTool('crisis-resources').route),
        link('Help now widget', routes.tools.helpNowWidget),
      ],
    },
    {
      title: 'Studio',
      links: [
        link('About Us', routes.about),
        link('Our Process', routes.process),
        {
          ...link('Blog', routes.blog),
          children: posts
            .slice(0, BLOG_POSTS_ON_PAGE)
            .map((post) => link(post.title, routes.blogPost(post.slug))),
        },
        link('FAQs', routes.faq),
        link('Refer wwisermind', routes.refer),
      ],
    },
    /* The Therapy Index pages are noindex until INDEXABLE (lib/therapyindex/config.ts) is flipped, and a sitemap
       must not list a page that asks not to be indexed, so the group appears with the flag. */
    ...(INDEXABLE
      ? [
          {
            title: 'Therapy Index',
            links: [
              link(getTool('therapy-index').name, getTool('therapy-index').route),
              link('Therapy Index methodology', routes.therapyIndex.methodology),
              ...getMarketViews().map((view) => link(`${view.city.name} therapist rankings`, view.path)),
            ],
          },
        ]
      : []),
    {
      title: 'Legal',
      links: [
        link('Privacy Policy', routes.privacyPolicy),
        link('Terms & Conditions', routes.termsAndConditions),
        link('Cookie Policy', routes.cookiePolicy),
        link('XML sitemap', routes.sitemapXml, false),
      ],
    },
  ];
}

export type SitemapEntry = { path: string; lastModified?: string };

/** Every page for /sitemap.xml: the human page's links that are pages, plus the pages that have
    no place on it (the human sitemap itself, the blog's category pages and every post). */
export function sitemapEntries(): SitemapEntry[] {
  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];
  const add = (path: string, lastModified?: string) => {
    if (seen.has(path)) return;
    seen.add(path);
    entries.push({ path, lastModified });
  };

  const walk = (links: SitemapLink[]) => {
    for (const item of links) {
      if (item.xml !== false) add(item.href);
      if (item.children) walk(item.children);
    }
  };
  sitemapGroups().forEach((group) => walk(group.links));

  add(routes.sitemap);
  getStatesWithData().forEach((state) => add(routes.crisisState(state.slug)));
  /* Practice profiles have no place on the human page; the indexable ones (see PROFILE_INDEX_MIN_SCORE) go in the XML file with
     the rest of the Therapy Index. The others stay live but are noindex and left out. */
  if (INDEXABLE) indexableProfiles().forEach((p) => add(routes.therapyIndex.practice(p.state, p.city, p.practice)));
  getCategories().forEach((category) => add(routes.blogCategory(category.slug)));
  /* After the loop on purpose: the human page lists the newest posts with no date, and the XML
     file wants each post's own updated date, so the entry is replaced here. */
  getAllPosts().forEach((post) => {
    const existing = entries.find((entry) => entry.path === routes.blogPost(post.slug));
    if (existing) existing.lastModified = post.updatedAt;
    else add(routes.blogPost(post.slug), post.updatedAt);
  });

  return entries;
}
