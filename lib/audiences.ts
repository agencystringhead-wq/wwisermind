import { AUDIENCE_SLUGS, audienceHref, type AudienceSlug } from '@/lib/audience-slugs';
import {
  caseStudies,
  testimonials,
  type CaseStudySlug,
  type ServiceImage,
  type TestimonialId,
} from '@/lib/services';
import { siteConfig } from '@/lib/site';
import type { AiMarkName, ServiceIconName } from '@/components/ui/icons';

export { AUDIENCE_SLUGS, audienceHref, type AudienceSlug };

/* ==========================================================================
   /who-we-help/[slug].

   One data file, one template, two entries — the service pages' arrangement. Structure
   and styling are the template's; an entry carries only the words and the pictures. The
   two entries are the same shape field for field, so nothing in the template checks
   which page it is drawing.

   Figures: no number on these pages is typed here. The proof row names a case study and
   one of its stats, and reads the value out of `caseStudies` — the same figure the
   homepage shows, changing with it. Where there is no honest figure for a slot, the slot
   is a short claim with an icon instead. The one quote is the hero banner's, read from
   `testimonials`.

   Photographs: the homepage's own where one fits, and otherwise the free Pexels stock the
   service pages already carry (public/images/services/pexels-<id>.webp) as stand-ins.
   Each slot notes the ratio a purpose-shot replacement wants; swapping one is a one-line
   change to `src`.
   ========================================================================== */

/** A figure read from a case study: the slug and which of that project's stats, as the
    service pages' why-choose-us card does it. */
export type AudienceStat = {
  caseStudySlug: CaseStudySlug;
  /** 0 is the first stat on the homepage card. */
  statIndex: number;
  title: string;
  body: string;
};

/** A slot with no honest number: one short claim behind a thin line icon. */
export type AudienceClaim = { icon: ServiceIconName; title: string; body: string };

/** One of the four AI platform marks in `aiMarks` (components/ui/icons.tsx). */
export type AudienceCapability = { mark: AiMarkName; text: string };

export type AudienceValue = { title: string; body: string };

/** `tag` is the one word in the pill at the open row's right — the reference's "AUDIT". */
export type AudienceProcessRow = { title: string; body: string; tag: string };

export type AudienceFaq = { question: string; answer: string };

export type Audience = {
  slug: AudienceSlug;
  /** "Group practices" — the breadcrumb and the mega menu. */
  name: string;

  /* --- 1 · hero ------------------------------------------------------------ */
  hero: {
    /** Two designed lines, split on `\n`. */
    headline: string;
    paragraph: string;
    /** The left photograph, ≈ 9:10 (483×540 in the reference); the right one the same
        box, set lower by the paragraph above it. */
    photos: { left: ServiceImage; right: ServiceImage };
  };

  /* --- 2 · the story ------------------------------------------------------- */
  story: {
    /** Up to three lines, split on `\n`. */
    heading: string;
    paragraph: string;
  };

  /* --- 3 · proof ------------------------------------------------------------ */
  proof: {
    heading: string;
    subheading: string;
    /** The one figure on the page: the dark card, large, in the yellow. */
    lead: AudienceStat;
    /** The three qualitative slots: two stacked in the second column, the third tall. */
    claims: [AudienceClaim, AudienceClaim, AudienceClaim];
    /** The quote card. Absent, the row is the four cards. */
    quote?: TestimonialId;
  };

  /* --- 4 · capabilities ---------------------------------------------------- */
  capabilities: {
    /** Two or three short lines in the mono face, split on `\n`. */
    label: string;
    items: [AudienceCapability, AudienceCapability, AudienceCapability, AudienceCapability];
  };

  /* --- 5 · life / context -------------------------------------------------- */
  life: {
    eyebrow: string;
    heading: string;
    paragraph: string;
    /** Two landscapes side by side, ≈ 16:10 each. */
    photos: [ServiceImage, ServiceImage];
    caption: string;
  };

  /* --- 6 · vision ----------------------------------------------------------- */
  vision: {
    statement: string;
    paragraph: string;
  };

  /* --- 7 · values ----------------------------------------------------------- */
  values: [AudienceValue, AudienceValue, AudienceValue];

  /* --- 8 · process ---------------------------------------------------------- */
  process: {
    heading: string;
    /** Four numbered rows: the step, and the paragraph shown when the row is open. */
    rows: [AudienceProcessRow, AudienceProcessRow, AudienceProcessRow, AudienceProcessRow];
    /** The mono line at the foot, opposite the button. */
    note: string;
    cta: { label: string; href: string };
  };

  /* --- 9 · faq ---------------------------------------------------------------- */
  /** The homepage FAQ frame, with this audience's questions. Four to six. */
  faqs: AudienceFaq[];

  /* --- seo ------------------------------------------------------------------ */
  seo: { title: string; description: string };
};

/* The founder, as the vision frame shows him: the homepage's portrait, the byline in the
   mono face. One block for both pages — it is not the entries that differ here. */
export const audienceFounder = {
  portrait: {
    src: '/images/Srikaanth-Founder-wwisermind.webp',
    alt: 'SrikaantH, founder of wwisermind, at his desk in a book-lined office',
    position: 'center 30%',
  },
  name: 'SrikaantH',
  role: 'Founder, wwisermind',
};

/** The figure a proof card shows, read from the case study it names, with the label the
    homepage gives it. Checked at module load, so a stat index past the card's list is
    a build error rather than an empty card. */
export function audienceStat(stat: AudienceStat) {
  const study = caseStudies[stat.caseStudySlug];
  const figure = study.project.stats[stat.statIndex];
  if (!figure) {
    throw new Error(`${study.name} has no stat at index ${stat.statIndex}`);
  }
  return { value: figure.value, label: figure.label, practice: study.name };
}

export const audiences: Audience[] = [
  /* --- 01 · Group practices ------------------------------------------------- */
  {
    slug: 'group-practices',
    name: 'Group practices',

    hero: {
      headline: 'A site that sells the whole team,\nnot just the founder.',
      paragraph:
        'Group practices come to us with one full calendar and several half-empty ones. The website is usually why: it was built when the practice was one person, and it still reads that way.',
      photos: {
        /* The homepage’s group-practice still. A purpose-shot replacement wants ≈ 9:10. */
        left: {
          src: '/images/grouppractice.webp',
          alt: 'A group practice team together outside their office',
          position: 'center 30%',
        },
        /* Pexels stand-in. Wants ≈ 9:10, a team in a practice setting. */
        right: {
          src: '/images/services/pexels-7988669.webp',
          alt: 'Five colleagues around a table looking at a tablet together',
          position: 'center 40%',
        },
      },
    },

    story: {
      heading: 'One name on the door,\nsix clinicians behind it',
      paragraph:
        'Your referral sources know one name: yours. Clients search for you, land on a site that is mostly about you, and ask for you. Meanwhile the clinicians you hired to take that load sit at sixty percent, and the second location is a page nobody got round to writing. The practice has grown. The site has to catch up, and then keep selling every clinician and every office without you doing it by hand.',
    },

    proof: {
      heading: 'What changed for a practice we built for',
      subheading:
        'One figure from Evolve Therapy & Yoga, and what we have seen hold across the rest. Nothing here is an estimate.',
      /* The one figure: appointments, because a group's problem is the calendar. The
         visitors figure (index 1) is left out rather than set beside it. */
      lead: {
        caseStudySlug: 'evolve',
        statIndex: 0,
        title: 'More appointments booked',
        body: 'At Evolve Therapy & Yoga after the new site went live.',
      },
      claims: [
        {
          icon: 'clipboard',
          title: 'Every clinician, a real profile',
          body: 'Not a name in a list. A page a referrer can send someone to.',
        },
        {
          icon: 'globe',
          title: 'A page for every office',
          body: 'So each location ranks in its own town.',
        },
        {
          icon: 'calendar',
          title: 'Booking that lands with the right person',
          body: 'A visitor books with the clinician who has room, not the practice inbox.',
        },
      ],
      quote: 'matt-erdman',
    },

    capabilities: {
      label:
        'Built for practices with more than one clinician.\nEvery person, specialty and location\ngets a page that can be found on its own.',
      /* One line per AI platform: what the structure lets each one do with the practice. */
      items: [
        { mark: 'chatgpt', text: 'Structured so ChatGPT can recommend the practice, not one name' },
        { mark: 'gemini', text: 'Every location findable when Gemini answers a local search' },
        { mark: 'grok', text: 'Each clinician’s specialty readable by Grok' },
        { mark: 'perplexity', text: 'Cited by Perplexity with the right office named' },
      ],
    },

    life: {
      eyebrow: 'Inside a group practice',
      heading: 'Built for how a group actually runs',
      paragraph:
        'A group practice is a scheduling problem before it is a marketing problem. Who has openings, who takes which insurance, who sees teenagers. The site has to answer those before a client emails to ask.',
      photos: [
        /* Pexels stand-ins. Each wants ≈ 16:10: a team meeting, and a session. */
        {
          src: '/images/services/pexels-3184360.webp',
          alt: 'A team gathered around a wooden table with laptops and papers',
          position: 'center 35%',
        },
        {
          src: '/images/services/pexels-7176027.webp',
          alt: 'A therapist gesturing while talking with a client',
          position: 'center 40%',
        },
      ],
      caption:
        'We write the clinician pages from short interviews, so each one sounds like the person rather than like the founder describing them. Intake is one clear path whichever office someone starts from, and adding a clinician is a page added, not a rebuild.',
    },

    vision: {
      statement:
        'A practice should not depend on one person being the only one people can find.',
      paragraph:
        'wwisermind builds for therapists only, and for a group the aim is simple: every clinician findable, every calendar fillable, and the founder free to step back from the front desk.',
    },

    values: [
      {
        title: 'Every clinician gets sold',
        body: 'The founder’s page is not the only good page. Each clinician gets a profile written for the client who is looking for exactly them.',
      },
      {
        title: 'Referrers get one clear place',
        body: 'A referral source should be able to send someone to the practice, not to a person, and trust that intake works whichever office they choose.',
      },
      {
        title: 'Growth is a page, not a rebuild',
        body: 'A new hire, a new office, a new specialty: each is added to the structure the site was planned around, and ranks on its own.',
      },
    ],

    process: {
      heading: 'How a group practice site comes together',
      rows: [
        {
          tag: 'Map',
          title: 'Map the practice',
          body: 'One call with you, and short interviews with the clinicians who want one. We list every person, specialty, location and insurance the site has to carry, and agree the launch date.',
        },
        {
          tag: 'Write',
          title: 'Write and design every page',
          body: 'Clinician profiles, location pages and specialty pages, written from the interviews and designed so the practice reads as one thing.',
        },
        {
          tag: 'Connect',
          title: 'Connect the calendars',
          body: 'Booking routed to the right clinician, HIPAA-aware intake, and the SEO foundation on every page.',
        },
        {
          tag: 'Launch',
          title: 'Launch, then fill the gaps',
          body: 'The site goes live on the agreed day. Then local SEO and, where it helps, ads, aimed at the clinicians with room.',
        },
      ],
      note: 'One call to start. No proposal deck, no retainer to sign first.',
      cta: { label: 'Book a free call', href: siteConfig.bookingPage },
    },

    faqs: [
      {
        question: 'Can the site handle more than one clinician?',
        answer:
          'Yes. Each clinician gets their own page, written from a short interview, with their specialties, the insurance they take and a booking link that goes to them. The practice page ties them together, so a referrer can send someone to the practice as a whole.',
      },
      {
        question: 'We have two locations. Does each one get a page?',
        answer:
          'Yes, and it should. A location page is what Google shows when someone searches for a therapist in that town, so each office gets its own page with its address, hours, the clinicians who work there and a map link. A third location later is a page added, not a rebuild.',
      },
      {
        question: 'What happens when we hire a new clinician?',
        answer:
          'You send us a bio and a photo, or we do a fifteen-minute interview, and their page is live within a few days on a care plan. Their booking link is connected at the same time. Nothing else on the site has to change.',
      },
      {
        question: 'Our referral sources only know the founder. Can the site change that?',
        answer:
          'It can help. Referrers get one clear address to send people to, the intake page explains how a client is matched with a clinician, and every clinician’s page gives a referrer something to link to that is not the founder’s name. The rest is a habit on your side, and we write the email that starts it.',
      },
      {
        question: 'How long does a group practice site take?',
        answer:
          'Most are live in three to five weeks, depending on how many clinicians want an interview. The launch date is agreed on the first call, and the build does not wait on you: you review twice, once for the copy and once for the built site.',
      },
      {
        question: 'Can it connect to our booking system?',
        answer:
          'SimplePractice, TherapyNotes, Calendly, Cal.com and most others connect in an afternoon, one link per clinician. If yours does not, we say so on the call rather than in week three.',
      },
    ],


    seo: {
      title: 'Websites and marketing for group therapy practices — wwisermind',
      description:
        'Websites and marketing for group practices: a profile for every clinician, a page for every location and specialty, booking that lands with the right person, and marketing that fills the associates’ calendars, not just the founder’s.',
    },
  },

  /* --- 02 · Solo practices -------------------------------------------------- */
  {
    slug: 'solo-practices',
    name: 'Solo practices',

    hero: {
      headline: 'You are the practice.\nThe site has to sound like it.',
      paragraph:
        'A solo practice runs on one person’s credibility. The site is where a client decides whether that person is right for them, usually at night, usually on a phone, before they ever write to you.',
      photos: {
        /* The homepage’s solo-practice still. A purpose-shot replacement wants ≈ 9:10. */
        left: {
          src: '/images/solopractice.webp',
          alt: 'A solo practitioner holding a tablet in her office',
          position: 'center 30%',
        },
        /* The homepage’s process photograph. Wants ≈ 9:10. */
        right: {
          src: '/images/launch-and-grow.webp',
          alt: 'A therapist sitting in her practice with a notebook',
          position: 'center 40%',
        },
      },
    },

    story: {
      heading: 'You trained to be a therapist,\nnot a marketer',
      paragraph:
        'Most solo practices we meet are full through word of mouth and a directory listing, and quietly worried about what happens if either slows down. The site was made in a weekend, or by a friend, and it does not say what you specialise in, who you are for, or how to start. So it brings in nobody, and every new client still has to come through you. The fix is not for you to post more. It is a site that carries your voice and your credibility while you are in session.',
    },

    proof: {
      heading: 'What changed for a solo practice we built for',
      subheading:
        'One figure from Timely Therapy, and what we have seen hold across the rest. Nothing here is an estimate.',
      /* The one figure: enquiries, because a solo practice's problem is clients arriving.
         The conversion-rate figure (index 0) is left out rather than set beside it. */
      lead: {
        caseStudySlug: 'timely',
        statIndex: 1,
        title: 'More enquiries sent',
        body: 'Form submissions at Timely Therapy after the new site went live.',
      },
      claims: [
        {
          icon: 'pen',
          title: 'Written in your voice',
          body: 'One conversation with you, and every page reads like you wrote it on a good day.',
        },
        {
          icon: 'shield',
          title: 'HIPAA-aware from day one',
          body: 'Forms that keep health information where it belongs.',
        },
        {
          icon: 'clock',
          title: 'Nothing for you to run',
          body: 'No posting schedule, no plugin updates. It works while you are in session.',
        },
      ],
      quote: 'matt-erdman',
    },

    capabilities: {
      label:
        'Built for one therapist with a full day.\nYour specialty stated plainly, your availability current,\nand nothing that needs you to keep it running.',
      items: [
        { mark: 'chatgpt', text: 'Structured so ChatGPT can recommend you for your specialty' },
        { mark: 'gemini', text: 'Your city and specialty findable in Gemini’s answers' },
        { mark: 'grok', text: 'Your credentials readable by Grok, as you stated them' },
        { mark: 'perplexity', text: 'Cited by Perplexity with your own booking link' },
      ],
    },

    life: {
      eyebrow: 'Inside a solo practice',
      heading: 'Built for the hours you are not in session',
      paragraph:
        'A solo practitioner’s marketing happens in the gaps: ten minutes between clients, an evening after notes. The site has to do its job without those minutes.',
      photos: [
        /* The homepage’s therapist photograph, then a Pexels stand-in. Each ≈ 16:10. */
        {
          src: '/images/wwisermind-built-for-mental-therapist-only.webp',
          alt: 'A therapist in a mustard blazer listening to a client across from her',
          position: '58% 40%',
        },
        {
          src: '/images/services/pexels-6255877.webp',
          alt: 'A psychologist and a client talking on a sofa',
          position: 'center 40%',
        },
      ],
      caption:
        'We write every page from one conversation, so the specialty is stated plainly and the fees and the first step are where a nervous client expects them. Booking is connected to your own calendar, forms are HIPAA-aware, and the site is built so that the only time it needs you is when something about the practice changes.',
    },

    vision: {
      statement:
        'The people who need you should be able to find you without you becoming a marketer.',
      paragraph:
        'wwisermind exists for that. We build for therapists only, and for a solo practice the whole job is to make one person’s credibility visible to the right client, and then get out of the way.',
    },

    values: [
      {
        title: 'Your voice, not a template’s',
        body: 'Every sentence is written from a conversation with you. If a page could belong to any therapist, it is not finished.',
      },
      {
        title: 'Credibility over cleverness',
        body: 'Your training, your specialty and how you work, stated plainly. No slogans, and no promises a client cannot check.',
      },
      {
        title: 'Nothing that needs you to run it',
        body: 'A static site with no plugins to update, a booking link that is always current, and edits handled on a care plan if you would rather not touch it.',
      },
    ],

    process: {
      heading: 'How a solo practice site comes together',
      rows: [
        {
          tag: 'Call',
          title: 'One conversation',
          body: 'A 30-minute call in your timezone. We talk about who you see, how you work and what you charge, and agree a launch date. You leave with a written plan whether you go ahead or not.',
        },
        {
          tag: 'Write',
          title: 'Written and designed for you',
          body: 'We write every page from that call and design around it. You review once and mark anything that does not sound like you.',
        },
        {
          tag: 'Connect',
          title: 'Booking and forms connected',
          body: 'Your scheduler linked, HIPAA-aware contact forms, and the SEO foundation for your specialty and your city.',
        },
        {
          tag: 'Launch',
          title: 'Live, and off your plate',
          body: 'The site goes live on the agreed day with a recorded walkthrough and thirty days of fixes. After that it runs without you.',
        },
      ],
      note: 'One call to start. You show up twice, the rest is handled.',
      cta: { label: 'Book a free call', href: siteConfig.bookingPage },
    },

    faqs: [
      {
        question: 'What does a solo practice site cost?',
        answer:
          'The One Week Website is a fixed scope at a fixed price, agreed on the first call before any work starts. There is no retainer and no contract. Hosting is a separate monthly plan, and a care plan is optional.',
      },
      {
        question: 'How much of my time does it take?',
        answer:
          'About ninety minutes in total: one thirty-minute call, and two reviews of about twenty minutes each, one for the copy and design and one for the built site. Everything else happens while you are in session.',
      },
      {
        question: 'I am doing this alone. Do I need to write anything?',
        answer:
          'No. Every page is written from the call. You read it once and mark anything that does not sound like you. If you already have a bio or a blurb you like, send it and we will work from it.',
      },
      {
        question: 'Do I have to keep posting or updating it?',
        answer:
          'No. The site is built to work without you: no plugins to update, a booking link that stays current, and a simple editor for changing fees or hours. If you would rather not touch it at all, a care plan covers edits.',
      },
      {
        question: 'What happens after launch?',
        answer:
          'Thirty days of fixes at no cost, a recorded walkthrough of how to make small edits, and then the site is yours. When you want more clients from search, local SEO is the usual next step, and it is a separate, month-to-month service.',
      },
      {
        question: 'Will it look like every other therapist’s website?',
        answer:
          'No, because none of it is a template. The layout is the site’s own, the words are yours from the call, and the photos are yours or a shortlist we pick together.',
      },
    ],


    seo: {
      title: 'Websites and marketing for solo therapy practices — wwisermind',
      description:
        'A website that carries your voice and credibility while you are in session: copy written from one call, booking connected, HIPAA-aware forms and an SEO foundation for your specialty and your city. Nothing you have to run.',
    },
  },
];

export function getAudience(slug: string): Audience | undefined {
  return audiences.find((audience) => audience.slug === slug);
}

/* Every slug in the list has an entry, and every entry names a stat its case study has —
   checked once, at module load, so a mismatch fails the build rather than a page. */
for (const slug of AUDIENCE_SLUGS) {
  const audience = getAudience(slug);
  if (!audience) throw new Error(`No audience entry for slug "${slug}"`);
  audienceStat(audience.proof.lead);
  if (audience.proof.quote && !testimonials[audience.proof.quote]) {
    throw new Error(`No testimonial "${audience.proof.quote}" for ${slug}`);
  }
}
