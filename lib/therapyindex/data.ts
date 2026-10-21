import { routes } from '@/lib/routes';
import { LOW_VISIBILITY_BELOW, PROFILE_INDEX_MIN_SCORE } from './config';
import { MARKETS } from './markets';
import { isRankEligible } from './score';
import { getSnapshots } from './snapshots';
import type { OrganicTopEntry, Practice, Snapshot } from './types';

/* ==========================================================================
   Therapy Index: everything the pages read, derived from the committed snapshots
   (data/therapyindex/<market>.json). Nothing in here is a typed-in number: counts, shares and
   leaders are all computed from the snapshots at build time. Server-only (it reads the file system).
   ========================================================================== */

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export const searchLabel = (keyword: string) => keyword.charAt(0).toUpperCase() + keyword.slice(1);

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "October 2026" from a snapshot date. */
export function formatMonth(date: string): string {
  const [year, month] = date.split('-').map(Number);
  return `${MONTHS[month - 1]} ${year}`;
}

/** "October 21, 2026" from a snapshot date. */
export function formatDate(date: string): string {
  const [year, month, day] = date.split('-').map(Number);
  return `${MONTHS[month - 1]} ${day}, ${year}`;
}

export type PracticeLabel = { id: 'chain' | 'medical' | 'nonprofit' | 'few' | 'nomap'; text: string };

export function practiceLabels(p: Practice): PracticeLabel[] {
  const labels: PracticeLabel[] = [];
  if (p.isChain) labels.push({ id: 'chain', text: 'National chain' });
  if (p.isMedical) labels.push({ id: 'medical', text: 'Medical' });
  if (p.isNonprofit) labels.push({ id: 'nonprofit', text: 'Nonprofit' });
  if (p.fewReviews) labels.push({ id: 'few', text: 'Few reviews' });
  if (!p.hasMapListing) labels.push({ id: 'nomap', text: 'No map listing' });
  return labels;
}

/** What a score looks like on a page: the number, or "Low visibility" under the threshold. */
export const scoreText = (score: number) => (score < LOW_VISIBILITY_BELOW ? 'Low visibility' : String(score));

export const bestMapRank = (p: Practice): number | null => {
  const ranks = Object.values(p.mapRankBySearch);
  return ranks.length ? Math.min(...ranks) : null;
};

/** A website address without tracking parameters (utm_*, Google Business Profile tags), for display and for the link. */
export function cleanUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    u.search = '';
    u.hash = '';
    return u.toString();
  } catch {
    return null;
  }
}

export const mapsUrl = (p: Practice): string | null => (p.mapsCid ? `https://www.google.com/maps?cid=${p.mapsCid}` : null);

/** Which kind of dot a practice gets on the map and in the legend. */
export type PracticeKind = 'practice' | 'chain' | 'medical' | 'nonprofit';
export const practiceKind = (p: Practice): PracticeKind => (p.isChain ? 'chain' : p.isMedical ? 'medical' : p.isNonprofit ? 'nonprofit' : 'practice');

export type MarketView = {
  snapshot: Snapshot;
  state: { slug: string; name: string };
  city: { slug: string; name: string };
  path: string;
  /** "ti-austin-tx-2026-10-21": the snapshot's identifier, as printed on the report. */
  snapshotId: string;
  month: string;
  date: string;
  /** Practices that can take a top-10 or leader slot, best score first. */
  eligible: Practice[];
  /** Position among the eligible practices, by practice slug. Ineligible practices have none. */
  rankOf: Map<string, number>;
  /** Everything that is not a directory: the directory of practices. */
  practices: Practice[];
  directories: Practice[];
  leader: Practice | null;
  /** Share (0 to 100) of organic top-6 slots held by directories, and the slots counted. */
  directoryShare: number;
  organicSlots: number;
  directorySlots: number;
  /** AI answers (one prompt on one engine) and how many named a hospital, university or directory. */
  aiAnswers: number;
  aiInstitutionAnswers: number;
  practicesNamedByAi: number;
};

let cache: MarketView[] | null = null;

export function getMarketViews(): MarketView[] {
  if (cache) return cache;
  cache = getSnapshots()
    .map((snapshot): MarketView => {
      const state = { slug: snapshot.market.stateSlug, name: snapshot.market.stateName };
      const city = { slug: slugify(snapshot.market.city), name: snapshot.market.city };
      const practices = snapshot.practices.filter((p) => !p.isDirectory);
      const eligible = practices.filter(isRankEligible);
      const rankOf = new Map(eligible.map((p, i) => [p.slug, i + 1]));
      const slots = Object.values(snapshot.organicTopBySearch).flat();
      const directorySlots = slots.filter((s) => s.kind === 'directory').length;
      const institutionAnswers = new Set<string>();
      for (const inst of snapshot.aiInstitutionMentions ?? []) {
        if (inst.type === 'chain') continue; // hospitals, universities and directories only
        for (const m of inst.mentions) institutionAnswers.add(`${m.provider}|${m.prompt}`);
      }
      return {
        snapshot,
        state,
        city,
        path: routes.therapyIndex.market(state.slug, city.slug),
        snapshotId: `ti-${snapshot.market.slug}-${snapshot.snapshotDate}`,
        month: formatMonth(snapshot.snapshotDate),
        date: formatDate(snapshot.snapshotDate),
        eligible,
        rankOf,
        practices,
        directories: snapshot.practices.filter((p) => p.isDirectory),
        leader: eligible[0] ?? null,
        directoryShare: slots.length ? Math.round((directorySlots / slots.length) * 1000) / 10 : 0,
        organicSlots: slots.length,
        directorySlots,
        aiAnswers: snapshot.aiPrompts.length * 2,
        aiInstitutionAnswers: institutionAnswers.size,
        practicesNamedByAi: snapshot.summary.practicesNamedByAi,
      };
    })
    // The order the markets are listed in markets.ts, so the pages read Houston, Austin, Denver.
    .sort((a, b) => MARKETS.findIndex((m) => m.slug === a.snapshot.market.slug) - MARKETS.findIndex((m) => m.slug === b.snapshot.market.slug));
  return cache;
}

export function getMarketView(state: string, city: string): MarketView | undefined {
  return getMarketViews().find((m) => m.state.slug === state && m.city.slug === city);
}

/** A practice gets a page of its own when it has a website or a score above zero. Directories never do. */
export const hasProfile = (p: Practice) => !p.isDirectory && (!!p.website || p.visibilityScore > 0);

/** Indexable when the score reaches PROFILE_INDEX_MIN_SCORE, or ChatGPT or Claude named the practice. */
export const isProfileIndexable = (p: Practice) => p.visibilityScore >= PROFILE_INDEX_MIN_SCORE || p.aiMentions.chatgpt + p.aiMentions.claude > 0;

export function practiceProfiles(): { state: string; city: string; practice: string }[] {
  return getMarketViews().flatMap((m) => m.practices.filter(hasProfile).map((p) => ({ state: m.state.slug, city: m.city.slug, practice: p.slug })));
}

/** The profiles that go in the sitemap (when INDEXABLE is on): the indexable ones. */
export function indexableProfiles(): { state: string; city: string; practice: string }[] {
  return getMarketViews().flatMap((m) =>
    m.practices.filter((p) => hasProfile(p) && isProfileIndexable(p)).map((p) => ({ state: m.state.slug, city: m.city.slug, practice: p.slug })),
  );
}

export type HubStats = {
  practices: number;
  cities: number;
  /** Share of all organic top-6 slots, across every city and search, held by directories. */
  directoryShare: number;
  date: string;
  month: string;
  /** The city where directories hold the largest share. */
  crowded: { city: string; share: number } | null;
  aiAnswers: number;
  aiInstitutionAnswers: number;
  searches: number;
  prompts: number;
};

export function getHubStats(): HubStats {
  const views = getMarketViews();
  const slots = views.reduce((n, m) => n + m.organicSlots, 0);
  const dirSlots = views.reduce((n, m) => n + m.directorySlots, 0);
  const latest = views.map((m) => m.snapshot.snapshotDate).sort().at(-1) ?? '';
  const crowded = [...views].sort((a, b) => b.directoryShare - a.directoryShare)[0];
  return {
    practices: views.reduce((n, m) => n + m.snapshot.summary.totalPractices, 0),
    cities: views.length,
    directoryShare: slots ? Math.round((dirSlots / slots) * 1000) / 10 : 0,
    date: latest ? formatDate(latest) : '',
    month: latest ? formatMonth(latest) : '',
    crowded: crowded ? { city: crowded.city.name, share: crowded.directoryShare } : null,
    aiAnswers: views.reduce((n, m) => n + m.aiAnswers, 0),
    aiInstitutionAnswers: views.reduce((n, m) => n + m.aiInstitutionAnswers, 0),
    searches: views[0]?.snapshot.keywords.length ?? 0,
    prompts: views[0]?.snapshot.aiPrompts.length ?? 0,
  };
}

/** The top three by Maps position for one search, from the practices' own rank data. */
export function mapTopThree(view: MarketView, keyword: string): Practice[] {
  return view.practices
    .filter((p) => (p.mapRankBySearch[keyword] ?? 99) <= 3)
    .sort((a, b) => a.mapRankBySearch[keyword] - b.mapRankBySearch[keyword]);
}

export type { OrganicTopEntry };
