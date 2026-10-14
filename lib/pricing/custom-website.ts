import { routes } from '@/lib/routes';
import type { PricingHeroData } from '@/components/pricing/LocalSeoHero';
import { getPricingEntry } from '@/lib/pricing';
import { carePlansListing } from '@/lib/pricing/care-plans';
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
import {
  packages as websitePackages,
  websiteDesignListing,
} from '@/lib/pricing/website-design';

/* ==========================================================================
   /pricing/custom-website.

   The eighth /pricing sub-page, in the same pattern as the others: every word and figure on
   the page is read from here, and the components only render it.

   The two prices are real and live in `customPrice` and `groupPrice`; the title, the meta
   description, the FAQ answers, the comparison table and the structured data are built from
   them, so no figure is typed twice. The One-Week Website column of the comparison table is
   read from lib/pricing/website-design.ts.

   Custom is positioned as the more personal option, never as better than the One-Week
   Website: we sell both.

   PLACEHOLDERS to fill in (each marked TODO below): the hero picture and the copywriter rates.

   Nothing here is a statistic, rating or review count. No em dashes or en dashes in the copy.
   ========================================================================== */

export { PRICE_CURRENCY };

export const customWebsitePath = routes.pricing.customWebsite;

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

const customPrice = 4499;
const groupPrice = 6499;

/* TODO: confirm the copywriter's rates. Both feed the copywriting card and the FAQ. */
const copyPerPage = 149;
const copyTenPages = 1299;

const paymentLine = 'Pay 40% to start, then the rest over 3 monthly payments.';

/** The offers for structured data, built from the same two prices. */
export const offers = [
  { name: 'Custom Website', price: customPrice },
  { name: 'Group Practice Website', price: groupPrice },
];

/* --- SEO ----------------------------------------------------------------------------- */

export const customWebsiteMeta = {
  title: `Custom Website Design for Therapists | From ${money(customPrice)} | wwisermind`,
  description: `Hand-designed websites for therapists and group practices. Free discovery call, fixed quotes, 4 to 6 week builds. Custom sites from ${money(customPrice)}, group practice sites from ${money(groupPrice)}.`,
};

export const serviceName = 'Custom website design for therapists';
export const serviceDescription = `Hand-designed websites for therapists and group practices, built after a free discovery call and a fixed quote. Starting at ${money(customPrice)} for a custom website and ${money(groupPrice)} for a group practice website.`;

/* --- 1. hero ------------------------------------------------------------------------- */

export const customWebsiteHero: PricingHeroData = {
  eyebrow: 'Custom website design',
  title: 'A website designed by hand, around your practice',
  sub: 'Every page designed from scratch by a person who has talked to you, understands your clients, and cares how it feels to land on your site. Built for solo therapists and group practices.',
  primary: { label: 'See pricing', href: '#pricing' },
  secondary: { label: 'See our work', href: '#projects' },
};

/* TODO: replace with a design process visual (sketches and a desktop mockup). Until it exists
   the hero shows the Custom Website Design card image from /pricing. */
export const heroImage = getPricingEntry('custom-website-design').image;

/* TODO: fill in with real trust points once the owner has confirmed them. While the array
   is empty the strip is not rendered at all. */
export const trustItems: string[] = [];

/* --- 2. is custom right for you ------------------------------------------------------ */

export const fitCopy = {
  title: 'Is a custom website right for you?',
  sub: '',
};

export const fitCards: FitCard[] = [
  {
    icon: 'pen',
    title: 'Your practice has its own feel',
    body: 'A template, however good, won’t capture the way you work or the space you create for clients',
  },
  {
    icon: 'chat',
    title: 'You want to be involved',
    body: 'You’d like to see ideas, give feedback, and shape the site as it comes together',
  },
  {
    icon: 'clipboard',
    title: 'Your site needs to do more',
    body: 'Several clinicians, more than one location, intake paths for different services',
  },
  {
    icon: 'calendar',
    title: 'This is a long-term investment',
    body: 'You want a site that grows with your practice for years, not just something live by Friday',
  },
];

/** The One-Week Website's from price, read from its own data file. */
const oneWeekFull = websitePackages.find((pkg) => pkg.id === 'pay-in-full');

export const fitCallout: FitCallout = {
  title: 'Need something faster and simpler?',
  body: `Our ${websiteDesignListing.name} is AI-assisted, reviewed by our team, and live in seven days${
    oneWeekFull?.price !== undefined ? ` from ${money(oneWeekFull.price)}` : ''
  }.`,
  link: { label: `See ${websiteDesignListing.name}`, href: websiteDesignListing.href },
};

/* --- 3. pricing ---------------------------------------------------------------------- */

export const pricingCopy = {
  eyebrow: 'Pricing',
  title: 'Two starting points',
  sub: 'Every project gets a fixed quote after a free discovery call. These are where most projects land.',
};

export const packages: LocalSeoPackage[] = [
  {
    id: 'custom-website',
    name: 'Custom Website',
    icon: 'pen',
    description: 'Ideal for: solo therapists and small practices who want a site that feels like them.',
    featured: true,
    tag: 'Most popular',
    price: customPrice,
    priceLabel: 'Starting at',
    sectionLabel: 'Package Details',
    rows: [
      { label: 'Design', value: '100% custom, by hand' },
      { label: 'Pages', value: 'Up to 10' },
      { label: 'Design revisions', value: '2 rounds' },
      { label: 'Build revisions', value: '2 rounds' },
      { label: 'Timeline', value: '4 to 6 weeks' },
      { label: 'Booking & contact forms', value: 'Included' },
      { label: 'On-page SEO setup', value: 'Included' },
      { label: 'Care after launch', value: '60 days included' },
      { label: 'Training session', value: '1 hour, recorded' },
      { label: 'Copywriting', value: 'Add-on', valueHref: '#copywriting' },
    ],
    cta: { label: 'Book a free discovery call', href: routes.withQuery(routes.contact, { plan: 'custom-website' }) },
  },
  {
    id: 'group-website',
    name: 'Group Practice Website',
    icon: 'users',
    description: 'Ideal for: group practices with multiple clinicians, services or locations.',
    featured: false,
    price: groupPrice,
    priceLabel: 'Starting at',
    sectionLabel: 'Everything in Custom Website, plus:',
    sectionPlus: true,
    rows: [
      { label: 'Pages', value: 'Up to 20' },
      { label: 'Clinician directory', value: 'With filters (specialty, location, availability)' },
      { label: 'Multiple locations', value: 'Included' },
      { label: 'Booking integrations', value: 'Included' },
      { label: 'Timeline', value: '6 to 8 weeks' },
      { label: 'Copywriting', value: 'Add-on', valueHref: '#copywriting' },
    ],
    cta: { label: 'Book a free discovery call', href: routes.withQuery(routes.contact, { plan: 'group-website' }) },
  },
];

export const everyWebsite = {
  title: 'Included with every custom website',
  items: [
    'Free discovery call, no paid session',
    'Mobile-friendly and fast',
    'Accessibility basics',
    'Google Analytics & Search Console',
    'Schema markup',
    'You own your site, content and domain',
  ],
};

export const paymentTerms = paymentLine;

/* --- 4. copywriting add-on ----------------------------------------------------------- */

export const copyCopy = {
  eyebrow: 'Copywriting',
  title: 'Need help with the words?',
  body: 'Have your own copy? We’ll design around it. If you’d rather not write it yourself, our copywriter will interview you and write pages that sound like you, not like a template.',
  note: 'Copywriting is available on both Custom and Group Practice websites.',
};

export type CopyRow = { label: string; value: string; tag?: string };

export const copyCard: { title: string; rows: CopyRow[] } = {
  title: 'Copywriting add-on',
  rows: [
    { label: 'Per page', value: money(copyPerPage) },
    { label: 'Up to 10 pages', value: money(copyTenPages), tag: 'Best value' },
    { label: 'Includes', value: 'Interview call, 2 rounds of edits' },
  ],
};

/* --- 5. process ---------------------------------------------------------------------- */

export const processCopy = {
  eyebrow: 'The process',
  title: 'How we design your website',
  sub: 'A clear process with two points where your feedback shapes everything.',
};

export const processStages: ProcessStage[] = [
  {
    when: 'Step 1',
    title: 'Discovery call',
    steps: ['A free call about your practice, your clients and your goals. You get a fixed quote afterwards'],
  },
  {
    when: 'Step 2',
    title: 'Plan',
    steps: ['We map your pages, how clients move through the site, and what each page needs to do'],
  },
  {
    when: 'Step 3',
    title: 'Homepage design',
    steps: ['We design your homepage first, then refine it with you over 2 rounds'],
  },
  {
    when: 'Step 4',
    title: 'Full build',
    steps: ['We apply the approved design across every page and build the site'],
  },
  {
    when: 'Step 5',
    title: 'Review',
    steps: ['You click through the whole site and leave feedback, 2 rounds'],
  },
  {
    when: 'Step 6',
    title: 'Launch & training',
    steps: ['We go live, then walk you through editing your site on a recorded call'],
  },
];

/* --- 6. compare options -------------------------------------------------------------- */

export const compareCopy = { title: 'Which website is right for you?' };

/** A blank first heading is read to screen readers as "Criteria". */
export const compareColumns = [
  '',
  websiteDesignListing.name,
  'Custom Website',
  'Group Practice Website',
];

/** Index of the highlighted option, among the options (not counting the criteria column). */
export const compareHighlight = 1;

/* The One-Week Website column is read from lib/pricing/website-design.ts. A value that cannot
   be found there prints "See page" instead of a guess. */
const oneWeekRow = (label: string): string | null =>
  websitePackages.flatMap((pkg) => pkg.rows).find((row) => row.label === label)?.value ?? null;

const seePage = 'See page';

const oneWeekPrice = (() => {
  const full = websitePackages.find((pkg) => pkg.id === 'pay-in-full')?.price;
  const monthly = websitePackages.find((pkg) => pkg.id === 'pay-monthly')?.price;
  if (full === undefined) return seePage;
  return monthly === undefined ? money(full) : `${money(full)} or ${money(monthly)}/mo`;
})();

const oneWeekCopy = oneWeekRow('Copywriting');
const oneWeekRevisions = oneWeekRow('Revision rounds');

export const compareRows: { criteria: string; cells: string[] }[] = [
  {
    criteria: 'Starting price',
    cells: [oneWeekPrice, money(customPrice), money(groupPrice)],
  },
  {
    criteria: 'How it’s made',
    cells: ['AI-assisted, reviewed by our team', 'Designed by hand', 'Designed by hand'],
  },
  {
    criteria: 'Timeline',
    cells: [oneWeekRow('Build time') ?? seePage, '4 to 6 weeks', '6 to 8 weeks'],
  },
  {
    criteria: 'Pages',
    cells: [oneWeekRow('Pages') ?? seePage, 'Up to 10', 'Up to 20'],
  },
  {
    criteria: 'Copy',
    cells: [
      oneWeekCopy ? `AI-assisted, ${oneWeekCopy.toLowerCase()}` : seePage,
      'Add-on',
      'Add-on',
    ],
  },
  {
    criteria: 'Revisions',
    cells: [
      oneWeekRevisions ? `${oneWeekRevisions} rounds` : seePage,
      '2 design + 2 build',
      '2 design + 2 build',
    ],
  },
  { criteria: 'Clinician directory', cells: ['No', 'No', 'Yes, with filters'] },
  {
    criteria: 'Best for',
    cells: [
      'Getting online fast',
      'A site that feels like you',
      'Teams and multiple locations',
    ],
  },
];

/* --- 7. recent projects -------------------------------------------------------------- */

export const projectsCopy = {
  title: 'Recent launches',
  sub: 'Websites we have built for therapy practices',
  link: { label: 'See all work', href: routes.results },
};

/** Read from the homepage's launches, so a figure changed there changes here. The section is
    hidden if the list is ever empty. */
export const projects = relevantProjects;

/* --- 8. why wwisermind --------------------------------------------------------------- */

export const whyCopy = { title: 'Why practices choose us for custom work' };

export const whyCards: { title: string; body: string }[] = [
  {
    title: 'Therapists only',
    body: 'We know what someone needs to see before they feel ready to reach out',
  },
  {
    title: 'A real designer, start to finish',
    body: 'The person who talks to you is involved in designing your site',
  },
  {
    title: 'Free discovery',
    body: 'No paid strategy session before you get a quote',
  },
  {
    title: 'Fixed quotes',
    body: 'You know the full price before we start. No surprises halfway through',
  },
  {
    title: 'Privacy-minded',
    body: 'Forms and booking set up without collecting more client information than you need',
  },
  {
    title: 'You own it all',
    body: 'Your site, content and domain are yours. We never hold a website hostage',
  },
];

/* --- 9. upsell ----------------------------------------------------------------------- */

export const upsellCopy = {
  title: 'Keep it looked after, and get it found',
  body: 'After your 60 days of included care, choose a care plan to keep things running. Add SEO when you’re ready to grow.',
};

/** Names, prices and links come from the care plans and Ongoing SEO data files. */
export const upsellPlans = [
  {
    name: carePlansListing.name,
    line: `${carePlansListing.price}${carePlansListing.unit}`,
    href: carePlansListing.href,
  },
  { name: ongoingListing.name, line: `${ongoingListing.price}${ongoingListing.unit}`, href: ongoingListing.href },
];

/* --- 10. faq ------------------------------------------------------------------------- */

export const customWebsiteFaqCopy = {
  eyebrow: 'Questions',
  title: 'Custom websites, answered plainly',
  sub: 'The things people ask before they start.',
};

export const customWebsiteFaqs: FaqItem[] = [
  {
    title: 'What’s the difference between this and the One-Week Website?',
    body: 'The One-Week Website is AI-assisted and built from your intake form, so it’s fast and affordable. Custom websites are designed by hand from scratch, with more back and forth and more room to shape the result. Both are reviewed by our team and built to the same standards.',
  },
  {
    title: 'Why “starting at”?',
    body: `Every practice is different. After a free discovery call you get a fixed quote. Most solo practices land at ${money(customPrice)} and most group practices at ${money(groupPrice)}. Extra pages or features are quoted upfront, never added later.`,
  },
  {
    title: 'Is copywriting included?',
    body: `No. You can supply your own copy, or add our copywriting service from ${money(copyPerPage)} per page. Our copywriter interviews you and writes pages that sound like you.`,
  },
  {
    title: 'How do payments work?',
    body: '40% to start, then the rest over 3 monthly payments.',
  },
  {
    title: 'What happens after launch?',
    body: 'You get 60 days of care included, covering updates, backups and small fixes. After that you can choose a care plan or look after the site yourself.',
  },
  {
    title: 'Will I be able to edit my site?',
    body: 'Yes. We’ll show you how on a recorded training call, so you can update text, photos and blog posts yourself.',
  },
  {
    title: 'Can you redesign my existing site?',
    body: 'Yes. We’ll move your content across and set up redirects so you don’t lose what Google already knows about your site.',
  },
  {
    title: 'Do I own my website?',
    body: 'Yes. Your site, content and domain are yours. If you ever leave, everything goes with you.',
  },
];

/* --- 11. final cta ------------------------------------------------------------------- */

export const finalCta: FinalCta = {
  title: 'Let’s design something that feels like your practice',
  sub: 'Book a free discovery call. We’ll talk about your practice and send a fixed quote. No paid sessions, no pressure.',
  button: { label: 'Book a free discovery call', href: routes.contact },
};

/** How the other pages list this one, so a price changed above changes there. */
export const customWebsiteListing = {
  name: 'Custom Website Design',
  price: `from ${money(customPrice)}`,
  unit: '',
  href: customWebsitePath,
};
