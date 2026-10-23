/* Where the scorecard talks to its Pages Functions. Set NEXT_PUBLIC_SCORECARD_API to point a local
   `next dev` at a running `wrangler pages dev`; leave it empty in production (same origin). */
export const API = `${process.env.NEXT_PUBLIC_SCORECARD_API ?? ''}/api/scorecard`;

/** Reports live at /free-tools/website-scorecard-for-therapists/r/<id>/ (see public/_redirects). */
export const REPORT_BASE = '/free-tools/website-scorecard-for-therapists/r/';
