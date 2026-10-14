import type { PricingHeroData } from '@/components/pricing/LocalSeoHero';
import { getPricingEntry } from '@/lib/pricing';
import {
  PRICE_CURRENCY,
  type FaqItem,
  type FinalCta,
  type FitCallout,
  type FitCard,
  type LocalSeoPackage,
  type PackageRow,
  type ProcessStage,
} from '@/lib/pricing/local-seo';

/* ==========================================================================
   /pricing/care-plans: WordPress care plans.

   Same pattern as the other pricing data files: every word and figure on the page is read
   from here, and the components only render it. The three plans live in `matrix`, one
   feature per row with one value per plan. The package cards and the side by side
   comparison table are both built from it, so a value is only ever typed once.

   This file imports nothing from the other pricing data files that import it (the website
   design file links here), so the upsell band is assembled in CarePlansPage.

   PLACEHOLDERS to fill in (each is hidden or defaulted while unset, and marked TODO below):
   onboarding fee note and FAQ line, response times, backup retention.

   Nothing here is a statistic, rating or review count. No em dashes or en dashes in the copy.
   ========================================================================== */

export { PRICE_CURRENCY };

export const carePlansPath = '/pricing/care-plans';

/* The one-time WordPress Evaluation & Tune-Up Fee. Required on every plan, on top of the
   monthly price. */
const onboardingFee = 197;
const feeName = 'WordPress Evaluation & Tune-Up Fee';
const ONBOARDING_FEE_NOTE = `A one-time ${feeName} of ${`$${onboardingFee}`} is required when you join, on top of your monthly plan.`;
const ONBOARDING_FEE_FAQ = `That check is covered by the one-time ${feeName} of $${onboardingFee}.`;
/* TODO: confirm how long offsite backups are kept, in days. */
const BACKUP_RETENTION = 90;
/* TODO: confirm the response time promised on each plan. */
const RESPONSE_TIMES = ['2 business days', '1 business day', 'Same business day'];

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

/* --- the plans, as data -------------------------------------------------------------- */

export type PlanId = 'essential' | 'plus' | 'partner';

type Cell = boolean | string;

type Feature = {
  id: string;
  label: string;
  /** One value per plan, in the order essential, plus, partner. true is a tick, false a cross. */
  values: [Cell, Cell, Cell];
  /** A different wording of the value on the plan cards, where the table is terser. */
  cardValues?: [Cell, Cell, Cell];
};

type FeatureGroup = { title: string; features: Feature[] };

const planOrder: PlanId[] = ['essential', 'plus', 'partner'];

export const featureGroups: FeatureGroup[] = [
  {
    title: 'Hosting & security',
    features: [
      { id: 'hosting', label: 'Managed WordPress hosting', values: [true, true, true] },
      { id: 'ssl', label: 'SSL certificate', values: [true, true, true] },
      { id: 'scans', label: 'Security scans', values: ['Weekly', 'Daily', 'Daily'] },
      { id: 'malware', label: 'Malware removal', values: [false, true, true] },
      { id: 'uptime', label: 'Uptime monitoring', values: [true, true, true] },
    ],
  },
  {
    title: 'Backups & updates',
    features: [
      { id: 'backups', label: 'Offsite backups', values: ['Weekly', 'Daily', 'Daily'] },
      {
        id: 'updates',
        label: 'WordPress core, theme & plugin updates',
        values: ['Monthly', 'Weekly', 'Weekly'],
      },
      { id: 'restore', label: 'Restore from backup', values: [true, true, true] },
    ],
  },
  {
    title: 'Support',
    features: [
      {
        id: 'support',
        label: 'Support time',
        values: ['30 min', '1 hr', '3 hrs'],
        cardValues: ['30 min/month', '1 hr/month', '3 hrs/month'],
      },
      {
        id: 'response',
        label: 'Response time',
        values: [RESPONSE_TIMES[0], RESPONSE_TIMES[1], RESPONSE_TIMES[2]],
      },
      { id: 'strategy', label: 'Strategy call', values: [false, false, '30 min/month'] },
    ],
  },
  {
    title: 'Performance & growth',
    features: [
      { id: 'speed', label: 'Speed optimisation', values: [false, true, true] },
      { id: 'links', label: 'Broken link fixes', values: [false, 'Monthly', 'Monthly'] },
      { id: 'analytics', label: 'Analytics snapshot', values: [false, 'Monthly', 'Monthly'] },
      { id: 'seo', label: 'SEO health check', values: [false, false, 'Quarterly'] },
      { id: 'rank', label: 'Keyword rank tracking', values: [false, false, true] },
      { id: 'a11y', label: 'Accessibility check', values: [false, false, 'Quarterly'] },
      { id: 'conversion', label: 'Conversion review', values: [false, false, 'Quarterly'] },
    ],
  },
  {
    title: 'Reporting',
    features: [
      { id: 'report', label: 'Health report', values: ['Monthly', 'Monthly', 'Monthly'] },
    ],
  },
];

const featureById = new Map(
  featureGroups.flatMap((group) => group.features).map((feature) => [feature.id, feature]),
);

/** A card row: a feature from the matrix, with its own wording where the card differs. */
type CardRow = { feature: string; label?: string };

type PlanDef = {
  id: PlanId;
  name: string;
  icon: 'shield' | 'shieldPlus' | 'handshake';
  description: string;
  price: number;
  featured?: boolean;
  tag?: string;
  sectionLabel: string;
  sectionPlus?: boolean;
  rows: CardRow[];
};

const planDefs: PlanDef[] = [
  {
    id: 'essential',
    name: 'Essential',
    icon: 'shield',
    description: 'Ideal for: sites that rarely change and just need to stay safe and online.',
    price: 110,
    sectionLabel: 'Package Details',
    rows: [
      { feature: 'hosting' },
      { feature: 'ssl' },
      { feature: 'updates' },
      { feature: 'scans' },
      { feature: 'backups' },
      { feature: 'uptime' },
      { feature: 'support' },
      { feature: 'report' },
    ],
  },
  {
    id: 'plus',
    name: 'Plus',
    icon: 'shieldPlus',
    description: 'Ideal for: practices that update their site a few times a month.',
    price: 199,
    featured: true,
    tag: 'Most popular',
    sectionLabel: 'Everything in Essential, plus:',
    sectionPlus: true,
    rows: [
      { feature: 'updates' },
      { feature: 'scans' },
      { feature: 'backups' },
      { feature: 'malware' },
      { feature: 'speed' },
      { feature: 'links' },
      { feature: 'analytics' },
      { feature: 'support' },
    ],
  },
  {
    id: 'partner',
    name: 'Partner',
    icon: 'handshake',
    description: 'Ideal for: active practices that want a website team on call.',
    price: 399,
    sectionLabel: 'Everything in Plus, plus:',
    sectionPlus: true,
    rows: [
      { feature: 'support' },
      { feature: 'response', label: 'Priority response' },
      { feature: 'strategy' },
      { feature: 'seo' },
      { feature: 'rank' },
      { feature: 'a11y' },
      { feature: 'conversion' },
    ],
  },
];

const planIndex = (id: PlanId) => planOrder.indexOf(id);

function cardRow(plan: PlanDef, row: CardRow): PackageRow {
  const feature = featureById.get(row.feature);
  if (!feature) throw new Error(`Unknown care plan feature: ${row.feature}`);
  const index = planIndex(plan.id);
  const cell = (feature.cardValues ?? feature.values)[index];
  return { label: row.label ?? feature.label, value: cell === true ? 'Included' : String(cell) };
}

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
  priceNote: `+ $${onboardingFee} one-time evaluation & tune-up`,
  sectionLabel: plan.sectionLabel,
  sectionPlus: plan.sectionPlus,
  rows: plan.rows.map((row) => cardRow(plan, row)),
  cta: { label: 'Get started', href: `/contact?plan=care-${plan.id}` },
}));

/** The comparison table's columns and the plan cards' offers, from the same defs. */
export const comparePlans = planDefs.map((plan) => ({
  id: plan.id,
  name: plan.name,
  featured: Boolean(plan.featured),
}));

export const compareGroups = featureGroups;

/** The Offers for structured data, built from the same prices. */
export const offers = planDefs.map((plan) => ({ name: plan.name, price: plan.price }));
export const offerUnitText = 'per month';

const lowestPrice = Math.min(...planDefs.map((plan) => plan.price));

/* --- SEO ----------------------------------------------------------------------------- */

export const carePlansMeta = {
  title: `WordPress Care Plans for Therapists | From ${money(lowestPrice)}/mo | wwisermind`,
  description: `WordPress hosting, updates, backups, security and support for therapy practice websites. Month-to-month plans from ${money(lowestPrice)}. Cancel any time.`,
};

export const serviceName = 'WordPress care plans for therapists';
export const serviceDescription =
  'Managed WordPress hosting, core, theme and plugin updates, offsite backups, security monitoring and support time for therapy practice websites. Month to month, from $110 a month.';

/* --- 1. hero ------------------------------------------------------------------------- */

export const carePlansHero: PricingHeroData = {
  eyebrow: 'WordPress care plans',
  title: 'A website that just works, so you don’t have to think about it',
  sub: `Hosting, updates, backups, security and help with changes for your WordPress site, all handled for you. Plans from ${money(lowestPrice)} a month. Cancel any time.`,
  primary: { label: 'See plans', href: '#plans' },
  secondary: { label: 'Book a 15-minute call', href: '/contact' },
};

/* The Website Care Plans card image from /pricing. */
export const heroImage = getPricingEntry('website-care-plans').image;

/* TODO: fill in with real trust points once the owner has confirmed them. While the array
   is empty the strip is not rendered at all. */
export const trustItems: string[] = [];

/* --- 2. the problem ------------------------------------------------------------------ */

export const fitCopy = {
  title: 'You didn’t become a therapist to fix websites',
  sub: '',
};

export const fitCards: FitCard[] = [
  {
    icon: 'clock',
    title: 'Small changes eat your evening',
    body: 'Updating a bio or your fees turns into an hour of clicking around',
  },
  {
    icon: 'shield',
    title: 'You’re not sure it’s backed up',
    body: 'If something broke tomorrow, you don’t know how you’d get it back',
  },
  {
    icon: 'bolt',
    title: 'Updates feel risky',
    body: 'You’ve seen the WordPress update warnings but you’re worried clicking update will break something',
  },
  {
    icon: 'chat',
    title: 'You don’t know who to ask',
    body: 'When something goes wrong, there’s no one to call',
  },
];

export const fitCallout: FitCallout = {
  title: 'That’s what a care plan is for',
  body: 'We look after the technical side every month, and you email us when you need something changed.',
};

/* --- 3. how it works ----------------------------------------------------------------- */

export const processCopy = { title: 'How it works', sub: '' };

export const processStages: ProcessStage[] = [
  {
    when: 'Step 1',
    title: 'Pick a plan',
    steps: ['Choose the level of support that fits how often you update your site'],
  },
  {
    when: 'Step 2',
    title: 'We take over the tech',
    steps: [
      'We set up access, run a full health check, and move your site to our managed WordPress hosting if needed',
    ],
  },
  {
    when: 'Step 3',
    title: 'Email us when you need something',
    steps: ['Requests go to our support desk and get handled, nothing gets lost'],
  },
];

export const processLink = {
  text: 'Not sure which plan fits?',
  label: 'Book a 15-minute call',
  href: '/contact',
};

/* --- 4. plans ------------------------------------------------------------------------ */

export const plansCopy = {
  eyebrow: 'Plans',
  title: 'Care plans for every kind of practice website',
  sub: 'For WordPress websites only. All plans are month to month. Cancel whenever you like.',
};

export const everyPlan = {
  title: 'Included in every plan',
  items: [
    'Month-to-month, cancel any time',
    'Help desk so nothing gets missed',
    'Restore from backup at no extra cost',
    'A real person, not a bot',
    'No access to client data, ever',
  ],
};

/** Small lines under the "every plan" row. A line still waiting on its figure is left out. */
export const finePrint: string[] = [
  'Care plans are for WordPress websites only.',
  'Support time doesn’t roll over to the next month.',
  ONBOARDING_FEE_NOTE,
].filter((line) => line.trim() !== '');

/* --- 5. compare plans ---------------------------------------------------------------- */

export const compareCopy = { title: 'Compare plans side by side' };

/* --- 6. what support time covers ----------------------------------------------------- */

export const supportCopy = { title: 'What can I use my support time for?' };

export const supportIncluded = {
  title: 'Included',
  items: [
    'Updating text, bios and fees',
    'Adding or editing pages from existing layouts',
    'Publishing blog posts',
    'Swapping photos',
    'Form changes',
    'Installing and setting up plugins',
    'Small design tweaks',
  ],
};

export const supportQuoted = {
  title: 'Quoted separately',
  items: [
    'Brand new page designs',
    'New features or custom plugin development',
    'Full site redesigns',
    'Large content migrations',
  ],
};

export const supportNote =
  'Not sure if something’s covered? Just ask. We’ll tell you before doing anything that costs extra.';

/* --- 7. care plan vs hosting company ------------------------------------------------- */

export const hostCompareCopy = { title: 'Can’t my hosting company do this?' };

/** A blank first heading is read to screen readers as "Criteria". */
export const hostCompareColumns = ['', 'Typical hosting', 'wwisermind care plan'];

export const hostCompareRows: { criteria: string; cells: string[] }[] = [
  {
    criteria: 'Backups',
    cells: [
      'Often only a day or two, sometimes on the same server',
      `Offsite backups kept for ${BACKUP_RETENTION} days`,
    ],
  },
  {
    criteria: 'Updates',
    cells: [
      'Automatic, and nobody checks if something broke',
      'WordPress updates run and checked by a person, rolled back if anything breaks',
    ],
  },
  { criteria: 'Making changes', cells: ['You do it yourself', 'Email us and it’s done'] },
  {
    criteria: 'When something breaks',
    cells: ['Support ticket queue', 'Someone who already knows your site'],
  },
  {
    criteria: 'Therapist context',
    cells: ['None', 'We know what your clients need to see'],
  },
];

/* --- 8. upsell ----------------------------------------------------------------------- */

export const upsellCopy = {
  title: 'Need a new site first?',
  body: 'Our one-week website includes hosting and care on the monthly option. Or pay once and add a care plan after launch.',
};

/* --- 9. faq -------------------------------------------------------------------------- */

export const carePlansFaqCopy = {
  eyebrow: 'Questions',
  title: 'Care plans, answered plainly',
  sub: 'The things people ask before they start.',
};

const joinAnswer = (base: string, extra: string) => (extra.trim() ? `${base} ${extra}` : base);

export const carePlansFaqs: FaqItem[] = [
  {
    title: 'Which platforms do you support?',
    body: 'WordPress only. Our care plans are built around how WordPress works: core, theme and plugin updates, WordPress-specific security, and managed WordPress hosting. If your site is on Squarespace, Wix or Showit, those platforms handle hosting and updates for you, so a care plan isn’t needed. Get in touch if you’d like help with changes on those.',
  },
  {
    title: 'My WordPress site wasn’t built by wwisermind. Can I still join?',
    body: joinAnswer(
      'Yes. We’ll do a one-time health check first so we know how your site is set up and can update it safely. If we find anything that needs fixing before we start, we’ll tell you upfront.',
      ONBOARDING_FEE_FAQ,
    ),
  },
  {
    title: `What is the ${feeName}?`,
    body: `A one-time fee of $${onboardingFee}, paid on top of your monthly plan when you join, and required on every plan. We review how your WordPress site is set up, check its health and security, and tune it so we can update and back it up safely from day one.`,
  },
  {
    title: 'Is there a minimum commitment?',
    body: 'No. Plans are month to month. Let us know before your next billing date and you won’t be charged again.',
  },
  {
    title: 'What if my website goes down?',
    body: 'Our monitoring alerts us when your site goes offline, so we’re often working on it before you notice. If it needs restoring from a backup, that’s included.',
  },
  {
    title: 'How do I send requests?',
    body: 'Email our support desk. You’ll get a confirmation straight away, then a person picks it up.',
  },
  {
    title: 'Does unused support time roll over?',
    body: 'No, support time resets each month. If you regularly need more, moving up a plan is usually better value than paying hourly.',
  },
  {
    title: 'Will you need access to client information?',
    body: 'No. We only need access to your WordPress site and hosting. We never need your EHR, client records or anything with client details.',
  },
  {
    title: 'Can I switch plans?',
    body: 'Yes, any time. Changes take effect from your next billing cycle.',
  },
];

/* --- 10. final cta ------------------------------------------------------------------- */

export const finalCta: FinalCta = {
  title: 'Hand over the tech, keep your evenings',
  sub: 'Pick a plan, or book a quick call and we’ll help you choose.',
  button: { label: 'See plans', href: '#plans' },
};

export const finalCtaSecondary = { label: 'Book a 15-minute call', href: '/contact' };

/** How the other pages list this one, so a price changed above changes there. */
export const carePlansListing = {
  name: 'WordPress Care Plans',
  price: `from ${money(lowestPrice)}`,
  unit: '/mo',
  href: carePlansPath,
};
