import {
  AI_BONUS_CAP,
  AI_MENTION_POINTS,
  MAP_BELOW_PACK_MAX_RANK,
  MAP_BELOW_PACK_POINTS,
  MAP_PACK_POINTS,
  ORGANIC_POINTS,
} from './markets';
import type { Practice } from './types';

/* ==========================================================================
   Visibility score. All the weights live in markets.ts; this file only combines them.

   For one practice:
     map points      summed over every keyword the practice shows in Google Maps for
                       rank 1 / 2 / 3  -> MAP_PACK_POINTS (10 / 8 / 6)
                       rank 4 to 10    -> MAP_BELOW_PACK_POINTS (1)
                       beyond          -> 0
     organic points  summed over every keyword it ranks in the organic top 6, ORGANIC_POINTS
                     (4 / 3 / 2.5 / 2 / 1.5 / 1): worth less than the same map position
     AI bonus        AI_MENTION_POINTS for each ChatGPT or Claude answer that names it,
                     capped at AI_BONUS_CAP
   raw = map + organic + AI bonus.

   The score shown is raw scaled so the best non-directory practice in the market = 100.
   Lighthouse results are shown on the page but do not feed the score.
   ========================================================================== */

type Scorable = Pick<Practice, 'mapRankBySearch' | 'organicRankBySearch' | 'aiMentions' | 'isDirectory'>;

export function mapPoints(rank: number): number {
  if (rank >= 1 && rank <= MAP_PACK_POINTS.length) return MAP_PACK_POINTS[rank - 1];
  if (rank > MAP_PACK_POINTS.length && rank <= MAP_BELOW_PACK_MAX_RANK) return MAP_BELOW_PACK_POINTS;
  return 0;
}

export function organicPoints(rank: number): number {
  return rank >= 1 && rank <= ORGANIC_POINTS.length ? ORGANIC_POINTS[rank - 1] : 0;
}

export function rawScore(p: Scorable): number {
  const map = Object.values(p.mapRankBySearch).reduce((sum, r) => sum + mapPoints(r), 0);
  const organic = Object.values(p.organicRankBySearch).reduce((sum, r) => sum + organicPoints(r), 0);
  const answers = p.aiMentions.chatgpt + p.aiMentions.claude;
  const ai = Math.min(answers * AI_MENTION_POINTS, AI_BONUS_CAP);
  return map + organic + ai;
}

/** Each practice's 0 to 100 score, in the same order. Directories score 0 and are left out of
    the leader calculation. */
export function visibilityScores(practices: Scorable[]): number[] {
  const raws = practices.map((p) => (p.isDirectory ? 0 : rawScore(p)));
  const leader = Math.max(0, ...raws);
  return raws.map((r) => (leader > 0 ? Math.round((r / leader) * 100) : 0));
}
