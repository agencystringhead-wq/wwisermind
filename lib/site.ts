export type NavItem = {
  label: string;
  href: string;
};

export const siteConfig = {
  name: 'Wisermind',
  bookingUrl: '#book-a-call',
  contactUrl: '#contact',
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
    title: 'The AI Visibility Guide for Therapists (2026 Edition)',
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
      'Clear guidance and smart planning helped our team focus faster and deliver results with confidence.',
    author: {
      name: 'Chance Vetrovs',
      role: 'Project manager',
      avatar: '/images/testimonial-chance.webp',
    },
  },
};

export const homeIntro = {
  headingLead: 'Be found by the right clients, look worthy of their trust, and stay booked — with calm,',
  headingRest:
    ' thoughtful websites and marketing built only for therapists and psychologists, by people who know why this work matters.',
  eyebrow: 'Recent Launches',
  viewAll: { label: 'View all projects', href: '#projects' },
  projects: [
    {
      name: 'Mindora',
      href: '#mindora',
      image: '/images/mindora.webp',
      stats: [
        { value: '31%', label: 'Conversion Rate Growth' },
        { value: '48%', label: 'Leads Submission' },
      ],
    },
    {
      name: 'Healyra',
      href: '#healyra',
      image: '/images/healyra.webp',
      stats: [
        { value: '81%', label: 'Patient Appointment' },
        { value: '148%', label: 'Website Visitors' },
      ],
    },
  ],
  /** How many times the project list repeats to fill the slider for now. */
  slideRepeat: 4,
};

export const problems = {
  headingLead: 'The problems we hear from',
  headingRest: 'therapists every week',
  /** Each card's media follows the same shape as `heroBanner.background`: `poster` is the
      still shown while the video loads and the permanent fallback wherever none of `sources`
      can play (Safari before 17.4 has no WebM). Add an mp4 to `sources` to cover those. */
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
      background: {
        poster: '/images/slider2.webp',
        sources: [
          {
            src: '/videos/AI-visibility-issue-therapist-solution-by-wwisermind.webm',
            type: 'video/webm',
          },
        ],
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
  ],
  /** How many times the three cards repeat to fill the slider for now. */
  slideRepeat: 3,
};

export const services = {
  label: "Services we've spent years perfecting",
  rows: [
    {
      title: 'Websites',
      href: '#websites',
      icon: '/images/icon_1.webp',
      iconWidth: 200,
      iconHeight: 152,
      body:
        'Calm, credible websites built only for therapists, designed to turn quiet visitors into booked consultations.',
      startWith: [
        { label: 'One week website', href: '#one-week-website' },
        { label: 'Custom website design', href: '#custom-website-design' },
      ],
      seeAll: { label: 'See all website services', href: '#website-services' },
    },
    {
      title: 'Marketing',
      href: '#marketing',
      icon: '/images/icon_2.webp',
      iconWidth: 200,
      iconHeight: 153,
      body:
        'Show up when someone in your city searches for a therapist at 11pm, and keep showing up.',
      startWith: [
        { label: 'Local SEO', href: '#local-seo' },
        { label: 'Ongoing SEO services', href: '#ongoing-seo' },
      ],
      seeAll: { label: 'See all marketing services', href: '#marketing-services' },
    },
    {
      title: 'AI Services',
      href: '#ai-services',
      icon: '/images/icon_3.webp',
      iconWidth: 200,
      iconHeight: 126,
      body:
        'Be the practice AI recommends when clients ask ChatGPT / Gemini / Perplexity for a therapist.',
      startWith: [
        { label: 'AI search optimization', href: '#ai-search-optimization' },
        { label: 'AI chatbot', href: '#ai-chatbot' },
      ],
      seeAll: { label: 'See all AI services', href: '#all-ai-services' },
    },
  ],
  startWithLabel: 'Start with:',
};

export const practice = {
  headingLead: 'Built around how you practice —',
  headingRest: "whether that's just you, or a whole team",
  metric: { label: 'AI Search Visibility', value: '159', unit: '%' },
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
  background: '/images/why-choose-us.webp',
  rows: [
    {
      number: '01',
      title: 'Built in India. Honest about it from the first hello.',
      image: '/images/01.webp',
      imageAlt: 'The Wisermind team working together at a desk',
      body:
        "We build from Pune, India and say so upfront, because it works in your favor: revisions happen while you sleep, meetings happen on video in your timezone, and you get agency-grade work at a price a practice can justify. We'd rather be judged on the work.",
    },
    {
      number: '02',
      title: 'Only Therapists. Every project. No exceptions.',
      image: '/images/02.webp',
      imageAlt: 'A therapist sitting on a couch in her practice',
      body:
        'We only work with therapists and psychologists. No dentists, no law firms, no restaurants. So you never explain your world to your own marketing team, and everything we build fits how a practice actually runs.',
    },
    {
      number: '03',
      title: 'Built for how clients search next.',
      image: '/images/03.webp',
      imageAlt: 'A therapist with a laptop in a warmly lit room',
      body:
        'Most therapist websites are built for how people searched in 2019. Yours will be ready for Google, Maps, and the AI tools clients already ask for recommendations, because AI visibility is in our foundations, not an upsell.',
    },
  ],
};

export const founder = {
  portrait: { src: '/images/srikaant.webp', alt: 'SrikaantH, founder of wwisermind, at his desk' },
  quoteLead:
    'I started wwisermind after watching my own family search for the right therapist and struggle to find one —',
  quoteRest:
    " not because good therapists weren't out there, but because they were invisible online. Nine years of building websites for healthcare practices taught me how to fix that. This company exists to make sure the people who need you can actually find you.",
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
  background: '/images/found-bg.webp',
  heading: 'Get found where your ideal clients are searching',
  body:
    'We optimize your presence across the search engines, directories, and AI tools your clients actually use',
  /** Natural sizes scaled by the project's 0.793 design factor. */
  featured: { src: '/images/psycology-today.webp', alt: 'Psychology Today', width: 238, height: 52 },
  logos: [
    { src: '/images/zencare.webp', alt: 'Zencare', width: 238, height: 51 },
    { src: '/images/gemini.webp', alt: 'Google Gemini', width: 159, height: 59 },
    { src: '/images/chatgpt.webp', alt: 'ChatGPT', width: 198, height: 58 },
    { src: '/images/perplexity.webp', alt: 'Perplexity', width: 198, height: 48 },
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

export const footerCta = {
  /** Decorative backdrop, same media shape as `heroBanner.background`: `poster` is the still
      shown while the video loads and the permanent fallback wherever none of `sources` can
      play (Safari before 17.4 has no WebM). Add an mp4 to `sources` to cover those. */
  background: {
    poster: '/images/cta-bg.webp',
    sources: [{ src: '/videos/Get-started-with-wwsiermind.webm', type: 'video/webm' }],
  },
  heading: 'Ready when you are.',
  bodyLead: 'One free call. No pitch deck, no pressure.',
  bodyRest:
    "You'll leave with an honest read on your online presence, whether you hire us or not.",
  actions: [
    { label: 'Book A Free Strategy Call', href: '#book-a-call', whatsapp: false },
    { label: 'Say us Hi', href: 'https://wa.me/', whatsapp: true },
  ],
};

export type FooterGroup = {
  title?: string;
  title2?: string;
  links?: NavItem[];
  lines?: string[];
  uppercaseLinks?: boolean;
};

export const footerMain = {
  headline: ['Be found. Be trusted.', 'Stay booked.'],
  contactLabel: 'New Business',
  email: 'admin@wwisermind.com',
  copyright: {
    lead: '© Copyright ',
    brand: 'wwisermind',
    tail: ' powered by Stringhead Technologies',
  },
  /** Three rows of three columns, laid out row by row beside the brand column. */
  rows: [
    [
      {
        title: 'Therapist website design',
        links: [
          { label: 'One Week Website', href: '#one-week-website' },
          { label: 'Custom Website Design', href: '#custom-website-design' },
          { label: 'Website Hosting Services', href: '#hosting' },
          { label: 'Website Care Plans', href: '#care-plans' },
        ],
      },
      {
        title: 'Online marketing',
        links: [
          { label: 'Local SEO', href: '#local-seo' },
          { label: 'SEO Audit/ Assessment', href: '#seo-audit' },
          { label: 'One Time SEO', href: '#one-time-seo' },
          { label: 'Ongoing SEO/AEO/GEO', href: '#ongoing-seo' },
          { label: 'Copywriting', href: '#copywriting' },
          { label: 'Meta Ads', href: '#meta-ads' },
        ],
      },
      {
        title: 'AI services',
        links: [
          { label: 'AI Chatbot', href: '#ai-chatbot' },
          { label: 'AI Search Optimization', href: '#ai-search-optimization' },
        ],
      },
    ],
    [
      {
        title: 'Results',
        title2: 'Who we help',
        links: [
          { label: 'Group Practices', href: '#group-practices' },
          { label: 'Solo Practices', href: '#solo-practices' },
        ],
      },
      {
        title: 'About',
        links: [
          { label: 'About Us', href: '#about' },
          { label: 'Our Process', href: '#process' },
          { label: 'Blog', href: '#blog' },
          { label: 'Reviews', href: '#reviews' },
          { label: "FAQ's", href: '#faq' },
        ],
      },
      {
        title: 'Freebies',
        title2: 'Tools',
        links: [
          { label: 'AI Visibility Report', href: '#ai-visibility-report' },
          { label: 'Marketing Assessment', href: '#marketing-assessment' },
          { label: 'Local Map Assessment', href: '#local-map-assessment' },
        ],
      },
    ],
    [
      {
        title: 'Address:',
        lines: [
          '1st Floor, C6, Indialand Global',
          'Tech Park, Phase 1, Hinjawadi,',
          'Rajiv Gandhi Infotech Park,',
          'Pune, Maharashtra 411057',
        ],
      },
      { title: 'Phone:', lines: ['(+91) 9175414055'] },
      {
        uppercaseLinks: true,
        links: [
          { label: 'Privacy Policy', href: '#privacy' },
          { label: 'Terms of Service', href: '#terms' },
          { label: 'Cookie Policy', href: '#cookies' },
        ],
      },
    ],
  ] as FooterGroup[][],
  social: [
    { label: 'Instagram', href: 'https://instagram.com/' },
    { label: 'Twitter', href: 'https://twitter.com/' },
    { label: 'Linkedin', href: 'https://linkedin.com/' },
    { label: 'Reddit', href: 'https://reddit.com/' },
  ],
  watermark: 'wwisermind',
};
