import type { PricingHeroData } from '@/components/pricing/LocalSeoHero';
import { getPricingEntry } from '@/lib/pricing';
import {
  PRICE_CURRENCY,
  type FaqItem,
  type FinalCta,
  type FitCard,
  type LineSegment,
  type LocalSeoPackage,
  type ProcessStage,
  type ResultCard,
} from '@/lib/pricing/local-seo';
import { oneTimeListing } from '@/lib/pricing/one-time-seo';
import { auditListing } from '@/lib/pricing/seo-audit';

/* ==========================================================================
   /pricing/seo.

   The fourth /pricing sub-page, in the same pattern as local-seo.ts, seo-audit.ts and
   one-time-seo.ts: every word and figure on the page is read from here, and the components
   only render it. The shared sections take the shapes those files export.

   The three plan prices are real and live in `plans`; the title, the meta description and the
   structured data are built from them.

   Nothing here is a statistic, percentage, ROI figure, rating or review count, and no
   third-party number is used. No em dashes or en dashes in the copy.
   ========================================================================== */

export { PRICE_CURRENCY };

export const ongoingSeoPath = '/pricing/seo';

/* --- the plans, first: everything else reads their prices ----------------------------- */

export const plans: LocalSeoPackage[] = [
  {
    id: 'solo-practice',
    name: 'Solo Practice',
    icon: 'person',
    description: 'Ideal for: solo therapists who want their site set up right and kept that way.',
    featured: false,
    price: 499,
    suffix: '/mo',
    sectionLabel: 'Package Details',
    rows: [
      { label: 'Keywords tracked', value: 'Up to 25' },
      { label: 'Content', value: '1 article/month' },
      { label: 'Technical & on-page work', value: '2 hrs/month' },
      { label: 'Google Business Profile', value: 'Weekly posts' },
      { label: 'Directory citations', value: '5/month' },
      { label: 'Schema markup', value: 'Core' },
      { label: 'AEO & GEO', value: 'Foundations' },
      { label: 'Reporting', value: 'Monthly snapshot' },
    ],
    cta: { label: 'Get started', href: '/contact?plan=solo-practice' },
  },
  {
    id: 'growing-practice',
    name: 'Growing Practice',
    icon: 'growth',
    description: 'Ideal for: practices adding clinicians or competing in a busy city.',
    featured: true,
    tag: 'Most popular',
    price: 999,
    suffix: '/mo',
    sectionLabel: 'Everything in Solo Practice, plus:',
    sectionPlus: true,
    rows: [
      { label: 'Keywords tracked', value: 'Up to 60' },
      { label: 'Content', value: '2 articles/month' },
      { label: 'Service page upgrades', value: '1/month' },
      { label: 'Technical & on-page work', value: '4 hrs/month' },
      { label: 'Directory citations', value: '10/month' },
      { label: 'Schema markup', value: 'Advanced' },
      { label: 'AEO & GEO', value: 'Full optimisation' },
      { label: 'Link building', value: 'Standard' },
      { label: 'Strategy call', value: 'Quarterly' },
    ],
    cta: { label: 'Get started', href: '/contact?plan=growing-practice' },
  },
  {
    id: 'group-practice',
    name: 'Group Practice',
    icon: 'users',
    description:
      'Ideal for: established group practices that want to lead in their area or niche.',
    featured: false,
    price: 1199,
    suffix: '/mo',
    sectionLabel: 'Everything in Growing Practice, plus:',
    rows: [
      { label: 'Keywords tracked', value: '100+' },
      { label: 'Content', value: '3 articles/month' },
      { label: 'Service & location pages', value: '2/month' },
      { label: 'Technical & on-page work', value: '6 hrs/month' },
      { label: 'Clinician bio optimisation', value: 'Included' },
      { label: 'AI mention tracking', value: 'Included' },
      { label: 'Link building', value: 'Digital PR' },
      { label: 'Conversion review', value: 'Quarterly' },
      { label: 'Strategy call', value: 'Monthly' },
    ],
    cta: { label: 'Get started', href: '/contact?plan=group-practice' },
  },
];

const lowestPrice = Math.min(...plans.flatMap((plan) => (plan.price === undefined ? [] : [plan.price])));

/* --- SEO ----------------------------------------------------------------------------- */

export const ongoingSeoMeta = {
  title: `Ongoing SEO, AEO & GEO for Therapists | Plans from $${lowestPrice}/mo | wwisermind`,
  description: `Monthly SEO and AI search optimisation for therapy practices. Get found on Google, in map results and in AI answers. Plans from $${lowestPrice} a month.`,
};

/* --- 1. hero ------------------------------------------------------------------------- */

export const ongoingSeoHero: PricingHeroData = {
  eyebrow: 'Ongoing SEO, AEO & GEO',
  title: 'Get found on Google and in AI answers. Month after month.',
  sub: 'People look for a therapist on Google, in the map results, and more and more by asking ChatGPT. We handle the strategy and the work every month, so your practice shows up wherever they’re searching.',
  primary: { label: 'See plans', href: '#plans' },
  secondary: { label: 'Get a free visibility check', href: '/contact' },
};

/* TODO: replace with /images/hero-serp.webp, a search results and AI answer mockup. Until it
   exists the hero shows this package's card image from /pricing. */
export const heroImage = getPricingEntry('ongoing-seo').image;

/* TODO: fill in with real trust points once the owner has confirmed them. While the array
   is empty the strip is not rendered at all. */
export const trustItems: string[] = [];

/* --- 2. the problem ------------------------------------------------------------------ */

export const problem = {
  eyebrow: 'The problem',
  title: 'If you’re not on page one, someone else is getting the call',
  body: 'Most people searching for a therapist pick from the first few results they see. A beautiful website doesn’t help if it isn’t one of them. And it’s not about being a better clinician. It’s about being visible at the moment someone decides to reach out.',
  button: { label: 'Show me where I rank', href: '/contact' },
};

/* TODO: replace with a real picture for this section. Until then it shows the SEO Audit
   card's image from /pricing. */
export const problemImage = getPricingEntry('seo-audit').image;

/* --- 3. why now ---------------------------------------------------------------------- */

export const whyNowCopy = {
  eyebrow: 'Why this matters now',
  title: 'Search changed. The practices that adapt early will be hard to catch.',
};

export type WhyNowCard = { title: string; body: string; labels?: string[] };

export const whyNowCards: WhyNowCard[] = [
  {
    title: 'Google',
    body: 'Still where most people start. The map results and the first few listings get the attention.',
  },
  {
    title: 'AI answers',
    body: 'ChatGPT, Gemini, Perplexity and Google’s AI Overviews now answer questions directly, and they recommend practices they trust.',
    labels: ['ChatGPT', 'Gemini', 'Perplexity', 'Google AI Overviews'],
  },
  {
    title: 'Directories',
    body: 'Psychology Today and other directories are useful, but you’re one profile among hundreds. Your own site is the one place you’re not competing on the same page.',
  },
];

export const whyNowSummary = {
  lead: 'Good SEO is now the foundation for AI visibility too.',
  body: 'The trust signals, structure and content that help you rank on Google are what AI tools use to decide who to recommend.',
};

/* --- 4. what's included -------------------------------------------------------------- */

export const includedCopy = {
  eyebrow: 'What’s included',
  title: 'Everything that helps you get found',
  sub: 'The exact mix shifts month to month based on what will move the needle for your practice. Higher plans get more depth, not just more tasks.',
};

export const includedCards: FitCard[] = [
  {
    icon: 'pin',
    title: 'Local SEO',
    body: 'Google Business Profile, map results, directory profiles and consistent practice details everywhere',
  },
  {
    icon: 'bolt',
    title: 'Technical SEO',
    body: 'Speed, crawl errors, indexing and site structure, so Google can read your site properly',
  },
  {
    icon: 'clipboard',
    title: 'On-page SEO',
    body: 'Titles, headings, internal links and page structure tuned for the searches that matter',
  },
  {
    icon: 'pen',
    title: 'Content',
    body: 'Articles and pages written around what your ideal clients are actually searching for',
  },
  {
    icon: 'chat',
    title: 'AEO (answer engine optimisation)',
    body: 'Clear, answer-ready content and FAQs so your practice gets quoted in AI answers and featured snippets',
  },
  {
    icon: 'globe',
    title: 'GEO (generative engine optimisation)',
    body: 'Building the trust and entity signals that make ChatGPT and Gemini recommend you',
  },
  {
    icon: 'code',
    title: 'Schema markup',
    body: 'Structured data for your practice, clinicians, services and FAQs',
  },
  {
    icon: 'target',
    title: 'Authority building',
    body: 'Relevant links and mentions from local and mental health sites',
  },
  {
    icon: 'mail',
    title: 'Reporting',
    body: 'Plain-English updates on rankings, traffic and enquiries, not a wall of numbers',
  },
];

/* --- 5. plans ------------------------------------------------------------------------ */

export const plansCopy = {
  eyebrow: 'Plans',
  title: 'Monthly plans for every stage of practice',
  sub: 'Pick the one that fits where your practice is now. You can move up any time.',
};

export const everyPlan = {
  title: 'Included in every plan',
  items: [
    'Custom 90-day strategy',
    'Keyword research & mapping',
    'Google Business Profile management',
    'Plain-English monthly updates',
    'No access to client data, ever',
    'You own everything we build',
  ],
};

/* TODO: write the contract terms. While this is empty the terms line is not rendered. */
export const contractTerms = '';

/** "Not ready for monthly?" Names and prices come from the other pricing data files. */
export const startSmall: LineSegment[] = [
  { text: 'Not ready for monthly? Start with an ' },
  { label: `${auditListing.name} (${auditListing.price})`, href: auditListing.href },
  { text: ' or ' },
  { label: `${oneTimeListing.name} (${oneTimeListing.price})`, href: oneTimeListing.href },
  { text: '.' },
];

/* --- 6. roadmap ---------------------------------------------------------------------- */

export const roadmapCopy = {
  eyebrow: 'What to expect',
  title: 'Your SEO roadmap',
  sub: 'SEO builds on itself. Here’s roughly how it unfolds. Every market is different, so we’ll be honest about yours.',
};

export const roadmapStages: ProcessStage[] = [
  {
    when: 'Months 1-3',
    title: 'Foundation',
    steps: [
      'Technical fixes',
      'Google Business Profile tune-up',
      'Keyword mapping',
      'Baseline tracking',
    ],
  },
  {
    when: 'Months 3-6',
    title: 'Momentum',
    steps: [
      'Content picks up',
      'First authority building',
      'Directory and local signals strengthen',
      'Early ranking movement',
    ],
  },
  {
    when: 'Months 6-12',
    title: 'Growth',
    steps: [
      'Rankings settle',
      'More enquiries from search',
      'AI tools start recognising your practice',
      'Clearer picture of what works',
    ],
  },
  {
    when: 'Year 2+',
    title: 'Staying ahead',
    steps: [
      'Content library compounds',
      'Harder for competitors to catch up',
      'Strategy shifts to protecting and expanding what you’ve built',
    ],
  },
];

/* --- 7. why wwisermind --------------------------------------------------------------- */

export const whyCopy = {
  eyebrow: 'Why wwisermind',
  title: 'Not the loudest agency. Just the one that does the work.',
};

export const whyCards: { title: string; body: string }[] = [
  {
    title: 'Therapists only',
    body: 'We only work with therapists and counselling practices, so we already know your searches, your ethics and your clients',
  },
  {
    title: 'Strategy first',
    body: 'Every month’s work comes from a written plan, not a fixed checklist we tick off regardless',
  },
  {
    title: 'Hands-off for you',
    body: 'We only reach out when we need an approval or have an update. You keep seeing clients',
  },
  {
    title: 'Privacy-minded',
    body: 'We never need access to client records, and we never ask clients for reviews',
  },
  {
    title: 'Plain-English reporting',
    body: 'You’ll know what we did and why it matters, without needing to learn SEO',
  },
  {
    title: 'You own it all',
    body: 'Content, pages, profiles and data are yours from day one. If you leave, it all stays with you',
  },
];

/** TODO: write the founder note and add a photo, then set `showFounderNote` to true. */
export const showFounderNote = false;

export const founderNote = {
  quote: '',
  name: '',
  role: '',
  photo: null as null | { src: string; alt: string; width: number; height: number },
};

/* --- 8. results ---------------------------------------------------------------------- */

export const resultsCopy = {
  title: 'Results from real practices',
  sub: 'What steady growth looks like',
  linkLabel: 'View case study',
};

/* TODO: add a card only when the practice has a real result, a real quote, a logo and a case
   study page to link to. None qualifies yet. */
export const resultCards: ResultCard[] = [];

/** The whole section is hidden unless at least two real cards exist. */
export const showResults = resultCards.length >= 2;

/* --- 9. faq -------------------------------------------------------------------------- */

export const ongoingSeoFaqCopy = {
  eyebrow: 'Questions',
  title: 'Ongoing SEO, answered plainly',
  sub: 'The things people ask before they start.',
};

export const ongoingSeoFaqs: FaqItem[] = [
  {
    title: 'What do AEO and GEO mean?',
    body: 'AEO is answer engine optimisation: making your content clear and structured enough to be quoted in AI answers and featured snippets. GEO is generative engine optimisation: building the trust signals that make tools like ChatGPT and Gemini recommend your practice. Both build on good SEO.',
  },
  {
    title: 'How soon will I see results?',
    body: 'Technical fixes can help within weeks. Steady ranking and enquiry growth usually takes 6 to 12 months. It depends on your city and how competitive your specialties are.',
  },
  {
    title: 'Do you guarantee rankings?',
    body: 'No, and we’d be wary of anyone who does. Search changes constantly. What we can promise is clear communication, real work every month, and honest reporting on what’s moving.',
  },
  {
    title: 'Do I need to do anything?',
    body: 'Very little. You’ll review and approve new content before it goes live, usually 1 to 3 times a month. Small SEO tweaks we handle directly.',
  },
  {
    title: 'Do I have to start with an audit?',
    body: 'No. Every plan starts with our own review of your site as part of the first 90-day strategy. If you’ve already done our SEO Audit or One-Time SEO, we build on that.',
  },
  {
    title: 'Will you need access to client information?',
    body: 'Never. We work with your website, Search Console, Analytics and Google Business Profile only.',
  },
  {
    title: 'Can I change plans?',
    body: 'Yes. You can move up any time. Moving down takes effect from your next billing cycle.',
  },
  {
    title: 'What platforms do you work with?',
    body: 'WordPress, Squarespace, Wix, Showit and custom sites. Larger development work gets flagged and quoted separately.',
  },
];

/* --- 10. final cta ------------------------------------------------------------------- */

export const finalCta: FinalCta = {
  title: 'Let’s get your practice found',
  sub: 'Book a free call. We’ll look at where you stand, who you’re competing with, and which plan makes sense. No pressure, the plan is yours either way.',
  button: { label: 'Book a free call', href: '/contact' },
  items: ['Visibility check', 'Competitor comparison', 'Plan recommendation'],
};
