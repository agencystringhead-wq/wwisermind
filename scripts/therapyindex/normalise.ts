import fs from 'node:fs';
import path from 'node:path';
import { classifyDomain, directoryName, normaliseDomain } from '../../lib/therapyindex/directories';
import { AI_PROMPTS, KEYWORDS, MARKETS, ORGANIC_TOP_N, type Market } from '../../lib/therapyindex/markets';
import { visibilityScores } from '../../lib/therapyindex/score';
import type { AiProvider, OrganicTopEntry, Practice, Snapshot } from '../../lib/therapyindex/types';
import { DATA_DIR, latestRawDate, RawStore, slugify, type RawReader } from './store';

/* Turns the cached raw responses into one snapshot: data/therapyindex/<market>.json.
   buildSnapshot is pure (reads only through `raw`), so it can be re-run for free any time. */

export function fillPrompt(prompt: string, market: Market): string {
  return prompt.replace('{city}', market.city).replace('{state}', market.stateName);
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
    isDirectory: false, _domain: null,
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

export function buildSnapshot(market: Market, date: string, raw: RawReader, keywords: string[] = KEYWORDS): Snapshot {
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

  const practiceDomains = new Set(drafts.map((d) => d._domain).filter((x): x is string => !!x && !directoryName(x)));
  const byDomain = new Map<string, Draft>();
  for (const d of drafts) if (d._domain && practiceDomains.has(d._domain) && !byDomain.has(d._domain)) byDomain.set(d._domain, d);

  // Organic results: local practices get a rank, directories get their own entries.
  const directories = new Map<string, Draft>();
  const organicTopBySearch: Record<string, OrganicTopEntry[]> = {};
  for (const kw of keywords) {
    const organic = resultItems(raw.read('organic', kw)).filter((i) => i.type === 'organic');
    const top: OrganicTopEntry[] = [];
    for (const item of organic.slice(0, ORGANIC_TOP_N)) {
      const domain = normaliseDomain(item.domain ?? item.url) ?? '';
      const kind = classifyDomain(domain, practiceDomains);
      const rank: number = item.rank_group;
      let owner: Draft | undefined;
      if (kind === 'local practice') owner = byDomain.get(domain);
      if (kind === 'directory') {
        const name = directoryName(domain)!;
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
      top.push({ rank, title: item.title ?? '', url: item.url ?? '', domain, kind, practiceSlug: null });
    }
    organicTopBySearch[kw] = top;
  }

  // Lighthouse.
  for (const d of drafts) if (d._domain) d.lighthouse = lighthouseScores(raw.read('lighthouse', d._domain));

  // AI mentions: a practice counts when its name (or website domain) appears in an answer.
  const prompts = AI_PROMPTS.map((p) => fillPrompt(p, market));
  for (const provider of ['chatgpt', 'claude'] as AiProvider[]) {
    prompts.forEach((prompt, i) => {
      const items = resultItems(raw.read(provider === 'chatgpt' ? 'ai-chatgpt' : 'ai-claude', `p${i}`));
      const text = items
        .filter((it) => it.type === 'message')
        .flatMap((it) => it.sections ?? [])
        .map((s: any) => s.text ?? '')
        .join('\n');
      if (!text) return;
      const norm = ` ${nameKey(text)} `;
      const lower = text.toLowerCase();
      for (const d of drafts) {
        const key = nameKey(d.name);
        const nameHit = key.length >= 5 && norm.includes(` ${key} `);
        const domainHit = !!d._domain && lower.includes(d._domain);
        if (!nameHit && !domainHit) continue;
        d.aiMentions[provider] += 1;
        d.aiMentions.prompts.push({ provider, prompt });
      }
    });
  }

  // Slugs, scores, ordering.
  const all: Draft[] = [...drafts, ...directories.values()];
  const used = new Set<string>();
  for (const d of all) {
    let base = slugify(d.name) || 'practice';
    if (used.has(base) && d.city) base = `${base}-${slugify(d.city)}`;
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

  all.sort((a, b) => Number(a.isDirectory) - Number(b.isDirectory) || b.visibilityScore - a.visibilityScore || a.name.localeCompare(b.name));
  const practices: Practice[] = all.map(({ _domain, ...p }) => p);

  const local = practices.filter((p) => !p.isDirectory);
  const slots = Object.values(organicTopBySearch).flat();
  const dirSlots = slots.filter((s) => s.kind === 'directory').length;
  return {
    snapshotDate: date,
    market: { slug: market.slug, city: market.city, stateSlug: market.stateSlug, stateName: market.stateName, areaLabel: market.areaLabel },
    keywords,
    aiPrompts: prompts,
    summary: {
      totalPractices: local.length,
      practicesInAnyMapPack: local.filter((p) => Object.values(p.mapRankBySearch).some((r) => r <= 3)).length,
      directorySharePercent: slots.length ? Math.round((dirSlots / slots.length) * 1000) / 10 : 0,
      practicesNamedByAi: local.filter((p) => p.aiMentions.chatgpt + p.aiMentions.claude > 0).length,
    },
    practices,
    organicTopBySearch,
  };
}

export function writeSnapshot(snapshot: Snapshot): string {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const file = path.join(DATA_DIR, `${snapshot.market.slug}.json`);
  fs.writeFileSync(file, JSON.stringify(snapshot, null, 2) + '\n');
  return file;
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
  const file = writeSnapshot(buildSnapshot(market, date, new RawStore(market.slug, date)));
  console.log(`Wrote ${file}`);
}
