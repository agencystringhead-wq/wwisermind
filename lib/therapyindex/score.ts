import {
  AI_BONUS_CAP,
  AI_MENTION_POINTS,
  MAP_BELOW_PACK_MAX_RANK,
  MAP_BELOW_PACK_POINTS,
  MAP_PACK_POINTS,
  ORGANIC_POINTS,
  REVIEW_WEIGHT,
} from './markets';
import type { Practice } from './types';

/* ==========================================================================
   Visibility score. All the weights live in markets.ts; this file only combines them.

   Step 1, activity points, for one practice:
     map points      summed over every keyword the practice shows in Google Maps for
                       rank 1 / 2 / 3  -> MAP_PACK_POINTS (10 / 8 / 6)
                       rank 4 to 10    -> MAP_BELOW_PACK_POINTS (1)
                       beyond          -> 0
     organic points  summed over every keyword it ranks in the organic top 6, ORGANIC_POINTS
                     (4 / 3 / 2.5 / 2 / 1.5 / 1): worth less than the same map position
     AI bonus        AI_MENTION_POINTS for each ChatGPT or Claude answer that names it,
                     capped at AI_BONUS_CAP
   activity = map + organic + AI bonus.

   Step 2, scale both parts to 0..1 within the market (independent practices only: no directories, no chains):
     visibility = min(1, activity / best activity)
     reviews    = ln(reviewCount + 1) / ln(most reviews + 1)       (no reviews = 0)

   Step 3, blend:   combined = (1 - REVIEW_WEIGHT) * visibility + REVIEW_WEIGHT * reviews     (90% / 10%)
   The score shown is combined scaled so the best independent practice = 100.

   National chain locations (isChain) are scored on the same scale (capped at 100) but never set the leader or
   the review maximum; directories score 0. Lighthouse results are shown on the page but do not feed the score.
   ========================================================================== */

type Scorable = Pick<Practice, 'mapRankBySearch' | 'organicRankBySearch' | 'aiMentions' | 'isDirectory' | 'isChain' | 'reviewCount'>;

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

/** Each practice's 0 to 100 score, in the same order (see the formula at the top of this file). */
export function visibilityScores(practices: Scorable[], reviewWeight: number = REVIEW_WEIGHT): number[] {
  const independent = practices.map((p) => !p.isDirectory && !p.isChain);
  const activity = practices.map((p) => (p.isDirectory ? 0 : rawScore(p)));
  const bestActivity = Math.max(0, ...activity.filter((_, i) => independent[i]));
  const maxReviews = Math.max(0, ...practices.filter((_, i) => independent[i]).map((p) => p.reviewCount ?? 0));
  const combined = practices.map((p, i) => {
    if (p.isDirectory || bestActivity === 0) return 0;
    const visibility = Math.min(1, activity[i] / bestActivity);
    const reviews = maxReviews > 0 ? Math.log((p.reviewCount ?? 0) + 1) / Math.log(maxReviews + 1) : 0;
    return (1 - reviewWeight) * visibility + reviewWeight * Math.min(1, reviews);
  });
  const top = Math.max(0, ...combined.filter((_, i) => independent[i]));
  return combined.map((c) => (top > 0 ? Math.min(100, Math.round((c / top) * 100)) : 0));
}
