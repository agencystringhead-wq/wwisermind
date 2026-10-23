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

/* The 2027 Full-Caseload Plan is built by scripts/guides/full-caseload-plan/build-pdf.mjs into
   public/guides/. The other two PDFs live in public/freebies/. */
const FULL_CASELOAD_PLAN_PDF = '/guides/wwisermind-2027-full-caseload-plan.pdf';
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
  /** The page's own title and description, where the hub card's title ("Email Signature for
      Therapists") is not what the page should say in search results. Replaces the shared
      "{Title} | Free for Therapists | wwisermind" pattern and the short description. */
  seo?: { title: string; description: string };
  /** A download with no form: the page shows the download button and a link straight away. */
  direct?: { secondaryLabel: string; secondaryHref: Route };
  /** The page's H1 and the line under it, where they differ from `title` and `longDescription`. */
  heading?: string;
  sub?: string;
  /** An answer can end in one link; the FAQPage data carries the answer text alone. */
  faq: { title: string; body: string; link?: { label: string; href: string } }[];
};

const canvaNote =
  'You’ll need a free Canva account. Clicking the link creates your own copy, so you can edit freely.';

export const freebies: Freebie[] = [
  {
    slug: '2027-full-caseload-plan-for-therapists',
    title: '2027 Full-Caseload Plan',
    shortDescription:
      'A four-week, one-hour-a-week plan to turn quiet website visitors into booked consultations.',
    longDescription:
      'Turn website visitors into booked clients before January. A calm, four-week plan for therapists, counselors and psychologists.',
    typeLabel: 'PDF guide',
    type: 'download',
    gated: false,
    direct: { secondaryLabel: 'Or book a free 30-minute call', secondaryHref: routes.contactBook },
    status: 'live',
    assetUrl: FULL_CASELOAD_PLAN_PDF,
    assetLabel: 'Download the free guide (PDF)',
    relatedService: {
      text: 'Want us to put the plan to work on your website?',
      label: 'See pricing',
      href: routes.pricing.hub,
    },
    icon: 'clipboard',
    previewImage: {
      src: '/images/full-caseload-plan-cover.webp',
      width: 900,
      height: 1165,
      alt: 'Cover of The 2027 Full-Caseload Plan, a free four-week guide for therapists from wwisermind',
    },
    whatsInside: [
      'Why inquiries feel slower in 2026',
      'The leaks: where visitors drop off',
      'Talking about fees without scaring people off',
      'Make booking the easy part',
      'Get found on Google and AI tools',
      'Trust without testimonials, the ethical way',
      'Your four-week, pre-January plan',
    ],
    seo: {
      title: 'The 2027 Full-Caseload Plan for Therapists | wwisermind',
      description:
        'A free four-week plan to turn therapy website visitors into booked clients before January. Fees, booking, Google and AI visibility, and ethical trust building.',
    },
    heading: 'The 2027 Full-Caseload Plan',
    sub: 'Turn website visitors into booked clients before January. A calm, four-week plan for therapists, counselors and psychologists.',
    faq: [],
  },
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
    title: 'website scorecard',
    shortDescription:
      'We scan your website, ask a few questions only you can answer, and give you a score with your top five fixes.',
    longDescription:
      'We scan your website, ask a few questions only you can answer, and give you a score, five category scores and a short list of fixes in order of impact.',
    typeLabel: 'Free tool',
    type: 'tool',
    gated: false,
    /* Live: the page is its own tool (components/scorecard), not the shared freebie template. */
    status: 'live',
    assetUrl: '',
    assetLabel: 'Start the scorecard',
    relatedService: {
      text: 'Want a website that turns visitors into inquiries?',
      label: 'See One-Week Website pricing',
      href: routes.pricing.oneWeekWebsite,
    },
    icon: 'clipboard',
    previewImage: null,
    whatsInside: [],
    seo: {
      title: 'Free Website Scorecard for Therapists | wwisermind',
      description:
        'A free scan of your therapy website plus a short quiz. Get a score out of 100, five category scores and your top five fixes in about 3 minutes.',
    },
    faq: [],
  },
  {
    slug: 'good-faith-estimate',
    title: 'Good Faith Estimate generator',
    shortDescription:
      'Fill in a short form and download a Good Faith Estimate PDF for a self-pay client. Nothing about your client leaves your browser.',
    longDescription:
      'Make a Good Faith Estimate for a self-pay therapy client in a few minutes, on the layout of the CMS standard form.',
    typeLabel: 'Free tool',
    type: 'tool',
    gated: false,
    /* Live: the page is its own tool (components/gfe), not the shared freebie template. */
    status: 'live',
    assetUrl: '',
    assetLabel: 'Make an estimate',
    relatedService: {
      text: 'Want a website that turns visitors into inquiries?',
      label: 'See One-Week Website pricing',
      href: routes.pricing.oneWeekWebsite,
    },
    icon: 'clipboard',
    previewImage: null,
    whatsInside: [],
    seo: {
      title: 'Free Good Faith Estimate Generator for Therapists | wwisermind',
      description:
        'Make a Good Faith Estimate PDF for a self-pay therapy client in a few minutes. Free, follows the CMS form, and your client’s details never leave your browser.',
    },
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
      'Build a clean, professional email signature for your practice in two minutes. Free, no sign-up.',
    longDescription:
      'Fill in your details, pick a style, and copy it straight into your email. Free, no sign-up.',
    typeLabel: 'Signature generator',
    type: 'code',
    gated: false,
    status: 'live',
    assetUrl: '',
    assetLabel: 'Copy signature',
    relatedService: {
      text: 'Want ongoing help with your website?',
      label: 'See WordPress Care Plans pricing',
      href: routes.pricing.carePlans,
    },
    icon: 'mail',
    previewImage: null,
    /* The generator is the page, so there is no "What's inside" list beside it. */
    whatsInside: [],
    seo: {
      title: 'Free Email Signature Generator for Therapists | wwisermind',
      description:
        'Build a clean, professional email signature for your therapy practice in two minutes. Free, no sign-up. Works in Gmail, Outlook and Apple Mail.',
    },
    heading: 'Email Signature Generator for Therapists',
    sub: 'Fill in your details, pick a style, and copy it straight into your email. Free, no sign-up.',
    faq: [
      {
        title: 'Is it really free?',
        body: 'Yes. The generator is free, there is nothing to sign up for, and the signature you build is yours to use however you like. Everything you type stays in your browser, so we never see your details. If you would rather have someone else set it up, we’re happy to help.',
      },
      {
        title: 'Do I need to put my license number in my email signature?',
        body: 'Not always, but some licensing boards expect it on professional communications, so check the rules for your state or country. If yours does, add it in the license line. Where it is optional, a short line such as “Licensed in California” is a common middle ground. If you’re unsure, your board or professional association can tell you.',
      },
      {
        title: 'Should a therapist email signature have a confidentiality notice?',
        body: 'Many therapists add one, and it costs you nothing. A short notice tells anyone who receives a message by mistake what to do next. It does not replace secure ways of sharing anything sensitive, so use it alongside them. Your insurer or board may suggest their own wording, so check before you settle on yours.',
      },
      {
        title: 'Why add a crisis or emergency line?',
        body: 'Email is not watched around the clock, and someone in distress may write to you when you can’t reply. One line pointing to a crisis service means they see where to turn even if you’re not there. Choose the country that matches your clients, and check the number is right for your area.',
      },
      {
        title: 'Why doesn’t my photo show up?',
        body: 'Email apps only show images that live at a web address, so pasted or uploaded images are usually stripped out. Use an image that is already on your website and paste its full address into the image field. Some apps also hide images until the reader allows them, so a new recipient may see a blank space at first. If it still doesn’t appear, check that the address opens the image on its own in your browser.',
      },
      {
        title: 'Will it work on my phone?',
        body: 'Yes, for the people reading your emails. The signature is built from simple tables, which phone mail apps display well and shrink to fit a narrow screen. Setting it up is easier on a computer, because the Gmail, Outlook and Apple Mail phone apps keep their own signature settings, and these often take plain text only.',
      },
      {
        title: 'Can you set it up for me?',
        body: 'Yes. Tell us which email app you use and which style you like, and we’ll take it from there.',
        link: {
          label: 'Ask us to install it',
          href: routes.withQuery(routes.contact, { freebie: 'email-signature' }),
        },
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
  if (freebie.type === 'code') return 'Build yours';
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
  formTitle: 'Build your signature',
  privacy: 'Nothing you type is saved or sent anywhere. It all stays in your browser.',
  optional: 'optional',
  style: {
    legend: '1. Pick a style',
    options: [
      { id: 'classic', label: 'Classic', note: 'A clean text stack' },
      { id: 'photo', label: 'With photo', note: 'Image left, details right' },
      { id: 'card', label: 'Card', note: 'A soft tinted block' },
      { id: 'minimal', label: 'Minimal', note: 'Name, one line, one link' },
    ],
  },
  details: {
    legend: '2. Your details',
    name: 'Full name',
    credentials: 'Credentials',
    credentialsHint: 'e.g. LCSW, PhD',
    pronouns: 'Pronouns',
    title: 'Title',
    practice: 'Practice name',
    phone: 'Phone',
    website: 'Website',
    bookingUrl: 'Booking link',
    bookingLabel: 'Button label',
    license: 'License line',
    licenseHint: 'e.g. Licensed in California, LMFT #12345',
  },
  image: {
    legend: '3. Photo or logo',
    url: 'Image URL',
    help: 'Use an image already on your website. Uploaded or pasted images get stripped by most email apps.',
    unused: 'The Classic and Minimal styles have no image. Pick With photo or Card to add one.',
    shape: 'Image shape',
    round: 'Round headshot',
    square: 'Square logo',
  },
  colour: {
    legend: '4. Accent colour',
    custom: 'Custom colour',
    customHint: 'e.g. #146ef5',
    invalid: 'Enter a colour like #146ef5.',
    light: 'That colour is light and may be hard to read on a white background.',
  },
  notices: {
    legend: '5. Notices',
    confidentiality: 'Confidentiality notice',
    confidentialityText: 'Notice text',
    health: 'Ask people not to share health details by email',
    emergency: 'Emergency line',
    country: 'Country',
    help: 'These are common additions, not legal advice. Check the wording against your board or insurer.',
  },
  preview: {
    title: 'Preview',
    needsImage: 'Add an image URL to show your photo or logo here.',
    empty: 'Fill in a few details to see your signature here.',
  },
  copySignature: 'Copy signature',
  copyCode: 'Copy HTML code',
  copied: 'Copied',
  copiedAnnouncement: 'Copied to your clipboard.',
  copyFailed: 'Your browser blocked copying. Select the preview, or open View code and copy from there.',
  viewCode: 'View code',
  stepsTitle: 'Set it up',
  outlookNote: 'Outlook can be fussy with formatting. If something looks off, we’re happy to help.',
  outlookHelpLabel: 'Ask us to install it',
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
      groups: [
        {
          label: 'New Outlook and Outlook on the web',
          steps: [
            'Click the gear for Settings, then Accounts, then Signatures.',
            'Click New signature and give it a name.',
            'Click Copy signature above, then paste it into the editor.',
            'Choose when to use it, then click Save.',
          ],
        },
        {
          label: 'Classic Outlook for desktop',
          steps: [
            'Open File, then Options, then Mail, then Signatures.',
            'Click New and give the signature a name.',
            'Click Copy signature above, then paste it into the editor.',
            'Click OK to save.',
          ],
        },
      ],
    },
    {
      id: 'apple-mail',
      label: 'Apple Mail',
      steps: [
        'Open Mail, then Settings, then Signatures.',
        'Pick your email account, then click the plus to add a signature.',
        'Click Copy signature above, then paste it into the box.',
        'Untick “Always match my default message font”, or Mail will drop the formatting.',
      ],
    },
  ] as {
    id: string;
    label: string;
    steps?: string[];
    groups?: { label: string; steps: string[] }[];
  }[],
  help: {
    title: 'Need help setting it up?',
    body: 'We’ll install it for you.',
    button: 'Ask us to install it',
    href: routes.withQuery(routes.contact, { freebie: 'email-signature' }),
  },
};

/** The short guide under the generator. */
export const signatureGuide = {
  eyebrow: 'Guide',
  title: 'What to include in a therapist email signature',
  intro:
    'A good signature does one job. It tells the reader who you are and how to reach you, without getting in the way of the message. Here is what most therapists find worth including.',
  items: [
    {
      title: 'Your name and credentials',
      body: 'Your full name and the letters after it, such as Dr. Maya Ellis, PsyD. Clients and colleagues should see at a glance who is writing and how you’re qualified.',
    },
    {
      title: 'License type and number',
      body: 'Some boards expect your license on professional communications, so check yours. If it isn’t required, a line such as “Licensed in California” can be enough.',
    },
    {
      title: 'One booking link',
      body: 'Choose the one next step you want a new client to take and link it once. Several links make the choice harder, so give people one clear way to book.',
    },
    {
      title: 'A confidentiality notice',
      body: 'A short line asking anyone who receives a message by mistake to tell you and delete it. It’s a courtesy, and it shows you take privacy seriously.',
    },
    {
      title: 'An emergency line',
      body: 'Email isn’t monitored around the clock. One line pointing to a crisis service means a person in distress still sees where to turn.',
    },
    {
      title: 'Keep it short',
      body: 'Skip quotes, long taglines and signatures made of a single image. Short signatures read well on a phone and still work when an email app blocks images.',
    },
  ],
};
