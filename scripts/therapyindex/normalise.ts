import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { CHAINS, chainFor } from '../../lib/therapyindex/chains';
import { classifyDomain, DIRECTORY_DOMAINS, directoryName, normaliseDomain } from '../../lib/therapyindex/directories';
import { AI_MODELS, AI_PROMPTS, KEYWORDS, MARKETS, ORGANIC_TOP_N, type Market } from '../../lib/therapyindex/markets';
import { visibilityScores } from '../../lib/therapyindex/score';
import type { AiOnlyMention, AiProvider, AiReviewEntry, LocalPackEntry, OrganicTopEntry, Practice, ReviewEntry, Snapshot } from '../../lib/therapyindex/types';
import { DATA_DIR, latestRawDate, RawStore, slugify, type RawReader } from './store';

/* Turns the cached raw responses into one snapshot (data/therapyindex/<market>.json) and a review list of
   organic results guessed to be single practices (data/therapyindex/review/<market>.json).
   buildResult is pure (reads only through `raw`), so it can be re-run for free any time. */

export function fillPrompt(prompt: string, market: Market): string {
  return prompt.replaceAll('{city}', market.city).replaceAll('{stateName}', market.stateName).replaceAll('{state}', market.stateName);
}

/** The organic query: keyword plus city and state code, with the market location also set on the request. */
export function organicQuery(keyword: string, market: Market): string {
  return `${keyword} ${market.city} ${market.stateAbbr}`;
}

/** Cache key for an AI answer. Includes the prompt text and model so changing either never reuses a stale answer. */
export function aiKey(promptIndex: number, prompt: string, model: string): string {
  return `p${promptIndex}-${crypto.createHash('sha1').update(`${model}|${prompt}`).digest('hex').slice(0, 8)}`;
}

const NAME_NOISE = /\b(llc|pllc|pc|p\.c|inc|ltd|the|and)\b/g;
function nameKey(name: string): string {
  return name.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9 ]+/g, ' ').replace(NAME_NOISE, ' ').replace(/\s+/g, ' ').trim();
}

type Draft = Practice & { _domain: string | null };

function resultItems(raw: any): any[] {
  return raw?.tasks?.[0]?.result?.[0]?.items ?? [];
}

function lighthouseScores(raw: any): Practice['lighthouse'] {
  const cats = raw?.tasks?.[0]?.result?.[0]?.categories;
  if (!cats) return null;
  const pct = (k: string) => (typeof cats[k]?.score === 'number' ? Math.round(cats[k].score * 100) : null);
  const performance = pct('performance');
  const seo = pct('seo');
  const accessibility = pct('accessibility');
  if (performance === null || seo === null || accessibility === null) return null;
  return { performance, seo, accessibility };
}

function emptyPractice(name: string): Draft {
  return {
    slug: '', name, address: null, city: null, phone: null, website: null, mapsCid: null, category: null,
    rating: null, reviewCount: null, mapRankBySearch: {}, organicRankBySearch: {},
    aiMentions: { chatgpt: 0, claude: 0, prompts: [] }, lighthouse: null, visibilityScore: 0,
    isDirectory: false, isChain: false, chainName: null, _domain: null,
  };
}

/** Practices found in Google Maps, de-duplicated by CID and then by website domain. Domains of
    directories are never used to merge (many unrelated therapists share psychologytoday.com). */
export function mapsPractices(market: Market, raw: RawReader, keywords: string[] = KEYWORDS): Draft[] {
  const drafts: Draft[] = [];
  const byCid = new Map<string, Draft>();
  const byDomain = new Map<string, Draft>();
  for (const kw of keywords) {
    for (const item of resultItems(raw.read('maps', kw))) {
      if (item.type !== 'maps_search' || !item.title) continue;
      const rank: number = item.rank_group;
      const cid: string | null = item.cid ? String(item.cid) : null;
      const domain = normaliseDomain(item.url ?? item.domain);
      const mergeable = domain && !directoryName(domain) ? domain : null;
      let d = (cid && byCid.get(cid)) || (mergeable && byDomain.get(mergeable)) || null;
      if (!d) {
        d = emptyPractice(item.title);
        drafts.push(d);
      }
      d.address ??= item.address ?? null;
      d.city ??= item.address_info?.city ?? null;
      d.phone ??= item.phone ?? null;
      d.website ??= item.url ?? null;
      d.mapsCid ??= cid;
      d.category ??= item.category ?? null;
      d.rating ??= item.rating?.value ?? null;
      d.reviewCount ??= item.rating?.votes_count ?? null;
      d._domain ??= domain;
      const prev = d.mapRankBySearch[kw];
      if (prev === undefined || rank < prev) d.mapRankBySearch[kw] = rank;
      if (cid) byCid.set(cid, d);
      if (mergeable) byDomain.set(mergeable, d);
    }
  }
  return drafts;
}

export type BuildOptions = { keywords?: string[]; promptIndexes?: number[] };
export type BuildResult = { snapshot: Snapshot; review: ReviewEntry[]; aiReview: AiReviewEntry[] };

export function buildSnapshot(market: Market, date: string, raw: RawReader, opts: BuildOptions = {}): Snapshot {
  return buildResult(market, date, raw, opts).snapshot;
}

/* ---- Names an AI answer recommends. Deliberately strict: a missed name is cheaper than junk, and every
   answer is saved in review/<market>-ai.json so misses can be found by hand. ---- */

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

/** Brand names that must never become an AI-only practice: directories and chains. */
const BRAND_KEYS = [...Object.values(DIRECTORY_DOMAINS), ...CHAINS.map((c) => c.name)].map(nameKey).filter((k) => k.length >= 4);
function isBrand(key: string): boolean {
  return BRAND_KEYS.some((b) => key === b || key.includes(b) || b.includes(key));
}

export function candidateNames(text: string): string[] {
  const found: string[] = [];
  // 1. "Name, credential" (Steven Dixon, Psy.D.) and "Dr. Name".
  const person = new RegExp(String.raw`\b((?:Dr\.\s+)?[A-Z][A-Za-z'’-]+(?:\s+[A-Z]\.?)?\s+[A-Z][A-Za-z'’-]+),?\s+(${CREDENTIAL})`, 'g');
  for (const m of text.matchAll(person)) found.push(`${m[1]}, ${m[2]}`);
  for (const m of text.matchAll(/\bDr\.\s+([A-Z][A-Za-z'’-]+(?:\s+[A-Z][A-Za-z'’-]+){1,2})/g)) found.push(`Dr. ${m[1]}`);
  // 2. Practice names: **bold** phrases and numbered-list items that look like proper business names.
  const phrases: string[] = [];
  for (const m of text.matchAll(/\*\*([^*\n]{3,90})\*\*/g)) phrases.push(m[1]);
  for (const m of text.matchAll(/^\s*\d+\.\s+([^\n]{3,120})/gm)) phrases.push(m[1].replace(/\*\*/g, ''));
  for (const raw of phrases) {
    const phrase = raw.replace(/[*_`]+/g, '').split(/\s[-–—]\s|:|\(/)[0].trim();
    if (BUSINESS_WORDS.test(phrase) && looksLikeProperName(phrase)) found.push(phrase);
  }
  return [...new Set(found.map((n) => n.replace(/\s+/g, ' ').trim()))].filter((n) => !isBrand(nameKey(n)));
}

export function buildResult(market: Market, date: string, raw: RawReader, opts: BuildOptions = {}): BuildResult {
  const keywords = opts.keywords ?? KEYWORDS;
  const drafts = mapsPractices(market, raw, keywords);

  // Fill gaps from Google My Business lookups (cached under the CID).
  for (const d of drafts) {
    const gmb = d.mapsCid ? resultItems(raw.read('gmb', d.mapsCid))[0] : null;
    if (!gmb) continue;
    d.phone ??= gmb.phone ?? null;
    d.website ??= gmb.url ?? null;
    d.category ??= gmb.category ?? null;
    d.address ??= gmb.address ?? null;
    d._domain ??= normaliseDomain(gmb.url);
  }

  for (const d of drafts) {
    const chain = chainFor(d._domain, d.name);
    d.isChain = !!chain;
    d.chainName = chain ? chain.name : null;
  }

  const practiceDomains = new Set(drafts.map((d) => d._domain).filter((x): x is string => !!x && !directoryName(x)));
  const byDomain = new Map<string, Draft>();
  for (const d of drafts) if (d._domain && practiceDomains.has(d._domain) && !byDomain.has(d._domain)) byDomain.set(d._domain, d);

  // Organic results: local practices get a rank, directories get their own entries.
  const directories = new Map<string, Draft>();
  const reviewByDomain = new Map<string, ReviewEntry>();
  const organicTopBySearch: Record<string, OrganicTopEntry[]> = {};
  const localPackItems: Record<string, any[]> = {};
  for (const kw of keywords) {
    const organicItems = resultItems(raw.read('organic', organicQuery(kw, market)));
    const organic = organicItems.filter((i) => i.type === 'organic');
    localPackItems[kw] = organicItems.filter((i) => i.type === 'local_pack');
    const top: OrganicTopEntry[] = [];
    for (const item of organic.slice(0, ORGANIC_TOP_N)) {
      const domain = normaliseDomain(item.domain ?? item.url) ?? '';
      const { kind, candidate, overridden } = classifyDomain(domain, practiceDomains, item.title ?? '', item.url ?? '', market);
      const rank: number = item.rank_group;
      let owner: Draft | undefined;
      if (kind === 'local practice') owner = byDomain.get(domain);
      if (kind === 'directory') {
        const name = directoryName(domain) ?? domain;
        owner = directories.get(name);
        if (!owner) {
          owner = emptyPractice(name);
          owner.isDirectory = true;
          owner.website = `https://${domain}`;
          owner._domain = domain;
          directories.set(name, owner);
        }
      }
      if (owner) {
        const prev = owner.organicRankBySearch[kw];
        if (prev === undefined || rank < prev) owner.organicRankBySearch[kw] = rank;
      }
      if (candidate && domain) {
        const entry: ReviewEntry = reviewByDomain.get(domain) ?? { domain, title: item.title ?? '', url: item.url ?? '', searches: [], tag: kind, overridden };
        entry.searches.push({ keyword: kw, rank });
        reviewByDomain.set(domain, entry);
      }
      top.push({ rank, title: item.title ?? '', url: item.url ?? '', domain, kind, practiceSlug: null });
    }
    organicTopBySearch[kw] = top;
  }

  // Lighthouse.
  for (const d of drafts) if (d._domain) d.lighthouse = lighthouseScores(raw.read('lighthouse', d._domain));

  // AI mentions: a practice counts when its name (or website domain) appears in an answer.
  const promptIdx = opts.promptIndexes ?? AI_PROMPTS.map((_, i) => i);
  const prompts = promptIdx.map((i) => fillPrompt(AI_PROMPTS[i], market));
  const aiOnly: AiOnlyMention[] = [];
  const aiReview: AiReviewEntry[] = [];
  for (const provider of ['chatgpt', 'claude'] as AiProvider[]) {
    prompts.forEach((prompt, n) => {
      const rawAnswer = raw.read(provider === 'chatgpt' ? 'ai-chatgpt' : 'ai-claude', aiKey(promptIdx[n], prompt, AI_MODELS[provider]));
      const sections: any[] = resultItems(rawAnswer)
        .filter((it) => it.type === 'message')
        .flatMap((it) => it.sections ?? []);
      const text = sections.map((sec: any) => sec.text ?? '').join('\n');
      if (!text) return;
      const norm = ` ${nameKey(text)} `;
      const lower = text.toLowerCase();
      const matched: string[] = [];
      for (const d of drafts) {
        const key = nameKey(d.name);
        const nameHit = key.length >= 5 && norm.includes(` ${key} `);
        const domainHit = !!d._domain && lower.includes(d._domain);
        if (!nameHit && !domainHit) continue;
        d.aiMentions[provider] += 1;
        d.aiMentions.prompts.push({ provider, prompt });
        matched.push(d.name);
      }

      // Names the answer recommends that match nothing found in Maps (kept apart, never scored).
      const model: string = rawAnswer?.tasks?.[0]?.result?.[0]?.model_name ?? AI_MODELS[provider];
      const seenHere = new Set<string>();
      const onlyNames: string[] = [];
      for (const name of candidateNames(text)) {
        const key = nameKey(name);
        if (key.length < 5 || seenHere.has(key)) continue;
        const isKnown = [...drafts, ...directories.values()].some((d) => {
          const dk = nameKey(d.name);
          return dk.length >= 5 && (key.includes(dk) || dk.includes(key));
        });
        if (isKnown) continue;
        seenHere.add(key);
        onlyNames.push(name);
        aiOnly.push({ name, provider, model, prompt });
      }
      const citations = [...new Set(sections.flatMap((sec: any) => (sec.annotations ?? []).map((a: any) => a.url).filter(Boolean)))] as string[];
      aiReview.push({ provider, model, prompt, text, citations, matchedPractices: matched, aiOnlyNames: onlyNames });
    });
  }

  // Slugs, scores, ordering.
  const all: Draft[] = [...drafts, ...directories.values()];
  const used = new Set<string>();
  for (const d of all) {
    // Collisions get a number, never the city again (names often contain it already).
    const base = slugify(d.name) || 'practice';
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    d.slug = slug;
  }
  const scores = visibilityScores(all);
  all.forEach((d, i) => (d.visibilityScore = scores[i]));

  for (const entries of Object.values(organicTopBySearch)) {
    for (const e of entries) {
      const owner =
        e.kind === 'directory' ? all.find((d) => d.isDirectory && d._domain === e.domain)
        : e.kind === 'local practice' ? all.find((d) => !d.isDirectory && d._domain === e.domain)
        : undefined;
      e.practiceSlug = owner ? owner.slug : null;
    }
  }

  // The local pack shown on each organic results page, tied back to practices[] by CID, else website domain.
  const localPackBySearch: Record<string, LocalPackEntry[]> = {};
  for (const [kw, items] of Object.entries(localPackItems)) {
    localPackBySearch[kw] = items.map((it, i): LocalPackEntry => {
      const domain = normaliseDomain(it.domain ?? it.url);
      const cid = it.cid ? String(it.cid) : null;
      const owner =
        all.find((d) => !d.isDirectory && cid && d.mapsCid === cid) ??
        all.find((d) => !d.isDirectory && domain && !directoryName(domain) && d._domain === domain);
      return {
        position: it.rank_group ?? i + 1,
        title: it.title ?? '',
        domain,
        url: it.url ?? null,
        phone: it.phone ?? null,
        mapsCid: cid,
        rating: it.rating?.value ?? null,
        reviewCount: it.rating?.votes_count ?? null,
        practiceSlug: owner ? owner.slug : null,
      };
    });
  }

  all.sort((a, b) => Number(a.isDirectory) - Number(b.isDirectory) || b.visibilityScore - a.visibilityScore || a.name.localeCompare(b.name));
  const practices: Practice[] = all.map(({ _domain, ...p }) => p);

  const local = practices.filter((p) => !p.isDirectory);
  const slots = Object.values(organicTopBySearch).flat();
  const dirSlots = slots.filter((s) => s.kind === 'directory').length;
  const snapshot: Snapshot = {
    snapshotDate: date,
    market: { slug: market.slug, city: market.city, stateSlug: market.stateSlug, stateName: market.stateName, areaLabel: market.areaLabel },
    keywords,
    aiPrompts: prompts,
    summary: {
      totalPractices: local.length,
      practicesInAnyMapPack: local.filter((p) => Object.values(p.mapRankBySearch).some((r) => r <= 3)).length,
      directorySharePercent: slots.length ? Math.round((dirSlots / slots.length) * 1000) / 10 : 0,
      practicesNamedByAi: local.filter((p) => p.aiMentions.chatgpt + p.aiMentions.claude > 0).length,
      chainLocations: local.filter((p) => p.isChain).length,
    },
    practices,
    aiOnlyMentions: aiOnly,
    organicTopBySearch,
    localPackBySearch,
  };
  const review = [...reviewByDomain.values()].sort((a, b) => a.domain.localeCompare(b.domain));
  return { snapshot, review, aiReview };
}

/** Writes the snapshot and its review list. `subdir` keeps smoke-test output apart from the real snapshots. */
export function writeResult({ snapshot, review, aiReview }: BuildResult, subdir = ''): string[] {
  const dir = path.join(DATA_DIR, subdir);
  const reviewDir = path.join(DATA_DIR, subdir, 'review');
  fs.mkdirSync(reviewDir, { recursive: true });
  const snapFile = path.join(dir, `${snapshot.market.slug}.json`);
  const reviewFile = path.join(reviewDir, `${snapshot.market.slug}.json`);
  fs.writeFileSync(snapFile, JSON.stringify(snapshot, null, 2) + '\n');
  fs.writeFileSync(reviewFile, JSON.stringify(review, null, 2) + '\n');
  const aiFile = path.join(reviewDir, `${snapshot.market.slug}-ai.json`);
  fs.writeFileSync(aiFile, JSON.stringify(aiReview, null, 2) + '\n');
  return [snapFile, reviewFile, aiFile];
}

// CLI: tsx scripts/therapyindex/normalise.ts --market <slug> [--date YYYY-MM-DD]
if (process.argv[1] && /normalise\.ts$/.test(process.argv[1].replace(/\\/g, '/'))) {
  const arg = (name: string) => {
    const i = process.argv.indexOf(`--${name}`);
    return i >= 0 ? process.argv[i + 1] : undefined;
  };
  const slug = arg('market');
  const market = MARKETS.find((m) => m.slug === slug);
  if (!market) {
    console.error(`Pass --market <slug>. Known: ${MARKETS.map((m) => m.slug).join(', ')}`);
    process.exit(1);
  }
  const date = arg('date') ?? latestRawDate(market.slug);
  if (!date) {
    console.error(`No cached raw data for ${market.slug}. Run the fetch script with --live first.`);
    process.exit(1);
  }
  const files = writeResult(buildResult(market, date, new RawStore(market.slug, date)));
  console.log(`Wrote ${files.join('\n      ')}`);
}
