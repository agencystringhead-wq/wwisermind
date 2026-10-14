import { routes } from '@/lib/routes';
import type { PricingHeroData } from '@/components/pricing/LocalSeoHero';
import type { PricingOfferData } from '@/components/pricing/PricingOffer';
import type { UpsellPlan } from '@/components/pricing/PricingUpsell';
import {
  PRICE_CURRENCY,
  localSeoPackages,
  localSeoPath,
  type FaqItem,
  type FinalCta,
  type FitCallout,
  type FitCard,
  type ProcessStage,
} from '@/lib/pricing/local-seo';
import type { ServiceIconName } from '@/components/ui/icons';

/* ==========================================================================
   /pricing/seo-audit.

   The sibling of lib/pricing/local-seo.ts: every word and figure on the page is read from
   here, and the components only render it. The shared sections (hero, check cards,
   timeline, closing CTA, FAQ) take the shapes that file exports.

   The price is real and lives in one place, `auditPrice`; every "$299" on the page, in the
   title and in the structured data is built from it.

   Nothing here is a statistic, rating or review count. No em dashes or en dashes in the
   copy.
   ========================================================================== */

export { PRICE_CURRENCY };

export const auditPrice = 299;
const dollars = `$${auditPrice}`;

export const seoAuditPath = routes.pricing.seoAudit;

/* --- SEO ----------------------------------------------------------------------------- */

export const seoAuditMeta = {
  title: `SEO Audit for Therapists | ${dollars} Flat Fee | wwisermind`,
  description: `A one-time SEO audit for therapy practice websites. Technical, content, local and AI search reviewed by a specialist, with a prioritised plan and walkthrough call. ${dollars}.`,
};

/* --- 1. hero ------------------------------------------------------------------------- */

/** Where the order buttons go. TODO: swap for the checkout or Cal.com link once it exists. */
export const orderHref = routes.withQuery(routes.contact, { service: 'seo-audit' });

export const seoAuditHero: PricingHeroData = {
  eyebrow: 'Pricing / SEO Audit',
  title: 'An SEO audit for your therapy practice website',
  sub: 'Find out exactly why your site isn’t showing up for the people looking for you, and what to fix first. One flat fee, no ongoing contract.',
  primary: { label: `Order your audit for ${dollars}`, href: '#pricing' },
  secondary: { label: 'See what’s checked', href: '#whats-checked' },
};

/* TODO: fill in with real trust points once the owner has confirmed them. While the array
   is empty the strip is not rendered at all. */
export const trustItems: string[] = [];

/* --- 2. signs you need an audit ------------------------------------------------------ */

export const signsCopy = {
  title: 'Does any of this sound familiar?',
  sub: 'Four common signs that a site needs a proper look.',
};

export const signsCards: FitCard[] = [
  {
    icon: 'target',
    title: 'Your site gets visits but few enquiries',
    body: 'People land on your pages and leave without booking a consultation',
  },
  {
    icon: 'search',
    title: 'You don’t show up for your own specialties',
    body: 'Search for what you treat in your city and other practices come up instead',
  },
  {
    icon: 'clipboard',
    title: 'You paid for SEO before and can’t tell what it did',
    body: 'Reports full of numbers, but no clear change in clients',
  },
  {
    icon: 'clock',
    title: 'Your site was built a while ago',
    body: 'It works, but you’re not sure it’s set up the way search engines expect today',
  },
];

export const signsCallout: FitCallout = {
  title: 'If even one of these is true',
  body: 'An audit gives you a clear, prioritised list of what’s holding your site back. You can fix it yourself, hand it to your web person, or ask us.',
};

/* --- 3. what we check ---------------------------------------------------------------- */

export type CheckCard = { icon: ServiceIconName; title: string; body: string };

export const checksCopy = {
  title: 'What’s covered in the audit',
  sub: 'A real person reviews your site. Not just a tool export.',
};

export const checkCards: CheckCard[] = [
  {
    icon: 'bolt',
    title: 'Technical health',
    body: 'Page speed, mobile experience, indexing, crawl errors, broken links and redirects',
  },
  {
    icon: 'globe',
    title: 'Site structure',
    body: 'How your pages connect, URL structure, navigation and sitemap',
  },
  {
    icon: 'search',
    title: 'Keywords',
    body: 'Whether your pages target what clients actually search for, by specialty and location',
  },
  {
    icon: 'pen',
    title: 'Content',
    body: 'What to update, merge, create or remove, and where pages compete with each other',
  },
  {
    icon: 'clipboard',
    title: 'On-page elements',
    body: 'Titles, meta descriptions, headings, image alt text, internal links',
  },
  {
    icon: 'pin',
    title: 'Local presence',
    body: 'Google Business Profile, NAP consistency, and therapy directory profiles like Psychology Today',
  },
  {
    icon: 'code',
    title: 'Schema markup',
    body: 'Whether search engines can read your practice details, services and FAQs',
  },
  {
    icon: 'chat',
    title: 'AI search visibility',
    body: 'How your practice shows up when people ask ChatGPT, Gemini or Google AI Overviews',
  },
  {
    icon: 'shield',
    title: 'Trust & conversion',
    body: 'Contact forms, booking flow, privacy policy, SSL and the signals that make someone feel safe reaching out',
  },
];

/* --- 4. pricing ---------------------------------------------------------------------- */

export const pricingCopy = {
  title: 'One audit, one flat price',
  sub: 'No retainer. No upsell required.',
};

/* TODO: set the number of business days once confirmed. While this is empty the turnaround
   line is not rendered. */
const turnaroundDays = '';

export const auditOffer: PricingOfferData = {
  name: 'Practice SEO Audit',
  icon: 'searchCheck',
  description:
    'A complete review of your website\u2019s search health, with a prioritised plan you can act on.',
  tag: 'Flat fee',
  price: dollars,
  suffix: 'one-time',
  turnaround: turnaroundDays ? `Delivered in ${turnaroundDays} business days` : '',
  cta: { label: 'Order your audit', href: orderHref },
  note: 'Pay once. Keep the report.',
  sectionLabel: 'What you get',
  rows: [
    { label: 'Full site audit report', value: 'Included' },
    { label: 'Prioritised action plan', value: 'Included' },
    { label: 'Competitor comparison', value: 'Up to 3 practices' },
    { label: 'Local & directory review', value: 'Included' },
    { label: 'AI search visibility check', value: 'Included' },
    { label: 'Walkthrough call', value: '30 minutes' },
  ],
};

/** How the other SEO pages list this one, so a price changed here changes there. */
export const auditListing = {
  name: 'SEO Audit',
  price: dollars,
  unit: 'one-time',
  href: seoAuditPath,
};

/* --- 5. how it works ----------------------------------------------------------------- */

export const processCopy = {
  title: 'How it works',
  sub: 'Simple, and you’ll know what’s happening at each step',
};

/* No day counts here: the turnaround lives on the pricing card only. */
export const processStages: ProcessStage[] = [
  {
    when: 'Step 1',
    title: 'Collect',
    steps: [
      'We gather data from your site, Search Console and analytics if you grant access, and check how you rank today',
    ],
  },
  {
    when: 'Step 2',
    title: 'Review',
    steps: [
      'A specialist goes through your site page by page and compares it with practices you compete with locally',
    ],
  },
  {
    when: 'Step 3',
    title: 'Walk through',
    steps: [
      'You get the report and a prioritised plan, then we go through it together on a call so nothing is unclear',
    ],
  },
];

/* --- 6. free tool vs audit ----------------------------------------------------------- */

export const compareCopy = {
  title: 'Can’t I just run a free tool?',
  sub: 'You can. Here’s what usually gets missed.',
};

export const compareColumns = ['Criteria', 'Free tool', 'wwisermind audit'] as const;

export const compareRows: { criteria: string; free: string; audit: string }[] = [
  {
    criteria: 'Who reviews it',
    free: 'An automated scan',
    audit: 'A specialist who works with therapy practices',
  },
  {
    criteria: 'Priorities',
    free: 'A long list of warnings, all weighted the same',
    audit: 'Ranked by what will actually bring in enquiries',
  },
  {
    criteria: 'Context',
    free: 'Generic advice for any website',
    audit: 'Specific to therapists, specialties and your location',
  },
  {
    criteria: 'Local & directories',
    free: 'Usually not covered',
    audit: 'Google Business Profile and therapy directories checked',
  },
  { criteria: 'AI search', free: 'Not covered', audit: 'Checked' },
  {
    criteria: 'Next steps',
    free: 'Up to you to work out',
    audit: 'A walkthrough call and a clear plan',
  },
];

/* --- 7. upsell ----------------------------------------------------------------------- */

export const upsellCopy = {
  title: 'Want us to fix what we find?',
  body: 'Plenty of practices take the plan and run with it. If you’d rather hand it over, our Local SEO packages pick up right where the audit leaves off.',
  href: localSeoPath,
};

/** Read from the Local SEO data, never retyped: a price changed there changes here. */
export const upsellPlans: UpsellPlan[] = localSeoPackages.flatMap((pkg) =>
  pkg.price === undefined
    ? []
    : [{ name: pkg.name, line: `from $${pkg.price}${pkg.suffix ?? ''}`, href: localSeoPath }],
);

/* --- 8. final cta -------------------------------------------------------------------- */

export const finalCta: FinalCta = {
  title: 'Know exactly what’s holding your site back',
  sub: 'One flat fee. A plan in plain English. No obligation after.',
  button: { label: `Order your audit for ${dollars}`, href: orderHref },
};

/* --- 9. faq -------------------------------------------------------------------------- */

export const seoAuditFaqCopy = {
  eyebrow: 'Questions',
  title: 'The audit, answered plainly',
  sub: 'The things people ask before they order.',
};

export const seoAuditFaqs: FaqItem[] = [
  {
    title: 'What do I need to give you?',
    body: 'Your website address and a few minutes to tell us about your practice. If you can give us view access to Google Search Console and Analytics, the audit gets more precise, but it isn’t required.',
  },
  {
    title: `Is the ${dollars} a one-time fee?`,
    body: 'Yes. You pay once and the report is yours. There’s no subscription and no obligation to work with us afterwards.',
  },
  {
    title: 'Will you need access to any client information?',
    body: 'No. We only look at your public website and, if you choose, your search and analytics data. We never need access to your EHR or anything containing client details.',
  },
  {
    title: 'Can my web designer use the report?',
    body: 'Yes. It’s written so anyone can act on it, and the action plan is ordered so they know what to tackle first.',
  },
  {
    title: `I have more than one location. Is it still ${dollars}?`,
    body: 'The audit covers one website. If you have several locations on one site, we include them. Separate websites are audited separately.',
  },
  {
    title: 'What happens on the walkthrough call?',
    body: 'We go through the findings, answer your questions, and help you decide what to do first. It’s not a sales call.',
  },
];
