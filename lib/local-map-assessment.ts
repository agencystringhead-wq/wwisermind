import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';

/* ==========================================================================
   Local Map Assessment: the landing page's words and its sample data.

   Everything the page shows as a "sample" comes from one small model in this file, so the hero
   mockup, the report preview and its leaderboard always agree. All practice names are invented.
   ========================================================================== */

export const LMA_PATH = routes.localMapAssessment;
export const LMA_START_PATH = '/local-map-assessment/start/';
export const LMA_URL = absUrl(LMA_PATH);
export const LMA_OG = '/images/local-map-assessment/og.jpg';

export const LMA_TITLE = 'Free Local Map Assessment for Therapists | wwisermind';
export const LMA_DESCRIPTION =
  'See which therapy practices outrank you on Google Maps in each part of town, and why. A free report in under 4 minutes. No login, no sales pitch.';

/** The id of the hero's practice field: every "run my report" button scrolls here and focuses it. */
export const SEARCH_FIELD_ID = 'lma-practice';

export const trustTicks = ['Free, no card', 'Under 4 minutes', 'No login, no sales pitch'] as const;

/* --- the sample model ------------------------------------------------------------------------- */

export const GRID = 5;

export const searchTerms = ['therapist near me', 'anxiety therapist', 'couples counseling', 'trauma therapy'] as const;
export type SearchTerm = (typeof searchTerms)[number];

export type Rank = number | null; // null: not in the first 20
export type Tone = 'good' | 'mid' | 'low' | 'none';

export const toneOf = (rank: Rank): Tone => (rank === null ? 'none' : rank <= 3 ? 'good' : rank <= 10 ? 'mid' : 'low');

type Practice = {
  id: string;
  name: string;
  /** Where the practice sits on the grid, and how strong its profile is for each search term. */
  home: [number, number];
  strength: Record<SearchTerm, number>;
};

export const practices: Practice[] = [
  { id: 'you', name: 'You', home: [1, 3], strength: { 'therapist near me': 0.66, 'anxiety therapist': 0.64, 'couples counseling': 0.45, 'trauma therapy': 0.55 } },
  { id: 'cedar', name: 'Cedar Path Counseling', home: [2, 1], strength: { 'therapist near me': 0.86, 'anxiety therapist': 0.7, 'couples counseling': 0.8, 'trauma therapy': 0.5 } },
  { id: 'northside', name: 'Northside Therapy Collective', home: [3, 0], strength: { 'therapist near me': 0.7, 'anxiety therapist': 0.82, 'couples counseling': 0.6, 'trauma therapy': 0.74 } },
  { id: 'willow', name: 'Willow Lane Psychology', home: [4, 3], strength: { 'therapist near me': 0.55, 'anxiety therapist': 0.5, 'couples counseling': 0.75, 'trauma therapy': 0.82 } },
  { id: 'harbor', name: 'Harbor Street Therapy', home: [0, 0], strength: { 'therapist near me': 0.4, 'anxiety therapist': 0.45, 'couples counseling': 0.35, 'trauma therapy': 0.4 } },
];

/** A small seeded generator, so the sample is the same on the server and in the browser. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FILLERS = 14;

/** rank[practiceId][cell] for one search term; cell = row * GRID + column. */
export function rankGrid(term: SearchTerm): Record<string, Rank[]> {
  const rand = mulberry32(7 + searchTerms.indexOf(term) * 101);
  const out: Record<string, Rank[]> = Object.fromEntries(practices.map((p) => [p.id, [] as Rank[]]));
  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      const scores = practices.map((p) => {
        const dist = Math.hypot(col - p.home[0], row - p.home[1]);
        return p.strength[term] - dist * 0.17 + (rand() - 0.5) * 0.12;
      });
      const fillers = Array.from({ length: FILLERS }, () => 0.05 + rand() * 0.4);
      practices.forEach((p, i) => {
        const higher = scores.filter((s, j) => j !== i && s > scores[i]).length + fillers.filter((s) => s > scores[i]).length;
        const rank = higher + 1;
        out[p.id].push(rank <= 20 ? rank : null);
      });
    }
  }
  return out;
}

export type LeaderRow = { id: string; name: string; top3: number; score: number };

/** The leaderboard for one term: zones where each practice is in the top 3, and a 0 to 100 score. */
export function leaderboard(term: SearchTerm): LeaderRow[] {
  const grid = rankGrid(term);
  return practices
    .map((p) => {
      const ranks = grid[p.id];
      const top3 = ranks.filter((r) => r !== null && r <= 3).length;
      const points = ranks.reduce<number>((sum, r) => sum + (r === null ? 0 : Math.max(0, 21 - r) / 20), 0);
      return { id: p.id, name: p.name, top3, score: Math.round((points / ranks.length) * 100) };
    })
    .sort((a, b) => b.score - a.score);
}

/** The term the hero's sample report shows. */
export const HERO_TERM: SearchTerm = 'therapist near me';

/* --- copy ------------------------------------------------------------------------------------- */

export const realityCards = [
  {
    title: 'You do not know where you really rank.',
    body: 'Google personalises results by location and history. What looks like first place to you may not show up at all for someone three neighbourhoods over.',
  },
  {
    title: 'You can be top 3 in one neighbourhood and missing in the next.',
    body: 'Map rankings shift block by block. The areas where your ideal clients live may never see you, and a single ranking number cannot tell you which.',
  },
  {
    title: 'You cannot see which practice is getting those enquiries.',
    body: 'Where you are not showing up, another practice is. Until you see their names beside yours, it is hard to know who is being found first, or why.',
  },
] as const;

export const mapPack = [
  { name: 'Cedar Path Counseling', rating: 4.9, reviews: 212, kind: 'Counselor', distance: '0.8 mi', open: true },
  { name: 'Northside Therapy Collective', rating: 4.8, reviews: 164, kind: 'Mental health service', distance: '1.3 mi', open: true },
  { name: 'Willow Lane Psychology', rating: 4.7, reviews: 129, kind: 'Psychologist', distance: '1.9 mi', open: true },
] as const;

export const stats = [
  { big: '3', label: 'Results', body: 'Google Maps shows three practices in the map pack. If you are not one of them, many people searching simply will not see you.' },
  { big: 'Direct', label: 'To your phone', body: 'People can call, message or get directions straight from the map, often before they ever open a website.' },
  { big: '#1', label: 'The top spot', body: 'The first result tends to get a clearly larger share of attention than the ones below it, and far more than a practice outside the pack.' },
] as const;

export const statsNote =
  'We have left out percentages on purpose. Published figures for how people use the map pack vary by study and method, and we would rather give you guidance than a number we cannot stand behind. The three-result pack is how Google Maps displays local results for most searches.';

export const reportParts = [
  { n: '01', title: 'Visibility map', body: 'A colour-coded grid of 25 points across your area, so you can see where you show up and where you do not.' },
  { n: '02', title: 'Practices outranking you', body: 'The names of the practices that appear above you in each zone, for each of four search terms people use to find a therapist.' },
  { n: '03', title: 'Gap analysis', body: 'Your Google Business Profile beside the practices ahead of you: reviews, rating, photos and how recently you were active.' },
  { n: '04', title: 'A ranked action plan', body: 'A short list of fixes in order of impact, so you know what to do first. No 30 page document.' },
] as const;

export const gapRows = [
  { metric: 'Google reviews', you: '38', top: '142', gap: '-104', note: 'Fewer reviews can make a practice feel less established to someone comparing options.' },
  { metric: 'Avg rating', you: '4.7', top: '4.9', gap: '-0.2', note: 'People often scan ratings before they read a single name.' },
  { metric: 'GBP photos', you: '12', top: '46', gap: '-34', note: 'A fuller gallery helps someone picture the room before they book.' },
  { metric: 'Days since last review', you: '71', top: '6', gap: '+65', note: 'A recent review tells Google, and people, that the practice is active.' },
  { metric: 'Days since last post', you: '190', top: '9', gap: '+181', note: 'A quiet profile can read as a practice that is not taking clients.' },
] as const;

export const whyBullets = [
  'The top practices have around four times as many Google reviews as you, and they add new ones most weeks.',
  'Your profile lists fewer services and specialties than theirs, so Google has less to match to what people search.',
  'Their photos, posts and answers were updated this month. Yours were last touched months ago.',
] as const;

export const actionPlan = [
  'Ask recent clients for a review with one short, ethical message, and aim for two a month.',
  'Add your main specialties, services and session types to your Google Business Profile.',
  'Upload 10 new photos of your space and team, and post an update once a month.',
] as const;

export const steps = [
  { n: '1', title: 'Find your practice', body: 'Type your practice name and city. We find your Google Business Profile for you. No login, no setup.' },
  { n: '2', title: 'We check 25 points around you', body: 'We look at Google Maps from 25 spots across your area, for four search terms people use to find a therapist.' },
  { n: '3', title: 'Get your report', body: 'The map, the practices outranking you, the gaps and a short action plan, ready in minutes.' },
] as const;

export const faqs = [
  {
    title: 'I have good reviews. Why do other practices rank above me?',
    body: 'Reviews are one factor, and recent reviews often count for more than the total. Google also weighs how complete your profile is, your categories, photos, how active you are and how close you are to the person searching. The report shows you exactly where the gap is.',
  },
  {
    title: 'I am mostly telehealth. Does Maps ranking still matter?',
    body: 'Often, yes. Many people searching for a therapist still look nearby first, and some states require clients to be located there. If you see clients online within a region, the report still shows how you appear to people in the places you serve.',
  },
  {
    title: 'How long does it take?',
    body: 'Under 4 minutes from entering your practice name to seeing your report. We check 25 points around your location for four search terms.',
  },
  {
    title: 'Is it actually free?',
    body: 'Yes. There is no card, no login and no required call. wwisermind helps therapists get found online, and this is one way we introduce ourselves.',
  },
  {
    title: 'Is my practice or client data safe?',
    body: 'We only read public information that already appears on Google, such as your listing, reviews and photos. We never ask for access to your Google account, your records or any client information.',
  },
  {
    title: 'What happens after I get my report?',
    body: 'You keep it. Use it yourself, share it with whoever manages your website, or book a free call with us if you would like help acting on it. Either way is fine.',
  },
] as const;

export const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.title,
    acceptedAnswer: { '@type': 'Answer', text: f.body },
  })),
};
