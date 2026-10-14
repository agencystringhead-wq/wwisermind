import type { PricingHeroData } from '@/components/pricing/LocalSeoHero';
import { getPricingEntry } from '@/lib/pricing';
import {
  PRICE_CURRENCY,
  localSeoPackages,
  localSeoPath,
  type FaqItem,
  type FinalCta,
  type FitCallout,
  type FitCard,
  type LocalSeoPackage,
  type ProcessStage,
  type ResultCard,
} from '@/lib/pricing/local-seo';
import { ongoingSeoPath, plans as ongoingPlans } from '@/lib/pricing/ongoing-seo';
import { packages as websitePackages, websiteDesignPath } from '@/lib/pricing/website-design';

/* ==========================================================================
   /pricing/hyper-growth: the all-in-one bundle.

   The seventh /pricing sub-page, in the same pattern as the others: every word and figure on
   the page is read from here, and the components only render it.

   The three plan prices are real and live in `planDefs`. The tier names in the plan rows and
   the "What's inside" prices are read from the Local SEO, Ongoing SEO and website design data
   files, so a name or price changed there changes here. A figure that cannot be found is left
   out, never guessed (see `inside`).

   PLACEHOLDERS to fill in (each is hidden or defaulted while unset, and marked TODO below):
   the hero picture, the contract terms and the matching FAQ answer, and the Local SEO tier
   on the Lead plan.

   Nothing here is a statistic, percentage, ROI figure, rating or review count. No em dashes
   or en dashes in the copy.
   ========================================================================== */

export { PRICE_CURRENCY };

export const hyperGrowthPath = '/pricing/hyper-growth';

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

/* TODO: write the contract terms (minimum term, notice, what happens at the end). Printed as
   fine print under the plans; left out while empty. */
const CONTRACT_TERMS = '';
/* TODO: the same terms, as the answer to "Is there a minimum commitment?". The question is left
   out while this is empty. */
const CONTRACT_TERMS_FAQ = '';

/* --- the standalone services this plan is built from ---------------------------------- */

type TierRef = { name: string; price: number | null; href: string };

const localTier = (id: string): TierRef | null => {
  const pkg = localSeoPackages.find((item) => item.id === id);
  return pkg ? { name: pkg.name, price: pkg.price ?? null, href: localSeoPath } : null;
};

const seoTier = (id: string): TierRef | null => {
  const plan = ongoingPlans.find((item) => item.id === id);
  return plan ? { name: plan.name, price: plan.price ?? null, href: ongoingSeoPath } : null;
};

/** The website's monthly option: hosting and care are part of that price. */
const websiteMonthly = websitePackages.find((pkg) => pkg.id === 'pay-monthly');
const website: TierRef | null = websiteMonthly
  ? { name: 'One-Week Website', price: websiteMonthly.price ?? null, href: websiteDesignPath }
  : null;

/* --- the plans ----------------------------------------------------------------------- */

type PlanDef = {
  id: string;
  name: string;
  icon: 'rocket' | 'speedometer' | 'flag';
  description: string;
  price: number;
  featured?: boolean;
  tag?: string;
  sectionLabel: string;
  sectionPlus?: boolean;
  /** Tiers of the standalone services, for the plan rows and the "What's inside" column. */
  local: { tier: TierRef | null; locations: number } | null;
  seo: TierRef | null;
  rows: { label: string; value: string; href?: string }[];
};

const fastGrowth = localTier('fast-growth');
const velocity = localTier('velocity');
const solo = seoTier('solo-practice');
const growing = seoTier('growing-practice');
const group = seoTier('group-practice');

const tierValue = (tier: TierRef | null, suffix: string) =>
  tier ? `${tier.name}${suffix}` : 'Included';

const planDefs: PlanDef[] = [
  {
    id: 'launch',
    name: 'Launch',
    icon: 'rocket',
    description: 'Ideal for: solo and small practices ready to grow beyond referrals.',
    price: 1499,
    sectionLabel: 'Package Details',
    local: { tier: fastGrowth, locations: 1 },
    seo: solo,
    rows: [
      { label: 'New website', value: 'One-Week Website included', href: website?.href },
      { label: 'Hosting & care', value: 'Included' },
      { label: 'Local SEO', value: tierValue(fastGrowth, ', 1 location'), href: localSeoPath },
      {
        label: 'Ongoing SEO, AEO & GEO',
        value: tierValue(solo, ' level'),
        href: ongoingSeoPath,
      },
      { label: 'Google Ads management', value: '1 campaign' },
      { label: 'Social media', value: '8 posts/month' },
      { label: 'Reporting', value: 'Monthly' },
      { label: 'Strategy call', value: 'Monthly' },
    ],
  },
  {
    id: 'accelerate',
    name: 'Accelerate',
    icon: 'speedometer',
    description: 'Ideal for: growing practices adding clinicians or competing in a busy city.',
    price: 2499,
    featured: true,
    tag: 'Most popular',
    sectionLabel: 'Everything in Launch, plus:',
    sectionPlus: true,
    local: { tier: velocity, locations: 1 },
    seo: growing,
    rows: [
      { label: 'Local SEO', value: tierValue(velocity, ', 1 location'), href: localSeoPath },
      {
        label: 'Ongoing SEO, AEO & GEO',
        value: tierValue(growing, ' level'),
        href: ongoingSeoPath,
      },
      { label: 'Google Ads management', value: 'Up to 3 campaigns' },
      { label: 'Meta ads management', value: 'Included' },
      { label: 'Social media', value: '12 posts/month' },
      { label: 'Email newsletter', value: 'Monthly' },
      { label: 'Landing pages', value: '1/month' },
      { label: 'Conversion review', value: 'Quarterly' },
      { label: 'Strategy call', value: 'Every 2 weeks' },
    ],
  },
  {
    id: 'lead',
    name: 'Lead',
    icon: 'flag',
    description: 'Ideal for: group practices that want to lead their area or specialty.',
    price: 3499,
    sectionLabel: 'Everything in Accelerate, plus:',
    sectionPlus: true,
    /* TODO: name the Local SEO tier this plan uses for its three locations. The Local SEO
       price is per location and depends on the tier, so while this is null no Local SEO line
       or figure is shown in "What's inside" for Lead. */
    local: { tier: null, locations: 3 },
    seo: group,
    rows: [
      { label: 'Local SEO', value: 'Up to 3 locations', href: localSeoPath },
      {
        label: 'Ongoing SEO, AEO & GEO',
        value: tierValue(group, ' level'),
        href: ongoingSeoPath,
      },
      { label: 'Google & Meta ads', value: 'Full management, all campaigns' },
      { label: 'Social media', value: '20 posts/month + short videos' },
      { label: 'Email', value: 'Newsletter + automated nurture sequence' },
      { label: 'Landing pages', value: '2/month' },
      { label: 'Clinician recruitment marketing', value: 'Included' },
      { label: 'Dedicated strategist', value: 'Included' },
      { label: 'Check-ins', value: 'Weekly' },
    ],
  },
];

/** The cards, in the shape the shared package grid takes. */
export const plans: LocalSeoPackage[] = planDefs.map((plan) => ({
  id: plan.id,
  name: plan.name,
  icon: plan.icon,
  description: plan.description,
  featured: Boolean(plan.featured),
  tag: plan.tag,
  price: plan.price,
  suffix: '/mo',
  sectionLabel: plan.sectionLabel,
  sectionPlus: plan.sectionPlus,
  rows: plan.rows.map((row) => ({ label: row.label, value: row.value, valueHref: row.href })),
  cta: { label: 'Get started', href: `/contact?plan=hyper-${plan.id}` },
}));

/** The Offers for structured data, built from the same prices. */
export const offers = planDefs.map((plan) => ({ name: plan.name, price: plan.price }));
export const offerUnitText = 'per month';

const lowestPrice = Math.min(...planDefs.map((plan) => plan.price));

/* --- SEO ----------------------------------------------------------------------------- */

export const hyperGrowthMeta = {
  title: `Hyper Growth Marketing for Therapists | All-in-One from ${money(lowestPrice)}/mo | wwisermind`,
  description: `All-in-one marketing for therapy practices: website, SEO, AI search, local SEO, ads, social and email, managed by one team. Plans from ${money(lowestPrice)} a month.`,
};

export const serviceName = 'Hyper Growth Marketing for therapists';
export const serviceDescription = `An all-in-one marketing plan for therapy practices: website design, hosting and care, SEO, AI search, local SEO, paid ads, social media and email, managed by one team. Plans from ${money(lowestPrice)} a month.`;

/* --- 1. hero ------------------------------------------------------------------------- */

export const hyperGrowthHero: PricingHeroData = {
  eyebrow: 'Hyper Growth Marketing',
  title: 'Your whole marketing team, in one monthly plan',
  sub: 'Website, SEO, AI search, Google Business Profile, ads, social and email, planned together and handled by one team. You focus on clients. We fill the calendar.',
  primary: { label: 'See plans', href: '#plans' },
  secondary: { label: 'Book a free growth call', href: '/contact' },
};

/* TODO: replace with a composite visual (a website, a map listing, an ad and an AI answer
   together). Until it exists the hero shows the Ongoing SEO card image from /pricing. */
export const heroImage = getPricingEntry('ongoing-seo').image;

/* TODO: fill in with real trust points once the owner has confirmed them. While the array
   is empty the strip is not rendered at all. */
export const trustItems: string[] = [];

/* --- 2. is this right for you -------------------------------------------------------- */

export const fitCopy = {
  title: 'Is an all-in-one plan right for your practice?',
  sub: '',
};

export const fitCards: FitCard[] = [
  {
    icon: 'chat',
    title: 'You’re juggling too many vendors',
    body: 'One person for the website, another for SEO, someone else for ads, and nobody talking to each other',
  },
  {
    icon: 'target',
    title: 'You want growth, not just maintenance',
    body: 'You’re adding clinicians, opening a location, or want a fuller caseload this year',
  },
  {
    icon: 'clock',
    title: 'You don’t have time to manage marketing',
    body: 'You’d rather see clients than review ad reports',
  },
  {
    icon: 'clipboard',
    title: 'You want one clear number',
    body: 'A single monthly cost and one team accountable for results',
  },
];

export const fitCallout: FitCallout = {
  title: 'If most of these sound like you',
  body: 'Hyper Growth puts every channel under one plan, so your website, search and ads all pull in the same direction.',
};

/* --- 3. plans ------------------------------------------------------------------------ */

export const plansCopy = {
  eyebrow: 'Plans',
  title: 'Pick your pace',
  sub: 'Every plan includes a new website, hosting and care, local SEO and ongoing SEO. Higher plans add more channels and more hands on deck.',
};

export const everyPlan = {
  title: 'Included in every plan',
  items: [
    '12-month growth strategy',
    'Google Business Profile management',
    'Privacy-safe call & form tracking',
    'One team, one point of contact',
    'Plain-English reporting',
    'No access to client data, ever',
  ],
};

/** Small lines under the "every plan" row. A line still waiting on its terms is left out. */
export const finePrint: string[] = [
  'Ad spend is paid directly to Google and Meta and isn’t included in the plan price.',
  CONTRACT_TERMS,
].filter((line) => line.trim() !== '');

/* --- 4. what's inside ---------------------------------------------------------------- */

export const insideCopy = {
  title: 'What’s inside each plan',
  sub: 'Hyper Growth is built from the same services we sell on their own. Here’s how it adds up.',
  separateLabel: 'Bought separately',
  unpricedNote: 'plus ads, social and email management, not sold on their own',
  planLabel: 'Hyper Growth',
};

export type InsideItem = { label: string; tier: string; price: number; href: string };

export type InsideColumn = {
  id: string;
  name: string;
  featured: boolean;
  items: InsideItem[];
  /** The sum of the priced items only. */
  subtotal: number;
  planPrice: number;
};

/** One column per plan, computed from the standalone data files. An item whose tier or price
    cannot be found is left out, so the subtotal is only ever the sum of figures that are
    shown. */
export const inside: InsideColumn[] = planDefs.map((plan) => {
  const items: InsideItem[] = [];

  if (website && website.price !== null) {
    items.push({
      label: website.name,
      tier: 'Monthly option, hosting and care included',
      price: website.price,
      href: website.href,
    });
  }

  if (plan.local?.tier && plan.local.tier.price !== null) {
    const { tier, locations } = plan.local;
    items.push({
      label: 'Local SEO',
      tier: locations > 1 ? `${tier.name}, ${locations} locations` : `${tier.name}, 1 location`,
      price: tier.price! * locations,
      href: tier.href,
    });
  }

  if (plan.seo && plan.seo.price !== null) {
    items.push({
      label: 'Ongoing SEO, AEO & GEO',
      tier: plan.seo.name,
      price: plan.seo.price,
      href: plan.seo.href,
    });
  }

  return {
    id: plan.id,
    name: plan.name,
    featured: Boolean(plan.featured),
    items,
    subtotal: items.reduce((sum, item) => sum + item.price, 0),
    planPrice: plan.price,
  };
});

/* --- 5. process ---------------------------------------------------------------------- */

export const processCopy = {
  eyebrow: 'The process',
  title: 'Your first six months',
  sub: '',
};

export const processStages: ProcessStage[] = [
  {
    when: 'Month 1',
    title: 'Foundation',
    steps: [
      'Strategy and goals',
      'Your new website built and launched in one week',
      'Tracking and Google Business Profile set up',
      'First ad campaigns planned',
    ],
  },
  {
    when: 'Months 2-3',
    title: 'Momentum',
    steps: [
      'Ads go live and get tuned',
      'SEO and content ramp up',
      'Social and email start running',
      'First landing pages built and tested',
    ],
  },
  {
    when: 'Months 4-6',
    title: 'Growth',
    steps: [
      'Scale what’s working, cut what isn’t',
      'Local and AI search visibility builds',
      'Monthly reviews shape the next quarter',
    ],
  },
];

/* --- 6. why one team ----------------------------------------------------------------- */

export const whyCopy = { title: 'Why one team beats five vendors' };

export const whyCards: { title: string; body: string }[] = [
  {
    title: 'Everything connects',
    body: 'Your ads point to pages built to convert, and your SEO feeds what we learn from ads',
  },
  {
    title: 'One point of contact',
    body: 'One strategist who knows your whole practice, not five people you have to brief separately',
  },
  {
    title: 'Therapists only',
    body: 'We know your ethics, your clients and what makes someone feel safe reaching out',
  },
  {
    title: 'Privacy-minded',
    body: 'Tracking set up carefully, with no ad pixels on contact or booking pages and no client data shared with ad platforms',
  },
  {
    title: 'Honest reporting',
    body: 'Enquiries and where they came from, explained in plain English',
  },
  {
    title: 'You own it all',
    body: 'Website, content, ad accounts and data stay yours',
  },
];

/* --- 7. results ---------------------------------------------------------------------- */

export const resultsCopy = {
  title: 'Results from real practices',
  sub: 'What steady growth looks like',
  linkLabel: 'View case study',
};

/* TODO: add a card only when the practice has a real result, a real quote, a logo and a case
   study page to link to. */
export const resultCards: ResultCard[] = [];

/** The whole section is hidden unless at least two real cards exist. */
export const showResults = resultCards.length >= 2;

/* --- 8. faq -------------------------------------------------------------------------- */

export const hyperGrowthFaqCopy = {
  eyebrow: 'Questions',
  title: 'Hyper Growth, answered plainly',
  sub: 'The things practices ask before they start.',
};

const allFaqs: FaqItem[] = [
  {
    title: 'Is ad spend included?',
    body: 'No. Ad spend goes directly to Google and Meta from your own card, so you always see exactly what’s being spent. Our fee covers planning, setup, writing, management and reporting. We’ll recommend a starting budget on your growth call.',
  },
  {
    title: 'Do I get a new website?',
    body: 'Yes. Every plan includes our One-Week Website, plus hosting and care. If you already have a site you love, we can optimise it instead and put that time into marketing.',
  },
  {
    title: 'Can I run ads for a therapy practice?',
    body: 'Yes, with some care. Google and Meta have rules around health-related ads and targeting, and some topics need extra certification. We set campaigns up to stay within those rules and avoid targeting based on people’s health.',
  },
  {
    title: 'How do you handle privacy?',
    body: 'We never need access to client records. We keep ad tracking pixels off pages where people submit contact or booking details, and we only use tracking that tells us where enquiries came from, not who someone is.',
  },
  {
    title: 'Is there a minimum commitment?',
    body: CONTRACT_TERMS_FAQ,
  },
  {
    title: 'Can I move between plans?',
    body: 'Yes. You can move up any time. Moving down takes effect from your next billing cycle.',
  },
  {
    title: 'How long until I see results?',
    body: 'Ads can bring enquiries within weeks of launching. SEO and AI search build over months. That’s why the plans combine both: something working now, and something growing for later.',
  },
  {
    title: 'What if I only need one or two of these services?',
    body: 'Then a single plan is probably better value. See our SEO, Local SEO, website and care plan pages.',
  },
];

/** An answer still waiting on its terms is left out, rather than shown empty. */
export const hyperGrowthFaqs: FaqItem[] = allFaqs.filter((item) => item.body.trim() !== '');

/* --- 9. final cta -------------------------------------------------------------------- */

export const finalCta: FinalCta = {
  title: 'One plan. One team. A fuller calendar.',
  sub: 'Book a free growth call. We’ll look at your practice, your market and your goals, and tell you honestly which plan fits, if any.',
  button: { label: 'Book a free growth call', href: '/contact' },
  items: ['Practice & market review', 'Competitor snapshot', 'Recommended plan and ad budget'],
};

/** How the other pages list this one, so a price changed above changes there. */
export const hyperGrowthListing = {
  name: 'Hyper Growth Marketing',
  price: `from ${money(lowestPrice)}`,
  unit: '/mo',
  href: hyperGrowthPath,
};
