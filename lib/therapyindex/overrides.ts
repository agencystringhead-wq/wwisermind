import type { OverrideTag } from './types';

/* Manual corrections, applied by the normaliser on its next run (npm run therapyindex:normalise).
   Key: the bare domain (no www). Value: the tag the domain should always get in organic results.
   Review candidates in data/therapyindex/review/<market>.json, then add the ones to flip here.
   An override wins over everything, including the automatic directory list. */
export const DOMAIN_OVERRIDES: Record<string, OverrideTag> = {
  // 'example-counseling.com': 'local-no-map',
  // 'some-listicle-site.com': 'other',
};
