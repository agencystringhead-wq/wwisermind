import type { Kind } from './store';

/* DataForSEO client and the price list behind --dry-run.

   Endpoints and prices checked against docs.dataforseo.com and dataforseo.com/pricing on 2026-10-21.
   Prices are published figures for Live mode; re-check them before a big run. */

const BASE = 'https://api.dataforseo.com/v3';

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
    // $0.0006 task fee + assumed provider cost with web search (not published by DataForSEO; see note).
    unitCost: 0.0006 + 0.015,
    note: '$0.0006 task fee + ASSUMED ~$0.015 model/web-search cost (billed through at actual token cost)',
  },
  'ai-claude': {
    path: 'ai_optimization/claude/llm_responses/live',
    title: 'AI Optimization LLM Responses: Claude (live)',
    unitCost: 0.0006 + 0.015,
    note: '$0.0006 task fee + ASSUMED ~$0.015 model/web-search cost (billed through at actual token cost)',
  },
};

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
