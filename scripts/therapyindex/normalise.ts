import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { isMentalHealthCategory } from '../../lib/therapyindex/categories';
import { chainFor } from '../../lib/therapyindex/chains';
import { classifyDomain, directoryName, normaliseDomain } from '../../lib/therapyindex/directories';
import { AI_MODELS, AI_PROMPTS, KEYWORDS, MARKETS, ORGANIC_TOP_N, type Market } from '../../lib/therapyindex/markets';
import { visibilityScores } from '../../lib/therapyindex/score';
import type {
  AiOnlyMention, AiProvider, AiReviewEntry, ExcludedMapsResult, LocalPackEntry, OrganicTopEntry, Practice, ReviewEntry, Snapshot,
} from '../../lib/therapyindex/types';
import { entityKey, extractFromAnswer, mergeEntities, nameKey, sameName, type RawMention } from './names';
import { DATA_DIR, latestRawDate, RawStore, slugify, type RawReader } from './store';

/* Turns the cached raw responses into one snapshot (data/therapyindex/<market>.json) plus review files:
     review/<market>.json           organic results guessed to be single practices (confirm or flip via overrides.ts)
     review/<market>-ai.json        every raw AI answer with what was extracted from it
     review/<market>-excluded.json  Maps listings dropped for a non-mental-health category
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
    isDirectory: false, isChain: false, chainName: null, hasMapListing: true, people: [], _domain: null,
  };
}

/** Practices found in Google Maps, de-duplicated by CID and then by website domain. Only mental-health categories are
    kept (primary or additional); the rest come back in `excluded`. A listing with no category data at all is kept.
    Domains of directories are never used to merge (many unrelated therapists share psychologytoday.com). */
export function mapsPractices(raw: RawReader, keywords: string[]): { drafts: Draft[]; excluded: ExcludedMapsResult[] } {
  const drafts: Draft[] = [];
  const excluded = new Map<string, ExcludedMapsResult>();
  const byCid = new Map<string, Draft>();
  const byDomain = new Map<string, Draft>();
  for (const kw of keywords) {
    for (const item of resultItems(raw.read('maps', kw))) {
      if (item.type !== 'maps_search' || !item.title) continue;
      const rank: number = item.rank_group;
      const categories: string[] = [item.category, ...(item.additional_categories ?? [])].filter(Boolean);
      if (categories.length > 0 && !isMentalHealthCategory(categories)) {
        const key = String(item.cid ?? item.title);
        const e: ExcludedMapsResult = excluded.get(key) ?? { title: item.title, category: item.category ?? null, additionalCategories: item.additional_categories ?? [], searches: [] };
        e.searches.push({ keyword: kw, rank });
        excluded.set(key, e);
        continue;
      }
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
  return { drafts, excluded: [...excluded.values()] };
}

export type BuildOptions = { keywords?: string[]; promptIndexes?: number[] };
export type PromotedPractice = { name: string; domain: string; slug: string; people: string[]; aiMentions: number };
export type BuildResult = {
  snapshot: Snapshot;
  review: ReviewEntry[];
  aiReview: AiReviewEntry[];
  excluded: ExcludedMapsResult[];
  promoted: PromotedPractice[];
};

export function buildSnapshot(market: Market, date: string, raw: RawReader, opts: BuildOptions = {}): Snapshot {
  return buildResult(market, date, raw, opts).snapshot;
}

const domainLabel = (domain: string) => domain.replace(/^www\./, '').split('.')[0].replace(/[^a-z0-9]/g, '');

export function buildResult(market: Market, date: string, raw: RawReader, opts: BuildOptions = {}): BuildResult {
  const keywords = opts.keywords ?? KEYWORDS;
  const { drafts, excluded } = mapsPractices(raw, keywords);

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
      const { kind, candidate, overridden } = classifyDomain(domain, practiceDomains, item.title ?? '', item.url ?? '', item.description ?? '', market);
      const rank: number = item.rank_group;
      let owner: Draft | undefined;
      if (kind === 'local practice') owner = byDomain.get(domain);
      if (kind === 'directory') {
        const name = directoryName(domain) ?? domain;
        owner = directories.get(name);
        if (!owner) {
          owner = emptyPractice(name);
          owner.isDirectory = true;
          owner.hasMapListing = false;
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
        const entry: ReviewEntry = reviewByDomain.get(domain) ?? { domain, title: item.title ?? '', url: item.url ?? '', searches: [], tag: kind, overridden, promotedTo: null };
        entry.searches.push({ keyword: kw, rank });
        reviewByDomain.set(domain, entry);
      }
      top.push({ rank, title: item.title ?? '', url: item.url ?? '', domain, kind, practiceSlug: null });
    }
    organicTopBySearch[kw] = top;
  }

  // Lighthouse.
  for (const d of drafts) if (d._domain) d.lighthouse = lighthouseScores(raw.read('lighthouse', d._domain));

  // AI answers. A Maps practice counts as named when its name (or website domain) appears in an answer.
  const promptIdx = opts.promptIndexes ?? AI_PROMPTS.map((_, i) => i);
  const prompts = promptIdx.map((i) => fillPrompt(AI_PROMPTS[i], market));
  const aiReview: AiReviewEntry[] = [];
  const rawMentions: RawMention[] = [];
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
      const model: string = rawAnswer?.tasks?.[0]?.result?.[0]?.model_name ?? AI_MODELS[provider];
      const found = extractFromAnswer(text);
      for (const f of found) rawMentions.push({ ...f, provider, model, prompt });
      const citations = [...new Set(sections.flatMap((sec: any) => (sec.annotations ?? []).map((a: any) => a.url).filter(Boolean)))] as string[];
      aiReview.push({
        provider, model, prompt, text, citations, matchedPractices: matched,
        extractedNames: found.flatMap((f) => [f.name, ...f.people]),
      });
    });
  }

  // Merge near-duplicate names, then sort each entity: already in Maps / a directory (dropped), named by AI and
  // found in organic results (promoted into practices[] without a Maps listing), or AI-only.
  const knownNames = [...drafts, ...directories.values()].map((d) => d.name);
  const promotedDrafts: Draft[] = [];
  const aiOnly: AiOnlyMention[] = [];
  for (const e of mergeEntities(rawMentions)) {
    if (e.names.some((n) => knownNames.some((k) => sameName(n, k)))) continue;

    const spaceless = entityKey(e.name).replace(/ /g, '');
    const fullKey = nameKey(e.name);
    const hit = [...reviewByDomain.values()].find((r) => {
      if (r.tag !== 'local-no-map' || r.promotedTo) return false;
      const label = domainLabel(r.domain);
      const byDomainName = spaceless.length >= 5 && label.length >= 5 && (label.includes(spaceless) || spaceless.includes(label));
      const byTitle = fullKey.split(' ').length >= 2 && nameKey(r.title).includes(fullKey);
      return byDomainName || byTitle;
    });
    if (!hit) {
      aiOnly.push({ name: e.name, people: e.people, mentions: e.mentions });
      continue;
    }
    const d = emptyPractice(e.name);
    d.hasMapListing = false;
    d.website = hit.url || `https://${hit.domain}`;
    d._domain = hit.domain;
    d.people = e.people;
    for (const s of hit.searches) {
      const prev = d.organicRankBySearch[s.keyword];
      if (prev === undefined || s.rank < prev) d.organicRankBySearch[s.keyword] = s.rank;
    }
    for (const m of e.mentions) {
      d.aiMentions[m.provider] += 1;
      d.aiMentions.prompts.push({ provider: m.provider, prompt: m.prompt });
    }
    d.lighthouse = lighthouseScores(raw.read('lighthouse', hit.domain));
    hit.promotedTo = hit.domain; // replaced by the slug below
    promotedDrafts.push(d);
  }

  // Slugs, scores, ordering.
  const all: Draft[] = [...drafts, ...promotedDrafts, ...directories.values()];
  const used = new Set<string>();
  for (const d of all) {
    // Collisions get a number, never the city again (names often contain it already).
    const base = slugify(d.name) || 'practice';
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    d.slug = slug;
  }
  for (const r of reviewByDomain.values()) {
    if (r.promotedTo) r.promotedTo = promotedDrafts.find((d) => d._domain === r.domain)?.slug ?? null;
  }
  const scores = visibilityScores(all);
  all.forEach((d, i) => (d.visibilityScore = scores[i]));

  for (const entries of Object.values(organicTopBySearch)) {
    for (const e of entries) {
      const owner =
        e.kind === 'directory' ? all.find((d) => d.isDirectory && d._domain === e.domain)
        : e.kind === 'local practice' || e.kind === 'local-no-map' ? all.find((d) => !d.isDirectory && d._domain === e.domain)
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
      unlistedPractices: local.filter((p) => !p.hasMapListing).length,
    },
    practices,
    aiOnlyMentions: aiOnly,
    organicTopBySearch,
    localPackBySearch,
  };
  const review = [...reviewByDomain.values()].sort((a, b) => a.domain.localeCompare(b.domain));
  const promoted: PromotedPractice[] = promotedDrafts.map((d) => ({
    name: d.name, domain: d._domain!, slug: d.slug, people: d.people, aiMentions: d.aiMentions.prompts.length,
  }));
  return { snapshot, review, aiReview, excluded, promoted };
}

/** Writes the snapshot and its review files. `subdir` keeps smoke-test output apart from the real snapshots. */
export function writeResult({ snapshot, review, aiReview, excluded }: BuildResult, subdir = ''): string[] {
  const dir = path.join(DATA_DIR, subdir);
  const reviewDir = path.join(DATA_DIR, subdir, 'review');
  fs.mkdirSync(reviewDir, { recursive: true });
  const slug = snapshot.market.slug;
  const files: [string, unknown][] = [
    [path.join(dir, `${slug}.json`), snapshot],
    [path.join(reviewDir, `${slug}.json`), review],
    [path.join(reviewDir, `${slug}-ai.json`), aiReview],
    [path.join(reviewDir, `${slug}-excluded.json`), excluded],
  ];
  for (const [file, data] of files) fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  return files.map(([file]) => file);
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
