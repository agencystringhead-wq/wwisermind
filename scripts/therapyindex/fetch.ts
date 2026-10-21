import {
  AI_MODELS, AI_PROMPTS, GMB_MAX_LOOKUPS, KEYWORDS, LANGUAGE_CODE, LIGHTHOUSE_MAX_PRACTICES,
  MAPS_DEPTH, MARKETS, ORGANIC_DEPTH, type Market,
} from '../../lib/therapyindex/markets';
import { normaliseDomain } from '../../lib/therapyindex/directories';
import { dfsPost, ENDPOINTS, pool, type Call } from './dfs';
import { buildSnapshot, fillPrompt, writeSnapshot } from './normalise';
import { RawStore, type Kind } from './store';

/* Usage:
     npx tsx scripts/therapyindex/fetch.ts [--market <slug>|all] [--date YYYY-MM-DD]          dry run (default)
     npx tsx scripts/therapyindex/fetch.ts --live [--market <slug>|all] [--date YYYY-MM-DD]   spends money
   Cached responses (data/therapyindex/raw/<market>/<date>/) are never requested again. */

const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(`--${n}`);
const opt = (n: string) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

if (flag('live') && flag('dry-run')) {
  console.error('Pass either --live or --dry-run, not both.');
  process.exit(1);
}
const live = flag('live');
const date = opt('date') ?? new Date().toISOString().slice(0, 10);
const marketArg = opt('market') ?? 'all';
const markets: Market[] = marketArg === 'all' ? MARKETS : MARKETS.filter((m) => m.slug === marketArg);
if (!markets.length) {
  console.error(`Unknown market "${marketArg}". Known: ${MARKETS.map((m) => m.slug).join(', ')}`);
  process.exit(1);
}

/** Assumed sizes for the calls that depend on earlier results, used only for the dry-run estimate. */
const ASSUMED_UNIQUE_PRACTICES = 60;
const ASSUMED_GMB_SHARE = 0.2;

try {
  process.loadEnvFile('.env.local');
} catch {
  /* no .env.local: fine for a dry run */
}

function phaseOneCalls(m: Market): Call[] {
  const calls: Call[] = [];
  for (const kw of KEYWORDS) {
    const common = { keyword: kw, location_name: m.dfsLocationName, language_code: LANGUAGE_CODE };
    calls.push({ kind: 'maps', key: kw, endpoint: ENDPOINTS.maps.path, label: `maps "${kw}"`, task: { ...common, depth: MAPS_DEPTH } });
    calls.push({ kind: 'organic', key: kw, endpoint: ENDPOINTS.organic.path, label: `organic "${kw}"`, task: { ...common, depth: ORGANIC_DEPTH, device: 'desktop' } });
  }
  AI_PROMPTS.forEach((p, i) => {
    const prompt = fillPrompt(p, m);
    for (const provider of ['chatgpt', 'claude'] as const) {
      const kind: Kind = provider === 'chatgpt' ? 'ai-chatgpt' : 'ai-claude';
      calls.push({
        kind, key: `p${i}`, endpoint: ENDPOINTS[kind].path, label: `${provider} "${prompt}"`,
        task: {
          user_prompt: prompt, model_name: AI_MODELS[provider], web_search: true,
          web_search_country_iso_code: 'US', web_search_city: m.city, max_output_tokens: 1500,
        },
      });
    }
  });
  return calls;
}

/** GMB lookups for map results missing a phone, website or category, and Lighthouse for the best-ranked sites. */
function phaseTwoCalls(m: Market, store: RawStore): Call[] {
  const prelim = buildSnapshot(m, date, store).practices.filter((p) => !p.isDirectory);
  const calls: Call[] = [];
  prelim
    .filter((p) => p.mapsCid && (!p.phone || !p.website || !p.category) && !store.has('gmb', p.mapsCid))
    .slice(0, GMB_MAX_LOOKUPS)
    .forEach((p) =>
      calls.push({
        kind: 'gmb', key: p.mapsCid!, endpoint: ENDPOINTS.gmb.path, label: `gmb ${p.name}`,
        task: { keyword: `cid:${p.mapsCid}`, location_name: m.dfsLocationName, language_code: LANGUAGE_CODE },
      }),
    );
  const seen = new Set<string>();
  for (const p of prelim) {
    const domain = normaliseDomain(p.website);
    if (!domain || seen.has(domain) || seen.size >= LIGHTHOUSE_MAX_PRACTICES) continue;
    seen.add(domain);
    calls.push({
      kind: 'lighthouse', key: domain, endpoint: ENDPOINTS.lighthouse.path, label: `lighthouse ${domain}`,
      task: { url: p.website, categories: ['performance', 'seo', 'accessibility'], for_mobile: true },
    });
  }
  return calls;
}

type Tally = Record<Kind, { calls: number; cached: number }>;
const emptyTally = (): Tally =>
  Object.fromEntries((Object.keys(ENDPOINTS) as Kind[]).map((k) => [k, { calls: 0, cached: 0 }])) as Tally;

function printDryRun(tally: Tally, assumed: Kind[]) {
  let total = 0;
  console.log('\nEndpoint'.padEnd(52) + 'calls  cached  billable  est. cost');
  for (const kind of Object.keys(ENDPOINTS) as Kind[]) {
    const t = tally[kind];
    const billable = t.calls - t.cached;
    const cost = billable * ENDPOINTS[kind].unitCost;
    total += cost;
    console.log(
      `${ENDPOINTS[kind].title}${assumed.includes(kind) ? ' *' : ''}`.padEnd(52) +
        `${t.calls}`.padEnd(7) + `${t.cached}`.padEnd(8) + `${billable}`.padEnd(10) + `$${cost.toFixed(4)}`,
    );
  }
  console.log(`${'TOTAL'.padEnd(77)}$${total.toFixed(4)}`);
  console.log('\n* count assumed (depends on search results): ' +
    `${ASSUMED_UNIQUE_PRACTICES} unique practices, ${ASSUMED_GMB_SHARE * 100}% needing a GMB lookup, Lighthouse capped at ${LIGHTHOUSE_MAX_PRACTICES}.`);
  console.log('AI cost per call is an assumption (DataForSEO bills the model/web-search cost through at actual usage).');
  console.log('Dry run only: nothing was sent. Re-run with --live to spend.');
}

async function runCalls(store: RawStore, calls: Call[], spent: { total: number }) {
  const todo = calls.filter((c) => !store.has(c.kind, c.key));
  console.log(`  ${todo.length} to fetch, ${calls.length - todo.length} cached`);
  await pool(todo, 5, async (c) => {
    try {
      const { response, cost } = await dfsPost(c);
      store.write(c.kind, c.key, response);
      spent.total += cost;
      console.log(`  ok  ${c.label}  $${cost.toFixed(4)}`);
    } catch (e) {
      console.error(`  FAIL ${c.label}: ${(e as Error).message}`);
    }
  });
}

async function main() {
  if (!live) {
    const tally = emptyTally();
    for (const m of markets) {
      const store = new RawStore(m.slug, date);
      for (const c of phaseOneCalls(m)) {
        tally[c.kind].calls++;
        if (store.has(c.kind, c.key)) tally[c.kind].cached++;
      }
      // Phase two: use real counts when phase one is already cached, else the assumptions.
      const haveSerp = KEYWORDS.every((kw) => store.has('maps', kw));
      if (haveSerp) {
        for (const c of phaseTwoCalls(m, store)) {
          tally[c.kind].calls++;
          if (store.has(c.kind, c.key)) tally[c.kind].cached++;
        }
      } else {
        tally.gmb.calls += Math.min(GMB_MAX_LOOKUPS, Math.round(ASSUMED_UNIQUE_PRACTICES * ASSUMED_GMB_SHARE));
        tally.lighthouse.calls += Math.min(LIGHTHOUSE_MAX_PRACTICES, ASSUMED_UNIQUE_PRACTICES);
      }
    }
    console.log(`Therapy Index dry run: ${markets.map((m) => m.slug).join(', ')} (${date})`);
    printDryRun(tally, ['gmb', 'lighthouse']);
    return;
  }

  const spent = { total: 0 };
  for (const m of markets) {
    const store = new RawStore(m.slug, date);
    console.log(`\n${m.slug}: searches and AI answers`);
    await runCalls(store, phaseOneCalls(m), spent);
    console.log(`${m.slug}: profile lookups and Lighthouse`);
    await runCalls(store, phaseTwoCalls(m, store), spent);
    const file = writeSnapshot(buildSnapshot(m, date, store));
    console.log(`${m.slug}: wrote ${file}`);
  }
  console.log(`\nSpent this run: $${spent.total.toFixed(4)} (as reported by DataForSEO)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
