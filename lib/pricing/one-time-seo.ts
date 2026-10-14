import { routes } from '@/lib/routes';
import type { PricingHeroData } from '@/components/pricing/LocalSeoHero';
import type { PricingOfferData } from '@/components/pricing/PricingOffer';
import type { UpsellPlan } from '@/components/pricing/PricingUpsell';
import {
  PRICE_CURRENCY,
  localSeoListing,
  localSeoPath,
  type FaqItem,
  type FinalCta,
  type FitCallout,
  type FitCard,
  type ProcessStage,
} from '@/lib/pricing/local-seo';
import { auditListing } from '@/lib/pricing/seo-audit';

/* ==========================================================================
   /pricing/one-time-seo.

   The sibling of lib/pricing/local-seo.ts and lib/pricing/seo-audit.ts: every word and
   figure on the page is read from here, and the components only render it. The shared
   sections (hero, check cards, timeline, closing CTA, FAQ, offer card, upsell band) take the
   shapes those files and components export.

   The price is real and lives in one place: `payments` and `paymentAmount`. The total, every
   "$349", the title, the meta description and the structured data are built from them.

   Nothing here is a statistic, ranking claim, rating or review count. No em dashes or en
   dashes in the copy.
   ========================================================================== */

export { PRICE_CURRENCY };

const payments = 3;
const paymentAmount = 349;
export const totalPrice = payments * paymentAmount;

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

export const oneTimeSeoPath = routes.pricing.oneTimeSeo;

/* --- SEO ----------------------------------------------------------------------------- */

export const oneTimeSeoMeta = {
  title: 'One-Time SEO Pricing for Therapists | No Retainer | wwisermind',
  description: `A 90-day, done-for-you SEO project for therapy practices. Research, technical fixes, on-page SEO, Google Business Profile and a content roadmap. ${payments} payments of ${money(paymentAmount)}.`,
};

/** The Offer's description: the single price is the total, so the instalments are said here. */
export const offerDescription = `${payments} monthly payments of ${money(paymentAmount)}`;

/* --- 1. hero ------------------------------------------------------------------------- */

/** Where the get started buttons go. TODO: swap for the checkout link once it exists. */
export const orderHref = routes.withQuery(routes.contact, { service: 'one-time-seo' });

export const oneTimeSeoHero: PricingHeroData = {
  eyebrow: 'Pricing / One-Time SEO',
  title: 'One-time SEO for therapy practices',
  sub: 'We fix the foundations of your website so the right clients can find you. A single 90-day project, done for you. No retainer.',
  primary: { label: 'Get started', href: '#pricing' },
  secondary: { label: 'See what’s included', href: '#phases' },
};

/* TODO: fill in with real trust points once the owner has confirmed them. While the array
   is empty the strip is not rendered at all. */
export const trustItems: string[] = [];

/* --- 2. is this right for you -------------------------------------------------------- */

export const fitCopy = {
  title: 'Built for practices that want it done properly, once',
  sub: 'Four signs this is the right kind of project.',
};

export const fitCards: FitCard[] = [
  {
    icon: 'search',
    title: 'You’re not showing up on Google',
    body: 'Your site exists, but people searching for what you treat can’t find it',
  },
  {
    icon: 'clipboard',
    title: 'You don’t want a monthly contract',
    body: 'You’d rather invest once and own the result',
  },
  {
    icon: 'clock',
    title: 'You don’t have time to learn SEO',
    body: 'You started a practice to help people, not to read about meta tags',
  },
  {
    icon: 'target',
    title: 'You want a plan for what comes next',
    body: 'Something you or your team can keep building on after we’re done',
  },
];

export const fitCallout: FitCallout = {
  title: 'Sound like you?',
  body: 'One-Time SEO fixes what’s holding your site back and leaves you with a clear roadmap. Plenty of practices stop there. Some move on to monthly support. Either is fine.',
};

/* --- 3. phases ----------------------------------------------------------------------- */

export type Phase = { title: string; purpose: string; items: string[] };

export const phasesCopy = {
  title: 'What’s included',
  sub: 'Three phases over 90 days. We do the work, you keep seeing clients.',
};

export const phases: Phase[] = [
  {
    title: 'Research & strategy',
    purpose: 'Know exactly what to focus on',
    items: [
      'Keyword research by specialty, service and location',
      'Competitor review of practices ranking in your area',
      'Content gap analysis',
      'A written SEO strategy for your practice',
    ],
  },
  {
    title: 'Fix & optimise',
    purpose: 'Fix what’s holding you back',
    items: [
      'Technical fixes: Search Console, sitemap, indexing, page speed basics',
      'On-page SEO for your top 8 pages',
      'Schema markup for your practice, services and FAQs',
      'Internal linking and site structure',
      'Google Business Profile optimisation',
      'Psychology Today and key therapy directory profiles reviewed and aligned',
    ],
  },
  {
    title: 'Roadmap & handover',
    purpose: 'Know what to do next',
    items: [
      'Content plan with 3 topic themes',
      'Pillar and supporting page plan',
      'AI search visibility check',
      'Ranking benchmarks so you can see change over time',
      'Final report and a 60-minute strategy call',
    ],
  },
];

/* --- 4. pricing ---------------------------------------------------------------------- */

export const pricingCopy = {
  title: 'The investment',
  sub: 'One project. Split into three payments.',
};

export const oneTimeOffer: PricingOfferData = {
  name: 'One-Time SEO',
  icon: 'flag',
  description: 'A complete SEO foundation for your practice website, done for you over 90 days.',
  tag: 'No retainer',
  priceLabel: `${payments} payments of`,
  price: money(paymentAmount),
  priceNote: `${money(totalPrice)} total, billed monthly over the project`,
  cta: { label: 'Get started', href: orderHref },
  note: 'Delivered in 90 days. Nothing to renew.',
  sectionLabel: 'Everything in the project',
  rows: [
    { label: 'Keyword & competitor research', value: 'Included' },
    { label: 'On-page SEO', value: 'Top 8 pages' },
    { label: 'Technical SEO fixes', value: 'Included' },
    { label: 'Schema markup', value: 'Included' },
    { label: 'Google Business Profile', value: 'Full optimisation' },
    { label: 'Therapy directory profiles', value: 'Included' },
    { label: 'Content roadmap', value: '3 themes' },
    { label: 'AI search visibility check', value: 'Included' },
    { label: 'Strategy call', value: '60 minutes' },
  ],
};

/* --- 5. how it works ----------------------------------------------------------------- */

export const processCopy = {
  title: 'How it works',
  sub: 'Three steps, and you’ll know what’s happening at each one',
};

export const processStages: ProcessStage[] = [
  {
    when: 'Step 1',
    title: 'Quick call',
    steps: ['A short call to make sure this is the right fit for your practice and website'],
  },
  {
    when: 'Step 2',
    title: 'Kickoff',
    steps: [
      'We get access to what we need (website, Search Console, Google Business Profile) and start Phase 01',
    ],
  },
  {
    when: 'Step 3',
    title: '90 days of work',
    steps: [
      'We work through all three phases and finish with your report and strategy call',
    ],
  },
];

/** How the other SEO pages list this one, so a price changed here changes there. */
export const oneTimeListing = {
  name: 'One-Time SEO',
  price: `${payments} x ${money(paymentAmount)}`,
  href: oneTimeSeoPath,
};

/* --- 6. which option ----------------------------------------------------------------- */

export type SeoOption = {
  name: string;
  price: string;
  unit: string;
  fit: string;
  /** Absent on the page's own card, which is not a link. */
  href?: string;
  current: boolean;
};

export const optionsCopy = {
  title: 'Not sure which to pick?',
  sub: 'Here’s how our SEO options fit together',
  currentTag: 'You are here',
  linkLabel: 'Learn more',
};

/** Names, prices and links of the other two come from their own data files. */
export const seoOptions: SeoOption[] = [
  {
    name: auditListing.name,
    price: auditListing.price,
    unit: auditListing.unit,
    fit: 'You want to know what’s wrong and fix it yourself',
    href: auditListing.href,
    current: false,
  },
  {
    name: oneTimeListing.name,
    price: oneTimeListing.price,
    unit: '',
    fit: 'You want it fixed properly, once, without a contract',
    current: true,
  },
  {
    name: localSeoListing.name,
    price: localSeoListing.price,
    unit: localSeoListing.unit,
    fit: 'You want ongoing growth in your local area',
    href: localSeoListing.href,
    current: false,
  },
];

/* --- 7. what happens after ----------------------------------------------------------- */

export const afterCopy = {
  title: 'What happens after 90 days?',
  body: 'You keep everything: the fixes, the strategy, the content plan. Many practices take the roadmap and keep going on their own. If you’d like us to keep the momentum going, our Local SEO packages pick up where this leaves off.',
};

export const afterPlans: UpsellPlan[] = [
  {
    name: 'Local SEO packages',
    line: [localSeoListing.price, localSeoListing.unit].filter(Boolean).join(''),
    href: localSeoPath,
  },
];

/* --- 8. final cta -------------------------------------------------------------------- */

export const finalCta: FinalCta = {
  title: 'Build the foundation once',
  sub: '90 days of focused work, a site that’s set up properly, and a plan for what comes next.',
  button: { label: 'Get started', href: orderHref },
};

/* --- 9. faq -------------------------------------------------------------------------- */

export const oneTimeSeoFaqCopy = {
  eyebrow: 'Questions',
  title: 'One-Time SEO, answered plainly',
  sub: 'The things people ask before they start.',
};

export const oneTimeSeoFaqs: FaqItem[] = [
  {
    title: 'How long does it take?',
    body: '90 days from kickoff. We work through all three phases and finish with your report and a strategy call.',
  },
  {
    title: 'Will I have to keep paying after this?',
    body: 'No. It’s three payments and that’s it. Monthly support is available if you want it, but it’s completely optional.',
  },
  {
    title: 'Do I need to write anything?',
    body: 'No. We handle the research, the fixes and the strategy. Writing new pages or blog posts isn’t included, but the content plan tells you exactly what to write, and we can help with that separately.',
  },
  {
    title: 'What platforms do you work with?',
    body: 'WordPress, Squarespace, Wix, Showit and custom sites. We make SEO changes inside your site. Bigger development work, like plugin conflicts or server issues, we’ll flag and quote separately or pass to your developer.',
  },
  {
    title: 'Will you need access to client information?',
    body: 'Never. We only work with your website, Search Console, Analytics and Google Business Profile. Nothing that contains client details.',
  },
  {
    title: 'I already had an SEO audit. Is this still useful?',
    body: 'Yes. An audit tells you what to fix. This project actually fixes it, and if your audit was with us, we’ll start from those findings.',
  },
  {
    title: 'When will I see results?',
    body: 'Some changes, like fixing indexing issues, can help quickly. Rankings usually build over the following months. It depends on your city and how competitive your specialties are, and we’ll be honest about that from the start.',
  },
];
