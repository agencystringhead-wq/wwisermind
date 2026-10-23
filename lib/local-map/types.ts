/* Local Map Assessment: the shapes shared by the Pages Functions (server) and the pages (browser). No imports, so both can read it. */

/** A Google Business Profile the visitor can pick as theirs. */
export type Listing = {
  name: string;
  address: string | null;
  cid: string | null;
  placeId: string | null;
  /** Null when Google hides the address (a service-area practice): the visitor drops a pin instead. */
  lat: number | null;
  lng: number | null;
  rating: number | null;
  reviews: number | null;
  photos: number | null;
  category: string | null;
  additionalCategories: string[];
  website: string | null;
};

/** One result from a Maps search, kept small: [key, name, rating, review count, photos, category]. Results are stored in rank order. */
export type SerpRow = [key: string, name: string, rating: number | null, reviews: number | null, photos: number | null, category: string | null];

export type GridPoint = { i: number; row: number; col: number; lat: number; lng: number };

/** What we know about one practice in the report: from the Maps results, plus its newest review and newest post. */
export type Profile = {
  key: string;
  name: string;
  you: boolean;
  rating: number | null;
  reviews: number | null;
  photos: number | null;
  category: string | null;
  daysSinceReview: number | null;
  daysSincePost: number | null;
};

export type BoardRow = { key: string; name: string; you: boolean; score: number; top3Zones: number };

export type KeywordResult = {
  keyword: string;
  /** Your rank at each of the 25 points (1 to 20), or null for "not in the first 20" or "not checked". */
  ranks: (number | null)[];
  /** True where the check did not finish, so a grey dot is not read as "not found". */
  missing: boolean[];
  /** The top three names at each point. */
  top3: string[][];
  board: BoardRow[];
};

export type GapRow = {
  id: 'reviews' | 'rating' | 'photos' | 'reviewRecency' | 'postRecency';
  label: string;
  you: string;
  top: string;
  gap: string;
  note: string;
  /** True when you are behind the practices ahead of you on this measure. */
  behind: boolean;
};

export type Fix = { id: string; title: string; body: string };

export type Report = {
  id: string;
  version: number;
  createdAt: number;
  practice: { name: string; address: string | null; lat: number; lng: number };
  radiusMiles: number;
  points: GridPoint[];
  keywords: KeywordResult[];
  /** Average of the four keyword scores, 0 to 100. */
  overall: number;
  you: Profile;
  competitors: Profile[];
  gaps: GapRow[];
  why: string[];
  fixes: Fix[];
  /** How many of the 100 checks did not finish. */
  missingChecks: number;
  partial: boolean;
};

export type Progress = { pointsDone: number; pointsTotal: number; checksDone: number; checksTotal: number };

export type StatusResponse = {
  status: 'scanning' | 'done' | 'failed';
  progress: Progress;
  report?: Report;
  message?: string;
  canRetry?: boolean;
};
