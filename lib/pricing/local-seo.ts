import type { ServiceIconName } from '@/components/ui/icons';
import { homeIntro } from '@/lib/site';

/* ==========================================================================
   /pricing/local-seo.

   One data file, one page, the same pattern as lib/services.ts: every word and every
   figure on the page is read from here, and the components only render it.

   PRICES ARE NOT FILLED IN. A `price` of null prints "Price on request" and emits no
   Offer structured data. Never put a guessed figure here.

   Nothing in this file is a statistic, rating or review count that is not already real
   data elsewhere in the repo. The one place real figures appear is `relevantProjects`,
   which reads them from the homepage's launches (lib/site.ts) rather than restating them.

   No em dashes or en dashes anywhere in the copy. Package names stay lowercase.
   ========================================================================== */

export const PRICE_CURRENCY = 'USD';

/* --- SEO ----------------------------------------------------------------------------- */

export const localSeoPath = '/pricing/local-seo';

export const localSeoMeta = {
  title: 'Local SEO Packages for Therapists | wwisermind',
  description:
    'Local SEO packages for therapists and group practices. Show up in local map results, get listed correctly in therapy directories, and turn searches into enquiries.',
};

/* --- 1. hero ------------------------------------------------------------------------- */

export const localSeoHero = {
  eyebrow: 'Pricing / Local SEO',
  title: 'Local SEO packages for therapists and group practices',
  sub: 'When someone searches ‘therapist near me’, most of them never scroll past the map. We help your practice show up there, and look trustworthy when it does.',
  primary: { label: 'Get a free local visibility check', href: '/contact' },
  secondary: { label: 'See packages', href: '#packages' },
};

/* TODO: fill in with real trust points (for example, who the work is for) once the owner
   has confirmed them. While the array is empty the strip is not rendered at all. */
export const trustItems: string[] = [];

/* --- 2. results ---------------------------------------------------------------------- */

export type ResultCard = {
  /** Practice logo. */
  logo: { src: string; alt: string; width: number; height: number };
  /** The headline result, as a short line. Real data only. */
  headline: string;
  quote: string;
  person: string;
  practice: string;
  href: string;
};

/* TODO: add a card only when the practice has a real local SEO result, a real quote, a logo
   and a case study page to link to. The two case studies in lib/services.ts are website
   projects with no quote, logo or case study page, so none qualifies yet. */
export const resultCards: ResultCard[] = [];

export const resultsCopy = {
  title: 'Results from real practices',
  sub: 'What steady local growth looks like',
  linkLabel: 'View case study',
};

/** The whole section is hidden unless at least two real cards exist. */
export const showResults = resultCards.length >= 2;

/* --- 3. is local SEO right for you --------------------------------------------------- */

export type FitCard = { icon: ServiceIconName; title: string; body: string };

export const fitCopy = {
  title: 'Is local SEO right for your practice?',
  sub: 'Four questions worth asking before you spend anything.',
};

export const fitCards: FitCard[] = [
  {
    icon: 'search',
    title: 'People search for help near them',
    body: 'Clients look for a therapist in their city or neighbourhood, not just a specialty',
  },
  {
    icon: 'globe',
    title: 'You see clients in person, or in a defined area',
    body: 'An office, or a clear set of locations where you’re licensed and practise',
  },
  {
    icon: 'target',
    title: 'Other practices compete for the same searches',
    body: 'Group practices and directories are taking the top spots in your area',
  },
  {
    icon: 'calendar',
    title: 'You want fewer empty slots',
    body: 'A steady flow of enquiries that doesn’t depend on referrals alone',
  },
];

export type FitCallout = {
  title: string;
  body: string;
  /** A link under the body, such as to a neighbouring option. */
  link?: { label: string; href: string };
};

export const fitCallout: FitCallout = {
  title: 'If all four sound familiar',
  body: 'Local SEO is probably the highest-leverage thing you can do this year. Our packages focus on getting you into the map results and turning those views into enquiries.',
};

/* --- 4. packages --------------------------------------------------------------------- */

export type PackageIcon =
  | 'growth'
  | 'rocket'
  | 'map'
  | 'person'
  | 'users'
  | 'card'
  | 'calendar'
  | 'shield'
  | 'shieldPlus'
  | 'handshake'
  | 'speedometer'
  | 'flag'
  | 'pen';

/** A sentence made of plain text and links, for the small line under a plan grid. */
export type LineSegment = { text: string } | { label: string; href: string };

export type PackageRow = {
  label: string;
  /** Absent on the multi-location card, whose rows are factors rather than inclusions. */
  value?: string;
  /** Makes the value a link, such as "optional add-on" pointing at the care plans page. */
  valueHref?: string;
};

export type LocalSeoPackage = {
  id: string;
  name: string;
  icon: PackageIcon;
  description: string;
  /** The dark card with the yellow tab. */
  featured: boolean;
  tag?: string;
  /** A number for a priced card; absent for a quoted one. */
  price?: number;
  priceLabel?: string;
  suffix?: string;
  /** A small line under the price, such as "12-month commitment". */
  priceNote?: string;
  /** Replaces the price line on a quoted card. */
  customPrice?: { headline: string; sub: string };
  sectionLabel: string;
  /** Draws a circled plus in front of the section label. */
  sectionPlus?: boolean;
  rows: PackageRow[];
  cta?: { label: string; href: string };
  /** A small line under the button; left out while empty. */
  ctaNote?: string;
};

export const packagesCopy = {
  title: 'What’s included',
  sub: 'Built around how people actually find a therapist locally',
  everyTitle: 'Included in every package',
};

export const localSeoPackages: LocalSeoPackage[] = [
  {
    id: 'fast-growth',
    name: 'Fast Growth',
    icon: 'growth',
    description: 'Ideal for: solo practitioners ready to grow in typical competition areas.',
    featured: false,
    price: 299,
    priceLabel: 'Starting at',
    suffix: '/mo per location',
    sectionLabel: 'Package Details',
    rows: [
      { label: 'Discovery & Setup', value: 'Included' },
      { label: 'Google Business Profile', value: 'Full Optimization' },
      { label: 'Therapy Directory Citations', value: 'Included' },
      { label: 'GBP Posts', value: '2-3/month' },
    ],
  },
  {
    id: 'velocity',
    name: 'Velocity',
    icon: 'rocket',
    description: 'Stronger local visibility with wider reach and privacy-safe review management.',
    featured: true,
    tag: 'Most popular',
    price: 399,
    priceLabel: 'Starting at',
    suffix: '/mo per location',
    sectionLabel: 'Everything in Fast Growth, plus:',
    sectionPlus: true,
    rows: [
      { label: 'GBP Posts', value: '4-6/month' },
      { label: 'Bing & Apple Maps', value: 'Included' },
      { label: 'Review Management', value: 'Included' },
    ],
  },
  {
    id: 'multi-location',
    name: 'Multi-Location',
    icon: 'map',
    description:
      'Several offices or clinicians? We’ll build a custom plan that scales with your practice.',
    featured: false,
    customPrice: { headline: 'Custom Quote', sub: 'Tailored to your footprint' },
    sectionLabel: 'Your plan depends on',
    rows: [
      { label: 'Number of locations' },
      { label: 'Number of clinicians' },
      { label: 'Local competition' },
      { label: 'Scope per location' },
    ],
    cta: { label: 'Talk to us', href: '/contact' },
  },
];

export const everyPackage: string[] = [
  'Competitor review & monthly reporting',
  'Call and form enquiry tracking',
  'Ongoing strategy, not set-and-forget',
  'A real person you can email',
];

export const visibilityBand = {
  title: 'Not sure where you stand?',
  body: 'We’ll check your map rankings against the practices near you and show you where the gaps are.',
  button: { label: 'Get a free local visibility check', href: '/contact' },
};

/* --- 5. process ---------------------------------------------------------------------- */

export const processCopy = {
  title: 'How the first six months go',
  sub: 'A steady build, not a sprint',
};

export type ProcessStage = { when: string; title: string; steps: string[] };

export const processStages: ProcessStage[] = [
  {
    when: 'Month 1',
    title: 'Foundation',
    steps: [
      'Audit your local presence',
      'Fix and optimise your Google Business Profile',
      'Clean up directory listings',
      'Set up tracking',
    ],
  },
  {
    when: 'Months 2-3',
    title: 'Momentum',
    steps: [
      'Tune your service and specialty pages for local search',
      'Add schema markup',
      'Build relevant local and directory links',
      'Focus on the areas you most want clients from',
    ],
  },
  {
    when: 'Months 4-6',
    title: 'Steady growth',
    steps: [
      'Build pages for neighbouring areas you serve',
      'Refine pages based on enquiry data',
      'Track rankings across your area street by street',
    ],
  },
];

/* --- 6. bundle ----------------------------------------------------------------------- */

export const bundleCopy = {
  title: 'Want the full picture?',
  sub: 'Local SEO works best alongside a site that converts',
  whyTitle: 'Why bundle',
};

export const bundle = {
  /* TODO: name the bundle. Lowercase, like the packages. */
  name: 'full bundle',
  price: null as number | null, // TODO: price
  priceUnit: '/mo',
  lead: 'Everything in local SEO, plus:',
  includes: [
    'Website design and care',
    'AI search visibility',
    'Content for your specialties',
    'Paid search, if it makes sense for you',
  ],
  button: { label: 'Talk to us', href: '/contact' },
};

export const bundleWhy: { title: string; body: string }[] = [
  {
    title: 'One strategy',
    body: 'Your site, profile and content pull in the same direction',
  },
  {
    title: 'One partner',
    body: 'No juggling three vendors and three reports',
  },
  {
    title: 'Clearer reporting',
    body: 'One monthly view of where enquiries come from',
  },
];

/* --- 7. relevant projects ------------------------------------------------------------ */

export const projectsCopy = {
  title: 'Recent work',
  sub: 'Practices we have built sites for',
  link: { label: 'See all work', href: '/results' },
};

/** Read from the homepage's launches, so a figure changed there changes here. Hidden if the
    list is ever empty. */
export const relevantProjects = homeIntro.projects;

/* --- 8. recognition ------------------------------------------------------------------ */

/* TODO: switch on when there are real badges to show. No component renders this yet; add
   one alongside the badges themselves. */
export const showRecognition = false;

/* --- 9. final cta -------------------------------------------------------------------- */

export type FinalCta = {
  title: string;
  sub: string;
  button: { label: string; href: string };
  /** Plain promises under the button; the row is left out when absent. */
  items?: string[];
};

export const finalCta: FinalCta = {
  title: 'Every practice’s local market is different',
  sub: 'So we start with a look at yours, not a sales pitch.',
  button: { label: 'Book a free call', href: '/contact' },
  items: ['Local visibility check', 'A plain-English plan', 'Honest advice on whether it’s worth it for you'],
};

/* --- 10. faq ------------------------------------------------------------------------- */

/* Shape matches the numbered accordion's items; the same strings feed the FAQPage data. */
export const localSeoFaqCopy = {
  eyebrow: 'Questions',
  title: 'Local SEO, answered plainly',
  sub: 'The things practices ask before they start.',
};

export type FaqItem = { title: string; body: string };

export const localSeoFaqs: FaqItem[] = [
  {
    title: 'How long until I see results?',
    body: 'Most practices see better visibility within 1-2 months. Enquiries usually follow over the next few months as rankings settle. It depends a lot on how competitive your city is.',
  },
  {
    title: 'I only offer telehealth. Can you still help?',
    body: 'Google only allows a Business Profile for a real address where you see clients, so purely virtual practices can’t use the map pack the same way. We’ll focus on directories, your website and state-level search instead, and tell you honestly what’s realistic.',
  },
  {
    title: 'Can you get my clients to leave reviews?',
    body: 'We don’t run review campaigns aimed at clients. Most professional ethics codes discourage asking current clients for testimonials, and it can put confidentiality at risk. We help you build trust in other ways and respond to existing reviews without confirming anyone was a client.',
  },
  {
    title: 'What if I have more than one location?',
    body: 'Each location gets its own profile work and pages. Pricing is per location, and the group practice plan is scoped to your setup.',
  },
  {
    title: 'Do I need a new website?',
    body: 'Not always. Your Business Profile can rank on its own, but a clear, fast site turns more of those views into booked consultations. We’ll tell you if yours is holding you back.',
  },
  {
    title: 'What’s in the monthly report?',
    body: 'Where you rank on the map, how many calls and form enquiries came in, and what we’re working on next. Short and readable.',
  },
];

/* --- helpers ------------------------------------------------------------------------- */

/** "Starting at $X/mo per location", or "Price on request" while there is no number. */
export function formatLocalPrice(price: number | null): string | null {
  if (price === null) return null;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: PRICE_CURRENCY,
    maximumFractionDigits: 0,
  }).format(price);
}

/** How the other SEO pages list these packages: the lowest priced plan, so a price changed
    above changes there. */
const startingPlan = localSeoPackages
  .filter((pkg) => pkg.price !== undefined)
  .sort((a, b) => (a.price as number) - (b.price as number))[0];

export const localSeoListing = {
  name: 'Local SEO',
  price: startingPlan ? `from $${startingPlan.price}` : '',
  unit: startingPlan?.suffix ?? '',
  href: localSeoPath,
};
