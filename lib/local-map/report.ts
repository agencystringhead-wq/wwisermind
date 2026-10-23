import { FIX_TEXT, GAP_LABELS, GAP_NOTES, RULES_VERSION, T, creditFor } from './rules';
import type { BoardRow, Fix, GapRow, GridPoint, KeywordResult, Listing, Profile, Report, SerpRow } from './types';

/* Everything that turns the raw Maps results into the report: ranks, scores, the leaderboard, the gap table, the "why" bullets
   and the ranked fixes. Pure functions with no network and no storage, shared by the server and by the local checks. */

const DAY = 86_400_000;

export const normName = (s: string) => s.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, ' ').trim();

/** One practice's key across every result: its Google cid, else its place id, else its name. */
export const rowKey = (cid: string | null | undefined, placeId: string | null | undefined, name: string) => cid || placeId || `n:${normName(name)}`;

/** Does this result row belong to the practice the visitor picked? */
export function isYou(row: SerpRow, listing: Listing): boolean {
  const [key, name] = row;
  if (listing.cid && key === listing.cid) return true;
  if (listing.placeId && key === listing.placeId) return true;
  return normName(name) === normName(listing.name);
}

/** The rank (1 to 20) of the first row that matches, or null. */
export const rankOf = (rows: SerpRow[], match: (row: SerpRow) => boolean): number | null => {
  const i = rows.findIndex(match);
  return i === -1 ? null : i + 1;
};

export type Cells = (SerpRow[] | null)[][]; // [point][keyword]; null = that check did not finish

/** The four practices that appear in the top three most often (ties broken by how much credit they earn), never you. */
export function pickCompetitors(cells: Cells, listing: Listing, limit = 4): { key: string; name: string }[] {
  const tally = new Map<string, { key: string; name: string; top3: number; credit: number }>();
  for (const perPoint of cells) {
    for (const rows of perPoint) {
      if (!rows) continue;
      rows.forEach((row, i) => {
        if (isYou(row, listing)) return;
        const t = tally.get(row[0]) ?? { key: row[0], name: row[1], top3: 0, credit: 0 };
        if (i < 3) t.top3 += 1;
        t.credit += creditFor(i + 1);
        tally.set(row[0], t);
      });
    }
  }
  return [...tally.values()]
    .filter((t) => t.top3 > 0)
    .sort((a, b) => b.top3 - a.top3 || b.credit - a.credit)
    .slice(0, limit)
    .map(({ key, name }) => ({ key, name }));
}

const scoreOf = (ranks: (number | null)[], missing: boolean[]) => {
  const done = ranks.filter((_, i) => !missing[i]);
  if (!done.length) return 0;
  return Math.round((done.reduce<number>((s, r) => s + creditFor(r), 0) / done.length) * 100);
};

export type Extras = Record<string, { lastReviewAt: number | null; lastPostAt: number | null }>;

export type BuildInput = {
  id: string;
  now: number;
  listing: Listing;
  centre: { lat: number; lng: number };
  radiusMiles: number;
  keywords: string[];
  points: GridPoint[];
  cells: Cells;
  competitors: { key: string; name: string }[];
  extras: Extras;
};

const days = (ts: number | null | undefined, now: number) => (ts ? Math.max(0, Math.floor((now - ts) / DAY)) : null);
const avg = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => x !== null);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

export function buildReport(input: BuildInput): Report {
  const { listing, cells, keywords, points, now } = input;
  const youMatch = (row: SerpRow) => isYou(row, listing);
  const people = [{ key: 'you', name: listing.name, you: true, match: youMatch }, ...input.competitors.map((c) => ({ key: c.key, name: c.name, you: false, match: (row: SerpRow) => row[0] === c.key }))];

  /* The newest figures for each practice seen anywhere in the results. */
  const seen = (match: (row: SerpRow) => boolean): SerpRow | null => {
    for (const perPoint of cells) for (const rows of perPoint) for (const row of rows ?? []) if (match(row)) return row;
    return null;
  };
  const profileOf = (p: (typeof people)[number]): Profile => {
    const row = seen(p.match);
    const extra = input.extras[p.you ? 'you' : p.key];
    return {
      key: p.key,
      name: p.name,
      you: p.you,
      rating: row?.[2] ?? (p.you ? listing.rating : null),
      reviews: row?.[3] ?? (p.you ? listing.reviews : null),
      photos: row?.[4] ?? (p.you ? listing.photos : null),
      category: row?.[5] ?? (p.you ? listing.category : null),
      daysSinceReview: days(extra?.lastReviewAt, now),
      daysSincePost: days(extra?.lastPostAt, now),
    };
  };
  const profiles = people.map(profileOf);
  const you = profiles[0];
  const competitors = profiles.slice(1);

  let missingChecks = 0;
  const results: KeywordResult[] = keywords.map((keyword, k) => {
    const missing = points.map((p) => cells[p.i]?.[k] == null);
    missingChecks += missing.filter(Boolean).length;
    const ranksFor = (match: (row: SerpRow) => boolean) => points.map((p) => (cells[p.i]?.[k] ? rankOf(cells[p.i][k]!, match) : null));
    const board: BoardRow[] = people
      .map((p) => {
        const r = ranksFor(p.match);
        return { key: p.key, name: p.name, you: p.you, score: scoreOf(r, missing), top3Zones: r.filter((x) => x !== null && x <= 3).length };
      })
      .sort((a, b) => b.score - a.score || b.top3Zones - a.top3Zones);
    return {
      keyword,
      ranks: ranksFor(youMatch),
      missing,
      top3: points.map((p) => (cells[p.i]?.[k] ?? []).slice(0, 3).map((r) => r[1])),
      board,
    };
  });

  const overall = Math.round(results.reduce((s, r) => s + (r.board.find((b) => b.you)?.score ?? 0), 0) / Math.max(1, results.length));
  const gaps = buildGaps(you, competitors);

  return {
    id: input.id,
    version: RULES_VERSION,
    createdAt: now,
    practice: { name: listing.name, address: listing.address, lat: input.centre.lat, lng: input.centre.lng },
    radiusMiles: input.radiusMiles,
    points,
    keywords: results,
    overall,
    you,
    competitors,
    gaps,
    why: buildWhy(you, competitors, results),
    fixes: buildFixes(you, competitors, results),
    missingChecks,
    partial: missingChecks > 0,
  };
}

/* --- gap table ---------------------------------------------------------------------------------- */

const fmtInt = (n: number | null) => (n === null ? 'n/a' : String(Math.round(n)));
const fmtRating = (n: number | null) => (n === null ? 'n/a' : n.toFixed(1));
const signed = (n: number, digits = 0) => `${n > 0 ? '+' : n < 0 ? '-' : ''}${Math.abs(n).toFixed(digits)}`;

function buildGaps(you: Profile, others: Profile[]): GapRow[] {
  const mean = (pick: (p: Profile) => number | null) => avg(others.map(pick));
  const row = (id: GapRow['id'], yours: number | null, top: number | null, fmt: (n: number | null) => string, digits: number, higherIsBetter: boolean): GapRow => {
    const known = yours !== null && top !== null;
    const diff = known ? yours - top : 0;
    return {
      id,
      label: GAP_LABELS[id],
      you: fmt(yours),
      top: fmt(top),
      gap: known ? signed(digits ? Math.round(diff * 10) / 10 : Math.round(diff), digits) : 'n/a',
      note: GAP_NOTES[id],
      behind: known && (higherIsBetter ? top > yours : yours > top),
    };
  };
  return [
    row('reviews', you.reviews, mean((p) => p.reviews), fmtInt, 0, true),
    row('rating', you.rating, mean((p) => p.rating), fmtRating, 1, true),
    row('photos', you.photos, mean((p) => p.photos), fmtInt, 0, true),
    row('reviewRecency', you.daysSinceReview, mean((p) => p.daysSinceReview), fmtInt, 0, false),
    row('postRecency', you.daysSincePost, mean((p) => p.daysSincePost), fmtInt, 0, false),
  ];
}

/* --- why, and what to do ------------------------------------------------------------------------ */

type Signals = {
  reviews: { you: number; top: number } | null;
  photos: { you: number; top: number } | null;
  rating: { you: number; top: number } | null;
  reviewAge: { you: number | null; top: number } | null;
  postAge: { you: number | null; top: number } | null;
};

function signals(you: Profile, others: Profile[]): Signals {
  const m = (pick: (p: Profile) => number | null) => avg(others.map(pick));
  const reviews = m((p) => p.reviews);
  const photos = m((p) => p.photos);
  const rating = m((p) => p.rating);
  const reviewAge = m((p) => p.daysSinceReview);
  const postAge = m((p) => p.daysSincePost);
  return {
    reviews: reviews !== null && you.reviews !== null && reviews - you.reviews >= T.reviewGapMin && reviews >= you.reviews * T.countRatio ? { you: you.reviews, top: reviews } : null,
    photos:
      photos !== null && you.photos !== null && (you.photos < T.photosLow || (photos - you.photos >= T.photosGapMin && photos >= you.photos * T.countRatio))
        ? { you: you.photos, top: photos }
        : null,
    rating: rating !== null && you.rating !== null && rating - you.rating >= T.ratingGap ? { you: you.rating, top: rating } : null,
    reviewAge: reviewAge !== null && (you.daysSinceReview ?? Infinity) > T.reviewStaleDays && reviewAge < (you.daysSinceReview ?? Infinity) / 2 ? { you: you.daysSinceReview, top: reviewAge } : null,
    postAge: postAge !== null && (you.daysSincePost ?? Infinity) > T.postStaleDays && postAge < (you.daysSincePost ?? Infinity) ? { you: you.daysSincePost, top: postAge } : null,
  };
}

const youScore = (r: KeywordResult) => r.board.find((b) => b.you)?.score ?? 0;

function buildWhy(you: Profile, others: Profile[], results: KeywordResult[]): string[] {
  const s = signals(you, others);
  const items: { weight: number; text: string }[] = [];
  const n = (x: number) => Math.round(x);
  if (s.reviews) items.push({ weight: s.reviews.top / Math.max(1, s.reviews.you), text: `The practices ahead of you average ${n(s.reviews.top)} Google reviews. You have ${n(s.reviews.you)}.` });
  if (s.photos) items.push({ weight: 2, text: `Their profiles show about ${n(s.photos.top)} photos on average. Yours shows ${n(s.photos.you)}.` });
  if (s.postAge) {
    items.push({
      weight: 1.8,
      text: s.postAge.you === null
        ? 'We could not find a recent post on your profile, while the practices ahead of you have posted lately.'
        : `Your most recent post is ${n(s.postAge.you)} days old. The practices ahead of you posted about ${n(s.postAge.top)} days ago.`,
    });
  }
  if (s.reviewAge) items.push({ weight: 1.6, text: `Your latest review is ${n(s.reviewAge.you ?? 0)} days old. Theirs came in about ${n(s.reviewAge.top)} days ago.` });
  if (s.rating) items.push({ weight: 1.2, text: `Their average rating is ${s.rating.top.toFixed(1)}. Yours is ${s.rating.you.toFixed(1)}.` });

  const weakest = [...results].sort((a, b) => youScore(a) - youScore(b))[0];
  const notFound = weakest ? weakest.ranks.filter((r, i) => r === null && !weakest.missing[i]).length : 0;
  if (weakest && notFound >= 8) items.push({ weight: 1, text: `For “${weakest.keyword}” you did not appear in the first 20 results in ${notFound} of 25 zones.` });

  const out = items.sort((a, b) => b.weight - a.weight).slice(0, 4).map((i) => i.text);
  if (out.length < 2) {
    out.push('Your profile compares well with the practices ahead of you. The difference is more likely to come from distance and how closely each search matches your categories.');
  }
  return out;
}

function buildFixes(you: Profile, others: Profile[], results: KeywordResult[]): Fix[] {
  const s = signals(you, others);
  const picks: (Fix & { weight: number })[] = [];
  const add = (id: keyof typeof FIX_TEXT, weight: number, title?: string) => {
    const t = FIX_TEXT[id];
    picks.push({ id, weight, title: title ?? (typeof t.title === 'string' ? t.title : ''), body: t.body });
  };

  if (s.reviews) add('reviews', 5 + s.reviews.top / Math.max(1, s.reviews.you));
  if (s.reviewAge) add('reviewRecency', 4);
  if (s.postAge) add('posts', 3.5);
  if (s.photos) add('photos', 3);
  if (s.rating) add('rating', 2);

  const best = Math.max(...results.map(youScore), 0);
  const weak = results.filter((r) => best > 0 && youScore(r) < best * T.weakKeywordShare).sort((a, b) => youScore(a) - youScore(b))[0];
  if (weak) add('services', 2.5, FIX_TEXT.services.title(weak.keyword));

  if (results.every((r) => r.ranks.filter((x) => x !== null && x <= 3).length <= 4)) add('coverage', 1.5);

  /* Always at least three, from the steady habits, so the plan is never empty. */
  for (const id of ['reviews', 'posts', 'photos', 'rating'] as const) {
    if (picks.length >= 3) break;
    if (!picks.some((p) => p.id === id)) add(id, 0.5);
  }

  return picks
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map(({ id, title, body }) => ({ id, title, body }));
}
