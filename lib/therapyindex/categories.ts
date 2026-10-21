/* Google Maps categories that count as mental-health practices. A Maps listing is kept only when its primary
   category or one of its additional categories matches; everything else (massage, spa, wellness centre,
   chiropractor, physical or speech therapy, church, non-profit ...) is dropped and listed in
   data/therapyindex/review/<market>-excluded.json. */

const MENTAL_HEALTH_CATEGORY = new RegExp(
  [
    'psycholog', // psychologist, child psychologist, clinical psychologist
    'psychotherap', // psychotherapist, EMDR psychotherapist
    'psychiatr', // psychiatrist, child psychiatrist, psychiatric clinic
    'counsel(l)?or', // counselor, marriage or relationship counselor, family counselor
    'counselling',
    'mental health', // mental health service / clinic / center
    'behavioral health',
    'marriage',
    'family therap',
    'couples',
    'social worker',
    'addiction', // addiction treatment center
    'substance abuse',
    'alcoholism',
    'drug .*treatment',
    'sex therap',
    'grief',
  ].join('|'),
  'i',
);

export function isMentalHealthCategory(categories: (string | null | undefined)[]): boolean {
  return categories.some((c) => !!c && MENTAL_HEALTH_CATEGORY.test(c));
}
