import type { ContactIconName } from '@/components/ui/icons';
import type { MapPlace } from '@/components/ui/WorldMap';
import { audienceHref } from '@/lib/audience-slugs';
import { freebiePath, freebies as freebieList } from '@/lib/freebies';
import { routes } from '@/lib/routes';
import { serviceHref } from '@/lib/service-slugs';
import { getTool } from '@/lib/tools';
import { freeToolGroups, freeToolLinks } from '@/lib/free-tools';
import { reviews, reviewsSummary } from '@/lib/reviews';

export type NavItem = {
  label: string;
  href: string;
  /** A small red pill above the label's top-right corner on the desktop nav, and beside it in the mobile menu. */
  badge?: string;
  /** The label is also a link to `href` while the item keeps its dropdown (Who We Help). */
  hubLink?: boolean;
};

export const siteConfig = {
  name: 'wwisermind',
  /* The origin the canonical URLs, sitemap and structured data point at. The site is live on
     the real domain, so this is the one address search engines should index. */
  url: 'https://wwisermind.com',
  bookingUrl: '#book',
  /* A real route now, not an on-page anchor — the header's "Contact Us" is the way in to
     /contact from every page. The booking anchor above stays an in-page target. */
  contactUrl: routes.contact,
  /** The booking anchor on the contact page, for a button on any other page: the anchor
      alone only resolves on /contact, where the calendar lives. */
  bookingPage: routes.contactBook,
  /** The four profiles, in the order they are shown. The footer, the contact page and the
      Organization schema all read this list. */
  social: [
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/srikaanth-wwisermind/' },
    { id: 'facebook', label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=61595638287227' },
    { id: 'instagram', label: 'Instagram', href: 'https://www.instagram.com/wwisermind/' },
    { id: 'x', label: 'X', href: 'https://x.com/wwisermind' },
  ] as const,
  twitterHandle: '@wwisermind',
  /** One number for the phone, the WhatsApp chat and the footer. Nothing else in the repo
      spells it out. */
  contact: {
    phoneDisplay: '+91-91754 14055',
    phoneTel: '+919175414055',
    /** Digits only: wa.me wants no plus sign and no dashes. */
    whatsapp: '919175414055',
    whatsappMessage: "Hi wwisermind, I'd like to know more about your services for my practice.",
  },
  /** The Cal.com event every booking button and the contact page's calendar open. */
  booking: {
    calLink: 'wwisermind/30min',
    namespace: '30min',
    origin: 'https://app.cal.com',
    durationLabel: '30 min free session',
    layout: 'month_view',
    useSlotsViewOnSmallScreen: 'true',
    hideEventTypeDetails: false,
    forwardQueryParams: true,
  },
};

/** An absolute URL for a site path, for canonicals, Open Graph and structured data. */
export const absUrl = (path: string) => `${siteConfig.url}${path}`;

export const announcement = {
  label: 'New',
  text: 'Black Friday offers on websites and SEO for therapists.',
  linkLabel: 'See offers',
  /* The pricing hub for now; point it at a dedicated offers page when there is one. */
  href: routes.pricing.hub,
};

export const mainNav: NavItem[] = [
  { label: 'Services', href: '#services' },
  { label: 'Who We Help', href: routes.hubs.whoWeHelp, hubLink: true },
  { label: 'Results', href: routes.results },
  { label: 'Pricing', href: routes.pricing.hub },
  { label: 'Free Tools', href: routes.freebies.hub, badge: 'NEW' },
  { label: 'About', href: routes.about },
];

/* ==========================================================================
   Mega menu panels.

   Keyed by the `mainNav` label they hang off, so the nav above stays a plain
   list of links and nothing here changes what it renders. Six of the seven
   items have a panel; only Results is an ordinary link.

   Every panel is the same shape — columns of links, one featured card, a strip
   along the bottom — so the header draws them all from one component.
   ========================================================================== */

export type MegaLink = NavItem & {
  /** the line under the label; absent on Pricing, which lists its packages plainly */
  desc?: string;
  /** a paragraph under the description — only Who We Help uses one */
  body?: string;
  badge?: string;
  /** The badge's colour: blue unless set. Blue is for "Soon"; orange and green are for the two notes above a title. */
  badgeTone?: 'orange' | 'green';
  /** Put the badge on its own line above the title instead of beside it. */
  badgeAbove?: boolean;
  /** Set apart from the links under it: a tinted row, used for the all-in-one plan. */
  featured?: boolean;
};

export type MegaColumn = {
  /** Makes the column's title a link, to its category hub. */
  titleHref?: string;
  /** the word before the slash in the column label, carried in the accent colour */
  lead?: string;
  title?: string;
  links: MegaLink[];
};

export type MegaPanel = {
  id: string;
  columns: MegaColumn[];
  feature: {
    eyebrow: string;
    lead?: string;
    body?: string;
    link?: NavItem;
    /** Optional, and only on three of the five panels — the other two read better plain. */
    image?: { src: string; width: number; height: number; alt: string; position?: string };
  };
  strip: { text: string; link?: NavItem };
  /** A link closing the mobile accordion, for a panel whose nav item no longer links anywhere on its
      own (the desktop dropdown has its strip link; the accordion shows only the columns). */
  mobileLink?: NavItem;
};

const caseloadPlan = freebieList.find((freebie) => freebie.slug === '2027-full-caseload-plan-for-therapists');

export const megaPanels: Record<string, MegaPanel> = {
  Services: {
    id: 'services',
    columns: [
      {
        lead: 'Build',
        title: 'Therapist Website Design',
        titleHref: routes.hubs.websiteDesign,
        links: [
          { label: 'One Week Website', href: serviceHref('one-week-website'), desc: 'Live in 7 days, done for you' },
          { label: 'Custom Website Design', href: serviceHref('custom-website-design'), desc: 'Built around your practice' },
          { label: 'Website Hosting', href: serviceHref('website-hosting'), desc: 'Fast, secure, managed' },
          { label: 'Website Care Plans', href: serviceHref('website-care-plans'), desc: 'Handled while you’re in session' },
        ],
      },
      {
        lead: 'Grow',
        title: 'Marketing',
        titleHref: routes.hubs.marketing,
        links: [
          { label: 'Local SEO', href: serviceHref('local-seo'), desc: 'Be found in your city' },
          { label: 'SEO Audit / Assessment', href: serviceHref('seo-audit'), desc: 'An honest read on your visibility' },
          { label: 'One Time SEO', href: serviceHref('one-time-seo'), desc: 'Fix the foundation once' },
          { label: 'Ongoing SEO / AEO / GEO', href: serviceHref('ongoing-seo'), desc: 'Keep climbing every month' },
          { label: 'Copywriting', href: serviceHref('copywriting'), desc: 'Words that sound like you' },
          { label: 'Meta Ads', href: serviceHref('meta-ads'), desc: 'Reach the right families' },
        ],
      },
      {
        lead: 'AI',
        title: 'AI Services',
        titleHref: routes.hubs.ai,
        links: [
          { label: 'AI Search Optimization', href: serviceHref('ai-search-optimization'), desc: 'Be the practice AI recommends' },
          { label: 'AI Website Design', href: serviceHref('ai-website-design'), desc: 'Modern build, human review' },
          { label: 'AI Chatbot', href: serviceHref('ai-chatbot'), desc: 'Answers at 11pm, bookings by 9' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Most Popular',
      lead: 'The One Week Website',
      body: 'Your practice online in seven days. Design, build, HIPAA-aware forms, and launch. All handled while you stay in session.',
      link: { label: 'See how it works', href: serviceHref('one-week-website') },
      image: {
        src: '/images/Timely-Therapy-Case-Studies-wwisermind.webp',
        width: 900,
        height: 900,
        alt: 'The Timely Therapy practice site',
      },
    },
    strip: {
      text: 'Not sure where to start? One free call, an honest plan.',
      link: { label: 'Book a free strategy call', href: '#book' },
    },
  },

  'Who We Help': {
    id: 'who-we-help',
    /* No column labels here: the brief gives none, and inventing them only repeated the
       title on the line below. These two columns are self-titled blocks instead. */
    columns: [
      {
        links: [
          {
            label: 'Group Practices',
            href: audienceHref('group-practices'),
            desc: 'Sites that sell the whole team',
            body: 'Every clinician gets a real profile, every location its own page, and referrers get one clear place to send people. Intake stays orderly as the team grows.',
          },
        ],
      },
      {
        links: [
          {
            label: 'Solo Practices',
            href: audienceHref('solo-practices'),
            desc: 'Your voice, your specialty',
            body: 'A site that carries your credibility while you’re in session. Your specialty stated plainly, your availability current, and enquiries that arrive ready to answer.',
          },
        ],
      },
    ],
    /* No `image`: the photograph this carried was retired with 01/02/03.webp. The panel
       renders text-only, the way the pricing one already does — Header checks for the key. */
    feature: {
      eyebrow: 'Our Promise',
      lead: 'Only therapists. Every project. No exceptions.',
    },
    strip: { text: 'Serving practices across the US, Australia, and Ireland, in your timezone.' },
    mobileLink: { label: 'See who we help', href: routes.hubs.whoWeHelp },
  },

  Pricing: {
    id: 'pricing',
    /* Only pricing pages are listed here, in three small groups. The services these packages
       are built on live in the Services panel, so nothing is repeated. */
    columns: [
      {
        lead: 'All-in-one',
        links: [
          { label: 'Hyper Growth Marketing', href: routes.pricing.hyperGrowth, desc: 'Website, SEO, ads and more, in one plan', badge: 'All-in-one', featured: true },
        ],
      },
      {
        lead: 'Websites',
        links: [
          { label: 'One-Week Website', href: routes.pricing.oneWeekWebsite },
          { label: 'Custom Website Design', href: routes.pricing.customWebsite },
          { label: 'WordPress Care Plans', href: routes.pricing.carePlans, desc: 'WordPress sites only' },
        ],
      },
      {
        lead: 'SEO',
        links: [
          { label: 'SEO Audit', href: routes.pricing.seoAudit },
          { label: 'One-Time SEO', href: routes.pricing.oneTimeSeo },
          { label: 'Ongoing SEO, AEO & GEO', href: routes.pricing.seo },
          { label: 'Local SEO Packages', href: routes.pricing.localSeo },
        ],
      },
    ],
    feature: {
      eyebrow: 'Fair & Flexible',
      lead: 'No long-term contracts.',
      body: 'Simple plans you can cancel anytime.',
      link: { label: 'Compare all packages', href: routes.pricing.hub },
    },
    strip: {
      text: 'Every price is on the page. No ‘speak to a coordinator.’',
      link: { label: 'See all pricing', href: routes.pricing.hub },
    },
  },

  About: {
    id: 'about',
    columns: [
      {
        lead: 'Studio',
        title: 'The People',
        links: [
          { label: 'About Us', href: routes.about, desc: 'The story behind wwisermind' },
          { label: 'Our Process', href: routes.process, desc: 'Three steps, no mystery' },
          { label: 'Reviews', href: routes.reviews, desc: 'What therapists say' },
          { label: 'Contact', href: routes.contact, desc: 'Questions, or a free 30-minute call' },
        ],
      },
      {
        lead: 'Learn',
        title: 'The Words',
        links: [
          { label: 'Blog', href: routes.blog, desc: 'Practical articles for practices' },
          { label: 'FAQ’s', href: routes.faq, desc: 'Answered before you ask' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Founder’s Note',
      body: 'My nephew’s therapy journey inspired all of this. We understand what families search for, and how to help them find you.',
      link: { label: 'Read the full story', href: routes.homeSection('our-story') },
      image: {
        src: '/images/srikaant.webp',
        width: 274,
        height: 275,
        alt: 'Srikaant H., founder of wwisermind, at his desk',
      },
    },
    strip: { text: 'Built in Pune, India. Honest about it from the first hello.' },
  },

  'Free Tools': {
    id: 'free-tools',
    /* One menu for every free thing, grouped the way the /freebies/ hub groups it. The groups,
       names and lines come from lib/free-tools.ts, which reads the tools' status: a hidden tool is
       not here. No item carries a badge; the only one is NEW on the top-level label. */
    columns: freeToolGroups.map((group) => ({
      lead: group.lead,
      title: group.title,
      links: freeToolLinks(group),
    })),
    feature: {
      eyebrow: 'Start Here',
      lead: caseloadPlan?.heading ?? '2027 Full-Caseload Plan',
      body: 'Turn website visitors into booked clients before January.',
      link: { label: 'Get the free guide', href: routes.freebies.fullCaseloadPlan },
      /* The guide's own cover, from its entry in lib/freebies.ts, shown from the top so the title
         stays in the frame of this landscape slot. */
      ...(caseloadPlan?.previewImage
        ? {
            image: {
              src: caseloadPlan.previewImage.src,
              width: caseloadPlan.previewImage.width,
              height: caseloadPlan.previewImage.height,
              alt: caseloadPlan.previewImage.alt,
              position: 'center top',
            },
          }
        : {}),
    },
    strip: {
      text: 'Everything here is free. No credit card, no strings.',
      link: { label: 'See everything free', href: routes.freebies.hub },
    },
    mobileLink: { label: 'See everything free', href: routes.freebies.hub },
  },
};

export const heroTop = {
  headingLineOne: 'Therapist websites and marketing',
  headingLineTwo: 'that quietly grow your practice.',
  intro: {
    label: 'Calm, credible websites and marketing for',
    audience: [
      { label: 'Solo Therapists', href: audienceHref('solo-practices') },
      { label: 'Group Practices.', href: audienceHref('group-practices') },
    ],
  },
  guide: {
    badge: 'Free Guide',
    title: 'The 2027 Full-Caseload Plan: Turn Website Visitors Into Booked Clients Before January',
    description:
      "Most therapy websites don't have a traffic problem. They have a booking problem. A 4-week plan to fix the leaks, explain your fees clearly, and get found on Google and AI before the new-year rush.",
    linkLabel: 'Get the Free Guide',
    href: routes.freebies.fullCaseloadPlan,
  },
};

const featuredReview = reviews.find((review) => review.featured) ?? reviews[0];

export const heroBanner = {
  /** Decorative background media. `poster` is the still shown while the video loads and
      the permanent fallback wherever none of `sources` can play (Safari before 17.4 has
      no WebM). To cover those, drop an mp4 in /public/videos and append it to `sources`. */
  background: {
    poster: '/images/hero-bg.webp',
    sources: [{ src: '/videos/hero-bg.webm', type: 'video/webm' }],
  },
  headingLines: [
    'My nephew’s autism therapy journey',
    'inspired {brand}. We understand what families',
    'search for and how to help them find you.',
  ],
  brandWord: 'wwisermind',
  brandHref: '#our-story',
  linkLabel: 'Read My Story',
  linkHref: '#our-story',
  /* The homepage card shows the featured review. The words, the name, the practice and the
     photo are read from lib/reviews.ts, so they cannot drift from the /reviews page. */
  testimonial: {
    rating: reviewsSummary.rating,
    quote: featuredReview.quote,
    author: {
      name: featuredReview.name,
      /** rendered by .authorRole, the card's existing subtitle style */
      role: featuredReview.practice,
      avatar: featuredReview.photo ?? '/images/matt-erdman.webp',
    },
  },
};

export const homeIntro = {
  headingLead: 'Be found by the right clients, look worthy of their trust, and stay booked — with calm,',
  headingRest:
    ' thoughtful websites and marketing built only for therapists and psychologists, by people who know why this work matters.',
  eyebrow: 'Recent Launches',
  viewAll: { label: 'View all projects', href: '#projects' },
  /* Two case studies, laid out as a plain two-column grid — there is no longer a slider for
     them to repeat into. */
  projects: [
    {
      name: 'Timely',
      href: '#timely',
      image: '/images/Timely-Therapy-Case-Studies-wwisermind.webp',
      stats: [
        { value: '31%', label: 'Conversion Rate Growth' },
        { value: '48%', label: 'Leads Submission' },
      ],
    },
    {
      name: 'Evolve',
      href: '#evolve',
      image: '/images/Evolve-Therapy-Yoga-Case-Studies.webp',
      stats: [
        { value: '81%', label: 'Patient Appointment' },
        { value: '134%', label: 'Website Visitors' },
      ],
    },
  ],
};

/** A card shows a looping clip or a still, never both — spelled as a union rather than two
    optional keys so the renderer is made to check, and a card carrying neither cannot compile. */
export type ProblemCard = {
  title: string;
  body: string;
} & (
  | { background: { poster: string; sources: { src: string; type: string }[] } }
  | { image: { src: string; alt: string } }
);

export const problems: {
  headingLead: string;
  headingRest: string;
  cards: ProblemCard[];
  slideRepeat: number;
} = {
  headingLead: 'The problems we hear from',
  headingRest: 'therapists every week',
  /** A card carries either a `background` or an `image`, never both. `background` follows the
      same shape as `heroBanner.background`: `poster` is the still shown while the video loads
      and the permanent fallback wherever none of `sources` can play (Safari before 17.4 has no
      WebM) — add an mp4 to `sources` to cover those. `image` is a plain still, and the card
      renders no video element at all, so nothing about the clip is fetched. */
  cards: [
    {
      title: 'I’m invisible on Google.',
      background: {
        poster: '/images/slider1.webp',
        sources: [
          {
            src: '/videos/Therapist-Invisible-on-Google-Solution-wwisermind.webm',
            type: 'video/webm',
          },
        ],
      },
      body:
        'Your website exists, but when someone searches "therapist in [your city]," it’s your competitors and Psychology Today who show up. Page two might as well be nowhere.',
    },
    {
      title: 'AI doesn’t know I exist.',
      /* A still rather than a clip. Cut to the card's frame already — 534x887 against the
         media box's 535/891 — so `cover` has all of about a pixel to trim. */
      image: {
        src: '/images/Not-exist-on-AI-Therapist-Solution.webp',
        alt: 'Woman searching for a therapist on her phone',
      },
      body:
        'When someone asks ChatGPT, Google AI or Perplexity to recommend a therapist nearby, it names other practices, or none at all. A whole new way clients search, and you’re not in the answer.',
    },
    {
      title: 'My website embarrasses me.',
      background: {
        poster: '/images/slider3.webp',
        sources: [
          {
            src: '/videos/My-website-embrasses-me-therapist-probelm-solution-wwisermind.webm',
            type: 'video/webm',
          },
        ],
      },
      body:
        'It was fine in 2019. Now it looks dated on phones, doesn’t reflect how you actually practice, and you avoid sending people to it.',
    },
    {
      title: 'My Psychology Today profile stopped working.',
      image: {
        src: '/images/My-Psychology-Today-profile-stopped-working-solutions-wwisermind.webp',
        alt: 'Therapist looking at an empty inquiry inbox',
      },
      body:
        'Referrals from directories have quietly dried up. Big platforms with ad budgets now crowd the listings, and your profile sits pages deep where nobody scrolls.',
    },
    {
      title: 'People visit my site, then vanish.',
      background: {
        poster: '/images/People-visit-my-site-then-vanish-poster.webp',
        sources: [
          {
            src: '/videos/People-visit-my-site-then-vanish-therapist-solutions-wwisermind.webm',
            type: 'video/webm',
          },
        ],
      },
      body:
        'Inquiries are rare, and half are the wrong fit when they come. Your site talks about credentials when visitors in distress just want to feel understood.',
    },
    {
      title: 'I trained to be a therapist, not a marketer.',
      image: {
        src: '/images/I-trained-to-be-a-therapist-not-a-marketer-Solution-wwisermind.webp',
        alt: 'Therapist with no time left for marketing between sessions',
      },
      body:
        'Posting, optimizing, promoting yourself, it all feels uncomfortable and there’s no time between sessions anyway. So marketing keeps sliding to next month.',
    },
  ],
  /** How many times the six cards repeat to fill the slider. It was 3 while there were only
      three cards and the track had nothing to slide through; six fill it on their own, and
      repeating them cost eighteen slides and nine autoplaying video elements. */
  slideRepeat: 1,
};

export const services = {
  label: "Services we've spent years perfecting",
  rows: [
    {
      title: 'Websites',
      href: '#websites',
      icon: '/images/icon_1.webp',
      iconOnFill: '/images/icon_1-on-fill.webp',
      iconWidth: 200,
      iconHeight: 152,
      body:
        'Calm, credible websites built only for therapists, designed to turn quiet visitors into booked consultations.',
      startWith: [
        { label: 'One week website', href: '#one-week-website' },
        { label: 'Custom website design', href: '#custom-website-design' },
      ],
    },
    {
      title: 'Marketing',
      href: '#marketing',
      icon: '/images/icon_2.webp',
      iconOnFill: '/images/icon_2-on-fill.webp',
      iconWidth: 200,
      iconHeight: 153,
      body:
        'Show up when someone in your city searches for a therapist at 11pm, and keep showing up.',
      startWith: [
        { label: 'Local SEO', href: '#local-seo' },
        { label: 'Ongoing SEO services', href: '#ongoing-seo' },
      ],
    },
    {
      title: 'AI Services',
      href: '#ai-services',
      icon: '/images/icon_3.webp',
      iconOnFill: '/images/icon_3-on-fill.webp',
      iconWidth: 200,
      iconHeight: 126,
      body:
        'Be the practice AI recommends when clients ask ChatGPT / Gemini / Perplexity for a therapist.',
      startWith: [
        { label: 'AI search optimization', href: '#ai-search-optimization' },
        { label: 'AI chatbot', href: '#ai-chatbot' },
      ],
    },
  ],
  startWithLabel: 'Start with:',
};

export const practice = {
  headingLead: 'Built around how you practice —',
  headingRest: "whether that's just you, or a whole team",
  /** The built stat widget's figure. Only Solo Practice draws it now — Group Practice has a
      `metricImage` and renders that instead — so this is effectively that row's metric. */
  metric: { label: 'AI Search Visibility', value: 87, unit: '%' },
  /** Same media shape as `heroBanner.background`, plus `alt`: unlike the decorative hero and
      problem-card media, these two carry a description the old `imageAlt` supplied, so it is
      kept on the video. `poster` is the still shown while the video loads and the permanent
      fallback wherever none of `sources` can play (Safari before 17.4 has no WebM). */
  rows: [
    {
      title: 'Group Practice',
      body:
        'Your website has to sell the whole team: every clinician, every specialty, every location, and hold up to referral sources and insurance-savvy clients checking you out. We build sites that grow with your roster and marketing that fills every calendar, not just the founder’s.',
      link: { label: 'Built for group practices', href: audienceHref('group-practices') },
      /** Present only on this row, and where it is present it stands in for the whole built
          widget — the graph is the image, the figure over it is real text. Solo Practice has
          no `metricImage` and keeps the built one, which is why `metric` above still exists.
          The file's back-card peek and rounded corners are baked in, on real transparency, so
          it drops straight onto the gradient panel. */
      metricImage: {
        src: '/images/clinician-calendars-filled-group-practice-wwisermind.webp',
        /* The graph only. The figure that used to be baked into it is set as real text over
           the top, which is what `label`, `value` and `unit` below are for — so the number
           can count up, and so it stays selectable, translatable and legible at any zoom. */
        alt: '',
        width: 1600,
        height: 652,
        label: 'Clinician Calendars Filled',
        value: 159,
        unit: '%',
      },
      background: {
        poster: '/images/grouppractice.webp',
        sources: [
          {
            src: '/videos/Therapist-Group-Practice-Website-Marketing-Solution-wwisermind.webm',
            type: 'video/webm',
          },
        ],
        alt: 'A group practice team together outside their office',
      },
      photoFirst: false,
    },
    {
      title: 'Solo Practice',
      body:
        'You are the practice, so your website has to carry your voice, your specialty, and your credibility, and bring in clients without you becoming a marketer on the side. We build sites and marketing that work quietly while you’re in session.',
      link: { label: 'Built for solo practitioners', href: audienceHref('solo-practices') },
      /* No `metricImage`: this row draws the built widget below, which is what it carried
         before and what it has gone back to. */
      background: {
        poster: '/images/solopractice.webp',
        sources: [
          {
            src: '/videos/Individual-Therapist-Practice-Website-SEO-Marketing-Solution-wwisermind.webm',
            type: 'video/webm',
          },
        ],
        alt: 'A solo practitioner holding a tablet in her office',
      },
      photoFirst: true,
    },
  ],
};

export const processSection = {
  badge: 'Our process',
  headingLead:
    "No mystery, no chasing, no tech headaches. One free call, an honest plan, and a clear timeline you'll know before anything starts —",
  headingRest:
    ' while you stay in session, we handle the build, the SEO, and everything after launch, with a clear update at every step.',
  cta: { label: 'Book your free strategy session', href: '#book' },
  steps: [
    {
      title: 'Step 1 — Strategy call',
      body:
        "One free 30-minute video call, in your timezone. We look at your current website and visibility together, and you get an honest read on what's worth fixing and what isn't. You'll leave with a clear plan and a real timeline, whether you hire us or not. And if we're not the right fit, I'll say so.",
    },
    {
      title: 'Step 2 — Design & build',
      body:
        'You approve the plan before anything starts, and review the design before anything goes live. We handle everything in between: the design, the build, the HIPAA-aware forms, the SEO foundation, the mobile experience. Your total time investment is a couple of reviews, not a second job.',
    },
    {
      title: 'Step 3 — Launch & grow',
      body:
        "Your site goes live on schedule, and that's the beginning, not the end. Care plans keep it fast, secure, and updated. SEO and content keep you climbing. And every month you get a growth report: what happened, what it means, what's next.",
    },
  ],
  /** Same media shape as `heroBanner.background`, plus `alt` — as in `practice.rows`, this
      one carries a real description rather than being decorative, so it is kept on the video.
      `poster` is the still shown while the video loads and the permanent fallback wherever
      none of `sources` can play (Safari before 17.4 has no WebM). */
  launchBackground: {
    poster: '/images/launch-and-grow.webp',
    sources: [
      {
        src: '/videos/wwisermind-easy-process-therapist-business-growth.webm',
        type: 'video/webm',
      },
    ],
    alt: 'A therapist sitting in her practice with a notebook',
  },
};

export const whyUs = {
  label: 'Why practices choose us',
  /** The block's backdrop. `poster` is a frame pulled from the clip itself, so it is what
      shows before the video loads, wherever it cannot play, and under reduced motion — three
      cases that all want the same still. The colour behind both is the clip's own mean, so a
      gap on either side of the load is a shade of the video rather than a hole. */
  background: {
    poster: '/images/why-practices-choose-poster.webp',
    color: '#373494',
    sources: [
      {
        src: '/videos/Why-practices-choose-wwisermind-for-growth.webm',
        type: 'video/webm',
      },
    ],
  },
  rows: [
    {
      number: '01',
      title: 'Built in India. Honest about it from the first hello.',
      image: '/images/wwisermind-built-in-India-for-world-therapists.webp',
      imageAlt: 'Three colleagues in business dress outside an office, giving a thumbs up',
      /* The frame is wider than the source, so cover trims 10.6% off the height. Held above
         centre to keep the full headroom above all three faces. */
      imagePosition: 'center 30%',
      body:
        "We build from Pune, India and say so upfront, because it works in your favor: revisions happen while you sleep, meetings happen on video in your timezone, and you get agency-grade work at a price a practice can justify. We'd rather be judged on the work.",
    },
    {
      number: '02',
      title: 'Only Therapists. Every project. No exceptions.',
      image: '/images/wwisermind-built-for-mental-therapist-only.webp',
      imageAlt: 'A therapist in a mustard blazer listening to a client across from her',
      imagePosition: 'center 40%',
      body:
        'We only work with therapists and psychologists. No dentists, no law firms, no restaurants. So you never explain your world to your own marketing team, and everything we build fits how a practice actually runs.',
    },
    {
      number: '03',
      title: 'Built for how clients search next.',
      image: '/images/Built-for-clients-how-searches-next.webp',
      imageAlt: 'A woman looking at her phone at a cafe table',
      imagePosition: 'center 40%',
      body:
        'Most therapist websites are built for how people searched in 2019. Yours will be ready for Google, Maps, and the AI tools clients already ask for recommendations, because AI visibility is in our foundations, not an upsell.',
    },
  ],
};

export const founder = {
  portrait: {
    src: '/images/Srikaanth-Founder-wwisermind.webp',
    alt: 'Srikaant H., founder of wwisermind, at his desk in a book-lined office',
    /* Square source in a square frame, so cover crops nothing — the position is here to hold
       the face if a future portrait is not square. */
    position: 'center 30%',
  },
  /* One sentence, not two halves: the grey second half is gone, because the reveal carries
     that contrast itself now and a fixed colour would sit on top of it. */
  quote:
    "I started wwisermind after watching my own family search for the right therapist and struggle to find one — not because good therapists weren't out there, but because they were invisible online. Nine years of building websites for healthcare practices taught me how to fix that. This company exists to make sure the people who need you can actually find you.",
  attribution: 'Srikaant H. · Founder, wwisermind',
};

export const freebies = {
  badge: 'Freebies',
  headingLead: 'Free resources, no strings —',
  headingRest: " take what's useful, whether we ever work together.",
  /** Same media shape as `heroBanner.background`, plus `alt` — like `practice.rows`, this one
      carries a real description rather than being decorative, so it is kept on the video.
      `poster` is the still shown while the video loads and the permanent fallback wherever
      none of `sources` can play (Safari before 17.4 has no WebM). */
  background: {
    poster: '/images/freebies.webp',
    sources: [
      {
        src: '/videos/freebies-growth-solutions-therapist-wwisermind.webm',
        type: 'video/webm',
      },
    ],
    alt: 'A therapist smiling with her eyes closed',
  },
  items: [
    {
      title: 'The 2027 Full-Caseload Plan',
      body: 'A four-week, one-hour-a-week plan to turn quiet website visitors into booked consultations.',
      href: routes.freebies.fullCaseloadPlan,
    },
    {
      title: '30 Days of Social Content for Therapists',
      body:
        'A month of ready-to-post templates that keep your practice visible without turning you into a content creator.',
    },
    {
      title: 'Free Website Review',
      body:
        "Send us your current website and get a detailed report: what's working, what's costing you clients, and what to fix first. No pitch, just the honest read.",
    },
  ],
};

export const getFound = {
  background: '/images/wwisermind-directory-citation-services-therapist.webp',
  heading: 'Get found where your ideal clients are searching',
  body:
    'We optimize your presence across the search engines, directories, and AI tools your clients actually use',
  /** Natural sizes scaled by the project's 0.793 design factor, then halved. The design frame
      is what balanced these against each other — a wordmark's own padding is why 159 and 238
      read as the same size — so they are halved as a set, which keeps that balance rather
      than re-deciding it. */
  featured: { src: '/images/psycology-today.webp', alt: 'Psychology Today', width: 119, height: 26 },
  logos: [
    { src: '/images/zencare.webp', alt: 'Zencare', width: 119, height: 26 },
    { src: '/images/gemini.webp', alt: 'Google Gemini', width: 80, height: 30 },
    { src: '/images/chatgpt.webp', alt: 'ChatGPT', width: 99, height: 29 },
    { src: '/images/perplexity.webp', alt: 'Perplexity', width: 99, height: 24 },
  ],
  link: { label: 'See Full Directory List', href: '#directories' },
};

const PLACEHOLDER_ANSWER =
  'Placeholder answer — real copy to come. It sits in the accordion so the open and closed states can be checked, and it wraps to a couple of lines the way a real answer will.';

export const faq = {
  /** Same media shape as `heroBanner.background`, plus `alt` — like `practice.rows`, this one
      carries a real description rather than being decorative, so it is kept on the video.
      `poster` is the still shown while the video loads and the permanent fallback wherever
      none of `sources` can play (Safari before 17.4 has no WebM). */
  background: {
    poster: '/images/faq.webp',
    sources: [
      {
        src: '/videos/Therapist-Frequently-Asked-Questions-wwisermind.webm',
        type: 'video/webm',
      },
    ],
    alt: 'A therapist talking during a session',
  },
  heading: 'F.A.Q',
  subheading: 'Straightforward answers, so you can move forward with confidence.',
  items: [
    { question: "You're based in India. How does that work for US and Australian therapists?", answer: PLACEHOLDER_ANSWER },
    { question: 'Have you worked with therapists before?', answer: PLACEHOLDER_ANSWER },
    { question: 'What makes wwisermind different from other agencies?', answer: PLACEHOLDER_ANSWER },
    { question: "I'm not tech-savvy. Will I need to manage anything?", answer: PLACEHOLDER_ANSWER },
    { question: 'Do you handle HIPAA compliance?', answer: PLACEHOLDER_ANSWER },
    { question: "Can I cancel if it's not working?", answer: PLACEHOLDER_ANSWER },
  ],
  /** Right-hand support block from the reference layout. */
  support: {
    text: 'Still have questions? Our team is here to help.',
    linkLabel: 'Email Us',
    href: 'mailto:admin@wwisermind.com',
  },
  link: { label: 'See all FAQs', href: routes.faq },
};

/** The floating contact bar, pinned to every page from the root layout. `icon` names one of
    the inline glyphs the component draws — the project carries no icon package and these are
    hand-drawn like the arrows and the calendar already in the footer. */
export const contactBar = {
  avatar: {
    src: '/images/Srikaanth-Founder-wwisermind.webp',
    alt: 'Srikaant H., founder of wwisermind',
  },
  items: [
    {
      id: 'book',
      icon: 'calendar' as const,
      href: '#book',
      label: 'Book a free call · 30 min',
      aria: 'Book a free call, 30 minutes',
    },
    {
      id: 'phone',
      icon: 'phone' as const,
      href: `tel:${siteConfig.contact.phoneTel}`,
      label: 'Call us',
      /** Shown after the label on screens wide enough that tel: links tend to do nothing. */
      labelWide: `: ${siteConfig.contact.phoneDisplay}`,
      aria: `Call wwisermind on ${siteConfig.contact.phoneDisplay}`,
    },
    {
      id: 'email',
      icon: 'envelope' as const,
      href: 'mailto:admin@wwisermind.com',
      label: 'Email us',
      aria: 'Email us',
    },
    {
      id: 'whatsapp',
      icon: 'whatsapp' as const,
      href: `https://wa.me/${siteConfig.contact.whatsapp}?text=${encodeURIComponent(siteConfig.contact.whatsappMessage)}`,
      external: true,
      label: 'WhatsApp us',
      aria: 'Chat with wwisermind on WhatsApp',
      accent: true,
    },
  ],
};

/** Pages that close on a call to action of their own, so the footer's is left out. The pricing
    hub and the individual freebie and tool pages end on no such section, so they keep it. */
export const footerCtaHiddenPaths: string[] = [
  routes.pricing.hyperGrowth,
  routes.pricing.oneWeekWebsite,
  routes.pricing.customWebsite,
  routes.pricing.carePlans,
  routes.pricing.seoAudit,
  routes.pricing.oneTimeSeo,
  routes.pricing.seo,
  routes.pricing.localSeo,
  routes.freebies.hub,
];

/** The crisis resources directory and every state page under it. A visitor there may be in distress,
    so the page leaves out the announcement bar, the footer's call to action, the floating contact bar
    and the closing colour band, and keeps the header and the footer's links. The help now widget page
    is for therapists, not for someone in crisis, so it keeps all of them. */
/** Every Therapy Index page ends on a call to action of its own, so the footer's is left out. */
export const isTherapyIndexPage = (pathname: string): boolean => /^\/therapyindex(\/|$)/.test(pathname);

/** The Therapy Index's own header and footer replace the site's on its pages and on the tool pages that carry its research
    branding. Every other page keeps the site's header, footer and floating contact bar. */
export const tiChromeToolPaths: string[] = ['/tools/ai-visibility-report'];
export const usesTiChrome = (pathname: string): boolean =>
  isTherapyIndexPage(pathname) || tiChromeToolPaths.includes(pathname.replace(/\/+$/, ''));

/** The Local Map Assessment landing page, and its start page, carry a header and footer of their own. */
export const isLocalMapAssessmentPage = (pathname: string): boolean => /^\/local-map-assessment(\/|$)/.test(pathname);

/** Pages whose own chrome replaces the site's header, footer and floating contact bar. */
export const usesOwnChrome = (pathname: string): boolean => usesTiChrome(pathname) || isLocalMapAssessmentPage(pathname);

export const isCrisisResourcesPage = (pathname: string): boolean => {
  const trim = (path: string) => path.replace(/\/+$/, '');
  const here = trim(pathname);
  const root = trim(routes.tools.crisisResources);
  const widget = trim(routes.tools.helpNowWidget);
  if (here === widget || here.startsWith(`${widget}/`)) return false;
  return here === root || here.startsWith(`${root}/`);
};

export const footerCta = {
  /** The backdrop is drawn in CSS now — see the concentric rings in Footer.module.css. */
  /** Three fixed lines, as in both reference frames. */
  headingLines: ['Ready to', 'move', 'faster?'],
  /** Three lines on desktop; the breaks collapse under 640px so it wraps to the column. */
  bodyLines: [
    'We are here to help you grow',
    'without stress. No runaround. Just',
    'experienced people ready to help.',
  ],
  /** Cursor-following circle on desktop, static pill on touch — same words, two forms. */
  badge: {
    lines: ['Work', 'with us'],
    pillLabel: 'Work with us',
    href: '#book',
  },
};

/* ==========================================================================
   Main footer — measured off design-references/wwiserfooter.png.

   The reference is a 1920px export of a 1560px design wrapper: its content band runs
   x44→1875 (1832px), which is an 8-column grid of 208px columns and 24px gutters —
   1560px once divided by the 1.1744 export scale (177px columns, 20.4px gutters).
   This site's wrapper is 1300px, so every position and gap below is that design × 0.833
   and the same 8-column grid survives as `repeat(8, 1fr)` + a 17px gap.
   ========================================================================== */
export const footerMain = {
  tagline: ['Be found. Be trusted.', 'Stay booked'],

  logo: {
    src: '/images/wwisermind-official-logo-footer.webp',
    width: 1389,
    height: 244,
    alt: siteConfig.name,
  },

  /** Three link columns, one per grid column. The reference is a 3 x 3 block; the third column
      carries a fourth link, Our Process. */
  navColumns: [
    [
      { label: 'Website Design', href: '#website-design' },
      { label: 'Online Marketing', href: '#marketing' },
      { label: 'AI Services', href: '#ai-services' },
      { label: 'FAQs', href: routes.faq },
    ],
    [
      { label: 'Who We Help', href: '#who-we-help' },
      { label: 'Results', href: routes.results },
      { label: 'Reviews', href: routes.reviews },
      { label: 'Pricing', href: routes.pricing.hub },
    ],
    [
      { label: 'About', href: routes.about },
      { label: 'Our Process', href: routes.process },
      { label: 'Blog', href: routes.blog },
      { label: 'Free Tools', href: routes.freebies.hub },
    ],
  ] as NavItem[][],

  cta: {
    label: 'Schedule a call',
    href: '#book',
    note: {
      lead: 'Websites and marketing that help families find the right therapist. Built with love in Pune, India at ',
      linkLabel: 'wwisermind',
      href: routes.home,
      tail: '.',
    },
  },

  /** The two halves of the footer's tabbed row. One list shows at a time and scrolls as a
      marquee, so these are read twice per render — see FooterTabs. */
  tabs: [
    {
      id: 'services',
      label: 'Services',
      items: [
        { label: 'One Week Website', href: serviceHref('one-week-website') },
        { label: 'Custom Website Design', href: serviceHref('custom-website-design') },
        { label: 'Website Care Plans', href: serviceHref('website-care-plans') },
        { label: 'Local SEO', href: serviceHref('local-seo') },
        { label: 'SEO Assessment', href: serviceHref('seo-audit') },
        { label: 'One Time SEO', href: serviceHref('one-time-seo') },
        { label: 'Ongoing SEO / AEO / GEO', href: serviceHref('ongoing-seo') },
        { label: 'Copywriting', href: serviceHref('copywriting') },
        { label: 'Meta Ads', href: serviceHref('meta-ads') },
      ],
    },
    {
      id: 'ai-tools',
      label: 'AI Tools',
      /* Two of these are services with pages; the report and the assessment are tools,
         and their anchors wait for the tool pages. */
      items: [
        { label: 'AI Search Optimization', href: serviceHref('ai-search-optimization') },
        { label: 'AI Chatbot', href: serviceHref('ai-chatbot') },
        ...(['local-map-assessment', 'crisis-resources', 'therapy-index'] as const).map((id) => ({
          label: getTool(id).name,
          href: getTool(id).route,
        })),
      ],
    },
  ],

  /** 3:2 thumbnail beside the contact block, as in the reference's left rail. Derived from
      wwisermind-footer.webp at 2x its 231px slot — the 1500px original is 1.9 MB, which is
      not something to ship for a thumbnail. Swap the file when the intended photo exists. */
  thumbnail: {
    src: '/images/footer-thumb.webp',
    width: 462,
    height: 308,
    alt: '',
  },

  contact: {
    headOffice: {
      label: 'Head office',
      lines: ['1st Floor, Indialand Global Tech Park,', 'Hinjawadi Rd, Phase 1, Pune, India'],
      link: {
        label: 'Direction on Google',
        href: 'https://maps.google.com/?q=Indialand+Global+Tech+Park+Hinjawadi+Pune',
      },
    },
    accepting: {
      label: 'Accepting projects from',
      value: 'USA  /  Australia  /  Ireland  /  Dubai',
    },
    email: { label: 'Email', value: 'admin@wwisermind.com', href: 'mailto:admin@wwisermind.com' },
    phone: {
      label: 'Phone',
      value: siteConfig.contact.phoneDisplay,
      href: `tel:${siteConfig.contact.phoneTel}`,
    },
    hours: { label: 'Office hours', value: 'Monday-Friday / 8:30AM - 5PM' },
  },

  /** The heart sits inline where the word "love" would be, so its alt text is that word and
      the sentence still reads straight through for anyone not seeing the icon. */
  love: {
    icon: '/icons/heart.webp',
    iconAlt: 'love',
    lead: 'Therapist websites and marketing. Created with ',
    tail: ' and gratitude in India, for the world, at wwisermind.',
  },

  /** Four live clocks, in the reference's city-over-region format. */
  clocks: [
    { city: 'India', region: 'Asia', timeZone: 'Asia/Kolkata' },
    { city: 'New York', region: 'N. America', timeZone: 'America/New_York' },
    { city: 'Ireland', region: 'Europe', timeZone: 'Europe/Dublin' },
    { city: 'Sydney', region: 'Oceania', timeZone: 'Australia/Sydney' },
  ],

  legal: {
    copyright: 'wwisermind © 2026.',
    rights: 'All rights reserved.',
    links: [
      { label: 'Privacy Policy', href: routes.privacyPolicy },
      { label: 'Terms & Conditions', href: routes.termsAndConditions },
      { label: 'Cookie Policy', href: routes.cookiePolicy },
      { label: 'Refer wwisermind', href: routes.refer },
      { label: 'Sitemap', href: routes.sitemap },
    ],
  },

  /** Full-bleed closing panel: the looping video, then the clipped word.

      No `poster` — there is no still of this footage in the repo, and the only footer
      photograph, wwisermind-footer.webp, is the bridge that belongs in the left rail above,
      not this frame. Until a real still is exported from the video, the panel shows the
      three-band gradient in Footer.module.css, which is that footage's own first frame
      averaged into sky / haze / hillside. */
  media: {
    headline: ['Artificial Intelligence', '+', 'Human Care'],
  },
};

/* ==========================================================================
   /contact.

   Two references. The hero follows helcim.com/industries/mental-health —
   eyebrow, headline, lead, one button, then a row of logos —
   and everything under it follows helcim.com/contact: the tab strip in the
   hero, the connect cards, a plain form.

   The hero runs a dark treatment (Controls.module.css, `.dark`) and the
   mosaic straddles its lower edge; everything from there down is white, bar
   the form on the light grey, and a hairline at the top of the cards and the
   calendar separates one white frame from the next. Nothing is a second
   system: the type is the homepage's, the cards are the homepage card shell,
   the buttons are the header pill recoloured, and the headings carry the
   same scroll reveal.
   ========================================================================== */
type ContactCard = {
  title: string;
  body: string;
  href: string;
  linkLabel: string;
  /** names an entry in `contactIcons` — a typo is a type error, not a blank tile */
  icon: ContactIconName;
  /** opens elsewhere, so it gets the external mark and a new tab */
  external?: boolean;
};

type ContactTab = { label: string; href: string; current?: boolean; external?: boolean };

export const contactPage = {
  meta: {
    title: 'Contact wwisermind — a free 30-minute call for your therapy practice',
    description:
      'Talk to wwisermind about your therapy practice’s website, SEO and AI visibility. One free 30-minute call in your timezone, an honest plan whether you hire us or not, and a reply to every message within one business day.',
  },

  /** The in-page targets every button, card and tab on this page points at. */
  anchors: {
    connect: 'connect',
    booking: 'book',
    form: 'contact-form',
  },

  /* The pill strip at the top of the hero. The first two stay on this page; the last two
     leave it. TODO: `Submit a Ticket` and `FAQs` are `#` until the real URLs exist — the
     ticket desk's address, and wherever the FAQ ends up living. */
  tabs: [
    { label: 'Contact Us', href: '#connect', current: true },
    { label: 'Book a Call', href: '#book' },
    { label: 'Submit a Ticket', href: '#', external: true },
    { label: 'FAQs', href: '#', external: true },
  ] satisfies ContactTab[],

  hero: {
    eyebrow: 'Contact wwisermind',
    heading: 'Let’s find out if we’re the right fit',
    lead: 'One free 30-minute call, in your timezone. We’ll look at your website and visibility together, and you’ll leave with an honest plan — whether you hire us or not.',
    primary: { label: 'Book a free call', href: '#book' },
    /** The hero's backdrop, in the shape the homepage's background media takes. The poster
        is the clip's first frame, pulled from the file itself, and is what shows before the
        video loads and for anyone who has asked for reduced motion. The section paints the
        flat navy underneath both, so nothing is ever empty. */
    background: {
      poster: '/images/contact-hero-poster.webp',
      sources: [
        {
          src: '/videos/wwisermind-blue-background-hero-banner-contact-us.mp4',
          type: 'video/mp4',
        },
      ],
    },
  },

  /* The mosaic under the hero's button, measured off design-references/contact-gallery-mosaic.png
     (1510x513): a 612-wide tile the full height, a 360-wide middle split 148 over 353, a
     518-wide right split 318 over 181, 13px gaps. Three photographs and two flat tiles.

     The tall and wide photographs were made for this page; the middle one is the founder's
     portrait. The tiles want: tall ≈ 6:5, mid 1:1, wide ≈ 8:5. */
  gallery: {
    photos: {
      /* Made for this page (public/images/contact/), 5:4 at 1400x1120. */
      tall: {
        src: '/images/contact/contact-first-call-therapist.webp',
        alt: 'A smiling therapist at her desk on a video call, a notebook and mug beside her laptop',
        position: '45% 35%',
      },
      mid: {
        src: founder.portrait.src,
        alt: founder.portrait.alt,
        position: founder.portrait.position,
      },
      /* Made for this page, 27:16 at 1400x830. */
      wide: {
        src: '/images/contact/contact-waiting-room-open-door.webp',
        alt: 'A calm therapy practice waiting room in morning light, the front door slightly open',
        position: 'center 55%',
      },
    },
    accent: 'Only therapists. Every project.',
    /* The review score the tile draws, read from lib/reviews.ts so it is the same figure
       as the homepage card and /reviews. `score` is out of `outOf`. */
    reviews: {
      source: reviewsSummary.source,
      score: reviewsSummary.rating,
      outOf: reviewsSummary.outOf,
      count: reviewsSummary.count,
    },
  },

  /* The homepage's directory and AI marks, not a second set — there are no client logos
     in the repo yet. Swap `items` for those when they exist and nothing else changes. */
  logos: {
    label: 'We get practices found on',
    items: [getFound.featured, ...getFound.logos],
  },

  connect: {
    heading: 'Choose how you’d like to connect',
    subheading: 'However you prefer to reach out, we’re ready.',
    cards: [
      {
        title: 'Book a free call',
        body: 'One free 30-minute video call, in your timezone. An honest read on what’s worth fixing.',
        href: '#book',
        linkLabel: 'Pick a time',
        icon: 'calendar',
      },
      {
        title: 'Send us a message',
        body: 'Fill out the form below and we’ll reply within one business day.',
        href: '#contact-form',
        linkLabel: 'Go to the form',
        icon: 'message',
      },
      {
        title: 'Email us directly',
        body: 'Prefer email? Skip the form entirely.',
        href: 'mailto:admin@wwisermind.com',
        linkLabel: 'admin@wwisermind.com',
        icon: 'mail',
      },
      {
        /* TODO: `href` is a placeholder until the ticket desk has an address. */
        title: 'Submit a ticket',
        body: 'For care plan clients. Send a request and track it through to done.',
        href: '#',
        linkLabel: 'Open a ticket',
        icon: 'ticket',
        external: true,
      },
    ] satisfies ContactCard[],
  },

  booking: {
    label: 'Pick a time',
  },

  form: {
    heading: 'Ask us a question',
    subheading:
      'Tell us what’s going on with your practice and we’ll come back with an honest answer.',
    requiredNote: 'Required',
    /* Four text fields, two selects, one message — in that order, which is also the tab
       order. The component pairs them off two to a row on desktop. */
    fields: [
      { id: 'contact-name', label: 'Name', type: 'text', autoComplete: 'name', required: true },
      { id: 'contact-email', label: 'Email', type: 'email', autoComplete: 'email', required: true },
      {
        id: 'contact-practice',
        label: 'Practice name',
        type: 'text',
        autoComplete: 'organization',
        required: true,
      },
      {
        id: 'contact-site',
        label: 'Practice website',
        hint: 'optional',
        type: 'url',
        autoComplete: 'url',
        required: false,
      },
    ],
    selects: [
      {
        id: 'contact-help',
        label: 'What do you need help with?',
        placeholder: 'Choose one',
        options: ['New website', 'SEO', 'AI visibility', 'Copywriting', 'Ads', 'Not sure yet'],
        required: true,
      },
      {
        id: 'contact-practice-type',
        label: 'Are you a solo or group practice?',
        placeholder: 'Choose one',
        options: ['Solo practice', 'Group practice'],
        required: true,
      },
    ],
    message: { id: 'contact-message', label: 'Your message', required: true },
    submit: 'Send message',
  },

  studio: {
    heading: 'Built in Pune. Working in your timezone.',
    body: 'We work from Pune, India, and we’re upfront about it because it works in your favour. Revisions happen while you sleep, meetings happen on video in your hours, and you get agency-grade work at a price a practice can justify.',
    /* The world map beside the copy. `id` names a country in lib/world-map.ts, so a typo
       is a type error rather than a blank patch of dots; `role` is what colours it. The
       time zones are the same four the clock strip reads. */
    map: {
      label:
        'A world map: we work from India, and our clients are in the United States, the United Kingdom and Australia.',
      legend: { from: 'Where we work from', clients: 'Where our clients are' },
      places: [
        { id: 'india', name: 'India', role: 'from', timeZone: 'Asia/Kolkata' },
        { id: 'us', name: 'United States', role: 'client', timeZone: 'America/New_York' },
        { id: 'uk', name: 'United Kingdom', role: 'client', timeZone: 'Europe/London' },
        { id: 'australia', name: 'Australia', role: 'client', timeZone: 'Australia/Sydney' },
      ] satisfies MapPlace[],
    },
    /* The footer's clock component, re-pointed at the four cities this page names. */
    clocks: [
      { city: 'Pune', region: 'India', timeZone: 'Asia/Kolkata' },
      { city: 'New York', region: 'N. America', timeZone: 'America/New_York' },
      { city: 'London', region: 'Europe', timeZone: 'Europe/London' },
      { city: 'Sydney', region: 'Oceania', timeZone: 'Australia/Sydney' },
    ],
  },
};

/* ==========================================================================
   /results — the work page.

   Structure from design-references/results-inspiration.png: one large stacked headline,
   then the projects. The projects themselves are the case studies in lib/services.ts,
   listed in `resultsProjects` there; nothing about them is repeated here.
   ========================================================================== */
export const resultsPage = {
  meta: {
    title: 'Recent work — therapist websites and marketing by wwisermind',
    description:
      'Recent websites and marketing projects wwisermind has delivered for therapists and psychologists, including Timely Therapy and Evolve Therapy & Yoga, with the work behind each one.',
  },
  /** Three designed lines, as the reference stacks them. Set in sentence case here and
      uppercased by the heading style, like every other display line on the site. */
  headlineLines: ['Recent —', 'Works from', '©2025-2027'],
};
