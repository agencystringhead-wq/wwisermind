import { CHAINS } from '../../lib/therapyindex/chains';
import { DIRECTORY_DOMAINS } from '../../lib/therapyindex/directories';
import type { AiProvider } from '../../lib/therapyindex/types';

/* Names in AI answers: extraction, filtering and merging. Deliberately strict (a missed name is cheaper than
   junk), and every raw answer is saved in review/<market>-ai.json so misses can be found by hand. */

const NAME_NOISE = /\b(llc|pllc|pc|p\.c|inc|ltd|the|and)\b/g;
/** Light normalisation used to compare practice names with answer text. */
export function nameKey(name: string): string {
  return name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9 ]+/g, ' ').replace(NAME_NOISE, ' ').replace(/\s+/g, ' ').trim();
}

const CREDENTIAL_TOKENS = new Set(['phd', 'psyd', 'lpc', 'lpcs', 'lcsw', 'lcswc', 'lmft', 'lpcc', 'lcpc', 'lmhc', 'lmsw', 'md', 'ncc', 'dr', 'mr', 'ms', 'mrs', 'cctp', 'msw', 'ma']);
const GENERIC_WORDS = new Set([
  'counseling', 'counselling', 'counselor', 'counselors', 'therapy', 'therapies', 'therapist', 'therapists', 'psychotherapy',
  'psychology', 'psychological', 'psychologist', 'pllc', 'llc', 'pc', 'inc', 'associates', 'group', 'center', 'centre',
  'clinic', 'services', 'practice', 'of', 'and', 'the', 'in', 'for', 'a', 'an',
]);

/** Name with "Dr.", credentials and generic words (Counseling, Therapy, PLLC ...) stripped, for merging near-duplicates. */
export function entityKey(name: string): string {
  const cleaned = name.toLowerCase().replace(/\./g, '').replace(/&/g, ' and ').replace(/[^a-z0-9 ]+/g, ' ');
  return cleaned
    .split(/\s+/)
    .filter((w) => w && !CREDENTIAL_TOKENS.has(w) && !GENERIC_WORDS.has(w))
    .join(' ');
}

/** Same practice or person when the stripped keys are equal ("Just Mind" = "Just Mind Counseling" = "Dr. Just Mind, PLLC"), or when
    one full name contains the other as whole words and is long enough to be specific. Containment is checked on the unstripped
    names on purpose: "Austin Trauma" must not swallow "Austin Counseling & Trauma Specialists". */
export function sameName(a: string, b: string): boolean {
  const ka = entityKey(a);
  const kb = entityKey(b);
  if (ka && ka === kb) return true;
  const na = nameKey(a);
  const nb = nameKey(b);
  const [short, long] = na.length <= nb.length ? [na, nb] : [nb, na];
  return short.length >= 12 && short.includes(' ') && ` ${long} `.includes(` ${short} `);
}

/* ---- What to drop ---- */

const REGULATORS = /^national\b|\blicensed\b|\b(council|board|commission|department|licensing|association|society|federation|bureau|agency|government|nami|samhsa|lifeline|hotline|executive)\b/i;
const MODALITY_WORDS = new Set([
  'emdr', 'eft', 'cbt', 'dbt', 'act', 'ifs', 'erp', 'cpt', 'gottman', 'imago', 'emotionally', 'focused', 'cognitive', 'behavioral',
  'behavioural', 'behavior', 'dialectical', 'acceptance', 'commitment', 'internal', 'systems', 'psychodynamic', 'somatic',
  'experiencing', 'exposure', 'response', 'prevention', 'narrative', 'solution', 'brief', 'mindfulness', 'processing',
  'trauma', 'anxiety', 'depression', 'grief', 'couples', 'couple', 'marriage', 'relationship', 'family', 'individual', 'child',
  'method', 'approach', 'discernment', 'training', 'certified', 'specialist', 'specialists', 'treatment', 'program', 'based', 'informed',
]);

function isRegulator(name: string): boolean {
  return REGULATORS.test(name);
}

/** "Emotionally Focused Therapy", "Gottman Method Couples Therapy": a technique, not a business or person. */
function isModality(name: string): boolean {
  const words = entityKey(name).split(' ').filter(Boolean);
  const raw = name.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w && !GENERIC_WORDS.has(w));
  return raw.length > 0 && raw.every((w) => MODALITY_WORDS.has(w)) && words.every((w) => MODALITY_WORDS.has(w));
}

const BRAND_KEYS = [...Object.values(DIRECTORY_DOMAINS), ...CHAINS.map((c) => c.name)].map(nameKey).filter((k) => k.length >= 4);
function isBrand(name: string): boolean {
  const key = nameKey(name);
  return BRAND_KEYS.some((b) => key === b || key.includes(b) || b.includes(key));
}

/* ---- Extraction ---- */

const BUSINESS_WORDS = /(counsel|therap|psych|wellness|associates|center|centre|group|practice|clinic|health|mind|behavior|family|institute|services|recovery|healing)/i;
const CREDENTIAL = String.raw`(?:Ph\.?D\.?|Psy\.?D\.?|LCSW(?:-C)?|LPC(?:-S)?|LMFT|LCPC|LMHC|LPCC|LMSW|M\.?D\.?|NCC)`;
const SMALL_WORDS = new Set(['a', 'an', 'the', 'of', 'and', '&', 'in', 'for', 'to', 'at', 'on', 'by', 'with']);
const LEADING_STOPS = /^(for|before|if|your|you|when|what|how|look|check|ask|try|consider|other|directories|credentials|logistics|fit|specialty|best|a|an|the|this|these|there|many|most|some|use|find|verify|tell|call)\b/i;

function looksLikeProperName(phrase: string): boolean {
  const words = phrase.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 8) return false;
  if (LEADING_STOPS.test(phrase) || /\bor\b/i.test(phrase)) return false;
  const significant = words.filter((w) => !SMALL_WORDS.has(w.toLowerCase()));
  const capitalised = significant.filter((w) => /^[A-Z0-9]/.test(w)).length;
  return significant.length > 0 && capitalised / significant.length >= 0.6;
}

export type Found = { name: string; people: string[] };

/** Practices and people named in one answer. A person who appears on the same line as a practice is attached to
    that practice instead of listed on their own. */
export function extractFromAnswer(text: string): Found[] {
  const out: Found[] = [];
  const person = new RegExp(String.raw`\b((?:Dr\.\s+)?[A-Z][A-Za-z'’-]+(?:\s+[A-Z]\.?)?\s+[A-Z][A-Za-z'’-]+),?\s+(${CREDENTIAL})`, 'g');
  for (const line of text.split('\n')) {
    const people: string[] = [];
    for (const m of line.matchAll(person)) people.push(`${m[1]}, ${m[2]}`);
    for (const m of line.matchAll(/\bDr\.\s+([A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+){1,2})/g)) {
      const name = `Dr. ${m[1]}`;
      if (!people.some((p) => sameName(p, name))) people.push(name);
    }
    const phrases: string[] = [];
    for (const m of line.matchAll(/\*\*([^*\n]{3,90})\*\*/g)) phrases.push(m[1]);
    const li = line.match(/^\s*\d+\.\s+([^\n]{3,120})/);
    if (li) phrases.push(li[1].replace(/\*\*/g, ''));
    const orgs: string[] = [];
    for (const raw of phrases) {
      for (const part of raw.replace(/[*_`]+/g, '').split(/\s+\/\s+/)) {
        const phrase = part.split(/\s[-–—]\s|:|\(/)[0].trim();
        // "The Menninger Clinic": a leading "The" is part of the name, not a sentence opener.
        const bare = phrase.replace(/^the\s+/i, '');
        if (BUSINESS_WORDS.test(bare) && looksLikeProperName(bare) && !orgs.includes(phrase)) orgs.push(phrase);
      }
    }
    const ok = (n: string) => !isRegulator(n) && !isModality(n) && !isBrand(n) && entityKey(n).length >= 4;
    const cleanOrgs = orgs.filter(ok);
    const cleanPeople = people.filter(ok);
    if (cleanOrgs.length) {
      cleanOrgs.forEach((o, i) => out.push({ name: o, people: i === 0 ? cleanPeople : [] }));
    } else {
      for (const p of cleanPeople) out.push({ name: p, people: [] });
    }
  }
  return out;
}

/* ---- Merging across answers ---- */

export type RawMention = Found & { provider: AiProvider; model: string; prompt: string };
export type Entity = {
  /** The most complete spelling seen. */
  name: string;
  people: string[];
  mentions: { provider: AiProvider; model: string; prompt: string }[];
  /** The entity's name and its attached people, used for matching. */
  names: string[];
  isPersonOnly: boolean;
};

const looksLikePerson = (n: string) => /^Dr\./.test(n) || new RegExp(String.raw`,\s*${CREDENTIAL}$`).test(n);

export function mergeEntities(mentions: RawMention[]): Entity[] {
  const entities: Entity[] = [];
  const add = (e: Entity, m: RawMention) => {
    if (m.name.length > e.name.length) e.name = m.name;
    for (const p of m.people) if (!e.people.some((x) => sameName(x, p))) e.people.push(p);
    if (!e.mentions.some((x) => x.provider === m.provider && x.prompt === m.prompt)) {
      e.mentions.push({ provider: m.provider, model: m.model, prompt: m.prompt });
    }
    e.names = [e.name, ...e.people];
  };
  for (const m of mentions) {
    let e = entities.find((x) => x.names.some((n) => sameName(n, m.name)));
    if (!e) {
      e = { name: m.name, people: [], mentions: [], names: [m.name], isPersonOnly: looksLikePerson(m.name) && m.people.length === 0 };
      entities.push(e);
    } else if (!looksLikePerson(m.name)) {
      e.isPersonOnly = false;
    }
    add(e, m);
  }
  // A person-only entity that is already attached to a practice joins that practice.
  const merged: Entity[] = [];
  for (const e of entities) {
    if (e.isPersonOnly) {
      const host = entities.find((x) => x !== e && !x.isPersonOnly && x.people.some((p) => sameName(p, e.name)));
      if (host) {
        for (const mm of e.mentions) {
          if (!host.mentions.some((x) => x.provider === mm.provider && x.prompt === mm.prompt)) host.mentions.push(mm);
        }
        continue;
      }
    }
    merged.push(e);
  }
  return merged;
}
