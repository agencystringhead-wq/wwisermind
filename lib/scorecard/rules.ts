import type { CategoryId, CheckId } from './types';

/* ==========================================================================
   website scorecard: every weight, threshold, question, tier and fix in one file.

   Tune the scorecard here. The scoring code (score.ts) and the scanner (checks.ts) read these
   values and hold no numbers of their own.

   How the score works
   - Every check (from the scan) and every scored question (from the quiz) is an "item" with a
     weight and a score from 0 to 1.
   - A category score is the weighted average of its items, 0 to 100. Items we could not check
     are left out, not counted as zero.
   - The overall score is the weighted average of the category scores (CATEGORY_WEIGHTS).
   - The fix list is the items scoring below FAIL_BELOW, ranked by how much each would move the
     overall score (item weight share within its category, times the category weight, times how
     far it fell short).

   Copy rules: no em dashes, no invented numbers, and never advice to ask clients for reviews or
   testimonials (it conflicts with APA, ACA and NASW guidance).
   ========================================================================== */

/** Bump when weights or wording change in a way that makes old reports not comparable. */
export const RULES_VERSION = 1;

/** An item scoring below this (0 to 1) counts as a gap and can appear in the fix list. */
export const FAIL_BELOW = 0.6;

/** A category needs at least this share of its weight actually checked or answered to get a score. Below it the
    category shows as "not checked", so a couple of easy checks (https, viewport) cannot stand in for a speed score. */
export const MIN_KNOWN_SHARE = 0.5;

/** Items that must have real data for their category to be scored at all. Speed needs the PageSpeed result: https
    and the viewport tag alone say nothing about how fast the site is. */
export const REQUIRED_FOR_SCORE: Partial<Record<CategoryId, string[]>> = {
  speed: ['psi_perf'],
};

/** How many fixes the report lists. */
export const MAX_FIXES = 5;

export const CATEGORIES: { id: CategoryId; label: string; weight: number; blurb: string }[] = [
  { id: 'speed', label: 'Speed and mobile', weight: 20, blurb: 'How your site loads and looks on a phone.' },
  { id: 'found', label: 'Getting found', weight: 25, blurb: 'How easy it is for Google and local searchers to find you.' },
  { id: 'booking', label: 'Booking path', weight: 25, blurb: 'How easily someone ready to reach out can do it.' },
  { id: 'trust', label: 'Trust and clarity', weight: 20, blurb: 'Whether a visitor can tell who you are, what it costs and if you have room.' },
  { id: 'growth', label: 'Growth habits', weight: 10, blurb: 'The routines that keep your site working for you over time.' },
];

/** Score cut-offs for the three result tiers. A tier applies from `min` up to the next one. */
export const TIERS = [
  {
    id: 'getting-started',
    name: 'getting started',
    min: 0,
    description:
      'A few of the basics are still to be put in place. That is common, and many of them are quick to fix. Start with the list below.',
  },
  {
    id: 'building-momentum',
    name: 'building momentum',
    min: 50,
    description:
      'Your site covers a good share of the basics. A few gaps are making it harder for the right people to find you and reach out.',
  },
  {
    id: 'well-set-up',
    name: 'well set up',
    min: 75,
    description:
      'The essentials are in good shape. What is left in the list below is polish, and none of it is urgent.',
  },
] as const;

/** Measured values turned into a 0 to 1 score. */
export const THRESHOLDS = {
  /** Lighthouse mobile performance (0 to 1) at or above this earns full marks; below it scales down. */
  psiPerfFullMarks: 0.9,
  /** Largest contentful paint in ms: full marks at or under `good`, zero at or over `poor`, linear between. */
  lcpGoodMs: 2500,
  lcpPoorMs: 4000,
  /** Cumulative layout shift: full marks at or under `good`, zero at or over `poor`. */
  clsGood: 0.1,
  clsPoor: 0.25,
  /** Share of images with alt text that counts as found. */
  altCoverageFound: 0.8,
  /** Title and description lengths (characters) below which we call them too thin to count. */
  titleMinChars: 10,
  metaDescMinChars: 50,
};

/** Rules for the scanner's time budget and politeness. */
export const SCAN_LIMITS = {
  budgetMs: 20000,
  perRequestMs: 8000,
  maxPagesExtra: 3,
  /* Page builders inline a lot of CSS (Divi and Squarespace homepages run past 400 KB), so the cap is generous. */
  maxBodyBytes: 1_200_000,
  /** Scans per IP per hour that hit a live site (a cached scan does not count). */
  perIpPerHour: 5,
  cacheHours: 24,
};

export type CheckRule = {
  id: CheckId;
  category: CategoryId;
  weight: number;
  label: string;
  /** What the report says for each status. Wording is "we couldn't find", never "you don't have". */
  found: string;
  notFound: string;
  /** Skip this check when the quiz answer for `question` is one of `values`. */
  skipWhen?: { question: string; values: string[] };
  fix: { why: string; what: string };
};

export const CHECKS: CheckRule[] = [
  /* --- speed and mobile --- */
  {
    id: 'psi_perf',
    category: 'speed',
    weight: 4,
    label: 'Mobile speed score',
    found: 'Your homepage scores well for speed on a phone.',
    notFound: 'Your homepage scores low for speed on a phone.',
    fix: {
      why: 'Most people looking for a therapist search on their phone, and a slow page can lose them before they read a word.',
      what: 'Compress large images, remove plugins or widgets you do not use, and ask your host or web person about caching.',
    },
  },
  {
    id: 'psi_lcp',
    category: 'speed',
    weight: 3,
    label: 'Time to show the main content',
    found: 'The main part of your homepage shows up quickly on a phone.',
    notFound: 'The main part of your homepage is slow to show up on a phone.',
    fix: {
      why: 'If your headline and top image take a while to appear, people tap back to the search results.',
      what: 'Resize the biggest image at the top of the page, save it as webp, and skip auto-playing video up there.',
    },
  },
  {
    id: 'psi_cls',
    category: 'speed',
    weight: 2,
    label: 'Layout stays still while loading',
    found: 'Your page holds still while it loads.',
    notFound: 'Parts of your page jump around while it loads.',
    fix: {
      why: 'When a page shifts as it loads, people mis-tap and lose their place, and that is worse on a small screen.',
      what: 'Set a width and height on images and leave space for banners and embedded forms.',
    },
  },
  {
    id: 'viewport',
    category: 'speed',
    weight: 3,
    label: 'Mobile viewport tag',
    found: 'We found the tag that makes your site fit a phone screen.',
    notFound: 'We couldn’t find the tag that makes your site fit a phone screen.',
    fix: {
      why: 'Without it, phones show a tiny desktop page that people have to pinch and zoom.',
      what: 'Add the viewport meta tag, or switch to a mobile-friendly theme or template.',
    },
  },
  {
    id: 'https',
    category: 'speed',
    weight: 3,
    label: 'Secure connection (https)',
    found: 'Your site loads over a secure connection.',
    notFound: 'We couldn’t confirm that your site loads over a secure connection.',
    fix: {
      why: 'Browsers warn visitors about sites that are not secure, and that warning hurts most on a site where people share something private.',
      what: 'Turn on the free SSL certificate in your hosting settings and send all http traffic to https.',
    },
  },

  /* --- getting found --- */
  {
    id: 'title',
    category: 'found',
    weight: 3,
    label: 'Page title',
    found: 'Your homepage has a page title.',
    notFound: 'We couldn’t find a clear page title on your homepage.',
    fix: {
      why: 'The page title is the blue link in Google results, and it is often the first thing a possible client reads about you.',
      what: 'Write a title with what you do and where, such as "Anxiety Therapy in Austin, TX | Your Practice Name".',
    },
  },
  {
    id: 'meta_desc',
    category: 'found',
    weight: 2,
    label: 'Meta description',
    found: 'Your homepage has a meta description.',
    notFound: 'We couldn’t find a meta description on your homepage.',
    fix: {
      why: 'This is the short blurb under your link in search results. A clear, warm one helps the right people click.',
      what: 'Write one or two sentences, under about 155 characters, on who you help and how.',
    },
  },
  {
    id: 'single_h1',
    category: 'found',
    weight: 2,
    label: 'One main headline (H1)',
    found: 'Your homepage has one main headline.',
    notFound: 'We couldn’t find exactly one main headline (H1) on your homepage.',
    fix: {
      why: 'The main headline tells visitors and Google what the page is about, and one clear headline keeps that simple.',
      what: 'Use one H1 on the homepage that says who you help and where.',
    },
  },
  {
    id: 'schema',
    category: 'found',
    weight: 3,
    label: 'Local business markup',
    found: 'We found local business markup (schema) on your site.',
    notFound: 'We couldn’t find local business markup (schema) on your site.',
    fix: {
      why: 'This markup helps Google understand your practice, your location and your services.',
      what: 'Add LocalBusiness or Psychologist structured data with your name, address, phone and hours. Most SEO plugins can do this.',
    },
  },
  {
    id: 'sitemap',
    category: 'found',
    weight: 2,
    label: 'Sitemap',
    found: 'We found a sitemap.xml.',
    notFound: 'We couldn’t find a sitemap.xml.',
    fix: {
      why: 'A sitemap gives search engines a list of your pages, so new pages get found sooner.',
      what: 'Turn on the sitemap in your SEO plugin or site builder, then submit it in Google Search Console.',
    },
  },
  {
    id: 'robots_ok',
    category: 'found',
    weight: 3,
    label: 'Search engines allowed in',
    found: 'Nothing we could see is blocking search engines.',
    notFound: 'Something we found may be blocking search engines from your site.',
    fix: {
      why: 'If a robots.txt rule or a noindex tag blocks search engines, your site can drop out of Google altogether.',
      what: 'Check robots.txt and your site’s "discourage search engines" setting, and remove any block you did not mean to add.',
    },
  },
  {
    id: 'img_alt',
    category: 'found',
    weight: 2,
    label: 'Image descriptions (alt text)',
    found: 'Most of your images have alt text.',
    notFound: 'We couldn’t find alt text on many of your images.',
    fix: {
      why: 'Alt text lets screen readers describe your images, and it gives search engines context too.',
      what: 'Add a short description to each meaningful image. Decorative images can keep empty alt text.',
    },
  },

  /* --- booking path --- */
  {
    id: 'booking_cta',
    category: 'booking',
    weight: 5,
    label: 'Booking or consult button',
    found: 'We found a booking or consultation link on your homepage.',
    notFound: 'We couldn’t find a booking or consultation button on your homepage.',
    fix: {
      why: 'Someone ready to reach out should not have to hunt for how. A clear next step makes contacting you easier on a hard day.',
      what: 'Put one button, such as "Book a free consultation", in your header and near the top of your homepage, so it is the first thing a visitor sees.',
    },
  },
  {
    id: 'tel_link',
    category: 'booking',
    weight: 2,
    label: 'Tap-to-call phone number',
    found: 'We found a phone number people can tap to call.',
    notFound: 'We couldn’t find a phone number people can tap to call.',
    fix: {
      why: 'Many people reach out from their phone, and a tap-to-call number saves them typing it.',
      what: 'Make your phone number a tel: link so it dials when tapped.',
    },
  },
  {
    id: 'contact_page',
    category: 'booking',
    weight: 2,
    label: 'Contact page',
    found: 'We found a contact page.',
    notFound: 'We couldn’t find a contact page.',
    fix: {
      why: 'A contact page is where people look when they are ready to get in touch.',
      what: 'Add a contact page with a short form, your email or phone, and what happens after someone reaches out.',
    },
  },

  /* --- trust and clarity --- */
  {
    id: 'fees_info',
    category: 'trust',
    weight: 4,
    label: 'Fees or insurance information',
    found: 'We found information about fees or insurance.',
    notFound: 'We couldn’t find information about fees or insurance.',
    fix: {
      why: 'Cost is one of the first questions people have, and if they cannot find the answer, many will not ask.',
      what: 'Add a short page or section with your session fee, the insurance you accept or your out-of-network and superbill details, and any sliding scale.',
    },
  },
  {
    id: 'accepting',
    category: 'trust',
    weight: 2,
    label: 'Accepting new clients note',
    found: 'We found a note about whether you are taking new clients.',
    notFound: 'We couldn’t find a note about whether you are taking new clients.',
    fix: {
      why: 'People want to know early whether you have room for them.',
      what: 'Add a line near the top saying whether you are accepting new clients, and update it when that changes.',
    },
  },
  {
    id: 'telehealth',
    category: 'trust',
    weight: 2,
    label: 'Telehealth and states served',
    found: 'We found a telehealth mention along with the states you serve.',
    notFound: 'We couldn’t find a clear note on telehealth and the states you serve.',
    skipWhen: { question: 'office', values: ['in_person'] },
    fix: {
      why: 'If you see clients online, they need to know which states you are licensed in before they reach out.',
      what: 'Say that you offer telehealth and list the states where you are licensed to practice.',
    },
  },
  {
    id: 'bios_credentials',
    category: 'trust',
    weight: 4,
    label: 'Clinician bios with credentials',
    found: 'We found clinician credentials on your site.',
    notFound: 'We couldn’t find clinician credentials such as LCSW, LPC, LMFT or PsyD.',
    fix: {
      why: 'People want to know who they would be talking to, and listing your license shows you are qualified to practice.',
      what: 'Add a bio for each clinician with their license, their approach and a friendly photo.',
    },
  },
  {
    id: 'privacy_policy',
    category: 'trust',
    weight: 2,
    label: 'Privacy policy link',
    found: 'We found a link to a privacy policy.',
    notFound: 'We couldn’t find a link to a privacy policy.',
    fix: {
      why: 'A privacy policy tells people how you handle their information, which matters when they are sharing something personal.',
      what: 'Add a privacy policy page and link it in your footer. Check with a lawyer or your professional association about what to include.',
    },
  },
  {
    id: 'crisis_info',
    category: 'trust',
    weight: 2,
    label: 'Crisis information',
    found: 'We found crisis or emergency guidance.',
    notFound: 'We couldn’t find crisis or emergency guidance.',
    fix: {
      why: 'A short note on what to do in a crisis helps someone who reaches out between sessions or before they are a client.',
      what: 'Add a footer line with 988 and an instruction to call 911 or go to the nearest emergency room in an emergency.',
    },
  },
];

/* --------------------------------------------------------------------------
   The quiz. About 12 to 15 questions, one per screen, in this order.

   - `category` and `weight`: set when the answer is scored. Questions without them are context
     only: they shape the wording and the handoff but add nothing to the score.
   - Each option's `score` is 0 to 1.
   - `onlyIfPlatformUnknown`: skipped when the scan detected the platform.
   - `answersCheck`: asked only when the scan could not check that item, and the answer stands in
     for the check ("yes" is found, "no" is not found, "not sure" is left out of the score).
   -------------------------------------------------------------------------- */
export type QuizOption = { id: string; label: string; score?: number };

export type Question = {
  id: string;
  prompt: string;
  help?: string;
  category?: CategoryId;
  weight?: number;
  options: QuizOption[];
  onlyIfPlatformUnknown?: boolean;
  answersCheck?: CheckId;
  /** Short label used in the report and fix list for scored questions. */
  label?: string;
  fix?: { why: string; what: string };
  /** Text for the "what we checked" list, keyed by outcome. */
  reportText?: { good: string; gap: string };
};

const YES_NO_SURE: QuizOption[] = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
  { id: 'unsure', label: 'Not sure' },
];

export const QUESTIONS: Question[] = [
  {
    id: 'practice_type',
    prompt: 'What best describes your practice?',
    options: [
      { id: 'solo', label: 'Solo practice' },
      { id: 'small', label: 'Small group' },
      { id: 'large', label: 'Group with 5 or more clinicians' },
    ],
  },
  {
    id: 'office',
    prompt: 'How do you see clients?',
    options: [
      { id: 'in_person', label: 'In person' },
      { id: 'telehealth', label: 'Telehealth only' },
      { id: 'both', label: 'Both' },
    ],
  },
  {
    id: 'payment',
    prompt: 'How do clients usually pay?',
    options: [
      { id: 'private', label: 'Private pay' },
      { id: 'insurance', label: 'Insurance' },
      { id: 'mix', label: 'A mix of both' },
    ],
  },
  {
    id: 'inquiries',
    prompt: 'About how many new client inquiries do you get in a month?',
    help: 'A rough guess is fine.',
    options: [
      { id: '0_2', label: '0 to 2' },
      { id: '3_5', label: '3 to 5' },
      { id: '6_10', label: '6 to 10' },
      { id: '11_plus', label: '11 or more' },
      { id: 'unsure', label: 'Not sure' },
    ],
  },
  {
    id: 'source',
    prompt: 'Where do most of your new clients find you?',
    category: 'found',
    weight: 2,
    label: 'Knowing where clients come from',
    options: [
      { id: 'website', label: 'My website', score: 1 },
      { id: 'google', label: 'Google searches or Maps', score: 1 },
      { id: 'directories', label: 'Psychology Today or other directories', score: 0.7 },
      { id: 'referrals', label: 'Referrals', score: 0.7 },
      { id: 'unsure', label: 'Not sure', score: 0.2 },
    ],
    reportText: {
      good: 'You know where most new clients find you.',
      gap: 'You are not sure where new clients find you.',
    },
    fix: {
      why: 'When you do not know what brings people in, it is hard to know what is worth improving.',
      what: 'Ask each new inquiry how they found you, and write the answers down for a few months.',
    },
  },
  {
    id: 'reply_speed',
    prompt: 'How quickly do you usually reply to a new inquiry?',
    category: 'booking',
    weight: 5,
    label: 'Reply time to new inquiries',
    options: [
      { id: 'same_day', label: 'The same day', score: 1 },
      { id: 'one_two_days', label: 'Within one or two days', score: 0.7 },
      { id: 'three_plus', label: 'Three days or more', score: 0.25 },
      { id: 'no_habit', label: 'I have no set routine', score: 0.25 },
    ],
    reportText: {
      good: 'You reply to new inquiries within a day or two.',
      gap: 'Replies to new inquiries can take a while.',
    },
    fix: {
      why: 'People often contact several therapists at once, and a quick, kind reply helps you stand out.',
      what: 'Aim to reply within one business day, and set up an auto-reply that says when they will hear from you.',
    },
  },
  {
    id: 'gbp',
    prompt: 'Do you have a Google Business Profile?',
    help: 'This is the listing that shows on Google Maps.',
    category: 'found',
    weight: 4,
    label: 'Google Business Profile',
    options: [
      { id: 'complete', label: 'Yes, and it is filled in', score: 1 },
      { id: 'partial', label: 'Yes, but it is only partly filled in', score: 0.5 },
      { id: 'no', label: 'No', score: 0 },
      { id: 'unsure', label: 'Not sure', score: 0.1 },
    ],
    reportText: {
      good: 'You have a filled-in Google Business Profile.',
      gap: 'Your Google Business Profile is missing or incomplete.',
    },
    fix: {
      why: 'A complete profile is how you show up on Google Maps and in local searches such as "therapist near me".',
      what: 'Claim your profile, then add your address or service area, hours, services and a plain description of your practice.',
    },
  },
  {
    id: 'blog',
    prompt: 'Do you publish articles or blog posts on your site?',
    category: 'growth',
    weight: 3,
    label: 'Publishing helpful articles',
    options: [
      { id: 'monthly', label: 'Monthly or more', score: 1 },
      { id: 'quarterly', label: 'A few times a year', score: 0.7 },
      { id: 'yearly', label: 'Once a year or less', score: 0.4 },
      { id: 'none', label: 'No', score: 0 },
    ],
    reportText: {
      good: 'You publish articles on a regular schedule.',
      gap: 'You publish articles rarely or not at all.',
    },
    fix: {
      why: 'Helpful articles answer the questions people type into Google and show how you think.',
      what: 'Pick one question clients ask you often and write a short answer. A few posts a year is a fine start. Keep it general and never about real clients.',
    },
  },
  {
    id: 'analytics',
    prompt: 'Do you track visits to your website?',
    category: 'growth',
    weight: 3,
    label: 'Website analytics',
    options: [
      { id: 'regular', label: 'Yes, and I check it now and then', score: 1 },
      { id: 'never_look', label: 'Yes, but I never look', score: 0.35 },
      { id: 'no', label: 'No', score: 0 },
      { id: 'unsure', label: 'Not sure', score: 0.1 },
    ],
    reportText: {
      good: 'You track your website visits and look at them.',
      gap: 'You are not tracking, or not looking at, your website visits.',
    },
    fix: {
      why: 'Without numbers, you cannot tell whether your site is bringing people in.',
      what: 'Add a privacy-friendly analytics tool and check it once a month. Do not send names, emails or health details to it.',
    },
  },
  {
    id: 'updated',
    prompt: 'When was your site last meaningfully updated?',
    help: 'New pages, fees, photos or copy count. A plugin update does not.',
    category: 'growth',
    weight: 3,
    label: 'Keeping the site current',
    options: [
      { id: 'recent', label: 'In the last 6 months', score: 1 },
      { id: 'half_year', label: '6 to 12 months ago', score: 0.75 },
      { id: 'one_three', label: '1 to 3 years ago', score: 0.4 },
      { id: 'over_three', label: 'More than 3 years ago', score: 0.1 },
      { id: 'unsure', label: 'Not sure', score: 0.3 },
    ],
    reportText: {
      good: 'Your site was updated in the past year.',
      gap: 'Your site has not been updated in a while.',
    },
    fix: {
      why: 'A site that looks untouched for years can make people wonder whether you are still practicing.',
      what: 'Look over your fees, bio, photos and availability at least twice a year.',
    },
  },
  {
    id: 'manager',
    prompt: 'Who looks after your website?',
    category: 'growth',
    weight: 2,
    label: 'Someone owns the website',
    options: [
      { id: 'agency', label: 'A freelancer or agency', score: 1 },
      { id: 'team', label: 'Someone on my team', score: 0.9 },
      { id: 'me', label: 'Me', score: 0.8 },
      { id: 'nobody', label: 'Nobody, really', score: 0 },
    ],
    reportText: {
      good: 'Someone looks after your website.',
      gap: 'Nobody is looking after your website.',
    },
    fix: {
      why: 'When nobody owns the site, updates and fixes do not happen.',
      what: 'Pick one person responsible, even if it is you for an hour a month, and keep the logins somewhere safe.',
    },
  },
  {
    id: 'platform',
    prompt: 'What is your website built on?',
    onlyIfPlatformUnknown: true,
    options: [
      { id: 'wordpress', label: 'WordPress' },
      { id: 'wix', label: 'Wix' },
      { id: 'squarespace', label: 'Squarespace' },
      { id: 'other', label: 'Something else' },
      { id: 'unsure', label: 'Not sure' },
    ],
  },
  /* Asked only when the scan could not read these from the site, so a blocked site still gets a fair score. */
  {
    id: 'self_booking_cta',
    prompt: 'Does your homepage have a clear button to book or request a consultation?',
    answersCheck: 'booking_cta',
    options: YES_NO_SURE,
  },
  {
    id: 'self_fees_info',
    prompt: 'Can visitors find your fees or insurance details on your site?',
    answersCheck: 'fees_info',
    options: YES_NO_SURE,
  },
  {
    id: 'self_bios_credentials',
    prompt: 'Does your site show each clinician’s license or credentials?',
    answersCheck: 'bios_credentials',
    options: YES_NO_SURE,
  },
  {
    id: 'self_crisis_info',
    prompt: 'Does your site tell people what to do in a crisis, such as calling 988 or 911?',
    answersCheck: 'crisis_info',
    options: YES_NO_SURE,
  },
  {
    id: 'goal',
    prompt: 'What is your biggest goal for the next 6 months?',
    options: [
      { id: 'fill', label: 'Fill open spots on my caseload' },
      { id: 'rates', label: 'Raise my rates or go private pay' },
      { id: 'telehealth', label: 'Add or grow telehealth' },
      { id: 'hire', label: 'Add clinicians to my practice' },
      { id: 'unsure', label: 'Not sure yet' },
    ],
  },
];

/** Where the report points people who have a physical office. Hidden until the URL env var is set. */
export const LOCAL_MAP_FLAG_ENV = 'NEXT_PUBLIC_LOCAL_MAP_TOOL_URL';
