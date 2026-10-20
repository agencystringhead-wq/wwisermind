import { routes } from '@/lib/routes';
/* ==========================================================================
   /process — every word on the page lives here.

   SOURCES. Nothing below is new fact. Each claim is lifted from one of two places and
   marked with its source, so the page cannot say anything the rest of the site does not:
     · HOME   = `processSection` in lib/site.ts (the homepage's Our Process block)
     · OWW    = the One Week Website entry in lib/services.ts
     · CONTACT = `contactPage` in lib/site.ts

   DRAFT MARKERS. Anything the repo does not state is written as a suggestion and carries
   `confirm`, a question for the owner. While `SHOW_CONFIRM_MARKERS` is true the page draws
   a small yellow "Confirm" chip beside each one, so a draft read-through shows exactly
   what is unverified. Flip it to false to ship. An item with no `confirm` is backed by
   its source and needs no check.
   ========================================================================== */

import type { ServiceIconName } from '@/components/ui/icons';

/** True while the copy is a draft. Off for launch; set true to see which claims were unverified. */
export const SHOW_CONFIRM_MARKERS = false;

export type Confirm = { confirm?: string };

export const processPage = {
  meta: {
    title: 'Our process for therapist websites and marketing | wwisermind',
    description:
      'Three steps, no mystery. One free 30-minute call, an honest plan and a timeline you know before anything starts. Then we design, build and launch while you stay in session.',
  },

  /* ---- 1. hero (dark, the contact hero component) -------------------------------- */
  hero: {
    eyebrow: 'Our process',
    /** Three options were drafted; A is the working one until the owner picks.
        A  Three steps. No mystery.                         (the About dropdown's own line)
        B  From first call to launch, no jargon.            (HOME: a clear update at every step)
        C  You stay in session. We handle the rest.         (HOME: while you stay in session) */
    heading: 'Three steps. No mystery.',
    /** Held to two lines at 64ch by the hero's own measure. */
    lead: 'One free call, an honest plan and a timeline you’ll know before anything starts. Then we build while you see clients.',
    primary: { label: 'Book a free call', href: routes.contactBook },
  },

  /* ---- 2. intro statement (light) ------------------------------------------------ */
  intro: {
    /** HOME headingLead + headingRest, tightened to one sentence pair. */
    statement:
      'No mystery, no chasing, no tech headaches. One free call, an honest plan, and a clear timeline before anything starts, with clear updates the whole way.',
  },

  /* ---- 3. the three steps -------------------------------------------------------- */
  steps: {
    eyebrow: 'The three steps',
    heading: 'What happens, and who does what.',
    items: [
      {
        numeral: '01',
        title: 'Strategy call',
        /* HOME step 1, shortened. */
        body: 'One free 30-minute video call, in your timezone. We look at your website and your visibility together, and you get an honest read on what’s worth fixing and what isn’t. If we’re not the right fit, we’ll say so.',
        yourPart: {
          label: 'Your part',
          body: 'Join the call and tell us how your practice runs and what you want it to do.',
        },
        ourPart: {
          label: 'Our part',
          /* OWW process row 1: "We agree the pages, the tone and the launch date." */
          body: 'Look at your site and visibility with you, then agree the pages, the tone and the launch date.',
        },
        walkAway: {
          lead: 'You walk away with',
          /* HOME: "a clear plan and a real timeline, whether you hire us or not". */
          body: 'a clear plan and a real timeline, whether you hire us or not.',
        },
      },
      {
        numeral: '02',
        title: 'Design & build',
        /* HOME step 2, shortened. */
        body: 'You approve the plan before anything starts, and review the design before anything goes live. We handle the rest: the design, the build, the HIPAA-aware forms, the SEO foundation and the mobile experience.',
        yourPart: {
          label: 'Your part',
          /* OWW FAQ: two reviews, about twenty minutes each, one for copy and design, one for
             the built site. The reviews are One Week Website specific, so the card says so. */
          body: 'Approve the plan, then review the copy and design once and the built site once. On a One Week Website, each review takes about twenty minutes.',
        },
        ourPart: {
          label: 'Our part',
          /* OWW included + process rows 2 and 3. */
          body: 'Write the copy, design every page, build the site, connect your booking, and set up the forms and the SEO foundation.',
        },
        walkAway: {
          lead: 'You walk away with',
          /* OWW included: booking, HIPAA-aware forms. */
          body: 'a site you’ve approved, with booking connected and HIPAA-aware forms.',
        },
      },
      {
        numeral: '03',
        title: 'Launch & grow',
        /* HOME step 3, shortened. */
        body: 'Your site goes live on schedule, and that’s the beginning, not the end. Care plans keep it fast, secure and updated. SEO and content keep you climbing.',
        yourPart: {
          label: 'Your part',
          body: 'Give the go-ahead to launch, then read your growth report when it lands.',
          confirm: 'Is a launch-day yes from the client part of the process? (You listed it; the repo does not say it.)',
        },
        ourPart: {
          label: 'Our part',
          /* OWW: recorded walkthrough, thirty days of fixes. HOME: care plans, SEO, content. */
          body: 'Launch on the agreed day with a recorded walkthrough and thirty days of fixes, then keep the site fast, secure and updated.',
        },
        walkAway: {
          lead: 'You walk away with',
          /* HOME: "every month you get a growth report: what happened, what it means,
             what's next." */
          body: 'a live site, and a monthly growth report: what happened, what it means, what’s next.',
        },
      },
    ],
  },

  /* ---- 4. timeline (light grey) -------------------------------------------------- */
  timeline: {
    eyebrow: 'One Week Website',
    heading: 'Seven days, start to finish.',
    /* OWW FAQ: "The week starts once the call has happened and any photos you want to use
       are in." */
    lede: 'Here is how a One Week Website week runs. It starts once the call has happened and any photos you want to use are in.',
    /** The data names four stages and two reviews but never says which day each lands on.
        The day numbers below are therefore a proposed split, every one marked `confirm`
        except Day 7, which the data supports ("launched in seven days", "a fixed launch
        day"). Stages come from OWW `process.rows`; the two reviews from OWW `faqs`. */
    days: [
      {
        day: 1,
        label: 'Copy',
        detail: 'We write your pages from the call.',
        confirm: 'Which day does copywriting start and finish?',
      },
      {
        day: 2,
        label: 'Design',
        detail: 'We design every page.',
        confirm: 'Which days is design done?',
      },
      {
        day: 3,
        label: 'Review one',
        detail: 'You check the copy and design. About twenty minutes.',
        confirm: 'Which day is the first review? (Length, about twenty minutes, is in OWW.)',
        review: true,
      },
      {
        day: 4,
        label: 'Build',
        detail: 'We build the site.',
        confirm: 'Which days is the build?',
      },
      {
        day: 5,
        label: 'Connect',
        detail: 'Booking, forms and the SEO foundation go in.',
        confirm: 'Which day are booking, forms and SEO set up?',
      },
      {
        day: 6,
        label: 'Review two',
        detail: 'You check the built site. About twenty minutes.',
        confirm: 'Which day is the second review?',
        review: true,
      },
      {
        day: 7,
        label: 'Launch',
        detail: 'The site goes live, with a recorded walkthrough.',
      },
    ] satisfies Array<{
      day: number;
      label: string;
      detail: string;
      review?: boolean;
    } & Confirm>,
    /** Where the strip begins, before Day 1. */
    before: { label: 'Before Day 1', detail: 'The strategy call, and any photos in.' },
    note: 'Longer projects are scoped on the call, so you’ll know the timeline before anything starts.',
  },

  /* ---- 5. what we need from you (white) ------------------------------------------ */
  needs: {
    eyebrow: 'Your part',
    heading: 'A short list, on purpose.',
    lede: 'Your time belongs to your clients. So we ask for as little as we can.',
    items: [
      {
        icon: 'chat' as ServiceIconName,
        title: 'A 30-minute call',
        /* OWW: "One 30-minute conversation is all we need." */
        body: 'One conversation. We write every page from it.',
      },
      {
        icon: 'clipboard' as ServiceIconName,
        title: 'Your photos, or a shortlist',
        /* OWW: "Your photos, or a shortlist", "any photos or a logo you already have". */
        body: 'Send the photos or logo you already have. If you have none, we’ll work from a shortlist.',
        confirm: 'What does "a shortlist" mean in practice: you pick from options we suggest?',
      },
      {
        icon: 'clock' as ServiceIconName,
        title: 'Two quick reviews',
        /* OWW FAQ: two reviews of about twenty minutes each. */
        body: 'About twenty minutes each. One for the copy and design, one for the built site.',
      },
      {
        icon: 'target' as ServiceIconName,
        title: 'A yes on launch day',
        body: 'When it looks right, you say go, and the site goes live.',
        confirm: 'Is a launch-day yes part of the process? (You listed it; the repo does not say it.)',
      },
    ],
  },

  /* ---- 6. how we communicate (light, soft blue gradient cards) -------------------- */
  comms: {
    eyebrow: 'How we communicate',
    heading: 'You always know where things stand.',
    cards: [
      {
        icon: 'chat' as ServiceIconName,
        title: 'Clear updates',
        /* HOME: "a clear update at every step"; OWW: "no jargon in between". */
        body: 'No jargon, no acronyms to look up. When something happens, we tell you what it is, what it means and what’s next.',
      },
      {
        icon: 'globe' as ServiceIconName,
        title: 'Meetings in your timezone',
        /* HOME step 1: "in your timezone"; services: "We work from Pune". */
        body: 'Every call is on video, at a time that suits your day. We work from Pune, so we plan around you.',
      },
      {
        icon: 'target' as ServiceIconName,
        title: 'One person to ask',
        body: 'You always know who to message. One name, one thread, no chasing.',
        confirm: 'Is there one named contact per client? Not stated anywhere in the repo.',
      },
    ],
    clocksLead: 'We’re in Pune. You’re in your timezone.',
    /** CONTACT meta already promises "a reply to every message within one business day". It
        is the only cadence promise in the repo, so it is reused here and flagged. */
    reply: {
      text: 'We reply to every message within one business day.',
      confirm: 'Only the contact page’s meta description makes this promise. Still true? Any weekly update promise to add?',
    },
  },

  /* ---- 7. FAQ (the homepage component, these questions) ---------------------------- */
  faq: [
    {
      question: 'What happens on the strategy call?',
      /* OWW process row 1, HOME step 1. */
      answer:
        'It’s one free 30-minute video call, in your timezone. We look at your website and visibility together and agree the pages, the tone and the launch date. You leave with a written plan and a real timeline, whether you hire us or not.',
    },
    {
      question: 'What do you need from me?',
      /* OWW faqs, almost verbatim. */
      answer:
        'One 30-minute call, any photos or a logo you already have, and two reviews of about twenty minutes each: one for the copy and design, one for the built site.',
    },
    {
      question: 'How do revisions work?',
      /* OWW process row 2 and launch tab; services whyChooseUs "a note left at 6pm". */
      answer:
        'You review the copy and design once and mark anything that isn’t you. We make the changes, then you review the built site once and we fix whatever isn’t right. We work from Pune, so a note you leave at 6pm is usually done by your morning.',
      confirm: 'What happens if someone wants more changes after the second review? The repo is silent.',
    },
    {
      question: 'What happens after launch?',
      /* OWW faqs + included. */
      answer:
        'You get a recorded walkthrough and thirty days of fixes at no cost. After that the site is yours. Hosting is a separate monthly plan, and a care plan covers edits, backups and updates if you’d rather not touch it. Neither is a contract.',
    },
    {
      question: 'What if we’re not the right fit?',
      /* HOME: "if we're not the right fit, I'll say so"; "whether you hire us or not". */
      answer:
        'We’ll say so on the call. The call is free, and you leave with a plan and a timeline whether you hire us or not, so you lose nothing by asking.',
    },
    {
      question: 'How do you handle timezones?',
      /* CONTACT: India, with clients in the US, UK and Australia. */
      answer:
        'We work from Pune, India, and every call happens in your timezone, whether you’re in the US, the UK or Australia. The gap helps too: a note you leave at the end of your day is usually done by your morning.',
    },
  ] satisfies Array<{ question: string; answer: string } & Confirm>,
};
