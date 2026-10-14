import { routes } from '@/lib/routes';
import type { PricingHeroData } from '@/components/pricing/LocalSeoHero';
import type { UpsellPlan } from '@/components/pricing/PricingUpsell';
import { getPricingEntry } from '@/lib/pricing';
import {
  PRICE_CURRENCY,
  relevantProjects,
  type FaqItem,
  type FinalCta,
  type FitCallout,
  type FitCard,
  type LocalSeoPackage,
  type ProcessStage,
} from '@/lib/pricing/local-seo';
import { ongoingListing } from '@/lib/pricing/ongoing-seo';
import { oneTimeListing } from '@/lib/pricing/one-time-seo';
import { carePlansPath } from '@/lib/pricing/care-plans';

/* ==========================================================================
   /pricing/website-design.

   The fifth /pricing sub-page, in the same pattern as the others: every word and figure on
   the page is read from here, and the components only render it. The shared sections take the
   shapes the other data files and components export.

   The two prices are real and live in `fullPrice` and `monthlyPrice`; the 12-month total, the
   comparison table, the title, the meta description and the structured data are built from
   them, so no figure is typed twice.

   PLACEHOLDERS to fill in (each is hidden or defaulted while unset, and marked TODO below):
   page count, edit hours, what happens after the term, early exit terms, ownership detail,
   the hero picture.

   Nothing here is a statistic, rating or review count. No em dashes or en dashes in the copy.
   ========================================================================== */

export { PRICE_CURRENCY };

export const websiteDesignPath = routes.pricing.oneWeekWebsite;

const fullPrice = 2999;
const monthlyPrice = 399;
const termMonths = 12;
export const monthlyTotal = monthlyPrice * termMonths;

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

/* TODO: confirm the page count. */
const pageCount = 7;
/* TODO: confirm the included edit time. */
const editHours = '1 hr';
/* TODO: say what happens after the 12 months. While this is empty the note under the Pay
   Monthly button and the matching FAQ answer are left out. */
const afterTermNote = '';
const afterTermFaq = '';
/* TODO: write the early exit terms. Appended to the cancel FAQ answer; left out while empty. */
const earlyExitTerms = '';
/* TODO: write the ownership detail. Appended to the ownership FAQ answer; left out while empty. */
const ownershipDetail = '';

/** How the other pages list this one, so a price changed above changes there. */
export const websiteDesignListing = {
  name: 'One-Week Website',
  price: `from ${money(monthlyPrice)}`,
  unit: '/mo',
  href: websiteDesignPath,
};

/** The offers for structured data, built from the same two prices. */
export const offers = [
  { name: 'Pay in Full', price: fullPrice, unitText: undefined as string | undefined },
  { name: 'Pay Monthly', price: monthlyPrice, unitText: 'per month, 12-month commitment' },
];

/* --- SEO ----------------------------------------------------------------------------- */

export const websiteDesignMeta = {
  title: `Therapist Website Design in One Week | From ${money(monthlyPrice)}/mo | wwisermind`,
  description: `Custom websites for therapists and counselling practices, built in one week. Copy and SEO setup included. ${money(fullPrice)} one-time or ${money(monthlyPrice)} a month.`,
};

/* --- 1. hero ------------------------------------------------------------------------- */

export const websiteDesignHero: PricingHeroData = {
  eyebrow: 'One-week website design',
  title: 'A website for your practice, live in one week',
  sub: 'Designed for therapists, written to help people feel safe reaching out, and built to show up on Google. Pay once, or spread it over 12 months.',
  primary: { label: 'See pricing', href: '#pricing' },
  secondary: { label: 'See our work', href: '#projects' },
};

/* TODO: replace with a device mockup of a recent launch. Until it exists the hero shows the
   One Week Website card image from /pricing. */
export const heroImage = getPricingEntry('one-week-website').image;

/* TODO: fill in with real trust points once the owner has confirmed them. While the array
   is empty the strip is not rendered at all. */
export const trustItems: string[] = [];

/* --- 2. is a new website right for you ----------------------------------------------- */

export const fitCopy = {
  title: 'Is it time for a new website?',
  sub: 'Four signs it might be.',
};

export const fitCards: FitCard[] = [
  {
    icon: 'pen',
    title: 'Your site doesn’t feel like you',
    body: 'It was built in a hurry, or by a template, and it doesn’t reflect how you actually work with clients',
  },
  {
    icon: 'target',
    title: 'People visit but don’t reach out',
    body: 'The booking path is unclear, or the site doesn’t answer the questions people have before their first session',
  },
  {
    icon: 'clock',
    title: 'It’s hard to update',
    body: 'Changing a bio or adding a service feels like a project',
  },
  {
    icon: 'calendar',
    title: 'You’ve been putting it off for months',
    body: 'You know it needs doing, but a 3-month agency project isn’t something you have time for',
  },
];

export const fitCallout: FitCallout = {
  title: 'If that sounds familiar',
  body: 'One week, a clear process, and a site you’ll actually be proud to send people to.',
};

/* --- 3. pricing ---------------------------------------------------------------------- */

export const pricingCopy = {
  eyebrow: 'Pricing',
  title: 'One website, two ways to pay',
  sub: 'Same website, same one-week build. Choose what works for your cash flow.',
};

export const packages: LocalSeoPackage[] = [
  {
    id: 'pay-in-full',
    name: 'Pay in Full',
    icon: 'card',
    description: 'Own your website outright with a single payment.',
    featured: false,
    price: fullPrice,
    suffix: 'one-time',
    sectionLabel: 'Package Details',
    rows: [
      { label: 'Build time', value: '1 week' },
      { label: 'Pages', value: `Up to ${pageCount}` },
      { label: 'Custom design', value: 'Included' },
      { label: 'Copywriting', value: 'Included' },
      { label: 'On-page SEO setup', value: 'Included' },
      { label: 'Booking or contact form', value: 'Included' },
      { label: 'Revision rounds', value: '2' },
      {
        label: 'Hosting & care',
        value: 'Optional add-on',
        valueHref: carePlansPath,
      },
    ],
    cta: { label: 'Get started', href: routes.withQuery(routes.contact, { plan: 'website-full' }) },
  },
  {
    id: 'pay-monthly',
    name: 'Pay Monthly',
    icon: 'calendar',
    description: `Spread the cost over ${termMonths} months, with hosting and care included.`,
    featured: true,
    tag: 'Most popular',
    price: monthlyPrice,
    suffix: '/mo',
    priceNote: `${termMonths}-month commitment`,
    sectionLabel: 'Everything in Pay in Full, plus:',
    sectionPlus: true,
    rows: [
      { label: 'Hosting', value: 'Included' },
      { label: 'Security & backups', value: 'Included' },
      { label: 'Software & plugin updates', value: 'Included' },
      { label: 'Small content edits', value: `${editHours} per month` },
      { label: 'Priority support', value: 'Included' },
    ],
    cta: { label: 'Get started', href: routes.withQuery(routes.contact, { plan: 'website-monthly' }) },
    ctaNote: afterTermNote,
  },
];

export const everyWebsite = {
  title: 'Included with every website',
  items: [
    'Mobile-friendly design',
    'Fast loading',
    'Google Analytics & Search Console setup',
    'Schema markup for your practice',
    'Accessibility basics',
    'You own your content and domain',
  ],
};

export const callBand = {
  title: 'Not sure which option fits?',
  body: 'Book a quick call and we’ll talk it through. No pressure either way.',
  button: { label: 'Book a free call', href: routes.contact },
};

/* --- 4. process ---------------------------------------------------------------------- */

export const processCopy = {
  eyebrow: 'The process',
  title: 'How we build your site in one week',
  sub: 'A short, focused process. The one thing we need from you is quick feedback.',
};

export const processStages: ProcessStage[] = [
  {
    when: 'Before we start',
    title: 'Kickoff',
    steps: [
      'A short call and a simple intake form about your practice, your clients and how you work',
    ],
  },
  {
    when: 'Days 1-2',
    title: 'Design & copy',
    steps: ['We design your homepage and write your core pages'],
  },
  {
    when: 'Day 3',
    title: 'Your review',
    steps: ['You look it over and send feedback (round 1)'],
  },
  {
    when: 'Days 4-5',
    title: 'Build',
    steps: ['We build the full site, set up forms, SEO basics and tracking'],
  },
  {
    when: 'Days 6-7',
    title: 'Final review & launch',
    steps: ['Round 2 of feedback, final checks, and we go live'],
  },
];

export const processNote =
  'The one-week clock starts once we have your intake form, photos and logo. Feedback within 24 hours keeps us on track.';

/* --- 5. pay in full vs monthly ------------------------------------------------------- */

export const compareCopy = {
  title: 'Which payment option is right for you?',
};

/** A blank first heading is read to screen readers as "Criteria". */
export const compareColumns = ['', 'Pay in Full', 'Pay Monthly'];

export const compareRows: { criteria: string; cells: string[] }[] = [
  { criteria: 'Upfront cost', cells: [money(fullPrice), money(monthlyPrice)] },
  {
    criteria: `Total over ${termMonths} months`,
    cells: [`${money(fullPrice)} + hosting`, `${money(monthlyTotal)}, hosting and care included`],
  },
  { criteria: 'Hosting & maintenance', cells: ['Add-on', 'Included'] },
  { criteria: 'Small edits', cells: ['Billed separately', 'Included'] },
  {
    criteria: 'Best for',
    cells: [
      'Practices that want to own it outright',
      'Practices that want predictable monthly costs',
    ],
  },
];

/* --- 6. recent projects -------------------------------------------------------------- */

export const projectsCopy = {
  title: 'Recent launches',
  sub: 'Websites we have built for therapy practices',
  link: { label: 'See all work', href: routes.results },
};

/** Read from the homepage's launches, so a figure changed there changes here. The section is
    hidden if the list is ever empty. */
export const projects = relevantProjects;

/* --- 7. why wwisermind --------------------------------------------------------------- */

export const whyCopy = {
  eyebrow: 'Why wwisermind',
  title: 'Built by people who know therapy practices',
};

export const whyCards: { title: string; body: string }[] = [
  {
    title: 'Therapists only',
    body: 'We design for therapy practices, so we know what potential clients need to see before they reach out',
  },
  {
    title: 'Copy included',
    body: 'You don’t need to write anything from scratch. We draft it, you make it sound like you',
  },
  {
    title: 'SEO from day one',
    body: 'Every site launches with the basics in place so Google can find you',
  },
  {
    title: 'Privacy-minded',
    body: 'Forms and booking set up without collecting more client information than you need',
  },
  {
    title: 'One clear week',
    body: 'No three-month timelines and endless back-and-forth',
  },
  {
    title: 'Room to grow',
    body: 'When you’re ready, our SEO plans pick up right where the launch leaves off',
  },
];

/* --- 8. upsell ----------------------------------------------------------------------- */

export const upsellCopy = {
  title: 'Want people to find it too?',
  body: 'A new website is the foundation. Pair it with SEO and it starts bringing in enquiries.',
};

/** Names, prices and links come from the One-Time SEO and Ongoing SEO data files. */
export const upsellPlans: UpsellPlan[] = [
  { name: oneTimeListing.name, line: oneTimeListing.price, href: oneTimeListing.href },
  { name: ongoingListing.name, line: `${ongoingListing.price}${ongoingListing.unit}`, href: ongoingListing.href },
];

/* --- 9. faq -------------------------------------------------------------------------- */

export const websiteDesignFaqCopy = {
  eyebrow: 'Questions',
  title: 'The website, answered plainly',
  sub: 'The things people ask before they start.',
};

const joinAnswer = (base: string, extra: string) => (extra ? `${base} ${extra}` : base);

const allFaqs: FaqItem[] = [
  {
    title: 'Is one week really realistic?',
    body: 'Yes, as long as we have your intake form, photos and logo at the start and you can give feedback within a day. If anything on your side takes longer, the timeline moves with it.',
  },
  {
    title: 'What do I need to provide?',
    body: 'A completed intake form, a professional photo, your logo if you have one, and your booking or contact details. We’ll handle the rest, including the copy.',
  },
  {
    title: 'Do you write the content?',
    body: 'Yes. We draft all the core pages based on your intake form. You review it and we refine it until it sounds like you.',
  },
  {
    title: `What happens after the ${termMonths} months on the monthly plan?`,
    body: afterTermFaq,
  },
  {
    title: 'Can I cancel the monthly plan early?',
    body: joinAnswer(
      `The monthly option is a ${termMonths}-month commitment, which is what makes the lower upfront cost possible.`,
      earlyExitTerms,
    ),
  },
  {
    title: 'Do I own my website?',
    body: joinAnswer('You own your domain and all your content from day one.', ownershipDetail),
  },
  {
    title: 'Can you move my existing site and domain?',
    body: 'Yes. We’ll handle the move and set up redirects so you don’t lose what Google already knows about your site.',
  },
  {
    title: 'Can I add pages later?',
    body: 'Yes. Extra pages can be added any time. Monthly plan clients can use their included edit time for small changes.',
  },
  {
    title: 'Will my site work with Psychology Today, SimplePractice or my booking tool?',
    body: 'We can link or embed most booking and practice management tools. Tell us what you use on the kickoff call.',
  },
];

/** An answer still waiting on its terms is left out, rather than shown empty. */
export const websiteDesignFaqs: FaqItem[] = allFaqs.filter((item) => item.body.trim() !== '');

/* --- 10. final cta ------------------------------------------------------------------- */

export const finalCta: FinalCta = {
  title: 'One week from now, your new site could be live',
  sub: 'Book a free call and we’ll walk you through exactly how it works.',
  button: { label: 'Book a free call', href: routes.contact },
};
