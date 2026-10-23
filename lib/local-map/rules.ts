/* Local Map Assessment: every number and every sentence the scoring and the report use. Tune here.
   Stored reports keep the words and scores they were made with; bump RULES_VERSION when a change makes old and new scores
   not comparable. */

export const RULES_VERSION = 1;

/* --- the scan ----------------------------------------------------------------------------------- */

export const GRID_SIZE = 5; // 5 x 5 = 25 points
export const RADIUS_OPTIONS = [1, 3, 5] as const;
export const DEFAULT_RADIUS = 3;
export const KEYWORD_COUNT = 4;
export const SERP_DEPTH = 20;
/** DataForSEO queue priority: 1 is the standard queue, 2 is high (faster, dearer). */
export const DFS_PRIORITY = 1;
/** Map zoom sent with each point's coordinates, by radius: a wider grid needs a wider view at each point. */
export const ZOOM_BY_RADIUS: Record<number, string> = { 1: '15z', 3: '14z', 5: '13z' };

export const CACHE_DAYS = 7;
export const REPORTS_PER_DAY = 3; // per IP and per email
export const LOOKUPS_PER_DAY = 20; // per IP
export const RETRIES_PER_REPORT = 2;
/** After this long, checks that have not come back are treated as missing. */
export const GRID_TIMEOUT_MS = 9 * 60_000;
export const PROFILE_TIMEOUT_MS = 2 * 60_000;
/** Reviews and posts asked for only once the grid was complete (the final four differed from the early pick) wait this long, and then the
    report is built from the competitors that did come back: the gap table averages whoever is there. */
export const LATE_PROFILE_GRACE_MS = 20_000;
/** A scan that makes no progress for this long (counted in time the page spent polling) is flagged: the visitor is told it is taking longer
    than usual, and wwisermind gets an alert. */
export const STALL_MS = 5 * 60_000;
/** A task that errors this many times when asked for its results is given up on (a task still being worked on is not an error). */
export const MAX_TASK_ERRORS = 3;
/** Below this share of finished checks, the report is not made: the visitor is asked to try again. */
export const MIN_DONE_SHARE = 0.6;
/** Once this share of the grid is in, the practices ahead of you are picked from what we have and their reviews and posts tasks go out,
    so those run alongside the rest of the grid instead of after it. */
export const EARLY_COMPETITORS_SHARE = 0.5;
/** The early pick is wider than the final four: a practice that is in the top three a little less often at the halfway mark can still make
    the final four, and a lookup asked for too late costs about two minutes. Each extra practice costs about $0.003. */
export const EARLY_CANDIDATES = 8;
/** A poll fetches and parses at most this many finished tasks. Each response is about 40 KB, so this bounds a poll's CPU time: the free
    plan gives an invocation 10 ms in all. */
export const FETCH_PER_POLL = 8;

/* --- scoring: credit by rank -------------------------------------------------------------------- */

export const creditFor = (rank: number | null): number => {
  if (rank === null) return 0;
  if (rank <= 3) return 1;
  if (rank <= 10) return 0.5;
  if (rank <= 20) return 0.2;
  return 0;
};

/* --- keywords ----------------------------------------------------------------------------------- */

const BASE_KEYWORDS = ['therapist', 'counselor', 'psychologist'];

/** The fourth keyword, from the profile's category. No "near me": the point's coordinates carry the place. */
export function defaultKeywords(category: string | null, extra: string[] = []): string[] {
  const text = [category ?? '', ...extra].join(' ').toLowerCase();
  let specialty = 'anxiety therapist';
  if (/marriage|couple|family/.test(text)) specialty = 'couples counseling';
  else if (/child|adolescent|teen/.test(text)) specialty = 'child therapist';
  else if (/addict|substance|alcohol/.test(text)) specialty = 'addiction counseling';
  else if (/trauma|ptsd|emdr/.test(text)) specialty = 'trauma therapist';
  else if (/psychiatr/.test(text)) specialty = 'psychiatrist';
  else if (/grief/.test(text)) specialty = 'grief counseling';
  return [...BASE_KEYWORDS, specialty];
}

/* --- gaps and fixes ----------------------------------------------------------------------------- */

export const T = {
  /** You are "well behind" on reviews or photos when the practices ahead have this many times as many. */
  countRatio: 1.5,
  reviewGapMin: 15,
  photosGapMin: 10,
  photosLow: 15,
  ratingGap: 0.2,
  reviewStaleDays: 30,
  postStaleDays: 14,
  /** A keyword is "weak" when its score is below this share of your best keyword's. */
  weakKeywordShare: 0.5,
} as const;

export const GAP_LABELS = {
  reviews: 'Google reviews',
  rating: 'Avg rating',
  photos: 'GBP photos',
  reviewRecency: 'Days since last review',
  postRecency: 'Days since last post',
} as const;

/** One short sentence per row on why it matters to someone choosing a therapist. */
export const GAP_NOTES = {
  reviews: 'More reviews can make a practice feel more established to someone comparing options.',
  rating: 'People often scan ratings before they read a single name.',
  photos: 'A fuller gallery helps someone picture the space before they book.',
  reviewRecency: 'A recent review tells Google, and people, that the practice is active.',
  postRecency: 'A quiet profile can read as a practice that is not taking clients.',
} as const;

export const FIX_TEXT = {
  reviews: {
    title: 'Make it easy for people to leave a review',
    body: 'Add a review link to your email signature and after-care notes, and mention it outside of session. Never confirm that anyone is or was a client when you reply, and check your licensing board’s guidance on reviews first.',
  },
  reviewRecency: {
    title: 'Keep reviews coming steadily',
    body: 'Aim for one or two new reviews a month rather than a burst. A review link in a routine email footer does this quietly.',
  },
  posts: {
    title: 'Post to your profile twice a month',
    body: 'A short update is enough: new openings, a seasonal note, or a link to a recent article. Posting regularly shows Google the profile is active.',
  },
  photos: {
    title: 'Add photos of your space and team',
    body: 'Upload 10 or more: the waiting area, the therapy room, the entrance, and a friendly headshot. Skip anything that shows a client.',
  },
  rating: {
    title: 'Reply to your reviews with care',
    body: 'Thank people for kind words and respond to critical ones calmly and briefly, without sharing any detail of care. Replies show the practice is attentive.',
  },
  services: {
    title: (kw: string) => `Add “${kw}” to your profile and website`,
    body: 'List it as a service on your Google Business Profile, add it to your categories if one fits, and make sure a page on your website covers it in your own words.',
  },
  coverage: {
    title: 'Build a page for the areas you serve',
    body: 'If clients come from several neighborhoods, a short page for each one, with real detail about how sessions work for people there, helps Google connect you to those searches.',
  },
} as const;
