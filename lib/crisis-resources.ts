import data from '@/lib/crisis-resources.json';

/* ==========================================================================
   EDITING THE DATA: after you change lib/crisis-resources.json, run `npm run crisis:data` and commit
   BOTH lib/crisis-resources.json and public/data/crisis-resources.json. The second is the copy the
   help now widget fetches from outside sites, and it is generated from the first. `npm run build`
   fails (scripts/check-crisis-data.mjs) if the two have drifted, so stale data cannot ship.

   Crisis Resources by State: the types and helpers over lib/crisis-resources.json.

   The JSON is the single source of truth. This site's pages read it through these helpers, and
   a later step publishes the same file for the help now widget on therapists' own sites.

   Nothing in the JSON is invented: every number, text code, hour and address is one that was
   checked against the official source named in `source`. An entry with `needsCheck: true` has
   not been checked yet, so no helper returns it and nothing renders it. State entries go in
   `states`, keyed by two-letter code, one state at a time after they are verified by hand.

   No em dashes or en dashes in this file or in the data.
   ========================================================================== */

export type CrisisCategory =
  | 'emergency'
  | 'crisis'
  | 'lgbtq'
  | 'veterans'
  | 'violence'
  | 'substance-use'
  | 'maternal'
  | 'eating-disorders'
  | 'support';

export type CrisisResource = {
  /** kebab-case */
  id: string;
  name: string;
  category: CrisisCategory;
  /** Who it is for, short. */
  audience: string;
  /** Display format. */
  call?: string;
  /** A tel: link, digits only. */
  callHref?: string;
  /** For example "Text HOME to 741741". */
  text?: string;
  /** An sms: link, number only, no body parameter (those behave differently on iOS and Android). */
  textHref?: string;
  tty?: string;
  chatUrl?: string;
  hours: string;
  languages?: string;
  notes?: string;
  /** The official URL used to verify the entry. */
  source: string;
  /** YYYY-MM-DD */
  verified: string;
  /** True: not yet verified against the official site, so it is never rendered publicly. */
  needsCheck?: boolean;
};

type CrisisData = {
  updated: string;
  national: CrisisResource[];
  states: Record<string, CrisisResource[]>;
};

const crisisData = data as CrisisData;

export const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  DC: 'District of Columbia',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
};

export type CrisisState = { code: string; name: string; slug: string };

/** "New Hampshire" becomes "new-hampshire": the last folder of a state page's address. */
const slugFor = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

/** A link from the data is used only if it starts with the one scheme its field allows
    (`tel:`, `sms:` or `https://`). Anything else comes back null and is skipped. */
export function safeHref(value: string | undefined, scheme: 'tel:' | 'sms:' | 'https://'): string | null {
  return typeof value === 'string' && value.startsWith(scheme) ? value : null;
}

const publishable = (resources: CrisisResource[]) =>
  resources.filter((resource) => resource.needsCheck !== true);

/** Every national resource that has been checked. Entries marked `needsCheck` stay out. */
export function getNationalResources(): CrisisResource[] {
  return publishable(crisisData.national);
}

/** A state's own resources, by two-letter code in any case. Empty when there are none. */
export function getStateResources(code: string): CrisisResource[] {
  return publishable(crisisData.states[code.toUpperCase()] ?? []);
}

/** The states that have at least one resource to show, in alphabetical order by name. */
export function getStatesWithData(): CrisisState[] {
  return Object.keys(crisisData.states)
    .filter((code) => STATE_NAMES[code] && getStateResources(code).length > 0)
    .map((code) => ({ code, name: STATE_NAMES[code], slug: slugFor(STATE_NAMES[code]) }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** The state for a page's slug ("illinois"), or undefined when it has no data. */
export function getStateBySlug(slug: string): CrisisState | undefined {
  return getStatesWithData().find((state) => state.slug === slug);
}

/** "October 2026", from the data file's `updated` date or an entry's own `verified` date. */
export function formatVerifiedDate(iso: string = crisisData.updated): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

/** The groups the main page draws, in order. A group with no resources to show is not drawn. */
export const CRISIS_SECTIONS: { id: string; title: string; categories: CrisisCategory[] }[] = [
  { id: 'crisis', title: 'Crisis and suicide', categories: ['emergency', 'crisis'] },
  { id: 'veterans', title: 'Veterans', categories: ['veterans'] },
  { id: 'lgbtq', title: 'LGBTQ+', categories: ['lgbtq'] },
  { id: 'violence', title: 'Violence and abuse', categories: ['violence'] },
  { id: 'substance-use', title: 'Substance use', categories: ['substance-use'] },
  { id: 'maternal', title: 'Pregnancy and new parents', categories: ['maternal'] },
  { id: 'eating-disorders', title: 'Eating disorders', categories: ['eating-disorders'] },
  { id: 'support', title: 'Information and support', categories: ['support'] },
];
