import type { ContactIconName } from '@/components/ui/icons';
import type { MapPlace } from '@/components/ui/WorldMap';
import { serviceHref } from '@/lib/service-slugs';

export type NavItem = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: 'Wisermind',
  /* TODO: confirm the production origin. It is only read for canonical URLs and the
     structured data on the service pages — nothing on the page itself. */
  url: 'https://wwisermind.com',
  bookingUrl: '#book-a-call',
  /* A real route now, not an on-page anchor — the header's "Contact Us" is the way in to
     /contact from every page. The booking anchor above stays an in-page target. */
  contactUrl: '/contact',
  /** The booking anchor on the contact page, for a button on any other page: the anchor
      alone only resolves on /contact, where the calendar lives. */
  bookingPage: '/contact#book-a-call',
};

export const announcement = {
  label: 'New',
  text: 'We are accepting new clients for month of September 26 .',
  linkLabel: 'Read',
  href: '#announcement',
};

export const mainNav: NavItem[] = [
  { label: 'Services', href: '#services' },
  { label: 'Results', href: '#results' },
  { label: 'Who We Help', href: '#who-we-help' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'About', href: '#about' },
  { label: 'Freebies', href: '#freebies' },
  { label: 'Tools', href: '#tools' },
];

/* ==========================================================================
   Mega menu panels.

   Keyed by the `mainNav` label they hang off, so the nav above stays a plain
   list of links and nothing here changes what it renders. Five of the seven
   items have a panel; Results and Freebies are ordinary links.

   Every panel is the same shape — columns of links, one featured card, a strip
   along the bottom — so the header draws them all from one component.
   ========================================================================== */

export type MegaLink = NavItem & {
  /** the line under the label; absent on Pricing, which lists its packages plainly */
  desc?: string;
  /** a paragraph under the description — only Who We Help uses one */
  body?: string;
  badge?: string;
};

export type MegaColumn = {
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
    image?: { src: string; width: number; height: number; alt: string };
  };
  strip: { text: string; link?: NavItem };
};

export const megaPanels: Record<string, MegaPanel> = {
  Services: {
    id: 'services',
    columns: [
      {
        lead: 'Build',
        title: 'Therapist Website Design',
        links: [
          { label: 'One Week Website', href: serviceHref('one-week-website'), desc: 'Live in 7 days, done for you' },
          { label: 'Custom Website Design', href: serviceHref('custom-website-design'), desc: 'Built around your practice' },
          { label: 'Website Hosting', href: serviceHref('website-hosting'), desc: 'Fast, secure, managed' },
          { label: 'Website Care Plans', href: serviceHref('website-care-plans'), desc: 'Handled while you’re in session' },
        ],
      },
      {
        lead: 'Grow',
        title: 'Online Marketing',
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
      body: 'Your practice online in seven days. Design, build, HIPAA-aware forms, and launch — all handled while you stay in session.',
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
      link: { label: 'Book a free strategy call', href: '#book-a-call' },
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
            href: '/#group-practices',
            desc: 'Sites that sell the whole team',
            body: 'Every clinician gets a real profile, every location its own page, and referrers get one clear place to send people. Intake stays orderly as the team grows.',
          },
        ],
      },
      {
        links: [
          {
            label: 'Solo Practices',
            href: '/#solo-practices',
            desc: 'Your voice, your specialty',
            body: 'A site that carries your credibility while you’re in session — your specialty stated plainly, your availability current, and enquiries that arrive ready to answer.',
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
    strip: { text: 'Serving practices across the US, UK, and Australia — in your timezone.' },
  },

  Pricing: {
    id: 'pricing',
    columns: [
      {
        lead: 'Build',
        title: 'Website Packages',
        /* TODO: the service pages carry no pricing frame any more, so these land on the
           page's top and the strip below promises a price the page does not show. Both
           want a pricing page, or the strip wants new words. */
        links: [
          { label: 'One Week Website', href: serviceHref('one-week-website') },
          { label: 'Custom Website Design', href: serviceHref('custom-website-design') },
          { label: 'Website Hosting', href: serviceHref('website-hosting') },
        ],
      },
      {
        lead: 'Grow',
        title: 'Marketing Packages',
        links: [
          { label: 'Local SEO', href: serviceHref('local-seo') },
          { label: 'SEO Audit', href: serviceHref('seo-audit') },
          { label: 'One Time SEO', href: serviceHref('one-time-seo') },
          { label: 'Ongoing SEO / AEO / GEO', href: serviceHref('ongoing-seo') },
        ],
      },
    ],
    feature: {
      eyebrow: 'Fair & Flexible',
      lead: 'No long-term contracts.',
      body: 'Simple plans you can cancel anytime.',
    },
    strip: { text: 'Every price is on the page. No ‘speak to a coordinator.’' },
  },

  About: {
    id: 'about',
    columns: [
      {
        lead: 'Studio',
        title: 'The People',
        links: [
          { label: 'About Us', href: '/#about', desc: 'The story behind wwisermind' },
          { label: 'Our Process', href: '/#process', desc: 'Three steps, no mystery' },
          { label: 'Reviews', href: '/#reviews', desc: 'What therapists say' },
        ],
      },
      {
        lead: 'Learn',
        title: 'The Words',
        links: [
          { label: 'Blog', href: '/#blog', desc: 'Plain-English articles' },
          { label: 'FAQ’s', href: '/#faq', desc: 'Answered before you ask' },
        ],
      },
    ],
    feature: {
      eyebrow: 'Founder’s Note',
      body: 'My nephew’s therapy journey inspired all of this. We understand what families search for — and how to help them find you.',
      link: { label: 'Read the full story', href: '/#our-story' },
      image: {
        src: '/images/srikaant.webp',
        width: 274,
        height: 275,
        alt: 'SrikaantH, founder of wwisermind, at his desk',
      },
    },
    strip: { text: 'Built in Pune, India. Honest about it from the first hello.' },
  },

  Tools: {
    id: 'tools',
    columns: [
      {
        lead: 'Check',
        title: 'Free Assessments',
        links: [
          { label: 'AI Visibility Report', href: '/#ai-visibility-report', desc: 'Does ChatGPT know you exist?', badge: 'NEW' },
          { label: 'Marketing Assessment', href: '/#marketing-assessment', desc: 'Where you stand today' },
          { label: 'Local Map Assessment', href: '/#local-map-assessment', desc: 'Your Google Maps presence' },
        ],
      },
      {
        lead: 'Open',
        title: 'Transparency',
        links: [{ label: 'OpenBook', href: '/#openbook', desc: 'A look inside the studio' }],
      },
    ],
    feature: {
      eyebrow: 'Try This First',
      lead: 'AI Visibility Report',
      body: 'Find out if ChatGPT, Gemini, and Perplexity recommend your practice — before your competitors do.',
    },
    strip: { text: 'All tools are free. No credit card, no strings.' },
  },
};

export const heroTop = {
  headingLineOne: 'Therapist websites and marketing',
  headingLineTwo: 'that quietly grow your practice.',
  intro: {
    label: 'Calm, credible websites and marketing for',
    audience: [
      { label: 'Solo Therapists', href: '#solo-therapists' },
      { label: 'Group Practices.', href: '#group-practices' },
    ],
  },
  guide: {
    badge: 'Free Guide',
    title: 'The AI Visibility Guide for Therapists',
    /** Set on its own line under the title — see .guideEdition. */
    titleEdition: '(2026 Edition)',
    description:
      'How to show up when clients ask ChatGPT and Google AI for a therapist near them. Plus the 12 AI tools that save practices 10+ hours a week, without becoming a "content creator."',
    linkLabel: 'Get the Free Guide',
    href: '#free-guide',
  },
};

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
  testimonial: {
    rating: 5,
    quote:
      'They just got it. I explained my practice once and they built something that sounds like me. Zero tech headaches on my end.',
    author: {
      name: 'Matt Erdman',
      /** rendered by .authorRole, the card's existing subtitle style */
      role: 'Timely Therapy',
      avatar: '/images/matt-erdman.webp',
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
      link: { label: 'Built for group practices', href: '#group-practices' },
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
      link: { label: 'Built for solo practitioners', href: '#solo-practitioners' },
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
    ' while you stay in session, we handle the build, the SEO, and everything after launch, with updates in plain English at every step.',
  cta: { label: 'Book your free strategy session', href: '#book-a-call' },
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
    alt: 'SrikaantH, founder of wwisermind, at his desk in a book-lined office',
    /* Square source in a square frame, so cover crops nothing — the position is here to hold
       the face if a future portrait is not square. */
    position: 'center 30%',
  },
  /* One sentence, not two halves: the grey second half is gone, because the reveal carries
     that contrast itself now and a fixed colour would sit on top of it. */
  quote:
    "I started wwisermind after watching my own family search for the right therapist and struggle to find one — not because good therapists weren't out there, but because they were invisible online. Nine years of building websites for healthcare practices taught me how to fix that. This company exists to make sure the people who need you can actually find you.",
  attribution: 'SrikaantH · Founder, wwisermind',
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
      title: 'The AI Visibility Guide for Therapists',
      note: ' (2026 Edition)',
      body:
        'Find out how to show up when clients ask ChatGPT, Gemini, or Google AI for a therapist near them, before your competitors do.',
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
  link: { label: 'See Full Directory List', href: '#faq' },
};

/** The floating contact bar, pinned to every page from the root layout. `icon` names one of
    the inline glyphs the component draws — the project carries no icon package and these are
    hand-drawn like the arrows and the calendar already in the footer. */
export const contactBar = {
  avatar: {
    src: '/images/Srikaanth-Founder-wwisermind.webp',
    alt: 'SrikaantH, founder of wwisermind',
  },
  items: [
    {
      id: 'book',
      icon: 'calendar' as const,
      /* TODO: awaiting the real number */
      href: '#book-a-call',
      label: 'Book a free call · 30 min',
      aria: 'Book a free call, 30 minutes',
    },
    { id: 'phone', icon: 'phone' as const, href: '#', label: 'Call us', aria: 'Call us' },
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
      href: '#',
      label: 'WhatsApp',
      aria: 'Message us on WhatsApp',
      accent: true,
    },
  ],
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
    href: '#book-a-call',
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

  /** Icon files already in /public/icons — square PNGs with alpha, drawn as flat marks. */
  social: [
    { label: 'Instagram', href: 'https://instagram.com/', icon: '/icons/instagram.png' },
    { label: 'LinkedIn', href: 'https://linkedin.com/', icon: '/icons/linkedin.png' },
    { label: 'X', href: 'https://x.com/', icon: '/icons/x.png' },
  ],

  /** Three link columns, one per grid column, matching the reference's 3 x 3 block. */
  navColumns: [
    [
      { label: 'Website Design', href: '#website-design' },
      { label: 'Online Marketing', href: '#marketing' },
      { label: 'AI Services', href: '#ai-services' },
    ],
    [
      { label: 'Who We Help', href: '#who-we-help' },
      { label: 'Results', href: '#results' },
      { label: 'Pricing', href: '#pricing' },
    ],
    [
      { label: 'About', href: '#about' },
      { label: 'Freebies', href: '#freebies' },
      { label: 'Tools', href: '#tools' },
    ],
  ] as NavItem[][],

  cta: {
    label: 'Schedule a call',
    href: '#book-a-call',
    note: {
      lead: 'Websites and marketing that help families find the right therapist. Built with love in Pune, India at ',
      linkLabel: 'wwisermind',
      href: '/',
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
        { label: 'AI Visibility Report', href: '/#ai-visibility-report' },
        { label: 'AI Search Optimization', href: serviceHref('ai-search-optimization') },
        { label: 'AI Chatbot', href: serviceHref('ai-chatbot') },
        { label: 'Local Map Assessment', href: '/#local-map-assessment' },
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
    hotline: { label: 'Hotline', value: '+91-91754 14055', href: 'tel:+919175414055' },
    hours: { label: 'Office hours', value: 'Monday-Friday / 8:30AM - 5PM' },
  },

  /** The heart sits inline where the word "love" would be, so its alt text is that word and
      the sentence still reads straight through for anyone not seeing the icon. */
  love: {
    icon: '/icons/heart.png',
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
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms & Conditions', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
      { label: 'Refer wwisermind', href: '#refer' },
      { label: 'Sitemap', href: '#sitemap' },
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
    booking: 'book-a-call',
    form: 'contact-form',
  },

  /* The pill strip at the top of the hero. The first two stay on this page; the last two
     leave it. TODO: `Submit a Ticket` and `FAQs` are `#` until the real URLs exist — the
     ticket desk's address, and wherever the FAQ ends up living. */
  tabs: [
    { label: 'Contact Us', href: '#connect', current: true },
    { label: 'Book a Call', href: '#book-a-call' },
    { label: 'Submit a Ticket', href: '#', external: true },
    { label: 'FAQs', href: '#', external: true },
  ] satisfies ContactTab[],

  hero: {
    eyebrow: 'Contact wwisermind',
    heading: 'Let’s find out if we’re the right fit',
    lead: 'One free 30-minute call, in your timezone. We’ll look at your website and visibility together, and you’ll leave with an honest plan — whether you hire us or not.',
    primary: { label: 'Book a free call', href: '#book-a-call' },
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

     The photographs are the homepage's own — no picture was shot for this. Two of them are
     cropped harder than they were made for (see `position`), so if purpose-shot images are
     supplied later, the tiles want: tall ≈ 6:5, mid 1:1, wide ≈ 8:5. */
  gallery: {
    photos: {
      tall: {
        src: '/images/wwisermind-built-for-mental-therapist-only.webp',
        alt: 'A therapist in a mustard blazer listening to a client across from her',
        /* 3:2 into a near-square frame: cover trims a fifth off each side, so the crop is
           held where the two faces are. */
        position: '58% 40%',
      },
      mid: {
        src: founder.portrait.src,
        alt: founder.portrait.alt,
        position: founder.portrait.position,
      },
      wide: {
        src: '/images/wwisermind-built-in-India-for-world-therapists.webp',
        alt: 'Three colleagues in business dress outside an office, giving a thumbs up',
        position: 'center 30%',
      },
    },
    accent: 'Only therapists. Every project.',
    /* TODO: there is no review data in the project yet. `score` is null on both entries, and
       the tile renders a dash and empty stars until real scores exist — nothing here is a
       number anyone made up. The two platform names are the likely ones, not confirmed. */
    reviews: {
      note: 'Review scores to come',
      outOf: 5,
      items: [
        { platform: 'Google', score: null },
        { platform: 'Psychology Today', score: null },
      ] as { platform: string; score: number | null }[],
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
        href: '#book-a-call',
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
    /** The frame is sized by ratio, so dropping a real embed in cannot change the page. */
    placeholder: {
      title: 'Booking calendar',
      note: 'Cal.com embed goes here',
    },
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
