/* The five category hubs: the words each one carries and where it lives.

   Pure data, imported by lib/services.ts (the `category` on each service), the hub pages, the
   menu and the sitemap. The services on a service hub are not listed here: each hub filters
   lib/services.ts by `category`, so a service added there appears on its hub by itself. */

import { routes, type Route } from '@/lib/routes';

export type ServiceCategoryId = 'website-design' | 'marketing' | 'ai';

export type CategoryHubId = ServiceCategoryId | 'who-we-help' | 'free-resources';

export type CategoryHub = {
  id: CategoryHubId;
  route: Route;
  /** What the hub is called in a breadcrumb, a menu and the sitemap. */
  name: string;
  h1: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
};

export const categoryHubs: Record<CategoryHubId, CategoryHub> = {
  'website-design': {
    id: 'website-design',
    route: routes.hubs.websiteDesign,
    name: 'Website Design',
    h1: 'Website design for therapists',
    intro:
      'Four ways to get a website that brings in clients. Pick the speed and level of care that fits your practice.',
    metaTitle: 'Website Design for Therapists | wwisermind',
    metaDescription:
      'Website design for therapists: a one-week site, a custom build, managed hosting and care plans. Pick the speed and care that fit your practice.',
  },
  marketing: {
    id: 'marketing',
    route: routes.hubs.marketing,
    name: 'Marketing',
    h1: 'Marketing for therapists',
    intro:
      'Get found in your city, on Google and in AI answers. Then turn that attention into booked sessions.',
    metaTitle: 'Marketing for Therapists | SEO, Local SEO & Ads | wwisermind',
    metaDescription:
      'Marketing for therapists: local SEO, SEO audits, ongoing SEO, AEO and GEO, copywriting and Meta ads that turn searches into booked sessions.',
  },
  ai: {
    id: 'ai',
    route: routes.hubs.ai,
    name: 'AI Services',
    h1: 'AI services for therapists',
    intro:
      'AI that helps families find you and get answers faster, with a human checking every piece.',
    metaTitle: 'AI Services for Therapists | wwisermind',
    metaDescription:
      'AI services for therapists: AI search optimization, AI website design and an AI chatbot, each one checked by a person before it goes live.',
  },
  'who-we-help': {
    id: 'who-we-help',
    route: routes.hubs.whoWeHelp,
    name: 'Who We Help',
    h1: 'Who we help',
    intro:
      'Solo therapists and group practices. Different needs, same goal: the right clients finding you.',
    metaTitle: 'Who We Help | Solo & Group Practices | wwisermind',
    metaDescription:
      'wwisermind builds websites and marketing for solo therapists and group practices. See how each one is set up to get the right clients finding you.',
  },
  'free-resources': {
    id: 'free-resources',
    route: routes.hubs.freeResources,
    name: 'Free Resources',
    h1: 'Free resources for therapists',
    intro: 'Tools, guides and templates for running a private practice. All free, no credit card.',
    metaTitle: 'Free Resources for Therapists | Tools & Templates | wwisermind',
    metaDescription:
      'Free tools, guides and templates for therapists: website scorecard, map check, Therapy Index, Good Faith Estimate, crisis resources and more.',
  },
};

/** The hub for a service category. */
export const serviceCategoryHub = (id: ServiceCategoryId): CategoryHub => categoryHubs[id];

/** The service categories in the order the hubs and the menu list them. */
export const serviceCategoryIds: ServiceCategoryId[] = ['website-design', 'marketing', 'ai'];
