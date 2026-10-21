import { footerMain, siteConfig } from '@/lib/site';

/* ==========================================================================
   Therapy Index: page-level settings. The data pipeline's settings (markets, keywords, scoring
   weights) are in markets.ts; this file only holds what the pages need.
   ========================================================================== */

/** The one switch for search visibility. While false, every Therapy Index page is sent
    noindex, nofollow (app/therapyindex/layout.tsx) and the pages are left out of the sitemap, because
    a sitemap must not list a page that asks not to be indexed. True from launch day (2026-10-21). */
export const INDEXABLE = true;

/** When INDEXABLE is true, a practice profile is indexable only if its score is at least this, or it was named by ChatGPT or
    Claude. Every other profile stays live and linked but is sent noindex and left out of the sitemap. The hub, the city reports
    and the methodology page are always indexable when INDEXABLE is true. */
export const PROFILE_INDEX_MIN_SCORE = 10;

/** The founder's photo in the hub's quote bubbles. Replace the file at this path (square WebP, 256 x 256). */
export const FOUNDER_PHOTO = '/images/therapyindex/srikaanth-founder.webp';

/** The address on every disclaimer: the site's own contact email. */
export const CONTACT_EMAIL: string = footerMain.contact.email.value;
export const CONTACT_MAILTO = `mailto:${CONTACT_EMAIL}`;

/** The free 30-minute visibility review, a Cal.com booking (wwisermind/30min) through CtaLink. */
export const CAL_LINK = siteConfig.booking.calLink;

/** Scores under this show "Low visibility" instead of a number. */
export const LOW_VISIBILITY_BELOW = 5;

/** The brand line used in titles. */
export const BRAND = 'wwisermind';

/** How the tracked searches are grouped on the hub (section 06) and the methodology page. Keys match the
    keywords in markets.ts; a keyword not listed here shows up under "More searches". */
export const SEARCH_GROUPS: { id: string; title: string; note: string; keywords: string[] }[] = [
  { id: 'general', title: 'General', note: 'The broad searches most people start with.', keywords: ['therapist', 'counselor', 'psychologist'] },
  { id: 'mood', title: 'Anxiety & depression', note: 'Searches about low mood, worry and panic.', keywords: ['anxiety therapist', 'depression therapist'] },
  { id: 'relationships', title: 'Couples & family', note: 'Searches by people looking for help together.', keywords: ['couples counseling', 'marriage counselor'] },
  { id: 'trauma', title: 'Trauma & grief', note: 'Searches about trauma, EMDR and loss.', keywords: ['trauma therapist', 'EMDR therapist', 'grief counseling'] },
  { id: 'children', title: 'Children', note: 'Parents searching for help for a child.', keywords: ['child therapist'] },
];

/** The sources named on the hub's marquee and the methodology page. */
export const SOURCES = ['Google Maps', 'Google Search', 'ChatGPT', 'Claude', 'Lighthouse', 'DataForSEO'] as const;
