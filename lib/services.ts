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

   The first entry, One Week Website, is written through. The other twelve are stubs: the
   slug, the name and the category are real, the four required frames carry TODO markers
   that render visibly, and every optional frame is absent. A stub is also sent out
   `noindex` — see app/services/[slug]/page.tsx.
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
  /** True while the entry is a stub. The page still renders, with the TODO markers
      showing, but it is sent out `noindex` so a search engine never files a half page. */
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
   `wide` is the landscape picture the projects stack wants (16:9); until one exists the
   square homepage card is used and cover-cropped.
   ========================================================================== */
export type CaseStudySlug = 'timely' | 'evolve';

export type CaseStudy = {
  slug: CaseStudySlug;
  name: string;
  headline: string;
  project: (typeof homeIntro.projects)[number];
  wide?: ServiceImage;
};

const [timelyProject, evolveProject] = homeIntro.projects;

export const caseStudies: Record<CaseStudySlug, CaseStudy> = {
  timely: {
    slug: 'timely',
    name: 'Timely Therapy',
    headline: 'A calm, credible site that turned more of its visitors into clients.',
    project: timelyProject,
    /* TODO: a 16:9 landscape of the Timely site. The square card image stands in. */
  },
  evolve: {
    slug: 'evolve',
    name: 'Evolve Therapy & Yoga',
    headline: 'Therapy and yoga under one roof, and a calendar that filled up.',
    project: evolveProject,
    /* TODO: a 16:9 landscape of the Evolve site. The square card image stands in. */
  },
};

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

/** What every unfilled field says. It is the same string everywhere so a search for it
    lists every gap, and it is loud enough on the page that nobody mistakes it for copy. */
const TODO = 'TODO';

/** A stub entry: real slug, name and category; the four required frames as TODOs; every
    optional frame absent, so the page is the shortest one the template can draw. */
function stub(
  slug: ServiceSlug,
  name: string,
  category: ServiceCategory,
  relatedSlugs: ServiceSlug[],
): Service {
  return {
    slug,
    name,
    category,
    draft: true,
    heroOutcome: `${TODO}: one sentence on the outcome of ${name}.`,
    intro: {
      paragraph: `${TODO}: a short paragraph on ${name} and who it is for.`,
      /* Keep the real items to three to five words each, so the two columns stay even. */
      capabilities: Array.from({ length: 4 }, (_, i) => `${TODO}: capability ${i + 1}`),
    },
    included: Array.from({ length: 3 }, (_, i) => ({
      title: `${TODO}: included item ${i + 1}`,
      body: `${TODO}: a short paragraph on item ${i + 1}.`,
    })),
    faqs: Array.from({ length: 4 }, (_, i) => ({
      question: `${TODO}: question ${i + 1}?`,
      answer: `${TODO}: answer ${i + 1}.`,
    })),
    relatedSlugs,
    seo: {
      title: `${name} for therapists — wwisermind`,
      description: `${TODO}: a 150-character description of ${name}.`,
    },
  };
}

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

  /* --- 02–13 · stubs. Fill each in place; the shape above is the guide. -------------- */
  stub('custom-website-design', 'Custom Website Design', 'Website Design', [
    'one-week-website',
    'ai-website-design',
    'website-care-plans',
  ]),
  stub('website-hosting', 'Website Hosting', 'Website Design', [
    'website-care-plans',
    'one-week-website',
    'custom-website-design',
  ]),
  stub('website-care-plans', 'Website Care Plans', 'Website Design', [
    'website-hosting',
    'one-week-website',
    'ongoing-seo',
  ]),
  stub('local-seo', 'Local SEO', 'Online Marketing', [
    'ongoing-seo',
    'seo-audit',
    'ai-search-optimization',
  ]),
  stub('seo-audit', 'SEO Audit / Assessment', 'Online Marketing', [
    'one-time-seo',
    'local-seo',
    'ongoing-seo',
  ]),
  stub('one-time-seo', 'One Time SEO', 'Online Marketing', [
    'seo-audit',
    'ongoing-seo',
    'local-seo',
  ]),
  stub('ongoing-seo', 'Ongoing SEO / AEO / GEO', 'Online Marketing', [
    'local-seo',
    'ai-search-optimization',
    'copywriting',
  ]),
  stub('copywriting', 'Copywriting', 'Online Marketing', [
    'one-week-website',
    'ongoing-seo',
    'meta-ads',
  ]),
  stub('meta-ads', 'Meta Ads', 'Online Marketing', [
    'local-seo',
    'copywriting',
    'one-week-website',
  ]),
  stub('ai-search-optimization', 'AI Search Optimization', 'AI Services', [
    'ongoing-seo',
    'ai-chatbot',
    'local-seo',
  ]),
  stub('ai-website-design', 'AI Website Design', 'AI Services', [
    'one-week-website',
    'custom-website-design',
    'ai-chatbot',
  ]),
  stub('ai-chatbot', 'AI Chatbot', 'AI Services', [
    'ai-search-optimization',
    'ai-website-design',
    'website-care-plans',
  ]),
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
