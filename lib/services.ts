import { SERVICE_SLUGS, serviceHref, type ServiceSlug } from '@/lib/service-slugs';
import { heroBanner, homeIntro } from '@/lib/site';
import type { ServiceIconName } from '@/components/ui/icons';

export { SERVICE_SLUGS, serviceHref, type ServiceSlug };

/* ==========================================================================
   /services/[slug].

   One data file, one template. Every word on a service page comes from the entry below
   that carries its slug; adding a service is adding its slug to SERVICE_SLUGS in
   lib/service-slugs.ts and an entry to `services` here. Nothing else changes — the route
   pre-renders one page per slug, the nav's service links are typed against the same list,
   and the template draws every frame from the entry it is handed.

   Frames come in two kinds. Four are on every page and their fields are required: the
   hero, the intro with the capabilities, what's included, and the FAQ with the related
   cards. The rest are optional — gallery, pillars, what we do, why choose us, technology,
   projects, process, testimonials — and a page simply has no such frame until its entry
   carries the field. Nothing renders an empty state.

   All thirteen entries are written through. `draft` stays on the type for the next service
   that is added before its copy is: a draft page still renders, and is sent out `noindex`
   — see app/services/[slug]/page.tsx.

   Photographs: the One Week Website page reuses the homepage's. Every other page carries
   free Pexels stock as a stand-in until purpose-shot pictures exist; each file is named by
   its Pexels photo ID (public/images/services/pexels-<id>.webp) so the source is always a
   lookup away, and swapping one for a real photograph is a one-line change to `src`.
   ========================================================================== */

/** The three columns the mega menu sorts services into. The hero's breadcrumb reads it. */
export type ServiceCategory = 'Website Design' | 'Online Marketing' | 'AI Services';

export type ServiceImage = { src: string; alt: string; position?: string };

/** The mosaic's three photographs and its yellow tile — the contact page's own shape, so
    the contact gallery component draws it unchanged. Ratios the tiles want, so `cover`
    trims almost nothing: tall ≈ 6:5, mid 1:1, wide ≈ 8:5. */
export type ServiceGallery = {
  tall: ServiceImage;
  mid: ServiceImage;
  wide: ServiceImage;
  accent: string;
};

export type ServicePillar = { icon: ServiceIconName; title: string; body: string };

export type WhatWeDoTab = {
  label: string;
  image: ServiceImage;
  heading: string;
  paragraph: string;
  /** Four, for the 2x2 grid. */
  claims: string[];
  cta?: { label: string; href: string };
};

export type WhyCard = { icon: ServiceIconName; title: string; body: string };

/** The one dark card in the why-choose-us grid. The figure is read from an existing case
    study rather than typed here, so no number on a service page is one nobody measured. */
export type WhyStat = {
  caseStudySlug: CaseStudySlug;
  /** Which of that project's stats: 0 is the first on the homepage card. */
  statIndex: number;
  title: string;
  body: string;
  /** Which of the four slots it takes, 0–3, reading left to right, top to bottom. */
  position: 0 | 1 | 2 | 3;
};

export type ServiceIncludedItem = { title: string; body: string };

export type ServiceProcessRow = { title: string; body: string };

export type ServiceFaq = { question: string; answer: string };

export type Service = {
  slug: ServiceSlug;
  name: string;
  category: ServiceCategory;
  /** True while the entry’s copy is unfinished. The page still renders, but it is sent
      out `noindex` so a search engine never files a half page. */
  draft?: boolean;

  /* --- 1 · hero (required) ------------------------------------------------ */
  /** One sentence, in white under the yellow name: the result, not the deliverable. */
  heroOutcome: string;

  /* --- 2 · gallery mosaic (optional) -------------------------------------- */
  gallery?: ServiceGallery;

  /* --- 3 · intro + capabilities (required) -------------------------------- */
  intro: {
    /** The one centred paragraph under the mosaic — no heading, as the reference. */
    paragraph: string;
    /** Four to eight short items, two columns in the paragraph's measure, each behind
        the nav's plus. The list fills row by row, so items 1, 3, 5, 7 make the left
        column and 2, 4, 6, 8 the right: keep every item to a similar length — three to
        five words — so neither column runs ragged beside the other. */
    capabilities: string[];
  };

  /* --- 4 · three pillars (optional) --------------------------------------- */
  /** Drawn in the intro's frame under a hairline: a thin blue line icon, the title with
      a colon, a short paragraph. Titles without the colon — the template adds it. */
  pillars?: [ServicePillar, ServicePillar, ServicePillar];

  /* --- 5 · what we do (optional) ------------------------------------------ */
  whatWeDo?: {
    heading: string;
    /** Three, numbered 01 02 03 by the template. */
    tabs: [WhatWeDoTab, WhatWeDoTab, WhatWeDoTab];
  };

  /* --- 6 · what's included (required) ------------------------------------- */
  /** The numbered accordion. The first opens by default. */
  included: ServiceIncludedItem[];

  /* --- 7 · why choose us (optional) --------------------------------------- */
  whyChooseUs?: {
    heading: string;
    image: ServiceImage;
    /** Three light cards when `stat` is set, four when it is not. */
    cards: WhyCard[];
    stat?: WhyStat;
  };

  /* --- 8 · technology (optional) ------------------------------------------ */
  technology?: {
    heading: string;
    /** Names entries in `technologies` below. */
    items: TechnologyId[];
  };

  /* --- 9 · completed projects (optional) ---------------------------------- */
  projects?: {
    heading: string;
    subheading: string;
    /** In the order they stack: the first is shown first, the next slides up over it. */
    caseStudySlugs: CaseStudySlug[];
  };

  /* --- 10 · process (optional) -------------------------------------------- */
  process?: {
    heading: string;
    image: ServiceImage;
    /** The check-marked accordion; the first row opens by default. */
    rows: ServiceProcessRow[];
  };

  /* --- 11 · testimonials (optional) --------------------------------------- */
  testimonials?: {
    heading: string;
    paragraph: string;
    /** Names entries in `testimonials` below; absent, every entry is shown. */
    ids?: TestimonialId[];
  };

  /* --- 12 · faq + related (required) -------------------------------------- */
  /** Four to eight. */
  faqs: ServiceFaq[];
  /** Three sibling services, in the order the cards should read. */
  relatedSlugs: ServiceSlug[];
  /** The picture on this service's own row in another page's related-services list.
      Absent, the row draws the practice panels' gradient instead. Ratio 16:10. */
  tileImage?: ServiceImage;

  /* --- seo ------------------------------------------------------------------ */
  seo: {
    title: string;
    description: string;
  };
};

/* ==========================================================================
   Case studies.

   Not a second copy of the homepage's results: each entry points at the project card in
   `homeIntro.projects`, so a number changed on the homepage changes here. The headline is
   this file's own and restates the stat rather than claiming anything the stat does not.
   `wide` is the landscape picture the projects stack and the results page want (16:9);
   the service-page stack falls back to the square homepage card, cover-cropped, and the
   results page leaves the project out until the picture exists.
   ========================================================================== */
export type CaseStudySlug = 'timely' | 'evolve';

export type CaseStudy = {
  slug: CaseStudySlug;
  name: string;
  headline: string;
  project: (typeof homeIntro.projects)[number];
  /** What was delivered, as the results page captions it under the card — one entry per
      line of work, printed comma-separated in this order. */
  delivered: string[];
  /** The 16:9 landscape of the finished site. Supply at 1920×1080 or larger. */
  wide?: ServiceImage;
  /** The project's own page or case study, once one exists. Absent, the results page
      shows the project as a plain block rather than a link to nowhere. */
  url?: string;
};

const [timelyProject, evolveProject] = homeIntro.projects;

/* `delivered` lists only what the service pages already claim: both projects sit in the
   Completed projects frame of the One Week Website and Custom Website Design pages, and
   nowhere else. Add the marketing lines as they are confirmed. */
export const caseStudies: Record<CaseStudySlug, CaseStudy> = {
  timely: {
    slug: 'timely',
    name: 'Timely Therapy',
    headline: 'A calm, credible site that turned more of its visitors into clients.',
    project: timelyProject,
    delivered: ['Website Design'],
    /* TODO: a 16:9 landscape of the Timely site. The service-page stack shows the square
       card meanwhile; the results page waits for the picture. */
  },
  evolve: {
    slug: 'evolve',
    name: 'Evolve Therapy & Yoga',
    headline: 'Therapy and yoga under one roof, and a calendar that filled up.',
    project: evolveProject,
    delivered: ['Website Design'],
    /* TODO: a 16:9 landscape of the Evolve site, as above. */
  },
};

/** The results page, most recent first. Adding a project there is adding its case study
    above and its slug here — the page maps over this list. */
export const resultsProjects: CaseStudySlug[] = ['timely', 'evolve'];

/* ==========================================================================
   Testimonials.

   The one real testimonial the site has is the hero banner's, and it is read from there.
   Add entries here as they come in; the carousel shows its arrows once there are two.
   ========================================================================== */
export type TestimonialId = 'matt-erdman';

export type Testimonial = {
  id: TestimonialId;
  quote: string;
  name: string;
  role: string;
  /** The reviewer's photograph, near-square (11:12). The hero's 176px avatar stands in
      for Matt until a real portrait exists. */
  photo: ServiceImage;
  rating: number;
};

export const testimonials: Record<TestimonialId, Testimonial> = {
  'matt-erdman': {
    id: 'matt-erdman',
    quote: heroBanner.testimonial.quote,
    name: heroBanner.testimonial.author.name,
    role: heroBanner.testimonial.author.role,
    photo: { src: heroBanner.testimonial.author.avatar, alt: heroBanner.testimonial.author.name },
    rating: heroBanner.testimonial.rating,
  },
};

/* ==========================================================================
   Technology.

   What the sites are built and run on — the tools in this repository, not a wish list.
   `logo` is optional: a tile with none prints the name, so the frame never waits on an
   asset. TODO: no logo files exist yet for any of these; see the report.
   ========================================================================== */
export type TechnologyId =
  | 'nextjs'
  | 'react'
  | 'typescript'
  | 'cloudflare'
  | 'github'
  | 'calcom';

export type Technology = {
  id: TechnologyId;
  name: string;
  /** What it does for a practice, read by a screen reader and shown on hover. */
  role: string;
  logo?: { src: string; width: number; height: number };
};

export const technologies: Record<TechnologyId, Technology> = {
  nextjs: { id: 'nextjs', name: 'Next.js', role: 'The framework every site is built on' },
  react: { id: 'react', name: 'React', role: 'The component library under Next.js' },
  typescript: { id: 'typescript', name: 'TypeScript', role: 'Typed code, so fewer bugs ship' },
  cloudflare: { id: 'cloudflare', name: 'Cloudflare Pages', role: 'Global hosting, fast everywhere' },
  github: { id: 'github', name: 'GitHub', role: 'Every change versioned and reviewable' },
  calcom: { id: 'calcom', name: 'Cal.com', role: 'The booking calendar on the contact page' },
};

/* ==========================================================================
   The services.
   ========================================================================== */

export const services: Service[] = [
  /* --- 01 · One Week Website ------------------------------------------------ */
  {
    slug: 'one-week-website',
    name: 'One Week Website',
    category: 'Website Design',
    heroOutcome:
      'Your practice online in seven days, designed, written and launched while you stay in session.',

    /* The homepage's photographs, as the contact mosaic uses them — nothing was shot for
       this page. Purpose-shot images want: tall ≈ 6:5, mid 1:1, wide ≈ 8:5. */
    gallery: {
      tall: {
        src: '/images/wwisermind-built-for-mental-therapist-only.webp',
        alt: 'A therapist in a mustard blazer listening to a client across from her',
        position: '58% 40%',
      },
      mid: {
        src: '/images/Timely-Therapy-Case-Studies-wwisermind.webp',
        alt: 'The Timely Therapy website on a laptop',
      },
      wide: {
        src: '/images/launch-and-grow.webp',
        alt: 'A therapist sitting in her practice with a notebook',
        position: 'center 40%',
      },
      accent: 'Live in seven days. Not seven months.',
    },

    intro: {
      paragraph:
        'A fixed scope, a fixed price and a fixed launch date. We write the copy from one conversation with you, design pages that read as calm and credible, and build them to be found on Google, Maps and the AI tools clients ask now. You review twice. Everything else is handled.',
      /* Read down the columns: the odd items are the left one, the even the right. Kept
         to a similar length so neither column runs ragged beside the other. */
      capabilities: [
        'Designed and built in 7 days',
        'Copy written for you',
        'HIPAA-aware contact forms',
        'Fast on phones',
        'SEO foundation built in',
        'Online booking built in',
        'Two reviews from you, that’s all',
        'A launch date you can plan',
      ],
    },

    pillars: [
      {
        icon: 'search',
        title: 'Get found',
        body: 'When someone searches for a therapist at 2am, your site should be there. Titles, structured data and a submitted sitemap are in from launch day.',
      },
      {
        icon: 'calendar',
        title: 'Convert',
        body: 'A good-looking site does not fill a calendar on its own. Clear next steps, booking connected, and copy that speaks to someone in distress.',
      },
      {
        icon: 'shield',
        title: 'Secure and fast',
        body: 'HIPAA-aware forms, a static build with nothing to hack, and pages that load fast on a phone. Every technical detail handled for you.',
      },
    ],

    whatWeDo: {
      heading: 'One week, three things done properly',
      tabs: [
        {
          label: 'Design that sounds like you',
          image: {
            src: '/images/wwisermind-built-for-mental-therapist-only.webp',
            alt: 'A therapist in a mustard blazer listening to a client across from her',
            position: '58% 40%',
          },
          heading: 'Pages that read the way your practice feels.',
          paragraph:
            'One 30-minute conversation is all we need. From it we write every page in plain language and design around it, so the site sounds like you rather than like a template with your name on it.',
          claims: [
            'Copy written from one call',
            'Calm, credible layouts',
            'Your photos, or a shortlist',
            'One review, marked up by you',
          ],
        },
        {
          label: 'Built to be found',
          image: {
            src: '/images/Built-for-clients-how-searches-next.webp',
            alt: 'A woman looking at her phone at a cafe table',
            position: 'center 40%',
          },
          heading: 'Indexable on the day it goes live.',
          paragraph:
            'The SEO foundation is part of the build, not an add-on: page titles and descriptions, structured data, a Google Business Profile link, and a sitemap submitted before you have finished reading the launch email.',
          claims: [
            'Titles and descriptions on every page',
            'Structured data for a practice',
            'Google Business Profile linked',
            'Sitemap submitted at launch',
          ],
        },
        {
          label: 'Launched in seven days',
          image: {
            src: '/images/launch-and-grow.webp',
            alt: 'A therapist sitting in her practice with a notebook',
            position: 'center 40%',
          },
          heading: 'A launch date you can put in the diary.',
          paragraph:
            'The week starts once the call has happened and any photos are in. You review the built site once, we fix what is not right, and the site goes live on the agreed day with thirty days of fixes included.',
          claims: [
            'A fixed launch day',
            'Booking connected before launch',
            'A recorded walkthrough',
            'Thirty days of fixes after',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'Up to five pages',
        body: 'Home, About, Services, Fees and FAQ, and Contact. The pages a practice needs to be found and trusted, without filler. Extra pages can be added on a care plan later.',
      },
      {
        title: 'Copy written for you',
        body: 'Every page is written from one conversation with you, in plain language that speaks to someone in distress rather than to a licensing board. You review it once.',
      },
      {
        title: 'HIPAA-aware forms',
        body: 'Contact and intake forms that do not store health information where it should not be, with a privacy notice written for a therapy practice rather than a shop.',
      },
      {
        title: 'Online booking',
        body: 'Your existing scheduler connected so a visitor can book a consultation without emailing first. If you have no scheduler yet, we set one up with you.',
      },
      {
        title: 'The SEO foundation',
        body: 'Page titles, descriptions, structured data, a Google Business Profile link and a submitted sitemap, so the site is indexable the day it goes live.',
      },
      {
        title: 'Launch and thirty days of fixes',
        body: 'A recorded walkthrough of how to make small edits yourself, and a month in which anything that is not right is fixed at no cost.',
      },
    ],

    whyChooseUs: {
      heading: 'A fixed week, and a process built around it',
      image: {
        src: '/images/solopractice.webp',
        alt: 'A solo practitioner holding a tablet in her office',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'You never explain your world to your own web team.',
        },
        {
          icon: 'clock',
          title: 'Revisions while you sleep',
          body: 'We work from Pune, so a note left at 6pm is done by your morning.',
        },
        {
          icon: 'chat',
          title: 'Plain English, every step',
          body: 'Two reviews, both explained, and no jargon in between.',
        },
      ],
      stat: {
        caseStudySlug: 'timely',
        statIndex: 0,
        title: 'More visitors became clients',
        body: 'Timely Therapy’s conversion rate growth after its new site went live.',
        position: 1,
      },
    },

    technology: {
      heading: 'Built on tools that stay out of your way',
      items: ['nextjs', 'react', 'typescript', 'cloudflare', 'github', 'calcom'],
    },

    projects: {
      heading: 'Practices we’ve built for',
      subheading:
        'Two of the sites that went live on schedule, and what changed for the practice afterwards.',
      caseStudySlugs: ['timely', 'evolve'],
    },

    process: {
      heading: 'Four steps, and you only show up for two of them',
      image: {
        src: '/images/grouppractice.webp',
        alt: 'A group practice team together outside their office',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'Strategy call',
          body: 'One 30-minute video call in your timezone. We agree the pages, the tone and the launch date, and you leave with a written plan whether you go ahead or not.',
        },
        {
          title: 'Copy and design',
          body: 'We write the copy and design every page from that one call. You review once and mark anything that isn’t you.',
        },
        {
          title: 'Build and connect',
          body: 'We build the site, connect your booking, and set up HIPAA-aware forms and the SEO foundation.',
        },
        {
          title: 'Launch',
          body: 'The site goes live on the agreed day, with a recorded walkthrough and thirty days of fixes included.',
        },
      ],
    },

    testimonials: {
      heading: 'What therapists say',
      paragraph:
        'The practices we build for are small and busy, so we ask for a sentence, not an essay. Here is what they said.',
    },

    faqs: [
      {
        question: 'Is seven days realistic?',
        answer:
          'Yes, because the scope is fixed and the copy comes from one call rather than a document you have to write. The week starts once the call has happened and any photos you want to use are in; the build itself does not wait on you.',
      },
      {
        question: 'What do you need from me?',
        answer:
          'One 30-minute call, any photos or a logo you already have, and two reviews of about twenty minutes each: one for the copy and design, one for the built site.',
      },
      {
        question: 'Which platform is it built on?',
        answer:
          'A fast, static build hosted on a global network, so there is no plugin to update and nothing to be hacked. You get a simple editor for the text, and a care plan covers anything bigger.',
      },
      {
        question: 'Will it work with my booking system?',
        answer:
          'SimplePractice, TherapyNotes, Calendly, Cal.com and most others connect in an afternoon. If yours does not, we will say so on the call rather than discover it in week two.',
      },
      {
        question: 'Do you handle HIPAA compliance?',
        answer:
          'We build the forms and the site so that no protected health information is stored where it should not be, and we point you to a BAA-covered provider for anything that collects it. We are not a law firm, and we say so.',
      },
      {
        question: 'What happens after the first month?',
        answer:
          'The site is yours. Hosting is a separate monthly plan, and a care plan covers edits, backups and updates if you would rather not touch it. Neither is a contract.',
      },
    ],
    relatedSlugs: ['custom-website-design', 'website-care-plans', 'local-seo'],
    tileImage: {
      src: '/images/Timely-Therapy-Case-Studies-wwisermind.webp',
      alt: 'The Timely Therapy website',
    },
    seo: {
      title: 'One Week Website for therapists — wwisermind',
      description:
        'A therapist website designed, written and launched in seven days. Fixed scope, fixed price, HIPAA-aware forms, booking connected and an SEO foundation built in. Two reviews from you, the rest handled.',
    },
  },

  /* --- 02 · Custom Website Design ------------------------------------------- */
  {
    slug: 'custom-website-design',
    name: 'Custom Website Design',
    category: 'Website Design',
    heroOutcome:
      'Every clinician, every location and every specialty on a site designed around how your practice runs, not around a template.',


    gallery: {
      tall: {
        src: '/images/services/pexels-7495649.webp',
        alt: 'Three colleagues talking across a table with laptops open',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-3184360.webp',
        alt: 'A team gathered around a wooden table with laptops and papers',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-7988669.webp',
        alt: 'Five colleagues around a table looking at a tablet together',
        position: 'center 35%',
      },
      accent: 'Designed around your practice. Not a template.',
    },

    intro: {
      paragraph:
        'The One Week Website is a fixed scope for a practice that needs the essentials fast. This is for the practice that has outgrown it: a group with several clinicians, more than one location, a list of specialties that each deserve a page, or a founder who wants the site to say something a template cannot. We start with a blank page and your practice, and we design and write every page to fit it.',
      capabilities: [
        'Designed from a blank page',
        'A profile for every clinician',
        'A page for every location',
        'Copy written from interviews',
        'HIPAA-aware intake forms',
        'Booking for every clinician',
        'SEO foundation built in',
        'Built to add pages later',
      ],
    },

    pillars: [
      {
        icon: 'clipboard',
        title: 'Built for the whole team',
        body: 'Referrers, insurance-savvy clients and a parent at midnight all check the same thing: who is on the team and what each of them treats. Every clinician gets a real profile, and every specialty a page that can rank on its own.',
      },
      {
        icon: 'pen',
        title: 'Written, not filled in',
        body: 'We interview you and, where it helps, the clinicians, and write every page from that. The site reads like the practice rather than like a template with the names swapped.',
      },
      {
        icon: 'globe',
        title: 'Room to grow',
        body: 'A new hire, a second office or a new service is a page added, not a rebuild. The structure is planned for the practice you are becoming, not only the one you are today.',
      },
    ],

    whatWeDo: {
      heading: 'Three things a template cannot do',
      tabs: [
        {
          label: 'Structure around the practice',
          image: {
            src: '/images/services/pexels-7495649.webp',
            alt: 'Three colleagues talking across a table with laptops open',
            position: 'center 35%',
          },
          heading: 'One page for everything a client might search for.',
          paragraph:
            'Before anything is designed we map the site: every clinician, every location, every specialty and every insurance question, and where each lives. A parent searching for a child anxiety therapist near your second office lands on a page about exactly that, not on a general home page.',
          claims: [
            'A site map agreed before design',
            'Clinician profiles with their own address',
            'Location pages that rank locally',
            'Specialty pages, not one long list',
          ],
        },
        {
          label: 'Design from a blank page',
          image: {
            src: '/images/services/pexels-3184360.webp',
            alt: 'A team gathered around a wooden table with laptops and papers',
            position: 'center 35%',
          },
          heading: 'Designed to look like your practice, not like ours.',
          paragraph:
            'Layouts, type and colour are chosen for your practice from scratch, and you see the design as finished pages before a line of it is built. The brief is the same on every project: calm, credible, and easy to read on a phone at 2am.',
          claims: [
            'Layouts designed for your content',
            'Your brand, or one we set with you',
            'Design reviewed before build',
            'Every page checked on a phone',
          ],
        },
        {
          label: 'Written from interviews',
          image: {
            src: '/images/services/pexels-7988669.webp',
            alt: 'Five colleagues around a table looking at a tablet together',
            position: 'center 35%',
          },
          heading: 'Copy that sounds like the people in the room.',
          paragraph:
            'We talk to you and, where it helps, to the clinicians, and write every page from that. The words speak to someone in distress rather than to a licensing board, and each profile sounds like the clinician it belongs to.',
          claims: [
            'Interviews, not a questionnaire',
            'A voice agreed up front',
            'Profiles written per clinician',
            'Two rounds of review on the copy',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'A site map built around your practice',
        body: 'Before design starts, every page is agreed: home, about, the team, each clinician, each location, each service or specialty, fees and insurance, FAQ and contact. Nothing is bolted on later that should have been planned.',
      },
      {
        title: 'Custom design, reviewed before build',
        body: 'Layouts designed for your content rather than picked from a theme, shown to you as finished pages that you review and mark up before the build begins.',
      },
      {
        title: 'Copy written from interviews',
        body: 'Every page written by us from conversations with you and your clinicians, in plain language that speaks to someone in distress rather than to a licensing board. A voice agreed before the first draft, and two rounds of review on the words.',
      },
      {
        title: 'Clinician profiles and location pages',
        body: 'A real page for each clinician, with their specialties, approach, availability and booking link, and a page for each office with its own address, map and hours, so each can be found on its own.',
      },
      {
        title: 'HIPAA-aware forms and booking',
        body: 'Contact and intake forms that keep protected health information out of places it should not be, and your scheduler connected so a visitor can book with the right clinician without emailing first.',
      },
      {
        title: 'The SEO foundation',
        body: 'Titles and descriptions on every page, structured data for a practice with several people and places, a Google Business Profile link for each location, and a sitemap submitted at launch.',
      },
      {
        title: 'Launch, a walkthrough and thirty days of fixes',
        body: 'A recorded walkthrough of how to edit text and add a clinician yourself, and a month after launch in which anything that is not right is fixed at no cost.',
      },
    ],

    whyChooseUs: {
      heading: 'Built by people who only build for practices',
      image: {
        src: '/images/services/pexels-12903018.webp',
        alt: 'A woman laughing at a desk in a bright office',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'Group intake, sliding scales, supervision, telehealth: we know what a practice page has to say before you tell us.',
        },
        {
          icon: 'chat',
          title: 'You see it before it is built',
          body: 'The design is reviewed as finished pages and the copy as a document. Nothing is a surprise at launch.',
        },
        {
          icon: 'clock',
          title: 'Revisions while you sleep',
          body: 'We work from Pune, so a note left after your last session is done by your morning.',
        },
      ],
      stat: {
        caseStudySlug: 'timely',
        statIndex: 0,
        title: 'More visitors became clients',
        body: 'Timely Therapy’s conversion rate growth after its new site went live.',
        position: 1,
      },
    },

    technology: {
      heading: 'The same stack under every site we build',
      items: ['nextjs', 'react', 'typescript', 'cloudflare', 'github', 'calcom'],
    },

    projects: {
      heading: 'Practices we’ve designed for',
      subheading:
        'Two of the practices whose sites we designed and built, and what changed for them afterwards.',
      caseStudySlugs: ['timely', 'evolve'],
    },

    process: {
      heading: 'Five steps, and you see every one of them coming',
      image: {
        src: '/images/services/pexels-4458602.webp',
        alt: 'A woman seen from behind at a desk with a laptop and plants',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'Strategy call',
          body: 'One 30-minute video call in your timezone. We talk through the practice, the clinicians, the locations and what the site has to do, and you leave with a written plan and a timeline whether you go ahead or not.',
        },
        {
          title: 'Site map and copy',
          body: 'We agree every page, then interview you and the clinicians and write the words. You review the copy as a document before any design.',
        },
        {
          title: 'Design',
          body: 'Every page designed for its content and shown to you as finished screens. You mark up what is not right, and we revise until it is.',
        },
        {
          title: 'Build and connect',
          body: 'The approved design built page by page, booking connected for each clinician, HIPAA-aware forms and the SEO foundation put in.',
        },
        {
          title: 'Launch and after',
          body: 'The site goes live on the agreed day, with a recorded walkthrough and thirty days of fixes. Hosting and a care plan carry on from there if you want them to.',
        },
      ],
    },

    testimonials: {
      heading: 'What therapists say',
      paragraph:
        'The practices we build for are small and busy, so we ask for a sentence, not an essay. Here is what they said.',
      ids: ['matt-erdman'],
    },

    faqs: [
      {
        question: 'How is this different from the One Week Website?',
        answer:
          'The One Week Website is a fixed scope: up to five pages, copy from one call, live in seven days. Custom Website Design starts from a blank page and a site map built around your practice, so it suits a group with several clinicians, more than one location, or a list of specialties that each deserve a page. It takes longer, and the timeline is agreed on the first call.',
      },
      {
        question: 'How long does it take?',
        answer:
          'It depends on how many pages there are and how many people we need to talk to, so we put a date on it on the first call rather than guessing here. The clock runs on our side: your reviews of the copy, the design and the built site are the only points where the work waits on you.',
      },
      {
        question: 'Can every clinician have their own page?',
        answer:
          'Yes, and they should. Each profile gets its own address, its own specialties and its own booking link, so a clinician who treats OCD in your second office can be found for exactly that. Adding a new hire later is a page added, not a rebuild.',
      },
      {
        question: 'We have two locations. Does that change things?',
        answer:
          'Each office gets its own page with its own address, hours, map and Google Business Profile link, so it can rank in its own area. The team and service pages are shared, and a visitor is pointed to the right office without a maze of menus.',
      },
      {
        question: 'Do we need to write anything?',
        answer:
          'No. We interview you and, where it helps, the clinicians, and write every page from that. You review the copy as a document and mark what is not you. If you would rather write your own, we edit it into shape instead.',
      },
      {
        question: 'What do you need from us?',
        answer:
          'The strategy call, the interviews, your logo and any photos of the team and the offices, and your reviews at each step. A practice photographer is worth booking; a phone photo of each clinician in decent light will do until then.',
      },
      {
        question: 'What happens after launch?',
        answer:
          'The site is yours. Hosting is a separate monthly plan, and a care plan covers edits, backups and updates if you would rather not touch it. Neither is a contract, and you can leave with the whole site at any point.',
      },
    ],
    relatedSlugs: ['one-week-website', 'website-care-plans', 'copywriting'],
    tileImage: {
      src: '/images/Evolve-Therapy-Yoga-Case-Studies.webp',
      alt: 'The Evolve Therapy & Yoga website',
    },
    seo: {
      title: 'Custom Website Design for therapy practices — wwisermind',
      description:
        'A therapy practice website designed from a blank page: a page for every clinician and location, copy written from interviews, HIPAA-aware forms, booking connected and an SEO foundation built in.',
    },
  },

  /* --- 03 · Website Hosting ------------------------------------------------- */
  {
    slug: 'website-hosting',
    name: 'Website Hosting',
    category: 'Website Design',
    heroOutcome:
      'Your site fast, secure and online on a global network, with nothing you have to log in to and update.',

    gallery: {
      tall: {
        src: '/images/services/pexels-6913727.webp',
        alt: 'A laptop on a wooden desk among potted plants',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-6889204.webp',
        alt: 'Hands typing on a laptop beside a mug of coffee',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-8036934.webp',
        alt: 'A person under a blue duvet looking at a phone at night',
        position: 'center 35%',
      },
      accent: 'Online at 11pm. Fast on a phone.',
    },

    intro: {
      paragraph:
        'A therapy practice website has to be up when a client looks at 11pm, fast on a phone, and safe to hand a distressed person a form on. Ours are static builds served from a global network: no server to patch, no plugins to update, nothing to be hacked into overnight. Hosting is a monthly plan with no contract, run by the people who built the site.',
      capabilities: [
        'Served from a global network',
        'SSL certificate included',
        'No plugins to update',
        'Every version kept',
        'Fast on phones everywhere',
        'Your domain connected',
        'Rollback in minutes',
        'Monthly, no contract',
      ],
    },

    pillars: [
      {
        icon: 'shield',
        title: 'Nothing to break in to',
        body: 'A static build has no database, no admin login and no plugin waiting for a security patch. There is very little for anyone to attack, and nothing for you to remember to update.',
      },
      {
        icon: 'bolt',
        title: 'Fast where your clients are',
        body: 'Pages are served from the network location nearest the visitor, so a site built in Pune loads as quickly in Sydney as in Seattle. Speed is a ranking signal, and a courtesy to someone on a phone.',
      },
      {
        icon: 'chat',
        title: 'Run by the people who built it',
        body: 'The studio that designed your site keeps it online. If something is wrong you email us, not a hosting company’s ticket queue, and the person who answers knows the site.',
      },
    ],

    whatWeDo: {
      heading: 'Three things hosting has to do for a practice',
      tabs: [
        {
          label: 'Stay up',
          image: {
            src: '/images/services/pexels-6913727.webp',
            alt: 'A laptop on a wooden desk among potted plants',
            position: 'center 35%',
          },
          heading: 'Online at 11pm, without a server to fall over.',
          paragraph:
            'The site is a set of files served from a global network, not a program running on one machine. There is no server of its own to slow down, fill up or crash, which is why a static site is the only kind we host.',
          claims: [
            'Served from a global network',
            'No server of its own',
            'SSL renewed for you',
            'Your domain pointed at it',
          ],
        },
        {
          label: 'Stay safe',
          image: {
            src: '/images/services/pexels-6889204.webp',
            alt: 'Hands typing on a laptop beside a mug of coffee',
            position: 'center 35%',
          },
          heading: 'Nothing to log in to, nothing to patch.',
          paragraph:
            'No admin login, no plugins and no database of client details on the site itself. Anything that collects health information runs on a BAA-covered provider the site links to, so the hosting has nothing to protect.',
          claims: [
            'No plugins to update',
            'No admin login to guard',
            'No client data on the site',
            'Every version kept in GitHub',
          ],
        },
        {
          label: 'Stay in good hands',
          image: {
            src: '/images/services/pexels-8036934.webp',
            alt: 'A person under a blue duvet looking at a phone at night',
            position: 'center 35%',
          },
          heading: 'Run by the people who built the site.',
          paragraph:
            'If something is wrong, you email the studio that built the site, and the reply comes from someone who knows it. A bad change is put back in minutes from the version before it.',
          claims: [
            'Support from the builders',
            'A reply within one business day',
            'Rollback in minutes',
            'Monthly, and no contract',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'Global hosting on Cloudflare Pages',
        body: 'Your site served from a network of data centres around the world, so a visitor in any city gets it from one nearby. The build is static: there is no server of its own to slow down or fall over.',
      },
      {
        title: 'SSL and your own domain',
        body: 'The certificate that puts the padlock in the browser is included and renewed for you, and your domain is pointed at the site by us. If you do not have a domain yet, we register one with you, in your name.',
      },
      {
        title: 'Every version kept',
        body: 'Every change to the site is a versioned commit in GitHub. If an edit goes wrong, the previous version is put back in minutes, and no page is ever one bad change away from gone.',
      },
      {
        title: 'A static build, by design',
        body: 'No content management system, no plugins and no database of client details on a server somewhere. The pages are files, served as they are, which is why they are fast and why there is so little to attack.',
      },
      {
        title: 'Support you can email',
        body: 'A studio address that reaches a person who knows your site. A reply within one business day, and a plain English note of what was done.',
      },
      {
        title: 'A monthly plan, no contract',
        body: 'Hosting is billed monthly and stops when you ask it to. The site is yours: if you ever move it, we hand over the files and the domain settings.',
      },
    ],

    whyChooseUs: {
      heading: 'Hosting from the people who built the site',
      image: {
        src: '/images/services/pexels-8296985.webp',
        alt: 'A hand on a laptop beside a coffee cup and folders',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'shield',
          title: 'Built for a practice, not a shop',
          body: 'No plugins, no admin login, no database of client details sitting on a server somewhere.',
        },
        {
          icon: 'chat',
          title: 'Support in plain English',
          body: 'Email the studio that built your site. A reply within one business day, from someone who knows it.',
        },
        {
          icon: 'globe',
          title: 'Fast in your city',
          body: 'Served from the network location nearest your clients, wherever your practice is.',
        },
        {
          icon: 'clipboard',
          title: 'No contract, no lock-in',
          body: 'A monthly plan you can stop, and a site you can take with you in full.',
        },
      ],
    },

    technology: {
      heading: 'What your site runs on',
      items: ['cloudflare', 'github', 'nextjs'],
    },

    process: {
      heading: 'How hosting works, from launch day on',
      image: {
        src: '/images/services/pexels-8296985.webp',
        alt: 'A hand on a laptop beside a coffee cup and folders',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'Connected at launch',
          body: 'Hosting starts the day the site goes live. The domain is pointed at the site, the certificate issued, and you are sent the details in one email.',
        },
        {
          title: 'Watched, not just left',
          body: 'Every deploy is a versioned commit. If anything is wrong, the previous version is put back in minutes, and you hear what happened in plain English.',
        },
        {
          title: 'Billed monthly, stopped when you say',
          body: 'Nothing to renew and nothing to remember. Ask to stop and it stops at the end of the month, with the files and the domain settings handed over.',
        },
      ],
    },

    faqs: [
      {
        question: 'Is hosting included with the website?',
        answer:
          'The build is a one-off; hosting is a separate monthly plan that starts at launch. The two are kept apart so the price of each is plain, and so you can stop or move hosting without it touching anything else.',
      },
      {
        question: 'Can you host a site you did not build?',
        answer:
          'Usually the honest answer is a rebuild rather than a move. Our hosting is built around the static sites we make, and a WordPress or Squarespace site cannot simply be copied onto it. Tell us what you have on a call and we will say whether hosting alone helps or whether the One Week Website is the cheaper route.',
      },
      {
        question: 'What happens if the site goes down?',
        answer:
          'It is unusual: a static site on a global network has no server of its own to fail. If something is wrong, email us and the person who built the site looks at it. Every previous version is kept, so a bad change can be put back in minutes.',
      },
      {
        question: 'Is the hosting HIPAA compliant?',
        answer:
          'The site itself stores no client information, so there is nothing on the hosting to protect. Anything that collects protected health information, an intake form or a client portal, runs on a BAA-covered provider that the site links to, not on the site. We are not lawyers, and we say so.',
      },
      {
        question: 'Who owns the domain?',
        answer:
          'You do. If we register it for you, it is registered in your name, and if you already have one we only point it at the site. Leaving us never means losing your address.',
      },
      {
        question: 'Can I cancel?',
        answer:
          'Yes. Hosting is monthly and stops at the end of the month you ask. We give you the site’s files and the domain settings, and nothing else on our side changes.',
      },
    ],
    relatedSlugs: ['website-care-plans', 'one-week-website', 'custom-website-design'],
    tileImage: {
      src: '/images/services/pexels-6889204.webp',
      alt: 'Hands typing on a laptop beside a mug of coffee',
      position: 'center 35%',
    },
    seo: {
      title: 'Website Hosting for therapists — wwisermind',
      description:
        'Managed hosting for therapist websites: a static build served from a global network, SSL and your domain included, every version kept, and support from the studio that built the site. Monthly, no contract.',
    },
  },

  /* --- 04 · Website Care Plans ---------------------------------------------- */
  {
    slug: 'website-care-plans',
    name: 'Website Care Plans',
    category: 'Website Design',
    heroOutcome:
      'Edits, updates and backups handled every month, so the site stays current while you stay in session.',

    gallery: {
      tall: {
        src: '/images/services/pexels-4240571.webp',
        alt: 'A woman writing at a desk beside a laptop and coffee',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-8473781.webp',
        alt: 'Hands typing on a laptop beside a mug and folders',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-4474047.webp',
        alt: 'A woman smiling at her laptop while writing a note',
        position: 'center 35%',
      },
      accent: 'You email. It is handled.',
    },

    intro: {
      paragraph:
        'A website is not finished at launch. Fees change, a clinician joins, a new group starts on Thursdays, and the software underneath gets updates. A care plan is a monthly arrangement in which we make those changes for you, keep the site fast, secure and backed up, and tell you in plain English what was done. You email; it is handled.',
      capabilities: [
        'Edits done for you',
        'New pages when needed',
        'Software kept updated',
        'Every version backed up',
        'Forms and booking checked',
        'Kept fast on phones',
        'Security handled for you',
        'Cancel any month',
      ],
    },

    pillars: [
      {
        icon: 'pen',
        title: 'Edits, done by us',
        body: 'A new fee, a changed opening hour, a clinician’s photo, a page for a new group: send it by email and it is live, usually by your next morning.',
      },
      {
        icon: 'shield',
        title: 'Kept updated and backed up',
        body: 'The framework under the site gets releases; we apply them, test the site and redeploy. Every version is kept, so nothing done can be undone by accident.',
      },
      {
        icon: 'clock',
        title: 'Checked, not just left running',
        body: 'We check that the forms send, the booking link books and the pages still load fast on a phone, because the day you notice something is broken is usually the day a client did first.',
      },
    ],

    whatWeDo: {
      heading: 'Three things a care plan takes off your desk',
      tabs: [
        {
          label: 'Edits',
          image: {
            src: '/images/services/pexels-4240571.webp',
            alt: 'A woman writing at a desk beside a laptop and coffee',
            position: 'center 35%',
          },
          heading: 'Send the change. It is live by your next morning.',
          paragraph:
            'A new fee, a changed hour, a clinician joining, a group ending. Email what has changed and we make the edit, check it on a phone and a desktop, and publish it. Usually before your first session.',
          claims: [
            'Text, photos, fees, hours',
            'New pages when needed',
            'Checked before publishing',
            'A note when it is done',
          ],
        },
        {
          label: 'Upkeep',
          image: {
            src: '/images/services/pexels-8473781.webp',
            alt: 'Hands typing on a laptop beside a mug and folders',
            position: 'center 35%',
          },
          heading: 'Updates applied, every version kept.',
          paragraph:
            'The framework under the site gets releases. We apply them, test every page and redeploy, so the site stays on a supported version. Every change is a versioned commit, so nothing is ever one bad edit from gone.',
          claims: [
            'Framework kept current',
            'Every page tested after',
            'Every version backed up',
            'Rollback in minutes',
          ],
        },
        {
          label: 'Checks',
          image: {
            src: '/images/services/pexels-4474047.webp',
            alt: 'A woman smiling at her laptop while writing a note',
            position: 'center 35%',
          },
          heading: 'The form still sends. The booking link still books.',
          paragraph:
            'A form that quietly stopped sending is the most expensive fault a practice site can have. We check the forms, the booking links and the page speed, and fix what has drifted before a client finds it.',
          claims: [
            'Forms tested',
            'Booking links tested',
            'Speed checked on a phone',
            'Fixed before you notice',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'Content edits',
        body: 'Text, photos, fees, hours, a new team member, a retired service. Email what has changed and we make the edit. Small changes are done by your next morning; larger ones get a date when you send them.',
      },
      {
        title: 'New pages',
        body: 'A new specialty page or clinician profile is designed to match the rest of the site, written with you and added to the sitemap. Something bigger, a second location or a redesign, is scoped separately so the plan stays predictable.',
      },
      {
        title: 'Updates and security',
        body: 'The site has no plugins to patch, but the framework under it does get releases. We apply them, test every page and redeploy, so the site stays on a version that is supported.',
      },
      {
        title: 'Backups and rollback',
        body: 'Every change is a versioned commit, so any earlier version of any page can be restored in minutes. Nothing is ever one bad edit away from gone.',
      },
      {
        title: 'Forms and booking checked',
        body: 'A form that quietly stopped sending is the most expensive fault a practice site can have. We check the forms and the booking links and fix them before a client finds out.',
      },
      {
        title: 'Support you can email',
        body: 'A studio address that reaches a person who knows your site. A reply within one business day, and a plain English note of what changed and when.',
      },
    ],

    whyChooseUs: {
      heading: 'Care from the people who built the site',
      image: {
        src: '/images/services/pexels-12912110.webp',
        alt: 'Hands writing in a notebook at a desk',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'We know what a fee page and an intake form have to get right, and we never need it explained.',
        },
        {
          icon: 'clock',
          title: 'Done while you sleep',
          body: 'A change sent after your last session is usually live before your first one.',
        },
        {
          icon: 'chat',
          title: 'Plain English, always',
          body: 'No ticket numbers, no changelogs. A sentence about what changed, and when.',
        },
        {
          icon: 'shield',
          title: 'Nothing to break in to',
          body: 'No admin login for you to protect and no plugin left unpatched; the site stays static and safe.',
        },
      ],
    },

    technology: {
      heading: 'What we keep up to date',
      items: ['nextjs', 'github', 'cloudflare'],
    },

    process: {
      heading: 'How a change gets made',
      image: {
        src: '/images/services/pexels-7606041.webp',
        alt: 'A woman gesturing while talking to her laptop',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'Email what has changed',
          body: 'A sentence is enough: the new fee, the new hours, the clinician who has joined. Attach a photo if there is one. No form, no portal, no ticket.',
        },
        {
          title: 'We make it, and check it',
          body: 'The change is made on a copy of the site first, checked on a phone and a desktop, and then published. Every version is kept, so it can always be put back.',
        },
        {
          title: 'You get a note',
          body: 'A plain email saying what changed and where to look. Usually it is waiting for you in the morning.',
        },
      ],
    },

    testimonials: {
      heading: 'What therapists say',
      paragraph:
        'The practices we look after are small and busy, so we ask for a sentence, not an essay. Here is what they said.',
      ids: ['matt-erdman'],
    },

    faqs: [
      {
        question: 'What counts as an edit?',
        answer:
          'Anything that changes what is already on the site: words, photos, fees, hours, a new team member on the team page, a service that has ended. A new page is a small piece of work we do within the plan; a second site or a redesign is scoped separately, so the plan stays predictable.',
      },
      {
        question: 'How fast are changes made?',
        answer:
          'Small edits are usually live by your next morning, because our working day in Pune is your night. Anything larger gets a date when you send it, and you hear from us when it is done.',
      },
      {
        question: 'Do I need a care plan if the site is static?',
        answer:
          'Not for security, mostly. A static site has no plugins to patch, and that is why we build them that way. A care plan is for the changes a practice makes every month and the checks nobody remembers to do: that the form still sends, that the booking link still books, that the pages still load fast on a phone.',
      },
      {
        question: 'Can I make edits myself?',
        answer:
          'Yes. Every site comes with a recorded walkthrough for text changes, and a care plan does not take that away. Most practices try it once and then decide their evening is better spent elsewhere.',
      },
      {
        question: 'Is hosting included?',
        answer:
          'Hosting is its own monthly plan and a care plan sits on top of it. They are kept separate so that each price is plain and you can drop either without touching the other.',
      },
      {
        question: 'Can I cancel?',
        answer:
          'Any month. There is no contract and no exit fee, and the site, its versions and its domain remain yours.',
      },
    ],
    relatedSlugs: ['website-hosting', 'ongoing-seo', 'copywriting'],
    tileImage: {
      src: '/images/services/pexels-8473781.webp',
      alt: 'Hands typing on a laptop beside a mug and folders',
      position: 'center 35%',
    },
    seo: {
      title: 'Website Care Plans for therapists — wwisermind',
      description:
        'A monthly care plan for your therapist website: edits done for you, software updated, every version backed up, forms and booking checked, and a reply within one business day. No contract.',
    },
  },

  /* --- 05 · Local SEO ------------------------------------------------------- */
  {
    slug: 'local-seo',
    name: 'Local SEO',
    category: 'Online Marketing',
    heroOutcome:
      'Show up in the map results when someone in your city searches for a therapist, and keep showing up.',

    gallery: {
      tall: {
        src: '/images/services/pexels-3800149.webp',
        alt: 'A man on a city street holding his phone',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-5647596.webp',
        alt: 'A hand holding a phone on a city street',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-3836820.webp',
        alt: 'A man in a suit reading his phone while a tram passes',
        position: 'center 35%',
      },
      accent: 'Found in your city. Not on page two.',
    },

    intro: {
      paragraph:
        'Most people looking for a therapist search with a place in mind: therapist in Denver, child psychologist near me, EMDR Portland. Google answers those with a map and three practices before it lists a single website. Local SEO is the work of getting your practice into that map for the searches that matter to you, and keeping it there: your Google Business Profile, your directory listings, the pages on your site about where you are and what you treat, and the reviews that decide which three practices are shown.',
      capabilities: [
        'Google Business Profile done',
        'Listed on the directories',
        'Location pages that rank',
        'Reviews asked for, ethically',
        'Same name and address everywhere',
        'Specialty by specialty',
        'Telehealth areas covered',
        'Tracked and reported plainly',
      ],
    },

    pillars: [
      {
        icon: 'target',
        title: 'The map, not just the list',
        body: 'Three practices are shown on the map before a single website is. Getting into that box, for your specialty and your part of town, is most of what local search is.',
      },
      {
        icon: 'clipboard',
        title: 'Every listing agreeing',
        body: 'Google trusts a practice whose name, address and phone read the same on Psychology Today, Zencare, its own site and its profile. We make them agree and keep them that way.',
      },
      {
        icon: 'chat',
        title: 'Reviews, asked for properly',
        body: 'Reviews decide which three practices are shown. We set up a way to ask that fits the ethics of your profession, and we never write or buy one.',
      },
    ],

    whatWeDo: {
      heading: 'Three things that decide the map',
      tabs: [
        {
          label: 'The profile',
          image: {
            src: '/images/services/pexels-3800149.webp',
            alt: 'A man on a city street holding his phone',
            position: 'center 35%',
          },
          heading: 'A Google Business Profile that is actually finished.',
          paragraph:
            'Most practice profiles are claimed and then left: no services, one photo, a category picked in a hurry. We fill in every field a client or Google reads, connect the booking link, and keep it current, because a profile that is updated is a profile that is shown.',
          claims: [
            'Every field filled in',
            'Categories and services right',
            'Telehealth and service areas set',
            'Booking link connected',
          ],
        },
        {
          label: 'The listings',
          image: {
            src: '/images/services/pexels-5647596.webp',
            alt: 'A hand holding a phone on a city street',
            position: 'center 35%',
          },
          heading: 'Every directory saying the same thing.',
          paragraph:
            'Psychology Today, Zencare, insurance directories, the old listing from a previous office: Google reads them all and trusts a practice whose details agree. We find every listing, fix the ones that differ, close the duplicates and keep them in step.',
          claims: [
            'Every listing found',
            'Name, address and phone matched',
            'Duplicates closed',
            'Specialties consistent',
          ],
        },
        {
          label: 'The pages and the reviews',
          image: {
            src: '/images/services/pexels-3836820.webp',
            alt: 'A man in a suit reading his phone while a tram passes',
            position: 'center 35%',
          },
          heading: 'Pages about your place, and reviews asked for properly.',
          paragraph:
            'A page for each office and each specialty someone might search for by place, and a way of asking for reviews that fits your ethics code. Together they are what moves a practice from the list into the map.',
          claims: [
            'A page per office and specialty',
            'Structured as a local practice',
            'An ethical way to ask for reviews',
            'Replies drafted for you',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'Google Business Profile',
        body: 'Claimed or set up, then filled in completely: categories, services, hours, telehealth, photos, the description and the booking link. Then kept current, because a profile left alone drifts down the map.',
      },
      {
        title: 'Directory listings',
        body: 'Psychology Today, Zencare and the other directories your clients use, each with the same name, address, phone and specialties. Old and duplicate listings found and fixed.',
      },
      {
        title: 'Location and specialty pages',
        body: 'A page on your site for each office and for each specialty a client might search for by place, written to say where you are and what you treat, and structured so Google can read it as a local practice.',
      },
      {
        title: 'Reviews',
        body: 'A short, ethical way to ask for reviews, a note on what a therapist can and cannot say in a reply, and replies drafted for you when one arrives.',
      },
      {
        title: 'Local structured data',
        body: 'The code on your pages that tells Google and the AI tools that this is a practice, where it is, what it treats and when it is open.',
      },
      {
        title: 'Tracking and a plain report',
        body: 'Where you appear on the map and in the results for the searches that matter, checked month by month, in a note you can read in two minutes.',
      },
    ],

    whyChooseUs: {
      heading: 'Local search, from people who only do it for practices',
      image: {
        src: '/images/services/pexels-7129718.webp',
        alt: 'A man on a balcony reading his phone',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'We know which directories matter for a practice and which are noise, before you tell us.',
        },
        {
          icon: 'shield',
          title: 'Inside your ethics code',
          body: 'Reviews asked for, and replied to, in a way your board would be comfortable reading.',
        },
        {
          icon: 'chat',
          title: 'A note, not a dashboard',
          body: 'Each month, two minutes of plain English on what changed and what is next.',
        },
        {
          icon: 'clock',
          title: 'Done while you sleep',
          body: 'We work from Pune, so listings are fixed and profiles updated between your sessions.',
        },
      ],
    },

    process: {
      heading: 'How local search gets put in order',
      image: {
        src: '/images/services/pexels-6874262.webp',
        alt: 'A woman standing in a living room reading a tablet',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'Look',
          body: 'We check where you appear today for the searches that matter in your area, and every listing that exists for the practice, including the ones you have forgotten.',
        },
        {
          title: 'Fix',
          body: 'The profile completed, the listings brought into agreement, duplicates closed, and the location and specialty pages written and put on the site.',
        },
        {
          title: 'Ask',
          body: 'A way to ask for reviews that fits your ethics code, set up with you, and a note on what a therapist can and cannot say in a reply.',
        },
        {
          title: 'Keep',
          body: 'The profile posted to and kept current, listings checked for drift, and a two-minute note each month on where you appear now.',
        },
      ],
    },

    faqs: [
      {
        question: 'What is Local SEO, in plain terms?',
        answer:
          'It is the work of showing up when someone searches for a therapist with a place attached: a city, a neighbourhood, or “near me”. Google answers those searches with a map and three practices first, and the map is decided by your Google Business Profile, your directory listings and your reviews more than by your website. Local SEO puts those in order.',
      },
      {
        question: 'I only see clients online. Does local search still matter?',
        answer:
          'Yes. Licences are by state or country, and people still search with a place in mind even when they expect to be seen on video. A Google Business Profile can list the areas you serve without an office address, and your pages can say where you are licensed. Being found in those places is the point.',
      },
      {
        question: 'Can you get me into the top three on the map?',
        answer:
          'Nobody can promise a position, and we do not. What we can do is the work that decides it: a complete profile, listings that agree, pages about your place and your specialties, and reviews asked for properly. Practices that do those things consistently are the ones the map shows.',
      },
      {
        question: 'Is it ethical for a therapist to ask for reviews?',
        answer:
          'It depends on your licensing board and ethics code, and we follow yours. In practice that usually means never asking a current client, never pressuring anyone, making it easy for those who want to, and replying without confirming that anyone is a client. We never write, buy or exchange reviews.',
      },
      {
        question: 'How long before I see a change?',
        answer:
          'Changes to your profile and listings usually show within weeks. Movement on the map takes longer and depends on how many practices are competing in your area. We do not put a number on it; we tell you each month what changed.',
      },
      {
        question: 'Do I need a new website for this?',
        answer:
          'Not usually. If your site can carry a location page and a specialty page, we work with it. If it cannot be edited or is too slow to rank, we say so before you spend a month on local work that the site would hold back.',
      },
      {
        question: 'How is this different from Ongoing SEO?',
        answer:
          'Local SEO is the map and the directories. Ongoing SEO is the whole picture every month: the pages, the answer boxes, the AI tools and the technical health of the site, with local work as one part of it. A practice that only wants to be found in its own city starts here.',
      },
    ],
    relatedSlugs: ['seo-audit', 'ongoing-seo', 'ai-search-optimization'],
    tileImage: {
      src: '/images/services/pexels-5647596.webp',
      alt: 'A hand holding a phone on a city street',
      position: 'center 35%',
    },
    seo: {
      title: 'Local SEO for therapists — wwisermind',
      description:
        'Local SEO for therapy practices: Google Business Profile completed, directory listings made consistent, location and specialty pages that rank, and reviews asked for ethically. Show up on the map in your city.',
    },
  },

  /* --- 06 · SEO Audit / Assessment ------------------------------------------ */
  {
    slug: 'seo-audit',
    name: 'SEO Audit / Assessment',
    category: 'Online Marketing',
    heroOutcome:
      'A written, honest read on why your practice is not being found, and what to fix first.',

    gallery: {
      tall: {
        src: '/images/services/pexels-5196821.webp',
        alt: 'A woman writing notes at a desk with a laptop and folders',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-7129624.webp',
        alt: 'A tablet in a hand, showing a page of text',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-4458257.webp',
        alt: 'A woman resting her head in her hands in front of a laptop',
        position: 'center 35%',
      },
      accent: 'What is wrong, and what to fix first.',
    },

    intro: {
      paragraph:
        'Before anyone spends a month on SEO, it is worth knowing what is actually wrong. An assessment is a one-off, written review of your website, your Google Business Profile and your directory listings, checked against what a client in your area types when they look for a therapist like you. You get a report in plain English: what is working, what is costing you clients, and what to fix first, in order. It is yours whether you hire us for the fixes, do them yourself, or hand it to someone else.',
      capabilities: [
        'The site checked technically',
        'Every page’s titles reviewed',
        'Local listings checked',
        'The searches clients use',
        'Competing practices compared',
        'AI answers checked too',
        'A written, ordered plan',
        'Yours, whoever does the work',
      ],
    },

    pillars: [
      {
        icon: 'search',
        title: 'Checked, not guessed',
        body: 'We look at what Google, Maps and the AI tools actually show for the searches that matter in your area, and at what your site gives them to work with.',
      },
      {
        icon: 'clipboard',
        title: 'Ordered, not exhaustive',
        body: 'A hundred findings is not a plan. The report says which handful of things matter, in the order to fix them, and which ones you can safely ignore.',
      },
      {
        icon: 'chat',
        title: 'Plain English, and honest',
        body: 'If your site is fine and the problem is elsewhere, the report says so. If the site needs rebuilding, it says that too, and why.',
      },
    ],

    whatWeDo: {
      heading: 'Three questions the assessment answers',
      tabs: [
        {
          label: 'Can you be found?',
          image: {
            src: '/images/services/pexels-5196821.webp',
            alt: 'A woman writing notes at a desk with a laptop and folders',
            position: 'center 35%',
          },
          heading: 'Whether Google can read the site at all.',
          paragraph:
            'Crawling, indexing, speed on a phone, broken links, missing titles and structured data. The technical layer that every ranking sits on, checked page by page.',
          claims: [
            'Crawl and index checked',
            'Speed on a phone',
            'Titles and descriptions',
            'Structured data',
          ],
        },
        {
          label: 'Who is found instead?',
          image: {
            src: '/images/services/pexels-7129624.webp',
            alt: 'A tablet in a hand, showing a page of text',
            position: 'center 35%',
          },
          heading: 'The searches that matter, and who wins them today.',
          paragraph:
            'What people in your area type when they look for what you treat, where you appear for each, and the three or four practices that take those searches, with what they do that you do not.',
          claims: [
            'The searches that matter',
            'Your position on each',
            'Competing practices compared',
            'The map and the AI answers',
          ],
        },
        {
          label: 'What to fix first?',
          image: {
            src: '/images/services/pexels-4458257.webp',
            alt: 'A woman resting her head in her hands in front of a laptop',
            position: 'center 35%',
          },
          heading: 'A fix list in order, not a hundred findings.',
          paragraph:
            'The report ends with the handful of things that matter, in the order to do them, written in plain English and yours to act on with us or without.',
          claims: [
            'Ordered by what matters',
            'Plain English',
            'Yours, whoever does the work',
            'A call to walk through it',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'Technical review',
        body: 'Whether Google can crawl and index the site, how fast it loads on a phone, broken links, missing pages, security, and anything in the build that gets in the way.',
      },
      {
        title: 'Page-by-page review',
        body: 'Titles, descriptions, headings and structured data on every page, and whether each page is about something a client might actually search for.',
      },
      {
        title: 'Local visibility',
        body: 'Your Google Business Profile and directory listings, checked for gaps, disagreements and duplicates, and where you appear on the map for the searches that matter.',
      },
      {
        title: 'The searches that matter',
        body: 'A short list of what people in your area actually type when they look for what you treat, and which of those you show up for today.',
      },
      {
        title: 'Competing practices',
        body: 'The three or four practices that take the searches you want, and what they do that you do not.',
      },
      {
        title: 'AI answers',
        body: 'What ChatGPT, Gemini and Perplexity say when asked for a therapist like you nearby, and whether your practice is in the answer.',
      },
      {
        title: 'The report, and a call',
        body: 'A written report with the fix list in order, and a call to walk through it. It is yours to act on, with us or without.',
      },
    ],

    whyChooseUs: {
      heading: 'An assessment written to be acted on',
      image: {
        src: '/images/services/pexels-19342306.webp',
        alt: 'A woman writing in a notebook by candlelight',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'We know what a practice site has to get right, so the report is about your practice, not about websites in general.',
        },
        {
          icon: 'search',
          title: 'Checked in three places',
          body: 'Google, the map and the AI tools, asked the way a client would ask.',
        },
        {
          icon: 'chat',
          title: 'Honest, whichever way it goes',
          body: 'If the site is fine, the report says so. If it needs rebuilding, it says that.',
        },
        {
          icon: 'pen',
          title: 'Ordered, not exhaustive',
          body: 'The handful of things that matter, in the order to do them, and the rest set aside.',
        },
      ],
    },

    process: {
      heading: 'From your web address to a fix list',
      image: {
        src: '/images/services/pexels-4031821.webp',
        alt: 'A woman on a video call at a laptop by a window',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'Send the details',
          body: 'Your website address, the specialties you most want clients for, the areas you serve, and read-only access to your Google profile and Search Console if you have them.',
        },
        {
          title: 'We check',
          body: 'The site, the profile, the directories, the searches people in your area use, the practices that currently win them, and what the AI tools answer.',
        },
        {
          title: 'The report',
          body: 'A written report in plain English: what is working, what is costing you clients, and the fix list in order.',
        },
        {
          title: 'The call',
          body: 'We walk through it together and answer questions. What happens next is yours to decide, with us or without.',
        },
      ],
    },

    faqs: [
      {
        question: 'How is this different from the free website review?',
        answer:
          'The free review looks at your website and tells you what stands out. The assessment goes further: your Google Business Profile, the directories, the searches people in your area use, the practices that currently win them and what the AI tools say, and it ends with a fix list in order rather than a set of observations.',
      },
      {
        question: 'What do you need from me?',
        answer:
          'Your website address, the specialties you most want clients for, the areas you serve, and, if you have them, access to your Google Business Profile and Google Search Console. Read-only access is enough. If you have neither, we work from the outside.',
      },
      {
        question: 'How long does it take?',
        answer:
          'We put a date on it when you send the details, and we keep to it. It is a fixed piece of work with a written result, not an open-ended engagement.',
      },
      {
        question: 'Will you try to sell me something at the end?',
        answer:
          'The report ends with a fix list. If you want us to do it, One Time SEO covers the fixes and Ongoing SEO carries on from there. If you would rather do it yourself or give it to someone else, the report is written so that you can. Nothing in it depends on hiring us.',
      },
      {
        question: 'Do you check the AI tools too?',
        answer:
          'Yes. A growing share of clients ask ChatGPT, Gemini or Perplexity for a therapist rather than searching. We ask them the way a client would, note whether your practice is in the answer and who is instead, and what the answer is drawing on.',
      },
      {
        question: 'Is an assessment worth it if I already know my site is bad?',
        answer:
          'Sometimes not. If the site is old, slow and thin, a rebuild is the fix and an assessment would only tell you that at length. Tell us what you have on a call and we will say which is the honest route.',
      },
    ],
    relatedSlugs: ['one-time-seo', 'local-seo', 'ongoing-seo'],
    tileImage: {
      src: '/images/services/pexels-7129624.webp',
      alt: 'A tablet in a hand, showing a page of text',
      position: 'center 35%',
    },
    seo: {
      title: 'SEO Audit and Assessment for therapists — wwisermind',
      description:
        'A one-off written SEO assessment of your therapy practice: the website, Google Business Profile, directory listings, the searches clients use and the AI answers, with a fix list in order. Plain English, yours to act on.',
    },
  },

  /* --- 07 · One Time SEO ---------------------------------------------------- */
  {
    slug: 'one-time-seo',
    name: 'One Time SEO',
    category: 'Online Marketing',
    heroOutcome:
      'The technical and on-page foundation fixed once, properly, so your site can be found from then on.',

    gallery: {
      tall: {
        src: '/images/services/pexels-7964254.webp',
        alt: 'Hands typing on a laptop beside a cup of coffee',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-5447949.webp',
        alt: 'A person typing on a laptop with a takeaway coffee in hand',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-1586996.webp',
        alt: 'A man at a tidy desk with a laptop and a lamp',
        position: 'center 35%',
      },
      accent: 'Fixed once. Written down.',
    },

    intro: {
      paragraph:
        'Most therapist websites have the same handful of problems: pages with no titles, a Google Business Profile half filled in, no structured data, a home page about everything and inner pages about nothing, and a form that loads slowly on a phone. One Time SEO fixes that list once, as a fixed piece of work with a start and an end. It is the assessment’s fix list, done, for a practice that wants the foundation right without signing up for every month.',
      capabilities: [
        'Titles and descriptions fixed',
        'Structured data added',
        'Every page made indexable',
        'Speed fixed on phones',
        'Google Business Profile completed',
        'Listings made consistent',
        'Sitemap submitted',
        'A start and an end',
      ],
    },

    pillars: [
      {
        icon: 'bolt',
        title: 'Once, properly',
        body: 'A fixed list of fixes, done in one pass and checked. No monthly retainer, and nothing left half done for later.',
      },
      {
        icon: 'search',
        title: 'The things that block being found',
        body: 'Crawling, indexing, titles, structure, speed. The unglamorous foundation every ranking sits on, and the part most practice sites are missing.',
      },
      {
        icon: 'clipboard',
        title: 'Written down when done',
        body: 'A note of every change made and why, so whoever looks after the site next, including you, knows what is there.',
      },
    ],

    whatWeDo: {
      heading: 'Three layers, fixed in one pass',
      tabs: [
        {
          label: 'Technical',
          image: {
            src: '/images/services/pexels-7964254.webp',
            alt: 'Hands typing on a laptop beside a cup of coffee',
            position: 'center 35%',
          },
          heading: 'The site made readable to Google.',
          paragraph:
            'Indexing, redirects, broken links, the sitemap, mobile speed. The faults that stop Google from reading the site properly, fixed and then checked.',
          claims: [
            'Indexing and sitemap',
            'Redirects and broken links',
            'Speed on a phone',
            'Google asked to recrawl',
          ],
        },
        {
          label: 'On the page',
          image: {
            src: '/images/services/pexels-5447949.webp',
            alt: 'A person typing on a laptop with a takeaway coffee in hand',
            position: 'center 35%',
          },
          heading: 'Every page about one thing, and titled for it.',
          paragraph:
            'Titles and descriptions written for each page, headings that say what the page is, and structured data that tells Google and the AI tools what the practice is and does.',
          claims: [
            'Titles and descriptions',
            'Headings and structure',
            'Structured data',
            'Wording shown before it goes live',
          ],
        },
        {
          label: 'Off the site',
          image: {
            src: '/images/services/pexels-1586996.webp',
            alt: 'A man at a tidy desk with a laptop and a lamp',
            position: 'center 35%',
          },
          heading: 'The profile and the listings brought into line.',
          paragraph:
            'Google Business Profile completed and the main directory listings brought into agreement with it and with the site, so every source says the same thing.',
          claims: [
            'Profile completed',
            'Listings made consistent',
            'Duplicates closed',
            'A handover note at the end',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'Technical fixes',
        body: 'Indexing, redirects, broken links, the sitemap, mobile speed, and anything in the build that stops Google from reading the site properly.',
      },
      {
        title: 'Every page’s title and description',
        body: 'Written for each page, for what a client would search for and for the practice it belongs to. No keyword stuffing; the lines Google shows should read like you.',
      },
      {
        title: 'Page structure and headings',
        body: 'Each page made to be about one thing, with headings that say what it is, so the OCD page can rank for OCD and the home page stops trying to rank for everything.',
      },
      {
        title: 'Structured data',
        body: 'The code that tells Google and the AI tools that this is a practice, who runs it, where it is, what it treats and how to book.',
      },
      {
        title: 'Google Business Profile and listings',
        body: 'The profile completed, and the main directory listings brought into agreement with it and with the site.',
      },
      {
        title: 'A handover note',
        body: 'What was changed, where and why, plus the two or three things worth doing next, whether with us or not.',
      },
    ],

    whyChooseUs: {
      heading: 'A fixed piece of work, done properly',
      image: {
        src: '/images/services/pexels-4065625.webp',
        alt: 'A woman at a desk among plants',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'bolt',
          title: 'A start and an end',
          body: 'A fixed list of fixes with a date on it, and no retainer waiting at the end.',
        },
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'The same handful of problems on most practice sites, and we know them by heart.',
        },
        {
          icon: 'chat',
          title: 'Every change explained',
          body: 'You see each wording change before it goes live, and get a note of everything done.',
        },
        {
          icon: 'clock',
          title: 'Done while you sleep',
          body: 'We work from Pune, so the fixes go in between your sessions, not during them.',
        },
      ],
    },

    process: {
      heading: 'How the foundation gets fixed',
      image: {
        src: '/images/services/pexels-4458602.webp',
        alt: 'A woman seen from behind at a desk with a laptop and plants',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'Scope',
          body: 'From your assessment, or from a short check of the site if you have none. A fixed list of fixes and a date, agreed before anything starts.',
        },
        {
          title: 'Fix',
          body: 'Technical issues, titles and descriptions, page structure, structured data, the profile and the listings. Wording changes shown to you before they go live.',
        },
        {
          title: 'Check',
          body: 'Every page tested on a phone and a desktop, the sitemap submitted, and Google asked to recrawl.',
        },
        {
          title: 'Hand over',
          body: 'A note of what was changed, where and why, and the two or three things worth doing next.',
        },
      ],
    },

    faqs: [
      {
        question: 'Do I need an assessment first?',
        answer:
          'Not always. If you have one, its fix list is the scope. If you do not, we look at the site before quoting and the short check is part of the work. An assessment is worth it when you want the full picture before deciding anything.',
      },
      {
        question: 'How is this different from Ongoing SEO?',
        answer:
          'This has an end. Ongoing SEO is the month-by-month work of writing pages, keeping listings current, earning links and watching the AI answers. Many practices do the one-time fixes first and decide about the ongoing work later, once the foundation is in place.',
      },
      {
        question: 'Can you do this on a site you did not build?',
        answer:
          'Usually, for titles, descriptions, structure, structured data and listings. Speed and some technical fixes depend on the platform the site is on, and if something cannot be fixed on yours we say so before starting rather than after.',
      },
      {
        question: 'Will it change how my site looks?',
        answer:
          'Mostly no. Titles and descriptions are invisible on the page itself. Headings and page structure may be edited, and you see every wording change before it goes live.',
      },
      {
        question: 'Will my rankings go up?',
        answer:
          'A site Google can read properly does better than one it cannot, but nobody can promise a position and we do not. What we promise is that the foundation is done, checked and written down.',
      },
      {
        question: 'What happens after?',
        answer:
          'Nothing you have to do. The site is left in order with a note of what was done. If you want the ongoing work later, that is a separate monthly plan you can start or stop any month.',
      },
    ],
    relatedSlugs: ['seo-audit', 'ongoing-seo', 'website-care-plans'],
    tileImage: {
      src: '/images/services/pexels-5447949.webp',
      alt: 'A person typing on a laptop with a takeaway coffee in hand',
      position: 'center 35%',
    },
    seo: {
      title: 'One Time SEO for therapists — wwisermind',
      description:
        'A one-off SEO fix for your therapy practice website: titles, structure, structured data, indexing, mobile speed, Google Business Profile and listings, done once and written down. No monthly retainer.',
    },
  },

  /* --- 08 · Ongoing SEO / AEO / GEO ----------------------------------------- */
  {
    slug: 'ongoing-seo',
    name: 'Ongoing SEO / AEO / GEO',
    category: 'Online Marketing',
    heroOutcome:
      'Google, Maps and the AI answers worked on every month, with a plain-English note on what changed.',

    gallery: {
      tall: {
        src: '/images/services/pexels-4152788.webp',
        alt: 'A woman on the phone at a desk surrounded by plants',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-3059747.webp',
        alt: 'A woman writing in a notebook in front of a computer',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-6159189.webp',
        alt: 'A hand writing in a notebook at a table',
        position: 'center 35%',
      },
      accent: 'Google, Maps and AI. Every month.',
    },

    intro: {
      paragraph:
        'Clients now find a therapist three ways: a Google search, the map, and a question typed into ChatGPT, Gemini or Perplexity. Ongoing SEO is the monthly work of showing up in all three. SEO for the search results, AEO for the answer boxes Google now puts above them, GEO for the AI tools that recommend practices by name. Every month there is a short plan, work done against it, and a note you can read in two minutes on what moved.',
      capabilities: [
        'Pages written every month',
        'Local listings kept current',
        'AI answers watched',
        'Answer boxes targeted',
        'Links earned honestly',
        'Technical health checked',
        'A plain monthly report',
        'Cancel any month',
      ],
    },

    pillars: [
      {
        icon: 'search',
        title: 'Search, answers and AI together',
        body: 'One plan for the three places a client looks, because the same page, written well and structured properly, serves all of them.',
      },
      {
        icon: 'pen',
        title: 'Pages a client would actually read',
        body: 'A page on what to expect in a first EMDR session does more for you than a hundred words on ten pages. We write the pages; you check them clinically.',
      },
      {
        icon: 'clock',
        title: 'Steady, not spiky',
        body: 'Search rewards a practice that publishes, tidies and asks for reviews every month, not one that does it all in January.',
      },
    ],

    whatWeDo: {
      heading: 'Three places a client looks, one plan',
      tabs: [
        {
          label: 'Search',
          image: {
            src: '/images/services/pexels-4152788.webp',
            alt: 'A woman on the phone at a desk surrounded by plants',
            position: 'center 35%',
          },
          heading: 'Pages a client would search for, written every month.',
          paragraph:
            'A specialty page, an answer to a question clients actually ask, an article on what a first session is like. Written in your voice, checked by you for clinical accuracy, and added to a site whose technical health we watch each month.',
          claims: [
            'Pages written in your voice',
            'Clinically checked by you',
            'Technical health watched',
            'Links earned, never bought',
          ],
        },
        {
          label: 'Answers',
          image: {
            src: '/images/services/pexels-3059747.webp',
            alt: 'A woman writing in a notebook in front of a computer',
            position: 'center 35%',
          },
          heading: 'Showing up in the answer, not just the list.',
          paragraph:
            'Google now answers many questions directly, above the results. We structure pages so a direct answer can be lifted from them, and keep your profile and listings current so the map keeps showing you.',
          claims: [
            'Structured for direct answers',
            'Profile kept current',
            'Listings checked for drift',
            'Reviews replied to',
          ],
        },
        {
          label: 'AI',
          image: {
            src: '/images/services/pexels-6159189.webp',
            alt: 'A hand writing in a notebook at a table',
            position: 'center 35%',
          },
          heading: 'Being the practice the AI tools name.',
          paragraph:
            'We ask ChatGPT, Gemini and Perplexity for a therapist the way a client would, every month, and keep the sources they draw from accurate. When the answer changes, you hear about it in the monthly note.',
          claims: [
            'AI answers checked monthly',
            'Sources kept accurate',
            'Changes reported plainly',
            'The same pages, doing double duty',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'A monthly plan',
        body: 'Each month starts with a short list of what will be done: which pages, which listings, which searches we are aiming at. You see it before the work starts.',
      },
      {
        title: 'Content, written for you',
        body: 'Specialty pages, FAQ answers and articles on the questions your clients actually ask, written in your voice and checked by you for clinical accuracy before they go live.',
      },
      {
        title: 'Answer engine optimisation',
        body: 'Pages structured so Google can lift a direct answer from them into the boxes above the results, and so an assistant can read them aloud correctly.',
      },
      {
        title: 'Generative engine optimisation',
        body: 'What ChatGPT, Gemini and Perplexity say about your practice, checked monthly, and the sources they draw from kept accurate and current.',
      },
      {
        title: 'Local upkeep',
        body: 'Google Business Profile posts, hours, services and photos kept current, reviews replied to, and directory listings checked for drift.',
      },
      {
        title: 'Links and mentions',
        body: 'Directories, local organisations, professional bodies and referral partners that link to you because it makes sense. Never bought.',
      },
      {
        title: 'Technical health',
        body: 'Indexing, speed and errors checked each month and fixed as part of the plan, so nothing quietly undoes the rest.',
      },
      {
        title: 'A plain report',
        body: 'What was done, what moved, what is next. Two minutes to read, and no dashboard to log in to.',
      },
    ],

    whyChooseUs: {
      heading: 'Monthly work you can actually see',
      image: {
        src: '/images/services/pexels-12912121.webp',
        alt: 'A woman waving at her laptop in a sunny room',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'We know what clients search for and what a practice can ethically say, before you tell us.',
        },
        {
          icon: 'pen',
          title: 'You see the plan first',
          body: 'Each month starts with a short list of what will be done. Nothing is a surprise.',
        },
        {
          icon: 'chat',
          title: 'A note, not a dashboard',
          body: 'What was done, what moved, what is next. Two minutes to read.',
        },
        {
          icon: 'clock',
          title: 'No contract',
          body: 'Billed monthly, stopped at the end of any month, and everything written stays on your site.',
        },
      ],
    },

    process: {
      heading: 'What a month looks like',
      image: {
        src: '/images/services/pexels-9708512.webp',
        alt: 'A man reading on a sofa in a plant-filled room',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'The plan',
          body: 'A short list of what will be done this month: which pages, which listings, which searches we are aiming at. Sent to you before the work starts.',
        },
        {
          title: 'The work',
          body: 'Pages written and sent to you for a clinical check, the profile and listings updated, technical issues fixed, the AI answers checked.',
        },
        {
          title: 'The note',
          body: 'At the end of the month, what was done, what moved, and what is next. Two minutes of plain English.',
        },
      ],
    },

    faqs: [
      {
        question: 'What do AEO and GEO mean?',
        answer:
          'SEO is showing up in the list of search results. AEO, answer engine optimisation, is showing up in the direct answers Google now places above that list. GEO, generative engine optimisation, is being the practice an AI tool names when someone asks it for a therapist. They overlap a great deal, which is why one plan covers all three.',
      },
      {
        question: 'How long until it works?',
        answer:
          'Months rather than weeks, and it depends on where you start and how many practices compete in your area. We do not put a number on it. What you get instead is a monthly note on what was done and what moved, so you can judge for yourself.',
      },
      {
        question: 'Do I have to write anything?',
        answer:
          'No. We write every page and article from a short conversation and your existing site, in your voice. You read each one before it goes live and check that it is clinically accurate. That is the only part we cannot do for you.',
      },
      {
        question: 'Do you guarantee rankings?',
        answer:
          'No, and be wary of anyone who does. Google and the AI tools decide; we do the work that is known to matter and report honestly on the result.',
      },
      {
        question: 'Is there a contract?',
        answer:
          'No. It is billed monthly and you can stop at the end of any month. Everything written for the site stays on it, and the listings stay yours.',
      },
      {
        question: 'Does this include Local SEO?',
        answer:
          'Yes. The local upkeep is one part of the monthly plan. Local SEO on its own is for a practice that only wants the map and the directories put in order.',
      },
      {
        question: 'My site was not built by you. Can you still do this?',
        answer:
          'Usually, as long as pages can be added and edited. Some platforms limit what can be done on speed and structure, and we say so on the first call rather than a month in.',
      },
    ],
    relatedSlugs: ['local-seo', 'ai-search-optimization', 'copywriting'],
    tileImage: {
      src: '/images/services/pexels-3059747.webp',
      alt: 'A woman writing in a notebook in front of a computer',
      position: 'center 35%',
    },
    seo: {
      title: 'Ongoing SEO, AEO and GEO for therapists — wwisermind',
      description:
        'Monthly SEO for therapy practices: pages written in your voice, local listings kept current, answer boxes and AI recommendations worked on, technical health checked, and a plain report each month. No contract.',
    },
  },

  /* --- 09 · Copywriting ----------------------------------------------------- */
  {
    slug: 'copywriting',
    name: 'Copywriting',
    category: 'Online Marketing',
    heroOutcome:
      'Every page written to sound like you and speak to someone in distress, so the right clients know they have found you.',

    gallery: {
      tall: {
        src: '/images/services/pexels-7176027.webp',
        alt: 'A therapist gesturing while talking with a client',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-5336965.webp',
        alt: 'A man in an armchair listening to his psychologist',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-6255877.webp',
        alt: 'A psychologist and a client talking on a sofa',
        position: 'center 35%',
      },
      accent: 'Sounds like you. Speaks to them.',
    },

    intro: {
      paragraph:
        'The person reading your website is often anxious, tired, and deciding in about a minute whether to trust you. Most therapist sites answer with a paragraph about modalities. Copywriting is us writing your pages, from one conversation with you, in plain language that speaks to that person: what you help with, what a first session is like, what it costs, and how to book. Clinically accurate, warm without being soft, and written so that Google and the AI tools can read it too.',
      capabilities: [
        'Written from one conversation',
        'In your voice, not ours',
        'Speaks to the client',
        'Clinically checked by you',
        'Written to be found',
        'A profile per clinician',
        'Fees and FAQs made plain',
        'Two rounds of review',
      ],
    },

    pillars: [
      {
        icon: 'chat',
        title: 'To the person, not the profession',
        body: 'A client does not search for evidence-based modalities. They search for “I can’t stop worrying”. The copy meets them where they are, and earns the right to explain the method later.',
      },
      {
        icon: 'pen',
        title: 'Your voice, kept',
        body: 'We interview you and write from the transcript, so the site reads like the person a client will meet in the room. You never have to write it yourself.',
      },
      {
        icon: 'search',
        title: 'Readable by Google and AI too',
        body: 'Plain, specific, well-structured copy is what search engines and AI tools understand best. Writing for the reader and writing to be found are the same job.',
      },
    ],

    whatWeDo: {
      heading: 'Three things the words have to do',
      tabs: [
        {
          label: 'Speak to the client',
          image: {
            src: '/images/services/pexels-7176027.webp',
            alt: 'A therapist gesturing while talking with a client',
            position: 'center 35%',
          },
          heading: 'Written for the person reading at 2am.',
          paragraph:
            'The reader is often anxious and deciding quickly. The copy names what they are going through in their words, says plainly how you help, and makes the next step obvious. The method gets explained, but not first.',
          claims: [
            'Their words, not the textbook’s',
            'One clear next step per page',
            'Fees and FAQs made plain',
            'Warm without being soft',
          ],
        },
        {
          label: 'Sound like you',
          image: {
            src: '/images/services/pexels-5336965.webp',
            alt: 'A man in an armchair listening to his psychologist',
            position: 'center 35%',
          },
          heading: 'Written from your interview, not a template.',
          paragraph:
            'One conversation with you, and a short one with each clinician, is what we write from. The transcript is the source, so the site reads like the person a client will meet, and the profiles sound like the people they belong to.',
          claims: [
            'Interviews, not questionnaires',
            'A voice note agreed first',
            'A profile per clinician',
            'Two rounds of your review',
          ],
        },
        {
          label: 'Be found',
          image: {
            src: '/images/services/pexels-6255877.webp',
            alt: 'A psychologist and a client talking on a sofa',
            position: 'center 35%',
          },
          heading: 'Plain copy is what Google and AI read best.',
          paragraph:
            'Each page is about one thing a client might search for, with a title and description written for it. Nothing is stuffed or repeated; specific, well-structured writing is what search engines and AI tools understand.',
          claims: [
            'One subject per page',
            'Titles and descriptions written',
            'Directory profiles to match',
            'Structured for AI answers',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'A voice and structure note',
        body: 'Before the first draft, a one-page note on how the site should sound and what each page is for, agreed with you so the drafts start from the right place.',
      },
      {
        title: 'Website pages',
        body: 'Home, about, each specialty, fees and insurance, FAQ and contact, written from your interview. Every page with one job and a clear next step.',
      },
      {
        title: 'Clinician profiles',
        body: 'A profile for each clinician, from a short conversation with each, that sounds like them and says plainly what they treat and who they are for.',
      },
      {
        title: 'Directory profiles',
        body: 'Psychology Today, Zencare and your Google Business Profile description, written to match the site and to fit each directory’s limits.',
      },
      {
        title: 'Titles and descriptions',
        body: 'The lines Google shows in its results, written for each page so they read like you and say what the page is for.',
      },
      {
        title: 'Two rounds of review',
        body: 'You read a full draft, mark what is not you, and we revise. Then once more. Clinical accuracy is yours to check; the words are ours to get right.',
      },
    ],

    whyChooseUs: {
      heading: 'Words from people who only write for practices',
      image: {
        src: '/images/services/pexels-18809829.webp',
        alt: 'A woman in a pink blazer smiling on a porch',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'Sliding scales, superbills, intake, telehealth across state lines: we know what the page has to say.',
        },
        {
          icon: 'chat',
          title: 'You check the clinical part',
          body: 'We get the words right; you confirm every clinical statement before it goes live.',
        },
        {
          icon: 'pen',
          title: 'Two rounds, both explained',
          body: 'A full draft, your marks, a revision, and once more. No jargon in between.',
        },
        {
          icon: 'clock',
          title: 'Drafts while you sleep',
          body: 'We work from Pune, so a draft sent after your last session is revised by your first.',
        },
      ],
    },

    process: {
      heading: 'From one conversation to every page',
      image: {
        src: '/images/services/pexels-14797769.webp',
        alt: 'A woman in an armchair with a pen, talking',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'The conversation',
          body: 'About an hour on video, in your timezone, about who you help, how you work, and what you say to someone new. Shorter ones with each clinician if there are several.',
        },
        {
          title: 'The voice note',
          body: 'A one-page note on how the site should sound and what each page is for, agreed with you before the first draft.',
        },
        {
          title: 'The draft',
          body: 'Every page, written and sent as one document. You mark what is not you and check the clinical statements.',
        },
        {
          title: 'The revision, and once more',
          body: 'We revise, you read again, and the words go on the site, with titles and descriptions written for each page.',
        },
      ],
    },

    faqs: [
      {
        question: 'Do I have to write anything?',
        answer:
          'No. One conversation of about an hour, and a shorter one with each clinician if there are several, is what we write from. You read the drafts and mark what is not you. If you have already written something, we can edit that into shape instead.',
      },
      {
        question: 'How can you write about my work without being a clinician?',
        answer:
          'We write for the client, not the clinician, and that is a different job from knowing the method. We interview you, we listen for how you explain things to someone new, and we write that down plainly. You check every clinical statement before it goes live.',
      },
      {
        question: 'Can you write for a group practice?',
        answer:
          'Yes. Each clinician gets a short conversation and a profile in their own voice, and the practice pages are written to hold the whole team together without sounding like a brochure.',
      },
      {
        question: 'Will the copy be written for search?',
        answer:
          'Yes, and without it reading that way. Each page is about one thing a client might search for, with a title and a description written for it. Copy that speaks plainly to a person is also what Google and the AI tools understand best.',
      },
      {
        question: 'Is copywriting included with your website services?',
        answer:
          'It is. The One Week Website and Custom Website Design both include the words. This service is for a practice keeping its current site and replacing the copy, adding pages, or fixing its profiles on the directories.',
      },
      {
        question: 'What about blog posts and articles?',
        answer:
          'Those are part of Ongoing SEO, where they are written every month against a plan. If you only want a handful, tell us on the call and we will scope them with the pages.',
      },
    ],
    relatedSlugs: ['custom-website-design', 'one-week-website', 'ongoing-seo'],
    tileImage: {
      src: '/images/services/pexels-5336965.webp',
      alt: 'A man in an armchair listening to his psychologist',
      position: 'center 35%',
    },
    seo: {
      title: 'Copywriting for therapists — wwisermind',
      description:
        'Website and directory copy for therapy practices, written from one conversation in your voice: pages that speak to someone in distress, clinician profiles, fees and FAQs made plain, and titles written to be found.',
    },
  },

  /* --- 10 · Meta Ads -------------------------------------------------------- */
  {
    slug: 'meta-ads',
    name: 'Meta Ads',
    category: 'Online Marketing',
    heroOutcome:
      'Facebook and Instagram ads that reach the people in your area looking for a therapist, and no one else.',

    gallery: {
      tall: {
        src: '/images/services/pexels-920382.webp',
        alt: 'A woman on a sofa smiling at her phone with a laptop on her lap',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-5311713.webp',
        alt: 'A woman on a couch reading her phone',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-6594304.webp',
        alt: 'A woman lying down looking at her phone',
        position: 'center 35%',
      },
      accent: 'The right families. Your area.',
    },

    intro: {
      paragraph:
        'Search finds people who are already looking. Meta ads reach the ones who have not searched yet: the parent scrolling at 11pm who has been meaning to find someone for their teenager, the couple who keep putting it off. We run Facebook and Instagram ads for practices, inside the rules Meta sets for health advertising and the ethics your profession sets for you, to a small area, on a budget you set, with a landing page written to turn the click into a consultation.',
      capabilities: [
        'Facebook and Instagram',
        'Your area, your specialty',
        'A budget set by you',
        'Ads written in your voice',
        'A landing page that books',
        'Health ad rules followed',
        'No health data shared',
        'Reported plainly each month',
      ],
    },

    pillars: [
      {
        icon: 'target',
        title: 'A small area, the right people',
        body: 'Ads shown in the towns you serve, to the people most likely to be looking, for the specialties you most want. Not the whole city, and not everyone in it.',
      },
      {
        icon: 'shield',
        title: 'Within the rules, and the ethics',
        body: 'Meta restricts how health services target and what an ad can imply. Your ethics code restricts more. The ads are written and set up inside both, and tracked without health information leaving your site.',
      },
      {
        icon: 'calendar',
        title: 'Judged on consultations, not clicks',
        body: 'A click that does not book is a cost. Every ad points to a page written to turn interest into a booked consultation, and that is the number we report.',
      },
    ],

    whatWeDo: {
      heading: 'Three things that make an ad worth running',
      tabs: [
        {
          label: 'The audience',
          image: {
            src: '/images/services/pexels-920382.webp',
            alt: 'A woman on a sofa smiling at her phone with a laptop on her lap',
            position: 'center 35%',
          },
          heading: 'A small area, and the people most likely to be looking.',
          paragraph:
            'Ads shown in the towns you serve, for the specialties you most want, to the people whose age, stage and interests suggest they are the ones looking. Never targeted by health condition, because Meta does not allow it and your ethics code would not either.',
          claims: [
            'Your towns, not the whole city',
            'By life stage and interest',
            'Never by health condition',
            'Budget set by you',
          ],
        },
        {
          label: 'The ad',
          image: {
            src: '/images/services/pexels-5311713.webp',
            alt: 'A woman on a couch reading her phone',
            position: 'center 35%',
          },
          heading: 'Calm words, in your voice, in several versions.',
          paragraph:
            'The ad says what you help with in the words a client would use, with images that are calm rather than clinical. We run several versions and keep the ones people respond to.',
          claims: [
            'Written in your voice',
            'Inside Meta’s health rules',
            'Several versions tested',
            'Weak ones paused',
          ],
        },
        {
          label: 'The page',
          image: {
            src: '/images/services/pexels-6594304.webp',
            alt: 'A woman lying down looking at her phone',
            position: 'center 35%',
          },
          heading: 'One page, built to turn the click into a consultation.',
          paragraph:
            'The ad lands on a page that says what you help with, what happens next and how to book, and nothing else. Tracking is arranged so no health information leaves your site, and the number we report is consultations, not clicks.',
          claims: [
            'One page, one next step',
            'Booking connected',
            'No health data to Meta',
            'Reported as consultations',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'Setup',
        body: 'The ad account, the audiences and the tracking, set up properly or tidied if they already exist, with tracking arranged so no health information is sent to Meta.',
      },
      {
        title: 'Ads written and designed',
        body: 'Words in your voice and images that are calm rather than clinical, in several versions, so we learn which one people respond to rather than guessing.',
      },
      {
        title: 'A landing page',
        body: 'One page built for the ad that says what you help with, what happens next and how to book, and nothing else.',
      },
      {
        title: 'Targeting and budget',
        body: 'Your area, the specialties you want, and a monthly budget you set and can change. We recommend a starting point; you decide.',
      },
      {
        title: 'Monthly management',
        body: 'Ads checked, the weak ones paused, new versions tested, and the budget moved toward what is working.',
      },
      {
        title: 'A plain report',
        body: 'What was spent, what it brought in consultations, and what we are changing next month. Two minutes to read.',
      },
    ],

    whyChooseUs: {
      heading: 'Ads run the way a practice would want them run',
      image: {
        src: '/images/services/pexels-5217850.webp',
        alt: 'Two women talking in a plant-filled room',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'We know what Meta allows a health service to say and what your board allows you to say.',
        },
        {
          icon: 'shield',
          title: 'No health data shared',
          body: 'Tracking arranged so nothing about who visited which page reaches Meta.',
        },
        {
          icon: 'calendar',
          title: 'Consultations, not clicks',
          body: 'The number in the monthly note is bookings, because that is the one that matters.',
        },
        {
          icon: 'chat',
          title: 'Honest about whether to run them',
          body: 'If ads are not the right move for your practice yet, we say so on the first call.',
        },
      ],
    },

    process: {
      heading: 'How a campaign gets set up and run',
      image: {
        src: '/images/services/pexels-12903018.webp',
        alt: 'A woman laughing at a desk in a bright office',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'The call',
          body: 'Your area, your specialties, room in your calendar, and whether ads are the right move at all. A recommended starting budget; you decide the number.',
        },
        {
          title: 'Setup',
          body: 'The ad account and audiences, tracking arranged so no health information leaves your site, the ads written in several versions, and the landing page built.',
        },
        {
          title: 'Launch and manage',
          body: 'Ads live in your area. Each week, weak versions paused, new ones tested, budget moved toward what is booking.',
        },
        {
          title: 'The note',
          body: 'Each month, what was spent, what it brought in consultations, and what changes next. Two minutes to read.',
        },
      ],
    },

    faqs: [
      {
        question: 'Do ads work for therapists?',
        answer:
          'For some practices, for some specialties. They work best when there is a clear specialty, a defined area and room in the calendar. They work badly as a way to fix a weak website, because the page the ad lands on decides whether anyone books. We say which you are on the first call.',
      },
      {
        question: 'What budget do I need?',
        answer:
          'It depends on your area and your specialty, so we recommend a starting point on the call rather than here. You set the number and can change it any month. Our fee is separate from what Meta charges for the ads themselves.',
      },
      {
        question: 'Is this HIPAA compliant?',
        answer:
          'Standard Meta tracking can send Meta a record of who visited which page, which is a problem on a health site. We set tracking up so that no health information leaves your site, and anything that collects it, such as an intake form, runs on a BAA-covered provider the landing page links to. We are not lawyers, and we say so.',
      },
      {
        question: 'Can you target people with anxiety or depression?',
        answer:
          'No, and you would not want to. Meta does not allow targeting by health condition, and your ethics code would not either. We reach people by area, by life stage and by interest in the kind of help you offer, and let the words of the ad do the rest.',
      },
      {
        question: 'What about Google Ads?',
        answer:
          'This service is Facebook and Instagram. If search ads would suit your practice better, we say so on the call rather than sell you these.',
      },
      {
        question: 'Is there a contract?',
        answer:
          'No. Management is billed monthly and stops at the end of any month you ask. The ad account and everything in it is yours.',
      },
    ],
    relatedSlugs: ['copywriting', 'local-seo', 'ai-chatbot'],
    tileImage: {
      src: '/images/services/pexels-5311713.webp',
      alt: 'A woman on a couch reading her phone',
      position: 'center 35%',
    },
    seo: {
      title: 'Meta Ads for therapists — wwisermind',
      description:
        'Facebook and Instagram ads for therapy practices: a small area, your specialties, a budget you set, ads in your voice, a landing page that books, and tracking arranged so no health information reaches Meta.',
    },
  },

  /* --- 11 · AI Search Optimization ------------------------------------------ */
  {
    slug: 'ai-search-optimization',
    name: 'AI Search Optimization',
    category: 'AI Services',
    heroOutcome:
      'Be the practice named when a client asks ChatGPT, Gemini or Perplexity for a therapist near them.',

    gallery: {
      tall: {
        src: '/images/services/pexels-6669811.webp',
        alt: 'A woman in a dark room lit by her phone',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-1497856.webp',
        alt: 'A woman holding her phone by a window',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-6009077.webp',
        alt: 'A man in a jacket looking at his phone outdoors',
        position: 'center 35%',
      },
      accent: 'Named by the AI. Not left out.',
    },

    intro: {
      paragraph:
        'A growing number of clients do not search at all. They ask ChatGPT, Gemini or Perplexity for a therapist who works with anxiety in their city, and they contact whoever the answer names. Those tools do not rank pages; they read them, and they recommend the practices they can understand and confirm elsewhere. AI Search Optimization is the work of making your practice one of those: the facts about you consistent everywhere the tools look, your pages written and structured so a machine can quote them accurately, and the answer checked every month so you know where you stand.',
      capabilities: [
        'Checked on ChatGPT, Gemini, Perplexity',
        'Facts consistent everywhere',
        'Structured data for AI',
        'Pages written to be quoted',
        'Directory profiles aligned',
        'The sources AI reads, fixed',
        'The answer tracked monthly',
        'Reported in plain English',
      ],
    },

    pillars: [
      {
        icon: 'search',
        title: 'A new way clients look',
        body: 'The question is not typed into Google any more. It is asked in a sentence, and the answer names a few practices. Being one of them is a different job from ranking.',
      },
      {
        icon: 'clipboard',
        title: 'Understood, not just found',
        body: 'AI tools recommend what they can read clearly and confirm elsewhere. Your name, place, specialties and fees have to agree on your site, your profile and the directories.',
      },
      {
        icon: 'chat',
        title: 'Honest about what can be promised',
        body: 'Nobody controls what an AI answers. We do the work that is known to shape it, check the answer every month, and tell you plainly what it says.',
      },
    ],

    whatWeDo: {
      heading: 'Three things an AI answer is built from',
      tabs: [
        {
          label: 'The facts',
          image: {
            src: '/images/services/pexels-6669811.webp',
            alt: 'A woman in a dark room lit by her phone',
            position: 'center 35%',
          },
          heading: 'One set of facts, everywhere the tools look.',
          paragraph:
            'An AI tool confirms what it reads about you against everything else it can find. An old address on one directory or a different fee on another is enough for it to name someone else. We bring every listing, profile and page into agreement, and keep them there.',
          claims: [
            'Site, profile and directories agree',
            'Old listings corrected',
            'Fees and insurance consistent',
            'Licences and areas stated plainly',
          ],
        },
        {
          label: 'The pages',
          image: {
            src: '/images/services/pexels-1497856.webp',
            alt: 'A woman holding her phone by a window',
            position: 'center 35%',
          },
          heading: 'Written so a machine can quote you accurately.',
          paragraph:
            'The tools lift sentences from pages that answer a question plainly. We write those pages on your site, in your voice, with the structured data underneath that says what the practice is, and you check them clinically before they go live.',
          claims: [
            'Plain answers to real questions',
            'Structured data on every page',
            'In your voice, checked by you',
            'One subject per page',
          ],
        },
        {
          label: 'The check',
          image: {
            src: '/images/services/pexels-6009077.webp',
            alt: 'A man in a jacket looking at his phone outdoors',
            position: 'center 35%',
          },
          heading: 'The same questions, asked every month.',
          paragraph:
            'We ask ChatGPT, Gemini and Perplexity for a therapist the way your clients would, record what they say and who they name, and do it again each month. What changed, and what we did about it, comes to you as a two-minute note.',
          claims: [
            'Asked the way a client asks',
            'Three tools, every month',
            'Who is named, and why',
            'A plain note on what changed',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'A baseline',
        body: 'We ask ChatGPT, Gemini and Perplexity for a therapist the way your clients would, for your specialties and your area, and record what they answer today and who they name instead of you.',
      },
      {
        title: 'Facts made consistent',
        body: 'Your practice’s name, address, specialties, fees, insurance and hours brought into agreement across your site, your Google Business Profile and the directories the AI tools read from.',
      },
      {
        title: 'Structured data',
        body: 'The code on every page that tells a machine this is a practice, who runs it, what it treats, where, and how to book, in the form the tools read.',
      },
      {
        title: 'Pages written to be quoted',
        body: 'Clear answers to the questions clients ask, on your own site and in your voice, so a tool can lift a sentence from your page rather than from someone else’s.',
      },
      {
        title: 'The sources the tools read',
        body: 'The directories, listings and mentions that AI answers draw from, checked, corrected where they are wrong, and added to where you are missing.',
      },
      {
        title: 'A monthly check and note',
        body: 'The same questions asked again each month, what changed in the answers, and a plain note on what we did about it.',
      },
    ],

    whyChooseUs: {
      heading: 'AI visibility from people who put it in the foundations',
      image: {
        src: '/images/services/pexels-4377192.webp',
        alt: 'A white chair by a sunlit window with dried flowers',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'We know what a client asks an AI for, and what a practice can ethically say back.',
        },
        {
          icon: 'search',
          title: 'In the foundations, not an upsell',
          body: 'Every site we build is made to be read by the AI tools. This is that work, applied to the site you have.',
        },
        {
          icon: 'chat',
          title: 'Honest about the answer',
          body: 'We report what the tools actually say each month, including when they name someone else.',
        },
        {
          icon: 'clock',
          title: 'No contract',
          body: 'Billed monthly, stopped at the end of any month, and every fix stays where it was made.',
        },
      ],
    },

    process: {
      heading: 'From a baseline to a monthly check',
      image: {
        src: '/images/services/pexels-6874262.webp',
        alt: 'A woman standing in a living room reading a tablet',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'Baseline',
          body: 'We ask the tools for a therapist the way your clients would, for your specialties and area, and record what they say today and who they name.',
        },
        {
          title: 'Make the facts agree',
          body: 'Your site, your Google Business Profile and every directory brought into agreement on name, place, specialties, fees, insurance and hours.',
        },
        {
          title: 'Write and structure',
          body: 'Pages that answer clients’ questions plainly, in your voice, with structured data underneath. You check them clinically before they go live.',
        },
        {
          title: 'Check and report',
          body: 'The same questions asked again each month, what changed, and a plain note on what we did about it.',
        },
      ],
    },

    faqs: [
      {
        question: 'Do clients really find therapists through ChatGPT?',
        answer:
          'Some do, and more each month, because asking a question in a sentence is easier than working through a directory. We cannot give you a number for your city. What we can do first is show you what the tools answer today for your specialties and your area, and who they name, which is a more useful thing to know.',
      },
      {
        question: 'How is this different from SEO?',
        answer:
          'Search ranks pages; an AI tool reads them and writes an answer. Ranking still helps, but the tools also draw on the directories, your Google profile and any mention of the practice, and they are put off by facts that disagree. This service is about being understood and confirmed, not only being found.',
      },
      {
        question: 'Can you guarantee the AI will recommend me?',
        answer:
          'No, and nobody honestly can; the tools change their answers often and do not explain them. We do the work that is known to shape the answer, ask the same questions every month, and report exactly what came back.',
      },
      {
        question: 'Is this included in Ongoing SEO?',
        answer:
          'Yes, as one part of a monthly plan that also covers search, the map and the site’s technical health. This is the focused version, for a practice whose search is already in order or that wants to start with the AI answer specifically.',
      },
      {
        question: 'Will AI make things up about my practice?',
        answer:
          'It can, and it mostly happens when the facts it finds disagree: an old address on one directory, a different fee on another, a specialty listed in one place and not the rest. Making everything agree is the fix, and it is most of the first month’s work.',
      },
      {
        question: 'What do you need from me?',
        answer:
          'Your website, your Google Business Profile, a list of the directories you are on, and the specialties and areas you most want clients for. Read-only access is enough. After that, a short conversation for the pages we write, and your clinical check of them.',
      },
      {
        question: 'I only see clients online. Does this apply?',
        answer:
          'Yes. People still ask for a therapist in a state or a city because that is where they are licensed and insured. The tools need to know where you are licensed and whether you see clients on video, and we make sure they can find both.',
      },
    ],
    relatedSlugs: ['ongoing-seo', 'local-seo', 'ai-chatbot'],
    tileImage: {
      src: '/images/services/pexels-1497856.webp',
      alt: 'A woman holding her phone by a window',
      position: 'center 35%',
    },
    seo: {
      title: 'AI Search Optimization for therapists — wwisermind',
      description:
        'Be the practice ChatGPT, Gemini and Perplexity name when a client asks for a therapist nearby: facts made consistent, structured data, pages written to be quoted, and the answer checked every month.',
    },
  },

  /* --- 12 · AI Website Design ----------------------------------------------- */
  {
    slug: 'ai-website-design',
    name: 'AI Website Design',
    category: 'AI Services',
    heroOutcome:
      'A site drafted with AI tools and finished by people, so it is built faster without reading like a machine wrote it.',

    gallery: {
      tall: {
        src: '/images/services/pexels-4099096.webp',
        alt: 'A woman with a coffee talking at her laptop in a kitchen',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-28461053.webp',
        alt: 'A desk with a monitor, plants and a lamp in a home office',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-4476606.webp',
        alt: 'A woman wearing a headset smiling at a computer',
        position: 'center 35%',
      },
      accent: 'Drafted by AI. Finished by people.',
    },

    intro: {
      paragraph:
        'AI can draft a layout, a first version of a page and the description behind every image in minutes. It cannot tell whether a page sounds like you, whether a form is safe to hand a distressed person, or whether a headline would make a licensing board wince. AI Website Design uses the tools for what they are good at and people for the rest: the first drafts are generated, every word and every screen is reviewed and rewritten by us, and you review it too. The result is a site built faster, built to be read by the AI tools clients now ask, and honest about how it was made.',
      capabilities: [
        'AI drafts, people finish',
        'Every word reviewed by us',
        'Copy in your voice',
        'Built to be read by AI',
        'HIPAA-aware forms',
        'Online booking connected',
        'SEO foundation built in',
        'Honest about how it’s made',
      ],
    },

    pillars: [
      {
        icon: 'bolt',
        title: 'Faster where speed is harmless',
        body: 'Layout options, first drafts, image descriptions, the parts nobody will judge you on. Generated in minutes, so the time goes on the parts they will.',
      },
      {
        icon: 'pen',
        title: 'Human where it matters',
        body: 'Nothing goes on the site that a person has not read and rewritten. The voice is yours, from your interview, and the calm, credible brief is the same as on every site we build.',
      },
      {
        icon: 'search',
        title: 'Built for the AI tools too',
        body: 'Structured, plainly written and consistent, so ChatGPT, Gemini and Perplexity can quote the site accurately from the day it goes live.',
      },
    ],

    whatWeDo: {
      heading: 'What the tools do, and what we do',
      tabs: [
        {
          label: 'Generated',
          image: {
            src: '/images/services/pexels-4099096.webp',
            alt: 'A woman with a coffee talking at her laptop in a kitchen',
            position: 'center 35%',
          },
          heading: 'First drafts in minutes, so the time goes on what matters.',
          paragraph:
            'Layout directions from your brief and photos, first versions of every page from your interview, and a description for every image. The tools do this quickly and reasonably well, and none of it is what a client will judge you on.',
          claims: [
            'Several layout directions',
            'First drafts of every page',
            'Image descriptions written',
            'Nothing goes live at this stage',
          ],
        },
        {
          label: 'Reviewed',
          image: {
            src: '/images/services/pexels-28461053.webp',
            alt: 'A desk with a monitor, plants and a lamp in a home office',
            position: 'center 35%',
          },
          heading: 'Every word and every screen, read and rewritten by a person.',
          paragraph:
            'We read every draft and rewrite it in your voice; we refine the layout we chose together until it reads as calm and credible on a phone. Then you review it, twice, the way you would on any site we build.',
          claims: [
            'Rewritten in your voice',
            'Designed, not just generated',
            'Checked against your ethics code',
            'Two reviews from you',
          ],
        },
        {
          label: 'Built for AI',
          image: {
            src: '/images/services/pexels-4476606.webp',
            alt: 'A woman wearing a headset smiling at a computer',
            position: 'center 35%',
          },
          heading: 'Made to be read correctly by the tools clients ask.',
          paragraph:
            'Structured data, consistent facts and plainly written pages are what ChatGPT, Gemini and Perplexity understand. The site is built that way from the start, with HIPAA-aware forms, booking connected and the SEO foundation in.',
          claims: [
            'Structured data on every page',
            'Facts consistent with your listings',
            'HIPAA-aware forms and booking',
            'Sitemap submitted at launch',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'Design directions, quickly',
        body: 'Several layout directions generated from your brief and your photos, reviewed and refined by us, and shown to you as pages to choose between rather than one take-it-or-leave-it design.',
      },
      {
        title: 'Copy drafted, then written',
        body: 'First drafts from your interview, then rewritten by us in your voice and reviewed by you. Nothing generated goes live unread.',
      },
      {
        title: 'Images and their descriptions',
        body: 'Your photos placed and described for screen readers and AI tools. Where you have none, a shortlist of photographs that do not look like stock. No generated people pretending to be your clients.',
      },
      {
        title: 'HIPAA-aware forms and booking',
        body: 'Contact and intake forms that keep protected health information out of places it should not be, and your scheduler connected so a visitor can book without emailing first.',
      },
      {
        title: 'An AI-ready foundation',
        body: 'Structured data, consistent facts and plainly written pages, plus titles, descriptions and a submitted sitemap, so search engines and the AI tools can both read the site accurately.',
      },
      {
        title: 'Launch and thirty days of fixes',
        body: 'A recorded walkthrough of how to make small edits yourself, and a month in which anything that is not right is fixed at no cost.',
      },
    ],

    whyChooseUs: {
      heading: 'AI used openly, by people who build only for practices',
      image: {
        src: '/images/services/pexels-4846437.webp',
        alt: 'An armchair and potted plants by a window',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'The tools do not know what a fee page or an intake form has to get right. We do.',
        },
        {
          icon: 'chat',
          title: 'Honest about how it is made',
          body: 'You are told which parts started as a draft, and nothing generated goes live unread.',
        },
        {
          icon: 'shield',
          title: 'No client data in any tool',
          body: 'The drafts are made from your public details, your interview and your photographs. Nothing else.',
        },
        {
          icon: 'clock',
          title: 'Revisions while you sleep',
          body: 'We work from Pune, so a note left after your last session is done by your morning.',
        },
      ],
    },

    process: {
      heading: 'Four steps, two of them yours',
      image: {
        src: '/images/services/pexels-12912121.webp',
        alt: 'A woman waving at her laptop in a sunny room',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'Strategy call',
          body: 'One 30-minute video call in your timezone. We agree the pages, the tone and the launch date, and you leave with a written plan whether you go ahead or not.',
        },
        {
          title: 'Draft and design',
          body: 'Layout directions and first drafts generated from the call and your photos, then chosen, refined and rewritten by us. You review the pages and the copy once.',
        },
        {
          title: 'Build and connect',
          body: 'The site built, booking connected, HIPAA-aware forms in, structured data and the SEO foundation put down. You review the built site once.',
        },
        {
          title: 'Launch',
          body: 'Live on the agreed day, with a recorded walkthrough and thirty days of fixes included.',
        },
      ],
    },

    faqs: [
      {
        question: 'Is the site made by AI?',
        answer:
          'Drafted, partly. Finished, no. The tools produce first versions of layouts, copy and image descriptions. We read, rewrite and design from there, and you review the result twice. Every line on the live site has been through a person, and we tell you which parts started as a draft.',
      },
      {
        question: 'Will it look like every other AI-built site?',
        answer:
          'Not if it is done properly. Generated layouts are a starting point we choose between and refine, not a finished template. The brief is the same as every site we build: calm, credible, easy to read on a phone at 2am, and recognisably yours.',
      },
      {
        question: 'Do you use AI-generated photos?',
        answer:
          'Not of people. A generated face standing in for a client or a clinician is a small dishonesty on a site whose whole job is trust. We use your photographs, or a shortlist of real ones that do not look like stock.',
      },
      {
        question: 'How is this different from the One Week Website?',
        answer:
          'The One Week Website is a fixed scope on a fixed week. AI Website Design is about how the site is made and what it is made for: generated first drafts give you more design directions to choose between, and the whole build is briefed around being read correctly by the AI tools. If you are not sure which suits your practice, the first call decides it.',
      },
      {
        question: 'Is it safe to put my practice through AI tools?',
        answer:
          'No client information goes into any AI tool, ever. The drafts are made from your public details, your interview and your photographs, the same things a visitor to the site will see. Anything that collects health information runs on a BAA-covered provider the site links to.',
      },
      {
        question: 'What happens after launch?',
        answer:
          'The site is yours. Hosting is a separate monthly plan, and a care plan covers edits, backups and updates if you would rather not touch it. Neither is a contract.',
      },
    ],
    relatedSlugs: ['one-week-website', 'ai-search-optimization', 'ai-chatbot'],
    tileImage: {
      src: '/images/services/pexels-28461053.webp',
      alt: 'A desk with a monitor, plants and a lamp in a home office',
      position: 'center 35%',
    },
    seo: {
      title: 'AI Website Design for therapists — wwisermind',
      description:
        'A therapist website drafted with AI tools and finished by people: every word reviewed, copy in your voice, HIPAA-aware forms, booking connected, and a foundation the AI tools clients ask can read accurately.',
    },
  },

  /* --- 13 · AI Chatbot ------------------------------------------------------ */
  {
    slug: 'ai-chatbot',
    name: 'AI Chatbot',
    category: 'AI Services',
    heroOutcome:
      'A chatbot on your site that answers the questions clients ask at 11pm and books the consultation, without giving clinical advice.',

    gallery: {
      tall: {
        src: '/images/services/pexels-4031707.webp',
        alt: 'A person waving at a laptop on a video call',
        position: 'center 35%',
      },
      mid: {
        src: '/images/services/pexels-9159663.webp',
        alt: 'A woman pointing at her laptop screen while talking',
        position: 'center 35%',
      },
      wide: {
        src: '/images/services/pexels-4476608.webp',
        alt: 'A woman in glasses talking on a headset at a computer',
        position: 'center 35%',
      },
      accent: 'Answers at 11pm. Bookings by 9.',
    },

    intro: {
      paragraph:
        'Most of the questions a prospective client has are the same ones: do you take my insurance, what does a session cost, do you see teenagers, are you taking new clients, how do I book. They ask at 11pm, and if the answer is not there they close the tab. An AI chatbot on your site answers those from what you have told it, in your voice, and books the consultation or hands over to you. It does not give clinical advice, it does not pretend to be you, and it knows the words that mean someone needs a crisis line rather than a booking link.',
      capabilities: [
        'Answers from your own facts',
        'Books the consultation',
        'In your voice',
        'No clinical advice, ever',
        'Crisis words handled',
        'No health data stored',
        'Hands over to you',
        'You see what it was asked',
      ],
    },

    pillars: [
      {
        icon: 'clock',
        title: 'Answers while you are in session',
        body: 'Fees, insurance, ages, availability, how to book. The questions that fill your inbox, answered in a sentence at any hour, from facts you wrote.',
      },
      {
        icon: 'shield',
        title: 'Knows what it must not do',
        body: 'It is told, in writing, never to give clinical advice, never to suggest that anyone is a client, and exactly what to say and show when a message reads like a crisis.',
      },
      {
        icon: 'calendar',
        title: 'Ends in a booking, or in your inbox',
        body: 'Every conversation is steered to the next step: a consultation booked from the chat, or the question handed to you by email when it is beyond what the bot may say.',
      },
    ],

    whatWeDo: {
      heading: 'What it says, what it will not, and where it sends people',
      tabs: [
        {
          label: 'What it says',
          image: {
            src: '/images/services/pexels-4031707.webp',
            alt: 'A person waving at a laptop on a video call',
            position: 'center 35%',
          },
          heading: 'The questions in your inbox, answered from your facts.',
          paragraph:
            'Fees, insurance, ages, specialties, availability, hours, locations, what a first session is like, how to book. Written up with you, and the only things the bot is allowed to say. It sounds like the practice because it was set up from your own pages.',
          claims: [
            'Your facts, and only those',
            'In the practice’s voice',
            'Says it is an assistant',
            'Updated as things change',
          ],
        },
        {
          label: 'What it will not',
          image: {
            src: '/images/services/pexels-9159663.webp',
            alt: 'A woman pointing at her laptop screen while talking',
            position: 'center 35%',
          },
          heading: 'No clinical advice, and a crisis line before anything else.',
          paragraph:
            'It is told in writing never to give clinical advice, never to suggest anyone is a client, and never to guess. When a message reads like an emergency it stops and shows the crisis line for your country, plainly, first. You approve that wording before launch.',
          claims: [
            'No clinical advice, ever',
            'Crisis words agreed with you',
            'Never guesses fees or availability',
            'No health information kept',
          ],
        },
        {
          label: 'Where it sends people',
          image: {
            src: '/images/services/pexels-4476608.webp',
            alt: 'A woman in glasses talking on a headset at a computer',
            position: 'center 35%',
          },
          heading: 'A consultation booked, or a question in your inbox.',
          paragraph:
            'Every conversation is steered to a next step. Your scheduler is connected so a visitor can book from the chat, and anything the bot may not answer is handed to you by email with the question attached.',
          claims: [
            'Booking from the chat',
            'Handover by email',
            'A monthly note on what was asked',
            'Off at any time',
          ],
          cta: { label: 'Book a free call', href: '/contact#book-a-call' },
        },
      ],
    },

    included: [
      {
        title: 'Set up from your facts',
        body: 'Fees, insurance, specialties, ages, hours, locations, what a first session is like and how to book, written up with you and given to the bot as the only things it may say.',
      },
      {
        title: 'Your voice',
        body: 'Set up from your site’s copy and a short conversation with you, so it sounds like the practice rather than a help desk, and says plainly that it is an assistant, not a clinician.',
      },
      {
        title: 'Booking and handover',
        body: 'Connected to your scheduler so a visitor can book from the chat, and set to hand over to you by email, with the question, when it is asked something it should not answer.',
      },
      {
        title: 'Crisis handling',
        body: 'A fixed response when a message reads like an emergency: the crisis line for your country, plainly, before anything else. The wording is reviewed with you before the bot goes live.',
      },
      {
        title: 'Privacy',
        body: 'Set up so it does not ask for or keep health information, with a notice a visitor sees before typing. Anything that collects such information runs on a BAA-covered provider it links to.',
      },
      {
        title: 'A monthly review',
        body: 'What it was asked, where it did not know the answer, and its facts updated as fees, hours and availability change.',
      },
    ],

    whyChooseUs: {
      heading: 'A chatbot set up the way a practice needs it',
      image: {
        src: '/images/services/pexels-9004759.webp',
        alt: 'A woman on a sofa reading her phone',
        position: 'center 30%',
      },
      cards: [
        {
          icon: 'clipboard',
          title: 'Only therapists, every project',
          body: 'We know which questions a prospective client asks and which ones a bot must not touch.',
        },
        {
          icon: 'shield',
          title: 'Limits written down',
          body: 'What it may say, what it must not, and what to show in a crisis, agreed with you before it goes live.',
        },
        {
          icon: 'calendar',
          title: 'Judged on bookings',
          body: 'The point is a consultation in your calendar, not a clever conversation.',
        },
        {
          icon: 'chat',
          title: 'Reviewed every month',
          body: 'What it was asked, where it did not know, and its facts updated. A two-minute note to you.',
        },
      ],
    },

    process: {
      heading: 'How the chatbot gets set up',
      image: {
        src: '/images/services/pexels-7195318.webp',
        alt: 'A laptop on a video call beside a hand taking notes',
        position: 'center 30%',
      },
      rows: [
        {
          title: 'The facts',
          body: 'A short conversation and your site’s copy become a written sheet of what the bot may say: fees, insurance, ages, availability, locations, how to book.',
        },
        {
          title: 'The limits',
          body: 'What it must never do, what it says when asked something clinical, and the crisis response for your country, written and approved by you.',
        },
        {
          title: 'Connect and test',
          body: 'Booking connected, handover by email set up, the privacy notice in place, and the bot tested with the questions your clients actually ask.',
        },
        {
          title: 'Live, and reviewed',
          body: 'On your site, matching its look. Each month, a note on what it was asked and its facts updated as things change.',
        },
      ],
    },

    faqs: [
      {
        question: 'Will it give therapy, or advice?',
        answer:
          'No. It is limited to the facts you give it about the practice and to booking. Asked anything clinical, it says so plainly, points to the consultation, and passes the question to you. That limit is written into how it is set up, not left to chance.',
      },
      {
        question: 'What happens if someone is in crisis?',
        answer:
          'It stops answering questions about the practice and shows the crisis line for your country, plainly, first. The words that trigger that and the response itself are agreed with you before launch, and we would rather it err on the side of showing the number.',
      },
      {
        question: 'Is it HIPAA compliant?',
        answer:
          'It is set up not to ask for or keep health information, and a visitor is told that before they type. Anything that does collect such information, an intake form or a portal, runs on a BAA-covered provider the bot links to rather than in the chat. We are not lawyers, and we say so.',
      },
      {
        question: 'Will clients know they are talking to a bot?',
        answer:
          'Yes. It introduces itself as the practice’s assistant, says it is not a clinician, and never pretends to be you or a member of your team. On a therapy site that honesty is part of the trust.',
      },
      {
        question: 'What does it do when it does not know?',
        answer:
          'It says so, offers to book a consultation or to pass the question to you, and does. It is not allowed to guess about fees, availability or anything clinical. The monthly review shows you the questions it could not answer, so its facts get better.',
      },
      {
        question: 'Do I need a new website for it?',
        answer:
          'Usually not. It sits on most sites as a small addition and matches the site’s colours and tone. If your site cannot carry it, we say so on the call rather than after.',
      },
      {
        question: 'Can I turn it off?',
        answer:
          'Any time, and the plan stops at the end of any month. Nothing about your site changes when it goes.',
      },
    ],
    relatedSlugs: ['ai-website-design', 'website-care-plans', 'meta-ads'],
    tileImage: {
      src: '/images/services/pexels-9159663.webp',
      alt: 'A woman pointing at her laptop screen while talking',
      position: 'center 35%',
    },
    seo: {
      title: 'AI Chatbot for therapists — wwisermind',
      description:
        'An AI chatbot for your therapy practice website: answers fees, insurance and availability from your own facts, books the consultation, hands over to you, handles crisis messages, and never gives clinical advice.',
    },
  },
];

/* ==========================================================================
   Lookups.
   ========================================================================== */

const bySlug = new Map(services.map((service) => [service.slug, service]));

export function getService(slug: string): Service | undefined {
  return bySlug.get(slug as ServiceSlug);
}

/** The three sibling cards, in the order the entry lists them. A slug that names nothing
    is skipped rather than rendered as an empty card, and the list is cut to three. */
export function relatedServices(service: Service): Service[] {
  return service.relatedSlugs
    .filter((slug) => slug !== service.slug)
    .map((slug) => bySlug.get(slug))
    .filter((match): match is Service => Boolean(match))
    .slice(0, 3);
}

export type WhySlot =
  | ({ kind: 'card' } & WhyCard)
  | ({ kind: 'stat'; value: string } & WhyStat);

/** The why-choose-us grid as four slots, the stat card in its place — or four light
    cards where the entry has no honest figure to show. */
export function whySlots(block: NonNullable<Service['whyChooseUs']>): WhySlot[] {
  const slots: WhySlot[] = block.cards.map((card) => ({ kind: 'card', ...card }));
  if (!block.stat) return slots;

  const stat = caseStudies[block.stat.caseStudySlug].project.stats[block.stat.statIndex];
  slots.splice(block.stat.position, 0, { kind: 'stat', value: stat.value, ...block.stat });
  return slots;
}

/* --- checked once at module load, so a slip fails the build rather than the page ----- */
if (bySlug.size !== SERVICE_SLUGS.length || SERVICE_SLUGS.some((slug) => !bySlug.has(slug))) {
  throw new Error('lib/services.ts: SERVICE_SLUGS and `services` are out of step.');
}

for (const service of services) {
  const why = service.whyChooseUs;
  if (why && why.cards.length !== (why.stat ? 3 : 4)) {
    throw new Error(
      `lib/services.ts: ${service.slug} whyChooseUs wants ${why.stat ? 'three' : 'four'} cards.`,
    );
  }
  if (why?.stat && !caseStudies[why.stat.caseStudySlug].project.stats[why.stat.statIndex]) {
    throw new Error(`lib/services.ts: ${service.slug} whyChooseUs.stat names a stat that does not exist.`);
  }
  for (const tab of service.whatWeDo?.tabs ?? []) {
    if (tab.claims.length !== 4) {
      throw new Error(`lib/services.ts: ${service.slug} whatWeDo tab "${tab.label}" wants four claims.`);
    }
  }
}
