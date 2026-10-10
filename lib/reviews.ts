/* ==========================================================================
   Reviews — the one file every review and every score on the site comes from.

   REAL DATA ONLY. Nothing here is written, paraphrased, shortened or invented. The rating,
   the count and each review are exactly what the owner supplied. To add a review, paste a
   new entry into `reviews` below; to change the score, change `reviewsSummary`. The
   homepage hero card, the contact page and service-page review tile, and /reviews all read
   from here, so the score cannot disagree between pages.

   This file imports nothing from the rest of the site, so lib/site.ts and lib/services.ts
   can both import it without a cycle.
   ========================================================================== */

export const reviewsSummary = {
  /** The Google rating, out of `outOf`. */
  rating: 5,
  outOf: 5,
  /** The number of Google reviews behind that rating. */
  count: 12,
  source: 'Google',
  /** TODO: the public Google reviews URL for the business. Supplied by the owner; do not
      guess it. While this is not an http(s) address the "Read them on Google" button is
      left out of the page rather than linked to nowhere. */
  googleReviewsUrl: 'TODO_GOOGLE_REVIEWS_URL',
  /** TODO: the Google "write a review" URL for the business. Supplied by the owner; do not
      guess it. While this is not an http(s) address the "Leave a review on Google" button
      is left out of the page. */
  googleWriteReviewUrl: 'TODO_GOOGLE_WRITE_REVIEW_URL',
};

/** True once a URL above has been replaced with a real address. */
export function hasRealUrl(url: string): boolean {
  return /^https?:\/\//.test(url);
}

export type Review = {
  id: string;
  /** The review, word for word. */
  quote: string;
  name: string;
  /** The reviewer's practice. */
  practice: string;
  location?: string;
  /** Shown exactly as written here ("March 2025"); it is never parsed or reformatted. */
  date?: string;
  /** A square portrait under /public. */
  photo?: string;
  /** Only used to filter the wall, and only offered once eight or more reviews carry one. */
  tag?: 'group' | 'solo';
  /** The one review the featured pull-quote frame shows. If none is marked, the first is
      used. A featured review is not repeated in the wall below it. */
  featured: boolean;
};

export const reviews: Review[] = [
  {
    id: 'matt-erdman',
    quote:
      'They just got it. I explained my practice once and they built something that sounds like me. Zero tech headaches on my end.',
    name: 'Matt Erdman',
    practice: 'Timely Therapy',
    location: 'Seattle',
    photo: '/images/matt-erdman.webp',
    featured: true,
  },
];

/** Whole numbers stay whole ("5", not "5.0"); anything else keeps one decimal. */
export function formatRating(rating: number): string {
  return Number.isInteger(rating) ? String(rating) : rating.toFixed(1);
}

/** Initials for a reviewer with no photograph: the letters of the name, nothing invented. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

/** "12 Google reviews", or "1 Google review". */
export function reviewCountLabel(): string {
  const { count, source } = reviewsSummary;
  return `${count} ${source} ${count === 1 ? 'review' : 'reviews'}`;
}

/* ==========================================================================
   The /reviews page's own copy. Drafted for the owner's approval; nothing here states a
   number, a name or a quote that is not in `reviewsSummary` or `reviews` above.
   ========================================================================== */
export const reviewsPage = {
  meta: {
    title: 'Reviews from the therapists we work with | wwisermind',
    /** Built from the data, so the score here is always the score on the page. */
    description: `What therapists say about working with wwisermind, in their own words. Rated ${reviewsSummary.rating} out of ${reviewsSummary.outOf} across ${reviewsSummary.count} ${reviewsSummary.source} reviews, with the projects behind them.`,
  },

  /* ---- 1. hero (dark, the contact hero component) ------------------------------ */
  hero: {
    eyebrow: 'Reviews',
    /** Three options were drafted; B is the working one until the owner picks.
        A  In their own words.
        B  Therapists tell it better than we do.
        C  What it's like to work with us, from the people who have. */
    heading: 'Therapists tell it better than we do.',
    lead: 'Here’s what therapists say after working with us, in their own words.',
    primary: { label: 'Book a free call', href: '/contact#book-a-call' },
    google: { label: 'Read them on Google' },
  },

  /* ---- 2. featured review (light) ----------------------------------------------- */
  featured: {
    eyebrow: 'In their words',
    /** The link is drawn only when the featured review's practice has a case study. */
    projectLinkLabel: (practice: string) => `See the ${practice} project`,
    projectLinkHref: '/results',
  },

  /* ---- 3. the wall (soft gray-blue tint) ---------------------------------------- */
  wall: {
    eyebrow: 'More reviews',
    heading: 'Every word is theirs.',
    filters: { all: 'All', group: 'Group practices', solo: 'Solo practices' },
    /** The filter row appears once at least this many reviews carry a tag. */
    filterMinTagged: 8,
    /** Reviews longer than this get a clamp and a Read more button. */
    truncateAfter: 280,
  },

  /* ---- 4. worked with us (white) ------------------------------------------------- */
  worked: {
    eyebrow: 'Worked with us?',
    heading: 'Tell the next therapist how it went.',
    body: 'A few honest lines on Google help another therapist decide. Take as long or as little as you like. There’s no pressure.',
    button: 'Leave a review on Google',
  },

  /* ---- 5. prefer numbers? (light) ------------------------------------------------ */
  numbers: {
    eyebrow: 'Prefer numbers?',
    heading: 'Two projects, and what changed after launch.',
    lede: 'The same work, measured. The full projects are on the results page.',
    cardCta: 'See the results',
  },
};
