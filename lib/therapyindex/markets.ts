/* ==========================================================================
   Therapy Index: the one config file behind the data pipeline.
   Edit the markets, keywords, AI prompts and scoring weights here; nothing else needs touching.
   Imported by the fetch scripts (scripts/therapyindex) and by the scoring code (score.ts).
   ========================================================================== */

export type Market = {
  /** Used for the snapshot file name and the raw cache folder: data/therapyindex/<slug>.json */
  slug: string;
  city: string;
  stateSlug: string;
  stateName: string;
  /** Two-letter code, used in organic queries ("therapist Houston TX") and the local-site check. */
  stateAbbr: string;
  /** Exact DataForSEO location name ("City,State,United States"). Check it against
      https://api.dataforseo.com/v3/serp/google/locations before a live run. */
  dfsLocationName: string;
  /** Human wording for the area, e.g. "Richmond and the surrounding area". */
  areaLabel: string;
  /** Suburbs and nearby cities of the market. Used only to decide whether an organic result that is not in Maps
      looks local (its title or URL must mention the city, one of these, or the state). */
  extraLocations: string[];
};

export const MARKETS: Market[] = [
  {
    slug: 'houston-tx',
    city: 'Houston',
    stateSlug: 'texas',
    stateName: 'Texas',
    stateAbbr: 'TX',
    dfsLocationName: 'Houston,Texas,United States',
    areaLabel: 'Houston and the surrounding area',
    extraLocations: ['Katy', 'Sugar Land', 'The Woodlands', 'Pearland', 'Spring', 'Cypress', 'Humble', 'Bellaire', 'Pasadena', 'Galveston', 'League City', 'Missouri City', 'Conroe', 'Kingwood', 'Memorial', 'Friendswood', 'Tomball'],
  },
  {
    slug: 'austin-tx',
    city: 'Austin',
    stateSlug: 'texas',
    stateName: 'Texas',
    stateAbbr: 'TX',
    dfsLocationName: 'Austin,Texas,United States',
    areaLabel: 'Austin and the surrounding area',
    extraLocations: ['Round Rock', 'Cedar Park', 'Georgetown', 'Pflugerville', 'Lakeway', 'Leander', 'Kyle', 'Buda', 'San Marcos', 'Bee Cave', 'Westlake', 'Dripping Springs', 'Hutto'],
  },
  {
    slug: 'denver-co',
    city: 'Denver',
    stateSlug: 'colorado',
    stateName: 'Colorado',
    stateAbbr: 'CO',
    dfsLocationName: 'Denver,Colorado,United States',
    areaLabel: 'Denver and the surrounding area',
    extraLocations: ['Aurora', 'Lakewood', 'Littleton', 'Arvada', 'Westminster', 'Centennial', 'Englewood', 'Thornton', 'Boulder', 'Highlands Ranch', 'Parker', 'Castle Rock', 'Greenwood Village', 'Wheat Ridge', 'Golden', 'Cherry Creek'],
  },
];

/** Shared by every market. Each keyword is searched in Google Maps and Google Organic. */
export const KEYWORDS: string[] = [
  'therapist',
  'counselor',
  'anxiety therapist',
  'couples counseling',
  'trauma therapist',
  'EMDR therapist',
  'child therapist',
  'psychologist',
  'marriage counselor',
  'depression therapist',
  'grief counseling',
];

/** Asked to ChatGPT and Claude per market. {city} and {stateName} are filled in. Keep each under 500 characters. */
export const AI_PROMPTS: string[] = [
  'Who is the best therapist in {city}, {stateName}?',
  'Recommend an anxiety therapist in {city}, {stateName}',
  'Best couples counselor in {city}, {stateName}',
];

/* ---- Data collection settings ---- */

export const LANGUAGE_CODE = 'en';
/** How many Maps results to read per keyword. One Maps SERP bills per 100 results, so 100 costs the same as 20.
    (Google may return fewer than this.) The cache key includes the depth, so changing it never reuses older data. */
export const MAPS_DEPTH = 100;
/** Organic results requested per keyword (one billed SERP = 10 results). */
export const ORGANIC_DEPTH = 10;
/** How many organic results per search are kept in organicTopBySearch. */
export const ORGANIC_TOP_N = 6;
/** DataForSEO model names, checked against the live Models endpoints on 2026-10-21
    (`npm run therapyindex:fetch -- --models` prints the current list). Aim: the default models people
    use in the ChatGPT and Claude apps. A base name resolves to its latest dated version.
    claude-sonnet-5-5: the newest Sonnet, the tier the Claude app defaults to.
    gpt-5.6-luna: the ChatGPT default for free users (Aug 2026 reports); the list also has gpt-5.6-sol (the paid
    flagship) and a gpt-6 line (gpt-6-luna, gpt-6-sol), which reports say is limited to the desktop app so far.
    Swap here if you decide a different one better represents what your audience sees. */
export const AI_MODELS = { chatgpt: 'gpt-5.6-luna', claude: 'claude-sonnet-5-5' } as const;
/** Lighthouse is slow and costs per page, so only the best-ranked practice sites are tested. */
export const LIGHTHOUSE_MAX_PRACTICES = 40;
/** Cap on Google My Business lookups, used only for map results missing a phone, site or category. */
export const GMB_MAX_LOOKUPS = 25;

/* ---- Scoring weights (see score.ts for how they combine) ---- */

/** Points for a Google Maps position, per search. Index 0 = rank 1. The first three are the map pack. */
export const MAP_PACK_POINTS = [10, 8, 6];
/** Points for Maps ranks 4 to MAP_BELOW_PACK_MAX_RANK (visible in the expanded list, not the pack). */
export const MAP_BELOW_PACK_POINTS = 1;
export const MAP_BELOW_PACK_MAX_RANK = 10;
/** Points for an organic position, per search. Index 0 = rank 1. Deliberately smaller than the map pack. */
export const ORGANIC_POINTS = [4, 3, 2.5, 2, 1.5, 1];
/** A practice needs at least this many Google reviews to take a top-10 or leader slot. Below it, it stays in the
    directory with its real score and a fewReviews flag. */
export const MIN_REVIEWS_FOR_RANKING = 10;

/** Share of the final score that comes from review strength (the rest is map + organic + AI). */
export const REVIEW_WEIGHT = 0.25;

/** Bonus for each AI answer (one prompt on one engine) that names the practice. */
export const AI_MENTION_POINTS = 3;
/** Ceiling on the AI bonus so a few lucky answers cannot outweigh local search. */
export const AI_BONUS_CAP = 12;

/* ---- Smoke test (--smoke): the smallest live run that touches every endpoint ---- */

export const SMOKE = {
  keywords: ['therapist', 'couples counseling'],
  /** Index into AI_PROMPTS; one prompt per model. */
  promptIndexes: [0],
  lighthousePractices: 3,
  /** One forced Google My Business lookup, so that endpoint is exercised too. */
  gmbLookups: 1,
};
