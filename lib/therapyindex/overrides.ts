import type { Decision, OverrideTag } from './types';

/* ==========================================================================
   Manual corrections, applied by the normaliser on its next run (npm run therapyindex:normalise).
   ========================================================================== */

/** Organic results: bare domain (no www) -> the tag it should always get. Wins over everything, including the
    automatic directory list. Candidates are in data/therapyindex/review/<market>.json. */
export const DOMAIN_OVERRIDES: Record<string, OverrideTag> = {
  // Not local practices (flagged in the Austin review):
  'soundsofsaving.org': 'other',
  'therapylab.com': 'other',
  // 'example-counseling.com': 'local-no-map',
};

/** Names in AI answers to ignore completely (not a practice, not an institution worth recording). Matched on the
    normalised name, so spelling and "The" / "LLC" differences do not matter. */
export const AI_NAME_EXCLUSIONS: string[] = [
  'National Social Anxiety Center', // franchise network
];

/** Decisions on individual practices. Key: the practice's website domain, or "cid:<Google Maps CID>" when it has no
    website of its own (or shares one with a directory or chain).
      keep      independent practice: clears any automatic chain / medical / nonprofit tag
      chain     treat as a national or multi-location chain
      medical   interventional psychiatry or psychiatry-only
      nonprofit nonprofit or community organisation
      exclude   not a licensed practice: removed from the snapshot entirely
    chain, medical and nonprofit practices stay in the directory with their real score but never take a top-10 or
    leader slot. The block below is rewritten by `npm run therapyindex:review-apply` from the "decision" column of
    data/therapyindex/review/top30.csv; entries you add by hand are kept. */
// BEGIN PRACTICE_DECISIONS
export const PRACTICE_DECISIONS: Record<string, Decision> = {
  'suzannebartholomewlcsw.com': 'keep', // Suzanne Bartholomew, LCSW (therapist who also offers ketamine-assisted therapy)
  'texaspsychiatrygroup.com': 'medical', // Texas Psychiatry Group
  'familyhouston.org': 'nonprofit', // Family Houston
  'lifecoachaustin.com': 'exclude', // Life Coach Austin (not a licensed practice)
};
// END PRACTICE_DECISIONS
