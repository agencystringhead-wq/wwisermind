import { AI_MODELS } from '../../lib/therapyindex/markets';
import type { Kind } from './store';

/* DataForSEO client and the price list behind --dry-run.

   Endpoints and prices checked against docs.dataforseo.com and dataforseo.com/pricing on 2026-10-21.
   Prices are published figures for Live mode; re-check them before a big run. */

const BASE = 'https://api.dataforseo.com/v3';

/* Provider cost per AI call (model tokens plus web search) is NOT published by DataForSEO; it is billed
   through at actual usage. These are rough per-call assumptions for the dry run only. Replace them with
   the real figures once a smoke run reports its cost. */
export const AI_TASK_FEE = 0.0006;
export const AI_COST_ASSUMPTIONS: Record<string, number> = {
  'gpt-5-mini': 0.015,
  'gpt-5': 0.04,
  'claude-haiku-4-5': 0.015,
  'claude-sonnet-5': 0.05,
  'claude-sonnet-5-5': 0.0512, // observed in the Austin full run (9 answers averaged ~$0.052 each; the earlier smoke answer was cheaper)
  'gpt-5.6-luna': 0.0163, // observed in the Austin full run (average of 3 answers)
  'gpt-5.6-sol': 0.05,
};
export const AI_COST_FALLBACK = 0.04;
/** The models used before the switch to the consumer defaults, kept for the cost comparison. */
export const PREVIOUS_AI_MODELS = { chatgpt: 'gpt-5-mini', claude: 'claude-haiku-4-5' } as const;
export const aiUnitCost = (model: string) => AI_TASK_FEE + (AI_COST_ASSUMPTIONS[model] ?? AI_COST_FALLBACK);

export type Call = {
  kind: Kind;
  /** Cache key, unique within the kind. */
  key: string;
  /** Path under /v3. */
  endpoint: string;
  /** The single task object sent in the request array. */
  task: Record<string, unknown>;
  label: string;
};

export const ENDPOINTS: Record<Kind, { path: string; title: string; unitCost: number; note: string }> = {
  maps: {
    path: 'serp/google/maps/live/advanced',
    title: 'SERP Google Maps (live/advanced)',
    unitCost: 0.002,
    note: '$0.002 per SERP of up to 100 results',
  },
  organic: {
    path: 'serp/google/organic/live/advanced',
    title: 'SERP Google Organic (live/advanced)',
    unitCost: 0.002,
    note: '$0.002 per SERP of 10 results (depth 10)',
  },
  gmb: {
    path: 'business_data/google/my_business_info/live',
    title: 'Business Data Google My Business Info (live)',
    unitCost: 0.0054,
    note: '$0.0054 per profile live ($0.0015 on the standard queue)',
  },
  lighthouse: {
    path: 'on_page/lighthouse/live/json',
    title: 'On-Page Lighthouse (live/json)',
    unitCost: 0.005,
    note: '$0.005 per page scanned',
  },
  'ai-chatgpt': {
    path: 'ai_optimization/chat_gpt/llm_responses/live',
    title: 'AI Optimization LLM Responses: ChatGPT (live)',
    unitCost: aiUnitCost(AI_MODELS.chatgpt),
    note: '$0.0006 task fee + ASSUMED model/web-search cost per call (billed through at actual usage)',
  },
  'ai-claude': {
    path: 'ai_optimization/claude/llm_responses/live',
    title: 'AI Optimization LLM Responses: Claude (live)',
    unitCost: aiUnitCost(AI_MODELS.claude),
    note: '$0.0006 task fee + ASSUMED model/web-search cost per call (billed through at actual usage)',
  },
};

export async function dfsGet(pathUnderV3: string): Promise<any> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) throw new DfsError('DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD missing. Put them in .env.local.');
  const auth = Buffer.from(`${login}:${password}`).toString('base64');
  const res = await fetch(`${BASE}/${pathUnderV3}`, { headers: { Authorization: `Basic ${auth}` } });
  if (!res.ok) throw new DfsError(`GET ${pathUnderV3}: HTTP ${res.status}`);
  return res.json();
}

export class DfsError extends Error {}

export async function dfsPost(call: Call): Promise<{ response: any; cost: number }> {
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (!login || !password) {
    throw new DfsError('DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD missing. Put them in .env.local.');
  }
  const auth = Buffer.from(`${login}:${password}`).toString('base64');
  const res = await fetch(`${BASE}/${call.endpoint}`, {
    method: 'POST',
    headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([call.task]),
  });
  if (!res.ok) throw new DfsError(`${call.label}: HTTP ${res.status}`);
  const json: any = await res.json();
  const task = json?.tasks?.[0];
  if (json?.status_code !== 20000 || !task || task.status_code !== 20000) {
    throw new DfsError(`${call.label}: ${task?.status_code ?? json?.status_code} ${task?.status_message ?? json?.status_message}`);
  }
  return { response: json, cost: Number(task.cost ?? 0) };
}

/** Runs async jobs with at most `limit` in flight. */
export async function pool<T>(items: T[], limit: number, fn: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++];
      await fn(item);
    }
  });
  await Promise.all(workers);
}
