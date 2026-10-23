import { DFS_PRIORITY, SERP_DEPTH } from '../rules';
import type { LmEnv } from './env';

/* DataForSEO, from a Pages Function. Credentials come from the environment and never reach the browser. The endpoints and the
   shape of a Maps result were checked against the saved responses in data/therapyindex/raw; the reviews and posts endpoints
   were not, so a failure there is never fatal (the report shows "n/a" for that row). */

const BASE = 'https://api.dataforseo.com/v3';

export class DfsError extends Error {
  code?: number;
  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
  }
}

export type DfsCall = { json: any; cost: number; ms: number };

export async function dfs(env: LmEnv, method: 'GET' | 'POST', path: string, body?: unknown): Promise<DfsCall> {
  if (!env.DATAFORSEO_LOGIN || !env.DATAFORSEO_PASSWORD) throw new DfsError('DataForSEO is not configured', 401);
  const started = Date.now();
  const res = await fetch(`${env.DATAFORSEO_BASE || BASE}/${path}`, {
    method,
    headers: {
      authorization: `Basic ${btoa(`${env.DATAFORSEO_LOGIN}:${env.DATAFORSEO_PASSWORD}`)}`,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new DfsError(`${path}: HTTP ${res.status}`, res.status);
  const json: any = await res.json();
  if (json?.status_code !== 20000) throw new DfsError(`${path}: ${json?.status_code} ${json?.status_message}`, json?.status_code);
  return { json, cost: Number(json.cost ?? 0), ms: Date.now() - started };
}

/* --- the three task families --------------------------------------------------------------------- */

export const FAMILY = {
  grid: 'serp/google/maps',
  reviews: 'business_data/google/reviews',
  updates: 'business_data/google/my_business_updates',
} as const;
export type Family = keyof typeof FAMILY;

export type Posted = { id: string | null; error?: string };

/** Posts up to 100 tasks in one request. The answer lines up with the input: one id (or one error) per task. */
export async function postTasks(env: LmEnv, family: Family, tasks: Record<string, unknown>[]): Promise<{ posted: Posted[]; cost: number; ms: number }> {
  const call = await dfs(env, 'POST', `${FAMILY[family]}/task_post`, tasks.map((t) => ({ priority: DFS_PRIORITY, language_code: 'en', ...t })));
  const out = (call.json.tasks ?? []) as any[];
  return {
    posted: tasks.map((_, i) => {
      const t = out[i];
      return t && t.status_code === 20100 && t.id ? { id: String(t.id) } : { id: null, error: `${t?.status_code ?? '?'} ${t?.status_message ?? 'no answer'}` };
    }),
    cost: call.cost,
    ms: call.ms,
  };
}

export const gridTask = (keyword: string, coordinate: string) => ({ keyword, location_coordinate: coordinate, depth: SERP_DEPTH });

export type ProfileRef = { keyword: string; reviewsFields: Record<string, unknown> };

export const reviewsTask = (ref: ProfileRef) => ({ ...ref.reviewsFields, depth: 5, sort_by: 'newest' });
export const updatesTask = (ref: ProfileRef) => ({ keyword: ref.keyword, location_name: 'United States' });

/** How a practice is named to the reviews and posts endpoints, from its cid or its place id. Null when it has neither. */
export function profileRef(key: string): ProfileRef | null {
  if (/^\d{6,}$/.test(key)) return { keyword: `cid:${key}`, reviewsFields: { cid: key, location_name: 'United States' } };
  if (/^ChIJ/.test(key)) return { keyword: `place_id:${key}`, reviewsFields: { place_id: key, location_name: 'United States' } };
  return null;
}

/** The ids of finished tasks in a family that we have not collected yet. */
export async function readyIds(env: LmEnv, family: Family): Promise<{ ids: Set<string>; cost: number; ms: number }> {
  const call = await dfs(env, 'GET', `${FAMILY[family]}/tasks_ready`);
  const ids = new Set<string>();
  for (const t of call.json.tasks ?? []) for (const r of t.result ?? []) if (r?.id) ids.add(String(r.id));
  return { ids, cost: call.cost, ms: call.ms };
}

/** One finished task. `ready` is false while it is still queued or being worked on. */
export async function getTask(env: LmEnv, family: Family, id: string): Promise<{ ready: boolean; items: any[]; error?: string; cost: number; ms: number }> {
  const path = family === 'grid' ? `${FAMILY.grid}/task_get/advanced/${id}` : `${FAMILY[family]}/task_get/${id}`;
  const call = await dfs(env, 'GET', path);
  const task = call.json.tasks?.[0];
  const code = task?.status_code;
  if (code === 40601 || code === 40602) return { ready: false, items: [], cost: 0, ms: call.ms };
  if (code !== 20000) return { ready: true, items: [], error: `${code} ${task?.status_message}`, cost: 0, ms: call.ms };
  /* A task is billed once, when it is posted. A finished Maps task echoes a cost when collected, but the account's own statistics show it is
     not charged again (checked against a real report), so collecting costs nothing here. */
  return { ready: true, items: task.result?.[0]?.items ?? [], cost: 0, ms: call.ms };
}

/** One live Maps search: used for the practice lookup, where the visitor is waiting. */
export async function liveMapsSearch(env: LmEnv, keyword: string, depth = 10): Promise<{ items: any[]; cost: number; ms: number }> {
  const call = await dfs(env, 'POST', 'serp/google/maps/live/advanced', [{ keyword, location_name: 'United States', language_code: 'en', depth }]);
  const task = call.json.tasks?.[0];
  if (task?.status_code !== 20000) throw new DfsError(`maps live: ${task?.status_code} ${task?.status_message}`, task?.status_code);
  return { items: task.result?.[0]?.items ?? [], cost: Number(task.cost ?? call.cost), ms: call.ms };
}
