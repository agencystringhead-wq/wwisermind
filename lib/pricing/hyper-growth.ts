import { routes } from '@/lib/routes';
import type { PricingHeroData } from '@/components/pricing/LocalSeoHero';
import type { ServiceIconName } from '@/components/ui/icons';
import { getPricingEntry } from '@/lib/pricing';
import { carePlansListing, carePlansPath, plans as carePlans } from '@/lib/pricing/care-plans';
import {
  customWebsiteListing,
  customWebsitePath,
  packages as websitePackages,
} from '@/lib/pricing/custom-website';
import {
  PRICE_CURRENCY,
  localSeoListing,
  localSeoPackages,
  localSeoPath,
  type FaqItem,
  type FinalCta,
  type FitCallout,
  type FitCard,
  type LocalSeoPackage,
  type PackageRow,
  type ProcessStage,
  type ResultCard,
} from '@/lib/pricing/local-seo';
import { ongoingListing, ongoingSeoPath, plans as ongoingPlans } from '@/lib/pricing/ongoing-seo';

/* ==========================================================================
   /pricing/hyper-growth-marketing-for-therapists/: the all-in-one yearly plan.

   Four things in one plan: a custom website designed by hand, a WordPress care plan, ongoing
   marketing (SEO, AEO, GEO, local SEO, location pages, on-page and off-page work) and Meta
   ads management. Billed yearly only.

   Same pattern as the other pricing data files: every word and figure on the page is read
   from here, and the components only render it. Each plan stores its list monthly price and
   its yearly price; the effective monthly price and the yearly saving are computed from them
   and never typed.

   Product names, tiers, links and the website timelines are read from the custom website,
   care plans, Local SEO and Ongoing SEO data files. A reference that cannot be found there
   is left out, never guessed.

   PLACEHOLDERS to fill in (each is hidden or defaulted while unset, and marked TODO below):
   the hero picture, the copywriting rows and FAQ answer, the renewal terms and the
   cancellation terms.

   Nothing here is a statistic, percentage, ROI figure, rating or review count. No em dashes
   or en dashes in the copy.
   ========================================================================== */

export { PRICE_CURRENCY };

export const hyperGrowthPath = routes.pricing.hyperGrowth;

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

/* TODO: confirm what each plan includes for website copywriting. Defaults shown. */
const COPY_LAUNCH = 'Add-on';
const COPY_ACCELERATE = 'Add-on';
const COPY_LEAD = 'Included, up to 10 pages';
/* TODO: the answer to "Is website copywriting included?". Kept in step with the three rows
   above. */
const COPY_FAQ =
  'Copywriting for up to 10 pages is included on Lead. On Launch and Accelerate it is available as an add-on. Our copywriter interviews you and writes pages that sound like you.';
/* TODO: what happens at the end of the year. The question is left out while this is empty. */
const RENEWAL_TERMS = '';
/* TODO: how cancelling works. The question is left out while this is empty. */
const CANCELLATION_TERMS = '';

/* --- the standalone products this plan is built from ---------------------------------- */

type Ref = { name: string; href: string };

const pick = <T extends { id: string; name: string }>(
  list: readonly T[],
  id: string,
  href: string,
): Ref | null => {
  const item = list.find((entry) => entry.id === id);
  return item ? { name: item.name, href } : null;
};

const customSite = pick(websitePackages, 'custom-website', customWebsitePath);
const groupSite = pick(websitePackages, 'group-website', customWebsitePath);
const essential = pick(carePlans, 'essential', carePlansPath);
const plusCare = pick(carePlans, 'plus', carePlansPath);
const partner = pick(carePlans, 'partner', carePlansPath);
const fastGrowth = pick(localSeoPackages, 'fast-growth', localSeoPath);
const velocity = pick(localSeoPackages, 'velocity', localSeoPath);
const solo = pick(ongoingPlans, 'solo-practice', ongoingSeoPath);
const growing = pick(ongoingPlans, 'growing-practice', ongoingSeoPath);
const group = pick(ongoingPlans, 'group-practice', ongoingSeoPath);

/** A website's build time, read from the custom website page's own card. */
const timelineOf = (id: string): string | null =>
  websitePackages.find((pkg) => pkg.id === id)?.rows.find((row) => row.label === 'Timeline')
    ?.value ?? null;

const customTimeline = timelineOf('custom-website');
const groupTimeline = timelineOf('group-website');

/** A row built from a product reference; left out when the reference is missing. */
const refRow = (label: string, ref: Ref | null, suffix = ''): PackageRow | null =>
  ref ? { label, value: `${ref.name}${suffix}`, valueHref: ref.href } : null;

const compact = (rows: (PackageRow | null)[]): PackageRow[] =>
  rows.filter((row): row is PackageRow => row !== null);

/* --- the plans ----------------------------------------------------------------------- */

type PlanDef = {
  id: string;
  name: string;
  icon: 'rocket' | 'speedometer' | 'flag';
  description: string;
  listMonthly: number;
  annualPrice: number;
  featured?: boolean;
  tag?: string;
  sectionLabel: string;
  sectionPlus?: boolean;
  rows: PackageRow[];
  /** The "What's inside" column: the standalone products, then the work done for you. */
  products: { label: string; detail: string; href?: string }[];
};

const planDefs: PlanDef[] = [
  {
    id: 'launch',
    name: 'Launch',
    icon: 'rocket',
    description: 'Ideal for: solo and small practices ready to grow beyond referrals.',
    listMonthly: 1499,
    annualPrice: 14999,
    sectionLabel: 'Package Details',
    rows: compact([
      refRow('Website', customSite, ', designed by hand'),
      refRow('Care plan', essential),
      refRow('Local SEO', fastGrowth, ', 1 location'),
      refRow('Ongoing SEO, AEO & GEO', solo, ' level'),
      { label: 'AI search visibility', value: 'Monthly check across ChatGPT, Gemini & AI Overviews' },
      { label: 'Location pages', value: 'Up to 2' },
      { label: 'On-page SEO', value: 'Core pages optimised' },
      { label: 'Off-page SEO', value: 'Directory citations & local links' },
      { label: 'Meta ads management', value: '1 campaign' },
      { label: 'Website copywriting', value: COPY_LAUNCH },
      { label: 'Reporting', value: 'Monthly' },
      { label: 'Strategy call', value: 'Monthly' },
    ]),
    products: [
      ...(customSite ? [{ label: 'Website', detail: customSite.name, href: customSite.href }] : []),
      ...(essential ? [{ label: 'Care plan', detail: essential.name, href: essential.href }] : []),
      ...(fastGrowth
        ? [{ label: 'Local SEO', detail: `${fastGrowth.name}, 1 location`, href: fastGrowth.href }]
        : []),
      ...(solo ? [{ label: 'Ongoing SEO', detail: solo.name, href: solo.href }] : []),
      { label: 'Also included', detail: 'Meta ads, AI search tracking, location pages' },
    ],
  },
  {
    id: 'accelerate',
    name: 'Accelerate',
    icon: 'speedometer',
    description: 'Ideal for: growing practices adding clinicians or competing in a busy city.',
    listMonthly: 2499,
    annualPrice: 24999,
    featured: true,
    tag: 'Most popular',
    sectionLabel: 'Everything in Launch, plus:',
    sectionPlus: true,
    rows: compact([
      refRow('Care plan', plusCare),
      refRow('Local SEO', velocity, ', 1 location'),
      refRow('Ongoing SEO, AEO & GEO', growing, ' level'),
      {
        label: 'AI search optimisation',
        value: 'Answer-ready content, schema & entity building',
      },
      { label: 'AI mention tracking', value: 'Monthly' },
      { label: 'Location pages', value: 'Up to 5' },
      { label: 'On-page SEO', value: 'All pages, updated monthly' },
      { label: 'Off-page SEO', value: 'Standard link building' },
      { label: 'Meta ads management', value: 'Up to 3 campaigns' },
      { label: 'Email newsletter', value: 'Monthly' },
      { label: 'Landing pages', value: '1/month' },
      { label: 'Website copywriting', value: COPY_ACCELERATE },
      { label: 'Strategy call', value: 'Every 2 weeks' },
    ]),
    products: [
      ...(customSite ? [{ label: 'Website', detail: customSite.name, href: customSite.href }] : []),
      ...(plusCare ? [{ label: 'Care plan', detail: plusCare.name, href: plusCare.href }] : []),
      ...(velocity
        ? [{ label: 'Local SEO', detail: `${velocity.name}, 1 location`, href: velocity.href }]
        : []),
      ...(growing ? [{ label: 'Ongoing SEO', detail: growing.name, href: growing.href }] : []),
      {
        label: 'Also included',
        detail: 'Meta ads, AI search tracking, location pages, email and landing pages',
      },
    ],
  },
  {
    id: 'lead',
    name: 'Lead',
    icon: 'flag',
    description: 'Ideal for: group practices that want to lead their area or specialty.',
    listMonthly: 3499,
    annualPrice: 34999,
    sectionLabel: 'Everything in Accelerate, plus:',
    sectionPlus: true,
    rows: compact([
      refRow('Website', groupSite),
      refRow('Care plan', partner),
      { label: 'Local SEO', value: 'Up to 3 locations', valueHref: localSeoPath },
      refRow('Ongoing SEO, AEO & GEO', group, ' level'),
      {
        label: 'AI search',
        value: 'Full GEO program with brand mentions & AI citation tracking',
      },
      { label: 'Location pages', value: 'Up to 10' },
      { label: 'Clinician bio pages', value: 'Optimised for search & AI' },
      { label: 'Off-page SEO', value: 'Digital PR & authority links' },
      { label: 'Meta ads management', value: 'Full management, all campaigns' },
      { label: 'Email', value: 'Newsletter + automated nurture sequence' },
      { label: 'Landing pages', value: '2/month' },
      { label: 'Website copywriting', value: COPY_LEAD },
      { label: 'Clinician recruitment marketing', value: 'Included' },
      { label: 'Dedicated strategist', value: 'Weekly check-ins' },
    ]),
    products: [
      ...(groupSite ? [{ label: 'Website', detail: groupSite.name, href: groupSite.href }] : []),
      ...(partner ? [{ label: 'Care plan', detail: partner.name, href: partner.href }] : []),
      { label: 'Local SEO', detail: 'Up to 3 locations', href: localSeoPath },
      ...(group ? [{ label: 'Ongoing SEO', detail: group.name, href: group.href }] : []),
      {
        label: 'Also included',
        detail:
          'Meta ads, full AI search program, location pages, email, landing pages and clinician recruitment marketing',
      },
    ],
  },
];

/** The words around the price on each card, so the components print no copy of their own. */
export const priceCopy = {
  perMonth: '/mo',
  billed: (annualPrice: number) => `Billed ${money(annualPrice)} yearly`,
  save: (savings: number) => `Save ${money(savings)} a year`,
  usually: (listMonthly: number, effective: number) =>
    `Usually ${money(listMonthly)} per month, now ${money(effective)} per month billed yearly`,
};

/** The yearly price spread over 12 months, and what the yearly price saves against paying the
    list monthly price for 12 months. Both computed, never typed. */
const effectiveMonthly = (plan: PlanDef) => Math.round(plan.annualPrice / 12);
const annualSavings = (plan: PlanDef) => plan.listMonthly * 12 - plan.annualPrice;

/** The cards, in the shape the shared package grid takes. */
export const plans: LocalSeoPackage[] = planDefs.map((plan) => ({
  id: plan.id,
  name: plan.name,
  icon: plan.icon,
  description: plan.description,
  featured: Boolean(plan.featured),
  tag: plan.tag,
  price: effectiveMonthly(plan),
  suffix: '/mo',
  annual: {
    listMonthly: plan.listMonthly,
    effectiveMonthly: effectiveMonthly(plan),
    annualPrice: plan.annualPrice,
    savings: annualSavings(plan),
    billed: priceCopy.billed(plan.annualPrice),
    save: priceCopy.save(annualSavings(plan)),
    spoken: priceCopy.usually(plan.listMonthly, effectiveMonthly(plan)),
  },
  sectionLabel: plan.sectionLabel,
  sectionPlus: plan.sectionPlus,
  rows: plan.rows,
  cta: { label: 'Get started', href: `/contact?plan=hyper-${plan.id}` },
}));

/** The Offers for structured data: the yearly price, per year. */
export const offers = planDefs.map((plan) => ({
  name: plan.name,
  price: plan.annualPrice,
  description: `Yearly plan: a custom website, a care plan, SEO, AI search, location pages and Meta ads for therapy practices, run by one team.`,
}));
export const offerUnitText = 'per year';

const launch = planDefs[0];
const launchMonthly = `${money(effectiveMonthly(launch))}/mo`;

/* --- SEO ----------------------------------------------------------------------------- */

/* "{Service} Pricing for Therapists | {price hook} | wwisermind", like the other pricing pages. */
const title = `Hyper Growth Marketing Pricing for Therapists | From ${launchMonthly} | wwisermind`;

export const hyperGrowthMeta = {
  title,
  description: `A custom website, care plan, SEO, AI search, location pages and Meta ads for therapy practices, run by one team. Yearly plans from ${launchMonthly}.`,
};

export const serviceName = 'Hyper Growth Marketing for therapists';
export const serviceDescription = `An all-in-one yearly plan for therapy practices: a custom website designed by hand, a WordPress care plan, SEO, AI search, local SEO, location pages and Meta ads, run by one team. Yearly plans from ${launchMonthly}.`;

/* --- 1. hero ------------------------------------------------------------------------- */

export const hyperGrowthHero: PricingHeroData = {
  eyebrow: 'Hyper Growth Marketing',
  title: 'Your website, its care and your marketing, all in one plan',
  sub: 'A custom website designed by hand, looked after every month, and marketed properly with SEO, AI search, location pages and Meta ads. One team, one yearly plan. You focus on clients. We fill the calendar.',
  primary: { label: 'See plans', href: '#plans' },
  secondary: { label: 'Book a free growth call', href: routes.contact },
  note: `Yearly plans from ${launchMonthly}`,
};

/* TODO: replace with a composite visual (a website, a map listing, a Meta ad and an AI answer
   together). Until it exists the hero shows the Ongoing SEO card image from /pricing. */
export const heroImage = getPricingEntry('ongoing-seo').image;

/* TODO: fill in with real trust points once the owner has confirmed them. While the array
   is empty the strip is not rendered at all. */
export const trustItems: string[] = [];

/* --- 2. four things, one plan -------------------------------------------------------- */

export type PillarCard = {
  icon: ServiceIconName;
  title: string;
  body: string;
  link?: { label: string; href: string };
};

export const pillarsCopy = {
  eyebrow: 'What’s in the bundle',
  title: 'Everything your practice needs to grow online',
  sub: 'Most practices piece this together from three or four different people. Hyper Growth puts it under one roof.',
};

export const pillars: PillarCard[] = [
  {
    icon: 'pen',
    title: 'A custom website',
    body: 'Designed by hand around your practice, not a template. Built to make people feel safe reaching out.',
    link: { label: customWebsiteListing.name, href: customWebsiteListing.href },
  },
  {
    icon: 'shield',
    title: 'Care, every month',
    body: 'Hosting, updates, backups, security and help with changes. Your site stays fast, safe and current.',
    link: { label: carePlansListing.name, href: carePlansListing.href },
  },
  {
    icon: 'searchSparkle',
    title: 'Marketing that gets you found',
    body: 'SEO, AI search, local SEO and location pages, so people find you on Google, in maps and in AI answers.',
    link: { label: ongoingListing.name, href: ongoingListing.href },
  },
  {
    icon: 'megaphone',
    title: 'Meta ads',
    body: 'Facebook and Instagram campaigns that bring new enquiries while your search presence builds.',
  },
];

/* --- 3. is this right for you -------------------------------------------------------- */

export const fitCopy = {
  title: 'Is an all-in-one plan right for your practice?',
  sub: '',
};

export const fitCards: FitCard[] = [
  {
    icon: 'chat',
    title: 'You’re juggling too many people',
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
    body: 'A single yearly price and one team accountable for results',
  },
];

export const fitCallout: FitCallout = {
  title: 'If most of these sound like you',
  body: 'Hyper Growth puts your website, its care and your marketing under one plan, so everything pulls in the same direction.',
};

/* --- 4. plans ------------------------------------------------------------------------ */

export const plansCopy = {
  eyebrow: 'Plans',
  title: 'Pick your pace',
  sub: 'Every plan includes a custom website, a care plan, ongoing marketing and Meta ads. Higher plans go deeper on each.',
};

export const annualNotice = 'Available on yearly plans only. Pay once a year and save.';

export const everyPlan = {
  title: 'Included in every plan',
  items: [
    'Custom website designed by hand',
    'Hosting, care & security',
    '12-month growth strategy',
    'Google Business Profile management',
    'Privacy-safe enquiry tracking',
    'One team, one point of contact',
    'Plain-English reporting',
    'No access to client data, ever',
  ],
};

export const finePrint: string[] = [
  'Plans are billed yearly, upfront. Monthly prices shown are the yearly price divided by 12.',
  'Ad spend is paid directly to Meta and isn’t included in the plan price.',
];

/* --- 5. visibility ------------------------------------------------------------------- */

export type VisibilityCard = {
  icon: ServiceIconName;
  title: string;
  body: string;
  bullets: string[];
  pills?: string[];
};

export const visibilityCopy = {
  eyebrow: 'Visibility',
  title: 'Found on Google, in maps, and in AI answers',
  sub: 'Most of each plan goes into the work that makes your practice easy to find, wherever people are looking.',
};

export const visibilityCards: VisibilityCard[] = [
  {
    icon: 'sparkle',
    title: 'AI search (AEO & GEO)',
    body: 'More people now ask ChatGPT, Gemini or Google’s AI Overviews to recommend a therapist. We structure your site and build the trust signals those tools look for.',
    bullets: [
      'Answer-ready pages and FAQs',
      'Schema and entity building',
      'Tracking when AI tools mention you',
    ],
    pills: ['ChatGPT', 'Gemini', 'Perplexity', 'AI Overviews'],
  },
  {
    icon: 'pin',
    title: 'Location pages',
    body: 'Pages for each area you serve, so people searching nearby find a page that speaks to them, not just your homepage.',
    bullets: [
      'Pages for each office and nearby area',
      'Matched to your Google Business Profile',
      'Written for people, not keyword stuffing',
    ],
  },
  {
    icon: 'layers',
    title: 'On-page & off-page SEO',
    body: 'The steady work behind good rankings: getting every page right, and building your reputation across the web.',
    bullets: [
      'Titles, headings, internal links and speed',
      'Directory citations and local links',
      'Digital PR on the Lead plan',
    ],
  },
];

/* --- 6. what's inside ---------------------------------------------------------------- */

export const insideCopy = {
  title: 'Built from the services we sell on their own',
  sub: 'Every part of Hyper Growth is a service you could buy separately. Bundled, it’s planned and run by one team.',
};

export type InsideColumn = {
  id: string;
  name: string;
  featured: boolean;
  items: { label: string; detail: string; href?: string }[];
  /** "Hyper Growth: $1,250/mo, billed yearly", from the computed price. */
  priceLine: string;
};

export const inside: InsideColumn[] = planDefs.map((plan) => ({
  id: plan.id,
  name: plan.name,
  featured: Boolean(plan.featured),
  items: plan.products,
  priceLine: `Hyper Growth: ${money(effectiveMonthly(plan))}/mo, billed yearly`,
}));

/* --- 7. process ---------------------------------------------------------------------- */

export const processCopy = {
  eyebrow: 'The process',
  title: 'Your first year',
  sub: '',
};

const timelineNote =
  customTimeline && groupTimeline
    ? ` (${customTimeline} for Launch and Accelerate, ${groupTimeline} for Lead)`
    : '';

export const processStages: ProcessStage[] = [
  {
    when: 'Months 1-2',
    title: 'Foundation',
    steps: [
      'Strategy and goals',
      `Your custom website designed and launched${timelineNote}`,
      'Care plan, tracking and Google Business Profile set up',
      'First Meta campaign planned',
    ],
  },
  {
    when: 'Months 2-4',
    title: 'Momentum',
    steps: [
      'Meta ads go live and get tuned',
      'On-page SEO across every page',
      'First location pages published',
      'AI search groundwork in place',
    ],
  },
  {
    when: 'Months 4-12',
    title: 'Growth',
    steps: [
      'More location pages and content',
      'Off-page authority building',
      'AI mentions tracked and improved',
      'Scale what’s working, cut what isn’t',
    ],
  },
];

/* --- 8. why one team ----------------------------------------------------------------- */

export const whyCopy = { title: 'Why one team beats four vendors' };

export const whyCards: { title: string; body: string }[] = [
  {
    title: 'Everything connects',
    body: 'Your Meta ads point to pages built to convert, and what we learn from ads shapes your SEO and content',
  },
  {
    title: 'One point of contact',
    body: 'One strategist who knows your whole practice, not four people you have to brief separately',
  },
  {
    title: 'Therapists only',
    body: 'We know your ethics, your clients and what makes someone feel safe reaching out',
  },
  {
    title: 'Privacy-minded',
    body: 'No ad pixels on contact or booking pages, and no client data shared with Meta',
  },
  {
    title: 'Honest reporting',
    body: 'Enquiries and where they came from, explained in plain English',
  },
  {
    title: 'You own it all',
    body: 'Website, content, ad account and data stay yours',
  },
];

/* --- 9. results ---------------------------------------------------------------------- */

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

/* --- 10. faq ------------------------------------------------------------------------- */

export const hyperGrowthFaqCopy = {
  eyebrow: 'Questions',
  title: 'Hyper Growth, answered plainly',
  sub: 'The things practices ask before they start.',
};

const launchSavings = money(annualSavings(launch));

const named = (ref: Ref | null, fallback: string) => ref?.name ?? fallback;

const allFaqs: FaqItem[] = [
  {
    title: 'What’s included in Hyper Growth?',
    body: 'A custom website designed by hand, a care plan for hosting and upkeep, ongoing marketing (SEO, AI search, local SEO, location pages, on-page and off-page work) and Meta ads management. All planned and run by one team.',
  },
  {
    title: 'Can I pay monthly?',
    body: `Hyper Growth is available on yearly plans only. Paying for the year upfront is what lets us design your custom website and commit a team to your practice, and it saves you ${launchSavings} or more compared with the usual monthly price.`,
  },
  {
    title: 'Do I get a new website?',
    body: `Yes. Launch and Accelerate include a ${named(customSite, 'custom website')} and Lead includes a ${named(groupSite, 'group practice website')}, both designed by hand. If you already have a site you love, we can optimise it instead and put that time into marketing.`,
  },
  { title: 'Is website copywriting included?', body: COPY_FAQ },
  {
    title: 'Is ad spend included?',
    body: 'No. Ad spend goes directly to Meta from your own card, so you always see exactly what’s being spent. Our fee covers planning, setup, writing, management and reporting. We’ll recommend a starting budget on your growth call.',
  },
  {
    title: 'Can you run Meta ads for a therapy practice?',
    body: 'Yes, with some care. Meta has rules around health-related ads and targeting. We set campaigns up to stay within those rules and never target people based on their health.',
  },
  {
    title: 'Do you run Google Ads or post on social media?',
    body: 'Not in Hyper Growth. We focus on what tends to work best for therapy practices: your website, search, AI visibility, local presence and Meta ads. If you need Google Ads or social posting, ask us on your growth call.',
  },
  {
    title: 'What is AEO and GEO?',
    body: 'AEO (answer engine optimisation) makes your content clear enough to be quoted in AI answers and featured snippets. GEO (generative engine optimisation) builds the trust signals that make tools like ChatGPT and Gemini recommend your practice.',
  },
  {
    title: 'How do you handle privacy?',
    body: 'We never need access to client records. We keep ad pixels off pages where people submit contact or booking details, and we only use tracking that tells us where enquiries came from, not who someone is.',
  },
  {
    title: 'Can I upgrade during the year?',
    body: 'Yes. Upgrade any time and we’ll credit what’s left on your current plan toward the new one. Changes to a lower plan take effect at renewal.',
  },
  { title: 'What happens at the end of the year?', body: RENEWAL_TERMS },
  { title: 'What if I need to cancel?', body: CANCELLATION_TERMS },
  {
    title: 'How long until I see results?',
    body: 'Meta ads can bring enquiries within weeks of launching. SEO and AI search build over months. That’s why the plans combine both: something working now, and something growing for later.',
  },
  {
    title: 'What if I only need one or two of these?',
    body: `Then a single service is probably better value. See our ${customWebsiteListing.name}, ${carePlansListing.name}, ${ongoingListing.name} and ${localSeoListing.name} pages.`,
  },
];

/** An answer still waiting on its terms is left out, rather than shown empty. */
export const hyperGrowthFaqs: FaqItem[] = allFaqs.filter((item) => item.body.trim() !== '');

/* --- 11. final cta ------------------------------------------------------------------- */

export const finalCta: FinalCta = {
  title: 'One plan. One team. A fuller calendar.',
  sub: 'Book a free growth call. We’ll look at your practice, your market and your goals, and tell you honestly which plan fits, if any.',
  button: { label: 'Book a free growth call', href: routes.contactBook },
  items: ['Practice & market review', 'Competitor snapshot', 'Recommended plan and Meta ad budget'],
};

/** How the other pages list this one, so a price changed above changes there. */
export const hyperGrowthListing = {
  name: 'Hyper Growth Marketing',
  price: `from ${money(effectiveMonthly(launch))}`,
  unit: '/mo, billed yearly',
  href: hyperGrowthPath,
};
