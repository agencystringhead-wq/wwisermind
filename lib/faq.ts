import { routes } from '@/lib/routes';
/* ==========================================================================
   FAQ: every question and answer on /faq lives in this file.

   The answers are pasted exactly as the owner wrote them and are never rewritten,
   shortened or added to. `answer` is plain text; a blank line is a paragraph break. The
   page, the search and the FAQPage structured data all read the same string, so what a
   visitor sees and what a search engine is told cannot differ.

   `status` is "ready" or "confirm". Only "ready" items are rendered or put in structured
   data, in every environment. A "confirm" item is parked here until its copy is final.
   A category with no ready items is left off the page rather than shown empty.

   Imports nothing from the rest of the site.
   ========================================================================== */

export type FaqStatus = 'ready' | 'confirm';

export type FaqCategoryId = 'need' | 'found' | 'chosen' | 'privacy' | 'working';

export type FaqCategory = { id: FaqCategoryId; label: string };

export type FaqItem = {
  /** Stable. It is the question's URL hash (#id) and its element id, so never rename one
      that has been published. */
  id: string;
  category: FaqCategoryId;
  question: string;
  answer: string;
  status: FaqStatus;
};

export const categories: FaqCategory[] = [
  { id: 'need', label: 'Do I need a website?' },
  { id: 'found', label: 'Getting found on Google and AI' },
  { id: 'chosen', label: 'Turning visitors into inquiries' },
  { id: 'privacy', label: 'Privacy and HIPAA' },
  { id: 'working', label: 'Working with wwisermind' },
];

export const items: FaqItem[] = [
  /* --- Do I need a website? ---------------------------------------------------- */
  {
    id: 'website-or-psychology-today',
    category: 'need',
    status: 'ready',
    question: 'Do I really need a website, or is a Psychology Today profile enough?',
    answer: `You need some kind of web presence. Whether that means a full website depends on how your clients find you.

If referrals keep your caseload full, a directory profile and a Google listing can be enough for now. If you want to fill openings from people searching, a website matters. A directory profile is shared space: every page looks alike, and you don't control how it ranks or what it costs next year. Your own site is the one place where you set the story.

Most practices that want to grow end up with both, and the two work best when they point at each other.`,
  },
  {
    id: 'psychology-today-worth-it',
    category: 'need',
    status: 'ready',
    question: 'Is Psychology Today still worth paying for?',
    answer: `It depends on your practice, and therapists report very different results. Some private-pay therapists say it sends them a client or two every few months. Others keep a profile mainly because it needs no upkeep.

Treat it as one door, not the whole house. Keep the profile complete and current, link it to your website, and count the inquiries it actually sends you over six months. Then decide with your own numbers.`,
  },
  {
    id: 'referrals-keep-me-busy',
    category: 'need',
    status: 'ready',
    question: 'My referrals keep me busy. Do I still need marketing?',
    answer: `Word of mouth is the best source there is, and nothing here replaces it. But referrals can dry up when a referrer retires, moves or fills their own caseload.

A clear, simple site means that when someone searches your name after a recommendation, they find something that sounds like you. Think of it as a first impression and a safety net, not a growth campaign.`,
  },

  /* --- Getting found on Google and AI ------------------------------------------ */
  {
    id: 'how-long-does-seo-take',
    category: 'found',
    status: 'ready',
    question: 'How long does SEO take?',
    answer: `Longer than anyone wants. Most practices see early movement within a few months, and it keeps building after that. In busy cities it can take longer.

Pages for specific searches, like "EMDR therapist in Seattle", usually start showing up before broad ones like "therapist near me". Anyone who promises page one in 30 days in a big city is selling something.`,
  },
  {
    id: 'guarantee-page-one',
    category: 'found',
    status: 'ready',
    question: 'Can you guarantee page one on Google?',
    answer: `No, and nobody honest can. Google decides rankings, not us.

What we can do is the work that moves them: a clear page for each specialty, a complete Google profile, fast mobile pages, and plain-English updates on what changed and what's moving. If an agency guarantees a ranking, ask them how.`,
  },
  {
    id: 'chatgpt-recommend-therapist',
    category: 'found',
    status: 'ready',
    question: 'Will I show up when someone asks ChatGPT for a therapist?',
    answer: `Nobody can promise that, so be wary of anyone who does. AI tools tend to be careful about naming individual therapists, and they draw on more than your website: directories, your Google profile, local mentions and how consistently you're described across all of them.

What helps is saying clearly who you help and where, in the same words, everywhere you appear. That helps Google and real people too. A quick test: ask ChatGPT the way a client would, with your city and your specialty, and see what comes back.`,
  },
  {
    id: 'google-business-profile',
    category: 'found',
    status: 'ready',
    question: 'Do I need a Google Business Profile? What if I work from home?',
    answer: `Yes, claim and verify one. It's what puts you in the map results when someone searches "therapist near me".

If you work from home or only see clients online, you can set it up as a service-area business and hide your street address. Keep your practice name, address and phone number identical across your website, Google, Apple Maps and your directories. Changing an address after verification can trigger a suspension, so make those changes carefully and ask us before you move.`,
  },
  {
    id: 'page-per-specialty',
    category: 'found',
    status: 'ready',
    question: 'Why do I need a separate page for each specialty?',
    answer: `Because clients search for the problem, not the method. Someone types "anxiety therapist" or "couples counseling" plus a city, and Google shows the page that matches.

One services page that lists everything gives you a weak match for all of those searches. Separate pages let each one speak directly to the person searching, in your voice.`,
  },
  {
    id: 'do-i-need-a-blog',
    category: 'found',
    status: 'ready',
    question: 'Do I need a blog?',
    answer: `Not at the start. Specialty pages and a good Google profile come first. A blog helps over time if you can keep it going, because it answers the questions people ask before they book.

A blog with three posts from 2021 doesn't help anyone. If writing isn't for you, skip it. We'd rather build something you'll keep up than something that goes stale.`,
  },
  {
    id: 'use-ai-to-write',
    category: 'found',
    status: 'ready',
    question: 'Can I use AI to write my website or blog?',
    answer: `You can, with care. Google says it looks at whether content is helpful, not how it was made. But unedited AI text tends to read as generic, and clients notice.

Use AI for first drafts and ideas, then rewrite in your own voice and check every clinical claim yourself. And never paste client details or session notes into a general AI tool.`,
  },

  /* --- Turning visitors into inquiries ----------------------------------------- */
  {
    id: 'visitors-no-inquiries',
    category: 'chosen',
    status: 'ready',
    question: "I get visitors but no inquiries. What's wrong?",
    answer: `It's usually a few small things rather than one big one. The page doesn't say who you help in the first few seconds. It opens with your credentials instead of the client's problem. There's too much on it, or no obvious next step. Or the fees and insurance are hidden.

The fix is rarely more traffic. It's a clearer page and one calm next step, like a free consult. Book a free call and we'll look at your site with you.`,
  },
  {
    id: 'list-fees-and-insurance',
    category: 'chosen',
    status: 'ready',
    question: 'Should I list my fees and insurance on my website?',
    answer: `Yes. "Do you take my insurance?" and "What does a session cost?" are two of the questions that decide whether someone reaches out. Say which plans you accept, whether you provide superbills for out-of-network reimbursement, your private-pay rate, and whether you offer a sliding scale.

If you'd rather not publish a number, say how someone can find out. People who can't find an answer often move on to a therapist who gives one.`,
  },
  {
    id: 'client-testimonials',
    category: 'chosen',
    status: 'ready',
    question: 'Can I put client testimonials on my website?',
    answer: `Be careful. The APA, ACA and NASW ethics codes say not to solicit testimonials from clients, because of the power gap in therapy. Some regulators, including in Canada, go further and don't allow therapists to use client reviews at all.

Reviews that clients leave on their own, on Google for example, are a separate matter, but replying to one can confirm that someone is your client, which is a confidentiality problem. So we don't build client testimonials into therapist sites. Trust comes from a warm bio, a clear approach, real photos, your credentials, and a plain description of what a first session is like.

Rules differ by profession, state and country, so check with your own board.`,
  },
  {
    id: 'google-ads-worth-it',
    category: 'chosen',
    status: 'ready',
    question: 'Are Google Ads worth it for a therapy practice?',
    answer: `They can be, but they're not where we'd start. Ads make sense when you have openings to fill now and a website that turns visitors into inquiries. Without that, you pay for clicks that go nowhere.

Work out what one new long-term client is worth to you, then track the cost per inquiry, not the number of clicks. Start small and measure. And keep ad tracking away from pages where visitors share anything private (see the tracking question under Privacy and HIPAA).`,
  },

  /* --- Privacy and HIPAA ------------------------------------------------------- */
  {
    id: 'website-hipaa-compliant',
    category: 'privacy',
    /* The brief this was pasted from stopped mid-sentence, at "the rules differ, but".
       The text below is exactly what arrived. It stays "confirm", and so off the page and
       out of the structured data, until the owner supplies the rest of the answer. */
    status: 'confirm',
    question: 'Does my website need to be HIPAA compliant?',
    answer: `Your public pages, like your bio, services and fees, don't need special handling. The risk is any form that collects what someone tells you about their health, such as a contact form with a "what brings you in?" box.

The standard forms built into Squarespace, Wix and WordPress usually aren't covered by a business associate agreement (BAA). For those forms, use a service that signs a BAA, such as Hushmail, Paubox or the HIPAA tier of Jotform, and embed it on your site.

If you bill insurance electronically, HIPAA applies to you directly. If you're fully private pay it may not, but your licensing board's confidentiality rules still do, so most practices handle forms the careful way either way. This is general information, not legal advice, and HIPAA is a US law. In the UK and Australia the rules differ, but`,
  },

  /* --- Working with wwisermind: no items supplied yet --------------------------- */
];

/* ==========================================================================
   Derived, so nothing downstream has to remember to filter.
   ========================================================================== */

/** The only items that ever reach the page or the structured data. */
export const readyItems: FaqItem[] = items.filter((item) => item.status === 'ready');

/** Categories that have at least one ready item, in `categories` order. */
export const visibleCategories: FaqCategory[] = categories.filter((category) =>
  readyItems.some((item) => item.category === category.id),
);

/* ==========================================================================
   The /faq page's own copy. Drafted for the owner's approval.
   ========================================================================== */
export const faqPage = {
  meta: {
    title: 'FAQs for therapists: websites, SEO and privacy | wwisermind',
    description:
      'Real questions from therapists about websites, getting found on Google and AI, turning visitors into inquiries, and privacy, answered plainly.',
  },

  hero: {
    eyebrow: 'FAQs',
    /** Three options were drafted; A is the working one until the owner picks.
        A  Plain answers to real questions.
        B  The questions therapists ask us.
        C  Straight answers, no pitch. */
    heading: 'Plain answers to real questions.',
    lead: 'Real questions from therapists, answered plainly.',
    primary: { label: 'Book a free call', href: routes.contactBook },
    searchLabel: 'Search the FAQs',
    searchPlaceholder: 'Search the questions',
    clearLabel: 'Clear search',
  },

  body: {
    navLabel: 'Topics',
    groupLabel: (n: number) => `Topic ${String(n).padStart(2, '0')}`,
    count: (n: number, q: string) =>
      `${n} ${n === 1 ? 'question matches' : 'questions match'} “${q}”`,
    empty: {
      line: (q: string) => `Nothing matches “${q}” yet. Try another word, or ask us directly.`,
      linkLabel: 'Ask us on the contact page',
      linkHref: routes.contact,
    },
  },

  ask: {
    eyebrow: 'Still have a question?',
    heading: 'Ask us. You’ll get a plain answer.',
    body: 'Whether you hire us or not.',
    primary: { label: 'Book a free call', href: routes.contactBook },
    secondary: { label: 'Send a message', href: routes.contactForm },
  },
};
