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
  /** Exact DataForSEO location name ("City,State,United States"). Check it against
      https://api.dataforseo.com/v3/serp/google/locations before a live run. */
  dfsLocationName: string;
  /** Human wording for the area, e.g. "Richmond and the surrounding area". */
  areaLabel: string;
};

/** PLACEHOLDER: one market so the pipeline can be dry-run. Replace or extend with the 3 real cities. */
export const MARKETS: Market[] = [
  {
    slug: 'richmond-va',
    city: 'Richmond',
    stateSlug: 'virginia',
    stateName: 'Virginia',
    dfsLocationName: 'Richmond,Virginia,United States',
    areaLabel: 'Richmond and the surrounding area',
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

/** Asked to ChatGPT and Claude per market. {city} and {state} are filled in. Keep each under 500 characters. */
export const AI_PROMPTS: string[] = [
  'Who is the best therapist in {city}?',
  'Recommend an anxiety therapist in {city}',
  'Best couples counselor in {city}',
];

/* ---- Data collection settings ---- */

export const LANGUAGE_CODE = 'en';
/** How many Maps results to read per keyword. One Maps SERP bills per 100 results, so 20 costs the same as 100. */
export const MAPS_DEPTH = 20;
/** Organic results requested per keyword (one billed SERP = 10 results). */
export const ORGANIC_DEPTH = 10;
/** How many organic results per search are kept in organicTopBySearch. */
export const ORGANIC_TOP_N = 6;
/** DataForSEO model names (see the Models endpoints). Cheaper models keep the cost down. */
export const AI_MODELS = { chatgpt: 'gpt-5-mini', claude: 'claude-haiku-4-5' } as const;
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
/** Bonus for each AI answer (one prompt on one engine) that names the practice. */
export const AI_MENTION_POINTS = 3;
/** Ceiling on the AI bonus so a few lucky answers cannot outweigh local search. */
export const AI_BONUS_CAP = 12;
