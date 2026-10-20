import type { ServiceIconName } from '@/components/ui/icons';
import { routes, type FreebieKey, type Route } from '@/lib/routes';

/* ==========================================================================
   Freebies: the /freebies/ hub, the five freebie pages and the two tool pages.

   One data file, one shared page template: every word on those pages is read from here.
   Same pattern as lib/services.ts and the pricing data files.

   The site has no form backend yet (the contact form is design only, waiting on Jotform), so the
   freebie form posts to FORM_ENDPOINT. While that is empty the form shows its success state
   without sending anything.

   PLACEHOLDERS to fill in (each marked TODO below): the form endpoint, the two
   Canva links, the preview images, and the privacy policy page.

   Nothing here is a download count, rating, testimonial or statistic. No em dashes or en dashes.
   ========================================================================== */

/* TODO: the endpoint the freebie form posts to (a Jotform or other form URL). While this is empty
   the form shows its success state without sending anything. */
export const FORM_ENDPOINT = '';

/* Both PDFs live in public/freebies/. */
const PT_KIT_PDF = '/freebies/psychology-today-profile-kit-for-therapists.pdf';
const GBP_CHECKLIST_PDF = '/freebies/google-business-profile-checklist-for-therapists.pdf';

/* TODO: the Canva template links ("make a copy" links). While one is empty its success state says
   the link is not ready, rather than showing a dead button. */
const SOCIAL_CANVA_TEMPLATE_LINK = '';
const BUSINESS_CARD_CANVA_LINK = '';

/** The privacy line under each freebie form links here. */
export const privacyPolicyHref: Route | null = routes.privacyPolicy;

export type FreebieType = 'download' | 'canva' | 'code' | 'tool' | 'quiz';

export type Freebie = {
  /** The last folder of its URL, and the key into FREEBIE_PATHS in lib/routes.ts. */
  slug: FreebieKey;
  title: string;
  shortDescription: string;
  longDescription: string;
  /** The small pill on the hub card and in the page's eyebrow. */
  typeLabel: string;
  type: FreebieType;
  /** Asks for a name and email before showing the download or the Canva link. */
  gated: boolean;
  /** Also shows an optional phone field on the form. */
  askPhone?: boolean;
  /** A coming-soon freebie has a page that takes an email for a heads-up, is not in the sitemap or
      llms.txt and is sent noindex. */
  status: 'live' | 'comingSoon';
  /** The PDF path or the Canva link. Empty until it exists. */
  assetUrl: string;
  /** What the get-it button says on the success state. */
  assetLabel: string;
  relatedService: { label: string; text: string; href: Route };
  icon: ServiceIconName;
  /* TODO: a preview image for each freebie. While it is null the page shows a plain placeholder. */
  previewImage: { src: string; width: number; height: number; alt: string } | null;
  whatsInside: string[];
  pageNote?: string;
  faq: { title: string; body: string }[];
};

const canvaNote =
  'You’ll need a free Canva account. Clicking the link creates your own copy, so you can edit freely.';

export const freebies: Freebie[] = [
  {
    slug: 'ai-visibility-report',
    title: 'AI Visibility Report',
    shortDescription:
      'See whether ChatGPT, Gemini and Google’s AI Overviews recommend your practice.',
    longDescription:
      'See whether ChatGPT, Gemini and Google’s AI Overviews recommend your practice when someone asks for a therapist like you.',
    typeLabel: 'Free tool',
    type: 'tool',
    gated: false,
    /* The tool does not exist yet: nothing in the app builds the report. */
    status: 'comingSoon',
    assetUrl: '',
    assetLabel: 'Open the report',
    relatedService: {
      text: 'Want help showing up in AI answers?',
      label: 'See Ongoing SEO pricing',
      href: routes.pricing.seo,
    },
    icon: 'search',
    previewImage: null,
    whatsInside: [],
    pageNote: 'This tool is not ready yet. Leave your email and we’ll let you know when it is.',
    faq: [],
  },
  {
    slug: 'website-scorecard-for-therapists',
    title: 'Website Scorecard',
    shortDescription:
      'Answer 12 quick questions and get a score for how well your website turns visitors into enquiries.',
    longDescription:
      'Answer 12 quick questions and get a score for how well your website turns visitors into enquiries.',
    typeLabel: 'Quiz',
    type: 'quiz',
    gated: false,
    /* The quiz does not exist yet. */
    status: 'comingSoon',
    assetUrl: '',
    assetLabel: 'Take the quiz',
    relatedService: {
      text: 'Want a website that turns visitors into enquiries?',
      label: 'See One-Week Website pricing',
      href: routes.pricing.oneWeekWebsite,
    },
    icon: 'clipboard',
    previewImage: null,
    whatsInside: [],
    pageNote: 'This quiz is not ready yet. Leave your email and we’ll let you know when it is.',
    faq: [],
  },
  {
    slug: 'psychology-today-profile-kit-for-therapists',
    title: 'Psychology Today Profile Kit',
    shortDescription:
      'Templates and a short guide to make your Psychology Today profile sound like you.',
    longDescription:
      'Fill-in-the-blank templates and a short guide to help your Psychology Today profile sound like you and bring in the right clients.',
    typeLabel: 'PDF + templates',
    type: 'download',
    gated: true,
    askPhone: true,
    status: 'live',
    assetUrl: PT_KIT_PDF,
    assetLabel: 'Download the kit',
    relatedService: {
      text: 'Want your website to match your profile?',
      label: 'See Custom Website Design pricing',
      href: routes.pricing.customWebsite,
    },
    icon: 'pen',
    previewImage: {
      src: '/images/freebies/psychology-today-profile-kit-preview.webp',
      width: 1200,
      height: 1000,
      alt: 'Pages from the Psychology Today Profile Kit: the cover, the opening paragraph templates and the publish checklist',
    },
    whatsInside: [
      'Intro paragraph templates',
      'Specialty and approach section templates',
      '“What to expect” section template',
      'Photo and headline tips',
      'A checklist before you hit publish',
    ],
    faq: [
      {
        title: 'Is this affiliated with Psychology Today?',
        body: 'No. It’s an independent guide from wwisermind to help you write a stronger profile.',
      },
      {
        title: 'What do I actually get?',
        body: 'A 10-page PDF: four fill-in templates for your statement, simple descriptions of common therapy approaches, photo and headline tips, and a checklist to run before you publish.',
      },
      {
        title: 'How do I use the templates?',
        body: 'Copy a template into a document, replace everything in the yellow brackets with your own words, then paste the result into your profile. Read it out loud once before you publish.',
      },
      {
        title: 'Will this get me more clients?',
        body: 'No guide can promise that. What it does is help your profile say clearly who you help, how, and what happens when someone reaches out, which is what people look for when they choose.',
      },
      {
        title: 'Can I use it for other directories?',
        body: 'Yes. The same templates work for other therapist directories, your Google Business Profile description and the About page on your own website.',
      },
      {
        title: 'Is it really free?',
        body: 'Yes. Enter your first name and email and the download appears straight away. Ticking the tips box is optional.',
      },
    ],
  },
  {
    slug: 'google-business-profile-checklist-for-therapists',
    title: 'Google Business Profile Checklist',
    shortDescription:
      'The therapy-specific details most practices miss on their Google Business Profile.',
    longDescription:
      'A printable checklist covering the therapy-specific details most practices miss on their Google Business Profile, from setup to monthly upkeep.',
    typeLabel: 'Checklist',
    type: 'download',
    gated: true,
    status: 'live',
    assetUrl: GBP_CHECKLIST_PDF,
    assetLabel: 'Download the checklist',
    relatedService: {
      text: 'Want us to manage it for you?',
      label: 'See Local SEO pricing',
      href: routes.pricing.localSeo,
    },
    icon: 'pin',
    askPhone: true,
    previewImage: {
      src: '/images/freebies/google-business-profile-checklist-preview.webp',
      width: 1200,
      height: 1000,
      alt: 'Pages from the Google Business Profile Checklist: the cover, the name and category checklist and the review reply templates',
    },
    whatsInside: [
      'Practice name and category rules',
      'Telehealth-only practices: what’s allowed',
      'Photos, hours and services',
      'Responding to reviews without confirming someone is a client',
      'Monthly upkeep checklist',
    ],
    faq: [
      {
        title: 'Is this affiliated with Google?',
        body: 'No. It’s an independent guide from wwisermind. Google and Google Business Profile are trademarks of Google LLC.',
      },
      {
        title: 'What do I actually get?',
        body: 'A 7-page PDF: four checklists covering your name, categories, photos, hours, reviews and upkeep, three review replies that never confirm someone is a client, and a fill-in template for your business description.',
      },
      {
        title: 'I only see clients online. Can I still have a profile?',
        body: 'Usually not. Google’s guidelines need a real place where you meet people in person. The checklist explains what to do instead, and why a home address or virtual office can get a profile suspended.',
      },
      {
        title: 'Does it work for group practices?',
        body: 'Yes. It covers how the practice profile and individual clinician profiles fit together, and what to keep the same across all of them.',
      },
      {
        title: 'Will this get me more clients?',
        body: 'No checklist can promise that. What it does is help you avoid the mistakes that get therapy profiles suspended or ignored, and keep the details people check before they call accurate.',
      },
      {
        title: 'Does this work outside the US?',
        body: 'Yes. Google Business Profile works the same way in most countries, including Ireland, Australia and Canada.',
      },
      {
        title: 'Is it really free?',
        body: 'Yes. Enter your first name and email and the download appears straight away. The phone number and the tips box are optional.',
      },
    ],
  },
  {
    slug: 'social-media-posts-for-therapists',
    title: '30 Days of Social Media Posts',
    shortDescription: 'A month of ready-to-edit Canva posts and captions written for therapists.',
    longDescription:
      'A month of ready-to-edit Canva templates and captions written for therapists. Open the link, make a copy, and post at your own pace.',
    typeLabel: 'Canva templates',
    type: 'canva',
    gated: true,
    status: 'live',
    assetUrl: SOCIAL_CANVA_TEMPLATE_LINK,
    assetLabel: 'Open in Canva',
    relatedService: {
      text: 'Want help growing your practice?',
      label: 'See Hyper Growth Marketing pricing',
      href: routes.pricing.hyperGrowth,
    },
    icon: 'chat',
    previewImage: null,
    whatsInside: [
      '30 post designs in Canva',
      'Captions for every post',
      'Mix of educational, practice and gentle promotional posts',
      'Written carefully: no client stories, no outcome promises',
    ],
    pageNote: canvaNote,
    faq: [
      {
        title: 'Do you post these for me?',
        body: 'No, this is a do-it-yourself pack. You edit and post them on your own schedule.',
      },
    ],
  },
  {
    slug: 'business-card-template-for-therapists',
    title: 'Business Card Template',
    shortDescription:
      'A calm, professional business card design you can edit in Canva and print anywhere.',
    longDescription:
      'Open the link, make your own copy in Canva, add your details and print. Designed to feel warm and trustworthy, not salesy.',
    typeLabel: 'Canva template',
    type: 'canva',
    gated: true,
    status: 'live',
    assetUrl: BUSINESS_CARD_CANVA_LINK,
    assetLabel: 'Open in Canva',
    relatedService: {
      text: 'Want a website that matches your card?',
      label: 'See One-Week Website pricing',
      href: routes.pricing.oneWeekWebsite,
    },
    icon: 'globe',
    previewImage: null,
    whatsInside: [
      'Front and back card designs',
      'Fields for name, credentials, practice, phone, website and booking link',
      'Space for a QR code to your booking page',
      'US size (3.5 x 2 in) and international size (85 x 55 mm)',
      'Print-ready export settings',
    ],
    pageNote: `${canvaNote} Print through Canva or any local printer.`,
    faq: [
      {
        title: 'Can I change the colours and fonts?',
        body: 'Yes. Once you’ve made your copy in Canva, everything is editable.',
      },
      {
        title: 'Do you print the cards for me?',
        body: 'No, this is a do-it-yourself template. You can print through Canva or any printer you like.',
      },
    ],
  },
  {
    slug: 'email-signature-for-therapists',
    title: 'Email Signature for Therapists',
    shortDescription:
      'A professional email signature for therapists. Copy the code and paste it in.',
    longDescription:
      'A clean, professional email signature built for therapists. Copy the code, swap in your details, and paste it into your email.',
    typeLabel: 'Copy-paste code',
    type: 'code',
    gated: false,
    status: 'live',
    assetUrl: '',
    assetLabel: 'Copy code',
    relatedService: {
      text: 'Want ongoing help with your website?',
      label: 'See WordPress Care Plans pricing',
      href: routes.pricing.carePlans,
    },
    icon: 'mail',
    previewImage: null,
    whatsInside: [
      'A live preview you can edit the look of',
      'Clean, table-based code that works in most email apps',
      'Optional logo or photo, confidentiality line and emergency line',
      'Setup steps for Gmail, Outlook and Apple Mail',
    ],
    faq: [
      {
        title: 'Is it really free?',
        body: 'Yes. The code is yours to use. If you’d like us to set it up for you, just get in touch.',
      },
    ],
  },
];

export const getFreebie = (slug: string): Freebie | undefined =>
  freebies.find((freebie) => freebie.slug === slug);

/** The page's address, from lib/routes.ts. */
export const freebiePath = (freebie: Freebie): Route => routes.freebies.page(freebie.slug);

export const isLive = (freebie: Freebie) => freebie.status === 'live';

/** The words on a hub card's link. */
export function ctaLabel(freebie: Freebie): string {
  if (freebie.status === 'comingSoon') return 'Get notified';
  if (freebie.type === 'code') return 'Get the code';
  if (freebie.type === 'tool' || freebie.type === 'quiz') return 'Try it';
  return 'Get it free';
}

/** "Free checklist", "Free Canva templates": the page's eyebrow from the type label. */
export function eyebrowFor(freebie: Freebie): string {
  const label = freebie.typeLabel;
  if (label.startsWith('Free')) return label;
  return /^([A-Z]{2,}|Canva)/.test(label)
    ? `Free ${label}`
    : `Free ${label.charAt(0).toLowerCase()}${label.slice(1)}`;
}

/* --- the hub ------------------------------------------------------------------------- */

export const hubMeta = {
  title: 'Free Resources for Therapists | Templates, Checklists & Tools | wwisermind',
  description:
    'Free tools and templates for therapists: Psychology Today profile kit, Google Business Profile checklist, social media and business card templates, email signature and more.',
};

export const hubHero = {
  eyebrow: 'Freebies',
  title: 'Free tools and templates for therapists',
  sub: 'Practical things you can use today to get found, look professional and save time. No catch. Some ask for your email so we can send them over.',
};

export const hubCta = {
  title: 'Want us to do it for you?',
  sub: 'These get you started. When you’re ready for a hand, we’re here.',
  button: { label: 'See pricing', href: routes.pricing.hub },
};

/* --- the page template's copy --------------------------------------------------------- */

export const pageCopy = {
  insideTitle: 'What’s inside',
  previewPlaceholder: 'Preview coming soon',
  faqCopy: { eyebrow: 'Questions', title: 'Quick answers', sub: '' },
};

export const formCopy = {
  nameLabel: 'First name',
  emailLabel: 'Email',
  phoneLabel: 'Phone',
  phoneHint: 'optional',
  consent: 'Send me occasional tips from wwisermind. Unsubscribe any time.',
  submit: 'Send it to me',
  notifySubmit: 'Let me know',
  sending: 'Sending…',
  emailedCopy: 'We’ve also emailed you a copy.',
  notifyDone: 'Thanks. We’ll email you when it’s ready.',
  linkNotReady: 'Your link is on its way by email. It isn’t ready to show here yet.',
  error: 'Something went wrong. Please try again, or email us.',
  privacy: 'We use your email to send you this. We don’t share it.',
  privacyWithPhone: 'We use your details to send you this and, if you add a phone number, to follow up. We don’t share them.',
  privacyLinkLabel: 'Privacy policy',
};

/* --- the email signature page ---------------------------------------------------------- */

export const signatureCopy = {
  previewTitle: 'Preview',
  options: {
    logo: 'Add a logo or photo',
    emergency: 'Add an emergency line',
    confidentiality: 'Add a confidentiality notice',
  },
  codeTitle: 'Code',
  copy: 'Copy code',
  copied: 'Copied',
  copyFormatted: 'Copy signature',
  copiedFormatted: 'Copied',
  placeholdersNote:
    'Swap each [placeholder] for your own details. Anything in square brackets is yours to replace.',
  stepsTitle: 'Set it up',
  outlookNote: 'Outlook can be fussy with formatting. If something looks off, we’re happy to help.',
  steps: [
    {
      id: 'gmail',
      label: 'Gmail',
      steps: [
        'Click the gear, then See all settings.',
        'Under General, scroll to Signature and create a new one.',
        'Click Copy signature above, then paste it into the box.',
        'Scroll down and click Save changes.',
      ],
    },
    {
      id: 'outlook',
      label: 'Outlook',
      steps: [
        'Open File, then Options, then Mail, then Signatures.',
        'Click New and give the signature a name.',
        'Click Copy signature above, then paste it into the editor.',
        'Click OK to save.',
      ],
    },
    {
      id: 'apple-mail',
      label: 'Apple Mail',
      steps: [
        'Open Mail, then Settings, then Signatures.',
        'Click the plus to add a signature.',
        'Untick “Always match my default message font”.',
        'Click Copy signature above, then paste it into the box.',
      ],
    },
  ],
  help: {
    title: 'Need help setting it up?',
    body: 'We’ll install it for you.',
    button: 'Ask us to install it',
    href: routes.withQuery(routes.contact, { freebie: 'email-signature' }),
  },
};
