import {
  AI_MODELS, AI_PROMPTS, GMB_MAX_LOOKUPS, KEYWORDS, LANGUAGE_CODE, LIGHTHOUSE_MAX_PRACTICES,
  MAPS_DEPTH, MARKETS, ORGANIC_DEPTH, SMOKE, type Market,
} from '../../lib/therapyindex/markets';
import { directoryName, normaliseDomain } from '../../lib/therapyindex/directories';
import { isRankEligible } from '../../lib/therapyindex/score';
import { aiUnitCost, dfsGet, dfsPost, ENDPOINTS, pool, PREVIOUS_AI_MODELS, type Call } from './dfs';
import { aiKey, buildResult, fillPrompt, mapsKey, organicQuery, writeResult, type BuildOptions } from './normalise';
import { RawStore, type Kind } from './store';

/* Usage:
     npx tsx scripts/therapyindex/fetch.ts [--market <slug>|all] [--date YYYY-MM-DD]          dry run (default)
     npx tsx scripts/therapyindex/fetch.ts --live [--market <slug>|all] [--date YYYY-MM-DD]   spends money
     add --smoke for the smallest live run (see SMOKE in markets.ts): first market only, 2 keywords,
       1 AI prompt per model, 1 profile lookup, Lighthouse on the first 3 sites. Output goes to
       data/therapyindex/smoke/ so it never overwrites a real snapshot.
     --only maps[,organic,ai,...] fetches just those call kinds (live run: skips profile lookups and Lighthouse, then rebuilds the snapshot).
     --check-locations verifies each market's dfsLocationName against DataForSEO's locations list (free).
     --models lists the model names the two AI endpoints currently accept (free, needs credentials).
   Cached responses (data/therapyindex/raw/<market>/<date>/) are never requested again. */

const argv = process.argv.slice(2);
const flag = (n: string) => argv.includes(`--${n}`);
const opt = (n: string) => {
  const i = argv.indexOf(`--${n}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

try {
  process.loadEnvFile('.env.local');
} catch {
  /* no .env.local: fine for a dry run */
}

if (flag('live') && flag('dry-run')) {
  console.error('Pass either --live or --dry-run, not both.');
  process.exit(1);
}
const live = flag('live');
const smoke = flag('smoke');
const date = opt('date') ?? new Date().toISOString().slice(0, 10);
const marketArg = smoke ? (opt('market') ?? MARKETS[0].slug) : (opt('market') ?? 'all');
const markets: Market[] = marketArg === 'all' ? MARKETS : MARKETS.filter((m) => m.slug === marketArg);
if (!markets.length) {
  console.error(`Unknown market "${marketArg}". Known: ${MARKETS.map((m) => m.slug).join(', ')}`);
  process.exit(1);
}

/** What one run covers. The smoke test shrinks every list; everything else is the full config. */
const plan = smoke
  ? { keywords: SMOKE.keywords, promptIndexes: SMOKE.promptIndexes, lighthouseMax: SMOKE.lighthousePractices, gmbMax: SMOKE.gmbLookups, gmbForce: true }
  : { keywords: KEYWORDS, promptIndexes: AI_PROMPTS.map((_, i) => i), lighthouseMax: LIGHTHOUSE_MAX_PRACTICES, gmbMax: GMB_MAX_LOOKUPS, gmbForce: false };
/** --only maps,organic,ai,gmb,lighthouse: restrict a run to those call kinds (names match kind prefixes; "ai" = both AI engines). */
const only = opt('only')?.split(',').map((x) => x.trim()).filter(Boolean);
const wanted = (kind: Kind) => !only || only.some((o) => kind === o || kind.startsWith(`${o}-`));
const buildOpts: BuildOptions = { keywords: plan.keywords, promptIndexes: plan.promptIndexes };

/** Assumed sizes for the calls that depend on earlier results, used only for the dry-run estimate. */
const ASSUMED_UNIQUE_PRACTICES = 60;
const ASSUMED_GMB_SHARE = 0.2;
const assumedGmb = smoke ? SMOKE.gmbLookups : Math.min(GMB_MAX_LOOKUPS, Math.round(ASSUMED_UNIQUE_PRACTICES * ASSUMED_GMB_SHARE));
const assumedLighthouse = Math.min(plan.lighthouseMax, ASSUMED_UNIQUE_PRACTICES);

function phaseOneCalls(m: Market): Call[] {
  const calls: Call[] = [];
  for (const kw of plan.keywords) {
    const common = { keyword: kw, location_name: m.dfsLocationName, language_code: LANGUAGE_CODE };
    calls.push({ kind: 'maps', key: mapsKey(kw), endpoint: ENDPOINTS.maps.path, label: `maps "${kw}"`, task: { ...common, depth: MAPS_DEPTH } });
    // Organic is searched as "<keyword> <city> <state>" with the market location also set.
    const query = organicQuery(kw, m);
    calls.push({ kind: 'organic', key: query, endpoint: ENDPOINTS.organic.path, label: `organic "${query}"`, task: { ...common, keyword: query, depth: ORGANIC_DEPTH, device: 'desktop' } });
  }
  for (const i of plan.promptIndexes) {
    const prompt = fillPrompt(AI_PROMPTS[i], m);
    for (const provider of ['chatgpt', 'claude'] as const) {
      const kind: Kind = provider === 'chatgpt' ? 'ai-chatgpt' : 'ai-claude';
      calls.push({
        kind, key: aiKey(i, prompt, AI_MODELS[provider]), endpoint: ENDPOINTS[kind].path, label: `${provider} "${prompt}"`,
        task: {
          user_prompt: prompt, model_name: AI_MODELS[provider], web_search: true,
          web_search_country_iso_code: 'US', web_search_city: m.city, max_output_tokens: 1500,
        },
      });
    }
  }
  return calls;
}

/** GMB lookups for map results missing a phone, website or category (the smoke test forces one), and
    Lighthouse for the best-ranked sites. */
function phaseTwoCalls(m: Market, store: RawStore): Call[] {
  // Practices that can reach the top 10 come first, so the capped Lighthouse and lookup budgets go to them.
  const prelim = buildResult(m, date, store, buildOpts)
    .snapshot.practices.filter((p) => !p.isDirectory)
    .sort((a, b) => Number(!isRankEligible(a)) - Number(!isRankEligible(b)));
  const calls: Call[] = [];
  const gmbPool = prelim.filter((p) => p.mapsCid && (plan.gmbForce || !p.phone || !p.website || !p.category));
  const gmbTargets = plan.gmbForce
    ? gmbPool.slice(0, plan.gmbMax)
    : gmbPool.filter((p) => !store.has('gmb', p.mapsCid!)).slice(0, plan.gmbMax);
  for (const p of gmbTargets) {
    calls.push({
      kind: 'gmb', key: p.mapsCid!, endpoint: ENDPOINTS.gmb.path, label: `gmb ${p.name}`,
      task: { keyword: `cid:${p.mapsCid}`, location_name: m.dfsLocationName, language_code: LANGUAGE_CODE },
    });
  }
  const seen = new Set<string>();
  for (const p of prelim) {
    if (seen.size >= plan.lighthouseMax) break;
    // No Lighthouse for national chains or sites hosted on a directory: not the practice's own website.
    if (p.isChain || p.isMedical) continue;
    const domain = normaliseDomain(p.website);
    if (!domain || seen.has(domain) || directoryName(domain)) continue;
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

const usd = (n: number) => `$${n.toFixed(4)}`;

function printDryRun(tally: Tally, assumed: Kind[]) {
  let total = 0;
  console.log('\n' + 'Endpoint'.padEnd(52) + 'calls  cached  billable  est. cost');
  for (const kind of Object.keys(ENDPOINTS) as Kind[]) {
    const t = tally[kind];
    const billable = t.calls - t.cached;
    const cost = billable * ENDPOINTS[kind].unitCost;
    total += cost;
    console.log(
      `${ENDPOINTS[kind].title}${assumed.includes(kind) ? ' *' : ''}`.padEnd(52) +
        `${t.calls}`.padEnd(7) + `${t.cached}`.padEnd(8) + `${billable}`.padEnd(10) + usd(cost),
    );
  }
  console.log(`${'TOTAL'.padEnd(77)}${usd(total)}`);

  // AI model comparison per market: the same AI calls priced on the previous and the current models.
  const aiCallsPerMarket = plan.promptIndexes.length;
  const prev = aiCallsPerMarket * (aiUnitCost(PREVIOUS_AI_MODELS.chatgpt) + aiUnitCost(PREVIOUS_AI_MODELS.claude));
  const now = aiCallsPerMarket * (aiUnitCost(AI_MODELS.chatgpt) + aiUnitCost(AI_MODELS.claude));
  console.log(`\nAI models, per market (${aiCallsPerMarket} prompt(s) x 2 engines, web search on):`);
  console.log(`  previous  ${PREVIOUS_AI_MODELS.chatgpt} + ${PREVIOUS_AI_MODELS.claude}: ${usd(prev)}`);
  console.log(`  current   ${AI_MODELS.chatgpt} + ${AI_MODELS.claude}: ${usd(now)}`);
  console.log(`  difference: ${now >= prev ? '+' : '-'}${usd(Math.abs(now - prev))} per market`);

  console.log(`\n* count assumed (depends on search results): ${assumedGmb} profile lookup(s), ${assumedLighthouse} Lighthouse scan(s)` +
    (smoke ? '.' : ` (${ASSUMED_UNIQUE_PRACTICES} unique practices, ${ASSUMED_GMB_SHARE * 100}% needing a lookup, Lighthouse capped at ${LIGHTHOUSE_MAX_PRACTICES}).`));
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
      console.log(`  ok  ${c.label}  ${usd(cost)}`);
    } catch (e) {
      console.error(`  FAIL ${c.label}: ${(e as Error).message}`);
    }
  });
}

/** Free reference lookup: checks each market's dfsLocationName against DataForSEO's Google locations list. */
async function checkLocations() {
  const json = await dfsGet('serp/google/locations/us');
  const locations: any[] = json?.tasks?.[0]?.result ?? [];
  console.log(`DataForSEO lists ${locations.length} US locations.`);
  let bad = 0;
  for (const m of markets) {
    const hit = locations.find((l) => l.location_name === m.dfsLocationName);
    if (hit) {
      console.log(`  OK   ${m.slug}: "${hit.location_name}" (code ${hit.location_code}, ${hit.location_type})`);
    } else {
      bad++;
      const near = locations.filter((l) => String(l.location_name).startsWith(`${m.city},`)).slice(0, 6).map((l) => `"${l.location_name}"`);
      console.log(`  MISS ${m.slug}: "${m.dfsLocationName}". Similar: ${near.join(', ') || 'none'}`);
    }
  }
  // extraLocations: each should exist as "<name>,<State>,United States" in the list.
  console.log('\nmarket | suburb | matched location name | code | type');
  for (const m of markets) {
    for (const sub of m.extraLocations) {
      const hit = locations.find((l) => String(l.location_name).startsWith(`${sub},${m.stateName},`));
      if (!hit) bad++;
      console.log(`${m.slug} | ${sub} | ${hit ? hit.location_name : 'NO MATCH'} | ${hit ? hit.location_code : '-'} | ${hit ? hit.location_type : '-'}`);
    }
  }
  if (bad) process.exitCode = 1;
}

async function listModels() {
  for (const [name, p] of [['ChatGPT', 'ai_optimization/chat_gpt/llm_responses/models'], ['Claude', 'ai_optimization/claude/llm_responses/models']]) {
    const json = await dfsGet(p);
    const models: any[] = json?.tasks?.[0]?.result ?? [];
    console.log(`\n${name} models (${models.length}):`);
    for (const m of models) console.log(`  ${m.model_name}${m.web_search_supported === false ? '  (no web search)' : ''}`);
  }
}

async function main() {
  if (flag('models')) return listModels();
  if (flag('check-locations')) return checkLocations();

  if (!live) {
    const tally = emptyTally();
    for (const m of markets) {
      const store = new RawStore(m.slug, date);
      for (const c of phaseOneCalls(m).filter((c) => wanted(c.kind))) {
        tally[c.kind].calls++;
        if (store.has(c.kind, c.key)) tally[c.kind].cached++;
      }
      // Phase two: real counts when phase one is already cached, else the assumptions.
      if (only && !wanted('gmb') && !wanted('lighthouse')) {
        // phase two not requested
      } else if (plan.keywords.every((kw) => store.has('maps', mapsKey(kw)) && store.has('organic', organicQuery(kw, m)))) {
        for (const c of phaseTwoCalls(m, store).filter((c) => wanted(c.kind))) {
          tally[c.kind].calls++;
          if (store.has(c.kind, c.key)) tally[c.kind].cached++;
        }
      } else {
        tally.gmb.calls += assumedGmb;
        tally.lighthouse.calls += assumedLighthouse;
      }
    }
    console.log(`Therapy Index ${smoke ? 'SMOKE TEST ' : ''}dry run: ${markets.map((m) => `${m.slug} (${m.dfsLocationName})`).join(', ')} (${date})`);
    printDryRun(tally, ['gmb', 'lighthouse']);
    return;
  }

  const spent = { total: 0 };
  for (const m of markets) {
    const store = new RawStore(m.slug, date);
    console.log(`\n${m.slug}: searches and AI answers`);
    await runCalls(store, phaseOneCalls(m).filter((c) => wanted(c.kind)), spent);
    if (!only || wanted('gmb') || wanted('lighthouse')) {
      console.log(`${m.slug}: profile lookups and Lighthouse`);
      await runCalls(store, phaseTwoCalls(m, store).filter((c) => wanted(c.kind)), spent);
    }
    const files = writeResult(buildResult(m, date, store, buildOpts), smoke ? 'smoke' : '');
    console.log(`${m.slug}: wrote\n      ${files.join('\n      ')}`);
  }
  console.log(`\nSpent this run: ${usd(spent.total)} (as reported by DataForSEO)`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
