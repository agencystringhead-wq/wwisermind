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
  image: {
    src: '/images/hero-bg.webp',
    width: 1905,
    height: 976,
    alt: '',
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
  cards: [
    {
      title: 'I’m invisible on Google.',
      image: '/images/slider1.webp',
      body:
        'Your website exists, but when someone searches "therapist in [your city]," it’s your competitors and Psychology Today who show up. Page two might as well be nowhere.',
    },
    {
      title: 'AI doesn’t know I exist.',
      image: '/images/slider2.webp',
      body:
        'When someone asks ChatGPT, Google AI or Perplexity to recommend a therapist nearby, it names other practices, or none at all. A whole new way clients search, and you’re not in the answer.',
    },
    {
      title: 'My website embarrasses me.',
      image: '/images/slider3.webp',
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
  rows: [
    {
      title: 'Group Practice',
      body:
        'Your website has to sell the whole team: every clinician, every specialty, every location, and hold up to referral sources and insurance-savvy clients checking you out. We build sites that grow with your roster and marketing that fills every calendar, not just the founder’s.',
      link: { label: 'Built for group practices', href: '#group-practices' },
      image: '/images/grouppractice.webp',
      imageAlt: 'A group practice team together outside their office',
      photoFirst: false,
    },
    {
      title: 'Solo Practice',
      body:
        'You are the practice, so your website has to carry your voice, your specialty, and your credibility, and bring in clients without you becoming a marketer on the side. We build sites and marketing that work quietly while you’re in session.',
      link: { label: 'Built for solo practitioners', href: '#solo-practitioners' },
      image: '/images/solopractice.webp',
      imageAlt: 'A solo practitioner holding a tablet in her office',
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
  launchImage: {
    src: '/images/launch-and-grow.webp',
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
