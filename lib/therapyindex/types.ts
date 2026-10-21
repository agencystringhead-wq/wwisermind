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
};

export type OrganicKind = 'local practice' | 'directory' | 'other';

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
  };
  practices: Practice[];
  organicTopBySearch: Record<string, OrganicTopEntry[]>;
};
