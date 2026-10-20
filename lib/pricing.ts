import { routes } from '@/lib/routes';
import { serviceHref, type ServiceSlug } from '@/lib/service-slugs';

/* ==========================================================================
   /pricing.

   One data file, one page, the same pattern as lib/services.ts: every package card, the
   featured block's price and the FAQ read from here, and nothing on the page types a price
   of its own.

   PRICES ARE NOT FILLED IN. Every `startingPrice` is null until the owner supplies the
   number; while it is null the page prints "Price on request" and no Offer structured data
   is emitted for that package. Never put a guessed figure here.

   Imports only service-slugs.ts, so site.ts and the pages can read it without a cycle.
   ========================================================================== */

export type PricingGroup = 'build' | 'grow';

export type PricingEntry = {
  /** Also the anchor id on /pricing, so `/pricing#local-seo` lands on this package's card. */
  id: ServiceSlug;
  group: PricingGroup;
  name: string;
  shortDescription: string;
  /** null until the owner supplies a number: the page then reads "Price on request". */
  startingPrice: number | null;
  priceUnit: 'one-time' | '/mo';
  /** The package's own service page. */
  href: string;
  image: { src: string; width: number; height: number; alt: string };
  /** Three or four short lines, behind the card's "What's included +" toggle. */
  includes: string[];
  /** False for Website Care Plans: no price is drawn for it anywhere on /pricing. */
  showPrice: boolean;
};

/** The two column labels, the same words the Pricing mega menu uses: "Build / Website
    Packages". */
export const pricingGroups: Record<PricingGroup, { lead: string; title: string }> = {
  build: { lead: 'Build', title: 'Website Packages' },
  grow: { lead: 'Grow', title: 'Marketing Packages' },
};

/** TODO: confirm the currency before any price goes live. It is only read once a price
    exists, for the Offer structured data and the figure on the card. */
export const PRICE_CURRENCY = 'USD';

export const pricingEntries: PricingEntry[] = [
  {
    id: 'one-week-website',
    group: 'build',
    name: 'One Week Website',
    shortDescription: 'Your practice online in seven days, designed and built for you.',
    startingPrice: null, // TODO: price
    priceUnit: 'one-time',
    href: serviceHref('one-week-website'),
    image: {
      src: '/images/pricing/pricing-one-week-website.webp',
      width: 1500,
      height: 1000,
      alt: 'A newly launched therapist website on a laptop beside a week planner with the last day starred',
    },
    // TODO: check these draft lines
    includes: [
      'Custom design for your practice',
      'Mobile-first build',
      'HIPAA-aware contact forms',
      'Launch and handover',
    ],
    showPrice: true,
  },
  {
    id: 'custom-website-design',
    group: 'build',
    name: 'Custom Website Design',
    shortDescription: 'A site designed around your practice, your clinicians and your voice.',
    startingPrice: null, // TODO: price
    priceUnit: 'one-time',
    href: serviceHref('custom-website-design'),
    image: {
      src: '/images/pricing/pricing-custom-website-design.webp',
      width: 1500,
      height: 1000,
      alt: 'A designer and a practice owner choosing between custom page proofs and swatches',
    },
    // TODO: check these draft lines
    includes: [
      'Design built from scratch for your practice',
      'Pages for every clinician and service',
      'Booking and intake set up',
      'On-page SEO basics',
    ],
    showPrice: true,
  },
  {
    id: 'website-hosting',
    group: 'build',
    name: 'Website Hosting',
    shortDescription: 'Fast, secure hosting that we manage so you never have to.',
    startingPrice: null, // TODO: price
    priceUnit: '/mo',
    href: serviceHref('website-hosting'),
    image: {
      src: '/images/pricing/pricing-website-hosting.webp',
      width: 1500,
      height: 1000,
      alt: 'A practice website left running on the reception laptop after hours, a small green status light on',
    },
    // TODO: check these draft lines
    includes: [
      'Fast, secure managed hosting',
      'SSL certificate',
      'Regular backups',
      'Help when something breaks',
    ],
    showPrice: true,
  },
  {
    id: 'website-care-plans',
    group: 'build',
    name: 'Website Care Plans',
    shortDescription: 'Updates, fixes and upkeep handled while you are in session.',
    startingPrice: null, // priced on its own page; never shown on /pricing
    priceUnit: '/mo',
    /* The plans and prices live on /pricing/wordpress-care-plans-for-therapists/. The service page
       is linked from the Services menu. */
    href: routes.pricing.carePlans,
    image: {
      src: '/images/pricing/pricing-website-care-plans.webp',
      width: 1500,
      height: 1000,
      alt: 'A therapist relaxing with tea and a book while her site is looked after',
    },
    // TODO: check these draft lines
    includes: [
      'Content updates when you need them',
      'Security and software upkeep',
      'Small fixes and tweaks',
    ],
    showPrice: false,
  },
  {
    id: 'local-seo',
    group: 'grow',
    name: 'Local SEO',
    shortDescription: 'Be the practice people find when they search in your city.',
    startingPrice: null, // TODO: price
    priceUnit: '/mo',
    href: serviceHref('local-seo'),
    image: {
      src: '/images/pricing/pricing-local-seo.webp',
      width: 1500,
      height: 1000,
      alt: 'A therapist outside his practice holding up a map with his practice at the top',
    },
    // TODO: check these draft lines
    includes: [
      'Google Business Profile set up and tuned',
      'Directory and citation listings',
      'Local keyword targeting',
      'Reviews guidance',
    ],
    showPrice: true,
  },
  {
    id: 'seo-audit',
    group: 'grow',
    name: 'SEO Audit',
    shortDescription: 'An honest read on how visible your practice is today.',
    startingPrice: null, // TODO: price
    priceUnit: 'one-time',
    href: serviceHref('seo-audit'),
    image: {
      src: '/images/pricing/pricing-seo-audit.webp',
      width: 1500,
      height: 1000,
      alt: 'A printed site assessment with green, amber and red rows under a magnifying glass',
    },
    // TODO: check these draft lines
    includes: [
      'Review of your site and search presence',
      'Written findings',
      'A short list of what to fix first',
    ],
    showPrice: true,
  },
  {
    id: 'one-time-seo',
    group: 'grow',
    name: 'One Time SEO',
    shortDescription: 'Fix the foundations once so the site is ready to be found.',
    startingPrice: null, // TODO: price
    priceUnit: 'one-time',
    href: serviceHref('one-time-seo'),
    image: {
      src: '/images/pricing/pricing-one-time-seo.webp',
      width: 1500,
      height: 1000,
      alt: 'Hands closing a toolbox beside a fully ticked checklist, the job done once',
    },
    // TODO: check these draft lines
    includes: [
      'Page titles and descriptions',
      'Site structure and speed fixes',
      'Search engine setup',
      'Handover notes',
    ],
    showPrice: true,
  },
  {
    id: 'ongoing-seo',
    group: 'grow',
    name: 'Ongoing SEO / AEO / GEO',
    shortDescription: 'Steady monthly work to keep climbing in search and in AI answers.',
    startingPrice: null, // TODO: price
    priceUnit: '/mo',
    href: serviceHref('ongoing-seo'),
    image: {
      src: '/images/pricing/pricing-ongoing-seo.webp',
      width: 1500,
      height: 1000,
      alt: 'Four pots on a windowsill showing the same plant growing month by month',
    },
    // TODO: check these draft lines
    includes: [
      'Monthly content and page improvements',
      'Search and AI answer visibility work',
      'Progress notes',
      'No long-term contract',
    ],
    showPrice: true,
  },
];

export function getPricingEntry(id: ServiceSlug): PricingEntry {
  const entry = pricingEntries.find((e) => e.id === id);
  if (!entry) throw new Error(`No pricing entry for ${id}`);
  return entry;
}

/** The figure as printed, or null while there is no price (or the entry hides its price). */
export function formatPrice(entry: PricingEntry): string | null {
  if (!entry.showPrice || entry.startingPrice === null) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: PRICE_CURRENCY,
    maximumFractionDigits: 0,
  }).format(entry.startingPrice);
}

/* --- featured block ------------------------------------------------------ */

export const featuredPackageId: ServiceSlug = 'one-week-website';

/* Icons are keys of serviceIcons (components/ui/icons.tsx). */
export const featuredInside = [
  { icon: 'pen', title: 'Custom design', body: 'Made for your practice, not a template.' },
  { icon: 'globe', title: 'Mobile-first build', body: 'Built for the phone people search on.' },
  { icon: 'shield', title: 'HIPAA-aware contact forms', body: 'Enquiries arrive through forms built with privacy in mind.' },
  { icon: 'calendar', title: 'Booking integration', body: 'Connected to the calendar you already use.' },
  { icon: 'search', title: 'On-page SEO basics', body: 'Titles, descriptions and structure set up properly.' },
  { icon: 'bolt', title: 'Launch and handover', body: 'We go live with you and show you how it works.' },
] as const;

export const featuredDepends = ['Number of pages', 'Copywriting needs', 'Booking and intake setup'];

/* TODO: check these draft lines */
export const featuredChecklist = [
  'Design and build done for you',
  'One review round before launch',
  'Fixes included after launch',
  'You own your site',
];

export const featuredBenefits = [
  { title: 'Live in 7 days', body: 'From the call to a site that is live.' },
  { title: 'One team start to finish', body: 'The same people design, build and launch it.' },
  { title: 'No contracts', body: 'Pay for the work, leave whenever you like.' },
];

/* --- FAQ ----------------------------------------------------------------- */

/* TODO: owner to review every answer below. Drafted without jargon and deliberately
   free of figures and timelines; add them here only once the prices are in. Shape matches
   the numbered accordion's items, and the same strings feed the FAQPage structured data. */
export const pricingFaqs = [
  {
    title: 'How is pricing set?',
    body: 'Each package has a starting price, and your final price depends on the size of the job: how many pages, how much copywriting you need, and how your booking and intake are set up. You get the price before any work begins.',
  },
  {
    title: 'Are there long-term contracts?',
    body: 'No. You pay for the work, and monthly services can be stopped whenever you choose.',
  },
  {
    title: 'Can I start with just one service?',
    body: 'Yes. Every package on this page stands on its own. Plenty of practices begin with a website or an audit and add marketing later.',
  },
  {
    title: 'How long before SEO shows results?',
    body: 'It depends on your area, your specialty and how much competition you have, so we do not promise a date. What we will do is show you what changed each month and what comes next.',
  },
  {
    title: 'What isn’t included in the price?',
    body: 'Third-party costs are paid directly by you. That means your domain name and, for Meta Ads, the ad spend itself. We tell you about any other outside cost before you commit.',
  },
];

export const pricingPage = {
  meta: {
    title: 'Pricing for therapy practice websites and marketing | wwisermind',
    description:
      'Simple, honest pricing for therapists and psychologists. See every website and marketing package, what is included and how your price is set.',
  },
};
