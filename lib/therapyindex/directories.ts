import { chainFor } from './chains';
import { DOMAIN_OVERRIDES, PRACTICE_DECISIONS } from './overrides';
import type { Market } from './markets';
import type { OrganicKind } from './types';

/** Therapist directories and marketplaces. Matched against the result's domain (subdomains count). */
export const DIRECTORY_DOMAINS: Record<string, string> = {
  'psychologytoday.com': 'Psychology Today',
  'headway.co': 'Headway',
  'zocdoc.com': 'Zocdoc',
  'growtherapy.com': 'Grow Therapy',
  'helloalma.com': 'Alma',
  'betterhelp.com': 'BetterHelp',
  'talkspace.com': 'Talkspace',
  'therapyden.com': 'TherapyDen',
  'goodtherapy.org': 'GoodTherapy',
  'therapytribe.com': 'TherapyTribe',
  'openpathcollective.org': 'Open Path',
  'zencare.co': 'Zencare',
  'rula.com': 'Rula',
  'thriveworks.com': 'Thriveworks',
  'choosingtherapy.com': 'Choosing Therapy',
  'healthgrades.com': 'Healthgrades',
  'yelp.com': 'Yelp',
  'mentalhealthmatch.com': 'Mental Health Match',
  'therapyportal.com': 'TherapyPortal',
  'sondermind.com': 'SonderMind',
  'cerebral.com': 'Cerebral',
  'brightside.com': 'Brightside',
  'vitals.com': 'Vitals',
  'webmd.com': 'WebMD',
  'psychhub.com': 'PsychHub',
  'findmycenter.org': 'Find My Center',
  'theravive.com': 'Theravive',
  'findatherapist.com': 'FindATherapist',
  'facebook.com': 'Facebook',
  'linkedin.com': 'LinkedIn',
};

/** Key for a manual decision on a practice: its own website domain, or "cid:<CID>" when it has none or shares one with a directory
    (many therapists link to a Psychology Today page, and chain branches share one domain). */
export function practiceKey(domain: string | null, mapsCid: string | null): string | null {
  if (domain && !directoryName(domain)) return domain;
  return mapsCid ? `cid:${mapsCid}` : null;
}

export function normaliseDomain(urlOrDomain: string | null | undefined): string | null {
  if (!urlOrDomain) return null;
  let host = urlOrDomain.trim().toLowerCase();
  try {
    host = new URL(host.includes('://') ? host : `https://${host}`).hostname;
  } catch {
    return null;
  }
  return host.replace(/^www\./, '') || null;
}

/** The directory's display name when the domain is a known directory, else null. */
export function directoryName(domain: string | null): string | null {
  if (!domain) return null;
  for (const [d, name] of Object.entries(DIRECTORY_DOMAINS)) {
    if (domain === d || domain.endsWith(`.${d}`)) return name;
  }
  return null;
}

/** Tag for one organic result. Order: manual override, known directory, Maps practice, single-practice
    guess, otherwise 'other'. `candidate` is true when the heuristic thought the domain was a single
    local practice outside Maps; those go into the review file with their final tag. */
export function classifyDomain(
  domain: string | null,
  practiceDomains: Set<string>,
  title: string,
  url: string,
  snippet: string,
  market: Market,
): { kind: OrganicKind; candidate: boolean; overridden: boolean } {
  const known = !!directoryName(domain) || (!!domain && practiceDomains.has(domain));
  // A chain's own website is not a single local practice, even when its title mentions the city.
  const candidate = !known && !(domain && chainFor(domain, '')) && looksLikeSinglePractice(domain, title, url, snippet, market);
  // A practice manually excluded from the snapshot is not a local practice outside Maps either.
  if (domain && PRACTICE_DECISIONS[domain] === 'exclude') return { kind: 'other', candidate: false, overridden: true };
  const override = domain ? DOMAIN_OVERRIDES[domain] : undefined;
  if (override) return { kind: override, candidate, overridden: true };
  if (directoryName(domain)) return { kind: 'directory', candidate, overridden: false };
  if (known) return { kind: 'local practice', candidate, overridden: false };
  return { kind: candidate ? 'local-no-map' : 'other', candidate, overridden: false };
}

/* ---- "Looks like a single practice" heuristic (for organic results that are neither a directory
   nor in Maps). It only guesses: every guess is written to data/therapyindex/review/<market>.json
   and can be corrected in overrides.ts. ---- */

/** National brands, publishers, forums, social and reference sites. Subdomains count. */
export const NOT_A_PRACTICE_DOMAINS = [
  'reddit.com', 'quora.com', 'wikipedia.org', 'youtube.com', 'instagram.com', 'tiktok.com', 'pinterest.com',
  'medium.com', 'indeed.com', 'glassdoor.com', 'nextdoor.com', 'mapquest.com', 'bbb.org', 'google.com',
  'nytimes.com', 'forbes.com', 'usnews.com', 'cnn.com', 'npr.org', 'washingtonpost.com', 'time.com',
  'healthline.com', 'verywellmind.com', 'psychcentral.com', 'everydayhealth.com', 'mayoclinic.org',
  'clevelandclinic.org', 'hopkinsmedicine.org', 'nami.org', 'apa.org', 'psychiatry.org', 'mhanational.org',
  'lifestance.com', 'mindpath.com', 'talkiatry.com', 'amwell.com', 'teladoc.com', 'mdlive.com',
  'cigna.com', 'aetna.com', 'uhc.com', 'unitedhealthcare.com', 'anthem.com', 'bcbs.com', 'kaiserpermanente.org',
  'cvs.com', 'walgreens.com', 'goodrx.com', 'nimh.nih.gov', 'samhsa.gov',
];
/** Words that mark an institution rather than one practice, matched anywhere in the domain. */
const INSTITUTION_WORDS = /(hospital|medicalcenter|medical|healthsystem|healthcare|health-system|university|college|school|church|ministr|parish|synagogue|mosque|ymca|hospice)/;
/** Titles of roundups and articles. */
const ARTICLE_TITLE = /\b(best|top\s*\d*|\d+\s+(best|top)|list of|near me|how to|guide|reviews?|vs\.?|cost of|what is)\b/i;

const US_STATE_ABBRS = new Set(
  'AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY DC'.split(' '),
);

const escapeRe = (x: string) => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Does the text mention the market's city, one of its suburbs or the state, without naming another state? */
export function mentionsMarket(text: string, market: Market): boolean {
  const flat = text.replace(/[-_/.]+/g, ' ');
  // "Richmond, CA" style: a different state in the title rules the market out.
  for (const m of text.matchAll(/,\s*([A-Z]{2})\b/g)) {
    if (US_STATE_ABBRS.has(m[1]) && m[1] !== market.stateAbbr) return false;
  }
  const places = [market.city, ...market.extraLocations, market.stateName];
  if (places.some((p) => new RegExp(String.raw`\b${escapeRe(p)}\b`, 'i').test(flat))) return true;
  return new RegExp(String.raw`\b${market.stateAbbr}\b`).test(flat);
}

/** Directories never reach this check (they are tagged first). Only a local-no-map guess has to look local. */
/** A therapy term must appear in the title or snippet (so a bare "Austin, TX" page or an unrelated business does not qualify). */
const THERAPY_TERM = /\b(therap(?:y|ies|ist|ists)|counsel(?:ing|ling|or|ors)|psycholog(?:y|ist|ists)|psychotherap\w*|LPC|LCSW|LMFT)\b/i;

export function looksLikeSinglePractice(domain: string | null, title: string, url: string, snippet: string, market: Market): boolean {
  if (!domain) return false;
  if (/\.(gov|edu|mil)$/.test(domain) || /\.(gov|edu|mil)\.[a-z]{2}$/.test(domain)) return false;
  if (NOT_A_PRACTICE_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`))) return false;
  if (INSTITUTION_WORDS.test(domain)) return false;
  if (ARTICLE_TITLE.test(title)) return false;
  // Both are required: a mention of the market (city, suburb or state) and a therapy term.
  return mentionsMarket(`${title} ${url} ${snippet}`, market) && THERAPY_TERM.test(`${title} ${snippet}`);
}
