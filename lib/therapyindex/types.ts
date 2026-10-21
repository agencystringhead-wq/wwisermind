export type SearchRanks = Record<string, number>;

export type AiProvider = 'chatgpt' | 'claude';

export type Practice = {
  slug: string;
  name: string;
  address: string | null;
  city: string | null;
  phone: string | null;
  website: string | null;
  /** Google Maps client id; the main de-duplication key. */
  mapsCid: string | null;
  category: string | null;
  rating: number | null;
  reviewCount: number | null;
  /** keyword -> Google Maps position (1 = first). */
  mapRankBySearch: SearchRanks;
  /** keyword -> Google organic position (1 = first). */
  organicRankBySearch: SearchRanks;
  aiMentions: {
    /** Number of prompts on each engine whose answer named this practice. */
    chatgpt: number;
    claude: number;
    prompts: { provider: AiProvider; prompt: string }[];
  };
  lighthouse: { performance: number; seo: number; accessibility: number } | null;
  /** 0 to 100, the top practice = 100. Directories are not scored (0). */
  visibilityScore: number;
  isDirectory: boolean;
  /** A location of a national chain or telehealth network (see chains.ts). Kept in practices[], but skipped
      for Lighthouse and never a top-10 or leader slot; shown with a "national chain" label. */
  isChain: boolean;
  chainName: string | null;
  /** False for a practice found only through organic results and AI answers (no Google Maps listing in the results). */
  hasMapListing: boolean;
  /** Google categories of the Maps listing (primary first, then additional). */
  categories: string[];
  /** Interventional psychiatry or psychiatry-only (see medical.ts). Kept in the directory, never top-10 or leader. */
  isMedical: boolean;
  /** Fewer than MIN_REVIEWS_FOR_RANKING Google reviews. Kept with its real score, never top-10 or leader. */
  fewReviews: boolean;
  /** Named clinicians attached to this practice by AI answers. */
  people: string[];
};

/** 'local-no-map': looks like a single practice's own site but is not in the Maps results. A
    heuristic guess, listed in data/therapyindex/review/<market>.json for manual confirmation. */
export type OrganicKind = 'local practice' | 'directory' | 'local-no-map' | 'other';
/** Tags an override can force onto a domain (see overrides.ts). */
export type OverrideTag = 'directory' | 'local-no-map' | 'other';

/** A practice or clinician that AI answers recommended but that matches nothing in Maps and no organic result. Near-duplicate
    spellings are merged into one entry; not scored and not in practices[]. */
export type AiOnlyMention = {
  /** The most complete spelling seen. */
  name: string;
  /** Clinicians named alongside the practice. */
  people: string[];
  mentions: { provider: AiProvider; model: string; prompt: string }[];
};

/** A Maps listing dropped because its Google category is not mental-health related. */
export type ExcludedMapsResult = {
  title: string;
  category: string | null;
  additionalCategories: string[];
  searches: { keyword: string; rank: number }[];
};

export type ReviewEntry = {
  domain: string;
  title: string;
  url: string;
  searches: { keyword: string; rank: number }[];
  /** Tag in the snapshot: 'local-no-map' unless an override changed it. */
  tag: OrganicKind;
  overridden: boolean;
  /** Slug of the practice this domain was promoted to (an AI-named practice with no Maps listing), if any. */
  promotedTo: string | null;
};

/** One result of the Google local pack that appears inside the organic SERP. */
export type LocalPackEntry = {
  position: number;
  title: string;
  domain: string | null;
  url: string | null;
  phone: string | null;
  mapsCid: string | null;
  rating: number | null;
  reviewCount: number | null;
  /** Slug of the matching entry in practices[] (by CID, else website domain). */
  practiceSlug: string | null;
};

/** One raw AI answer, saved for manual review (data/therapyindex/review/<market>-ai.json). */
export type AiReviewEntry = {
  provider: AiProvider;
  model: string;
  prompt: string;
  text: string;
  /** URLs the engine cited (web search annotations). */
  citations: string[];
  /** Practices from Maps that the answer named. */
  matchedPractices: string[];
  /** Every practice or person name extracted from the answer (after dropping regulators, modalities, directories, chains). */
  extractedNames: string[];
};

export type OrganicTopEntry = {
  rank: number;
  title: string;
  url: string;
  domain: string;
  kind: OrganicKind;
  /** Slug of the matching entry in practices[] (local practices and directories). */
  practiceSlug: string | null;
};

export type Snapshot = {
  snapshotDate: string;
  market: {
    slug: string;
    city: string;
    stateSlug: string;
    stateName: string;
    areaLabel: string;
  };
  keywords: string[];
  aiPrompts: string[];
  summary: {
    totalPractices: number;
    practicesInAnyMapPack: number;
    /** Share (0 to 100) of organic top-N slots, across all searches, held by directories. */
    directorySharePercent: number;
    practicesNamedByAi: number;
    /** Practices that are locations of a national chain (isChain). */
    chainLocations: number;
    /** Practices with no Maps listing, promoted from organic results because AI named them. */
    unlistedPractices: number;
    medicalPractices: number;
    fewReviewPractices: number;
  };
  practices: Practice[];
  /** Names the AI engines recommended that matched nothing in Maps. Not scored, not in practices[]. */
  aiOnlyMentions: AiOnlyMention[];
  organicTopBySearch: Record<string, OrganicTopEntry[]>;
  /** keyword -> the local pack shown on the organic results page. */
  localPackBySearch: Record<string, LocalPackEntry[]>;
};
