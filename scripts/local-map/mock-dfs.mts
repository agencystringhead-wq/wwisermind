/* A pretend DataForSEO, Turnstile and Resend for the Local Map Assessment: the same response shapes as the saved ones in
   data/therapyindex/raw, no network and no credentials. Used by e2e.mts and dev-server.mts. */
import fs from 'node:fs';

/* Each pretend result carries the bulk of a real one (opening hours, photos, review snippets, related searches: about 2 KB), taken from a
   saved real response, so a depth-20 answer is about 40 KB like the live ones and the CPU numbers from the tests mean something. */
const TEMPLATE: Record<string, unknown> = (() => {
  try {
    const dir = 'data/therapyindex/raw/austin-tx/2026-10-21';
    const file = fs.readdirSync(dir).find((f) => f.startsWith('maps'))!;
    const json = JSON.parse(fs.readFileSync(`${dir}/${file}`, 'utf8'));
    return json.tasks[0].result[0].items.find((i: any) => i.type === 'maps_search') as Record<string, unknown>;
  } catch {
    return { padding: 'x'.repeat(1800) };
  }
})();

/** Time the pretend servers themselves took, so a test can subtract it from what a handler appears to use. Everything runs in one
    process with no real waiting, so elapsed time is CPU time (process.cpuUsage ticks at 15 ms on Windows, too coarse to use). */
export const mockCpu = { micros: 0 };
export const CIDS = { you: '1111111111', cedar: '2222222222', north: '3333333333', willow: '4444444444', harbor: '5555555555' };
export const NAMES: Record<string, string> = { [CIDS.you]: 'Brightwater Therapy', [CIDS.cedar]: 'Cedar Path Counseling', [CIDS.north]: 'Northside Therapy Collective', [CIDS.willow]: 'Willow Lane Psychology', [CIDS.harbor]: 'Harbor Street Therapy' };
const STATS: Record<string, [number, number, number]> = { // rating, reviews, photos
  [CIDS.you]: [4.7, 38, 12], [CIDS.cedar]: [4.9, 212, 46], [CIDS.north]: [4.8, 164, 38], [CIDS.willow]: [4.7, 129, 29], [CIDS.harbor]: [4.5, 57, 20],
};
const mockItem = (cid: string, rank: number, extra: Record<string, unknown> = {}) => {
  const [rating, votes, photos] = STATS[cid] ?? [4.3 + (Number(cid.slice(-1)) % 5) / 10, 8 + Number(cid.slice(-2)) * 2, 3 + Number(cid.slice(-1))];
  const home = HOMES[cid];
  return {
    ...TEMPLATE,
    type: 'maps_search', rank_group: rank, rank_absolute: rank, title: NAMES[cid] ?? `Practice ${cid}`, cid, place_id: `ChIJ${cid}`,
    rating: { value: rating, votes_count: votes }, total_photos: photos, category: 'Psychotherapist', additional_categories: ['Mental health service'],
    address: '1 Main St, Austin, TX 78701', latitude: home?.[0] ?? 30.26, longitude: home?.[1] ?? -97.74, url: 'https://example.com/', ...extra,
  };
};
export const tasks = new Map<string, { family: string; body: any; reads: number }>();
let nextId = 1;
let readyCalls = 0;
export const emails: { to: string; subject: string }[] = [];
export const state = { failTasks: 0, heavy: false, notReadyFirst: 1, neverReady: false };
/** How many times the "tasks ready" list was asked for: the scan must never use it. */
export const seen = { tasksReady: 0 };

const reply = (body: unknown) => new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
const ok = (tasksOut: unknown[], cost = 0) => reply({ status_code: 20000, cost, tasks: tasksOut });

const HOMES: Record<string, [number, number, number]> = {
  [CIDS.you]: [30.262, -97.742, 0.62], [CIDS.cedar]: [30.285, -97.72, 0.8], [CIDS.north]: [30.3, -97.76, 0.7], [CIDS.willow]: [30.24, -97.7, 0.66], [CIDS.harbor]: [30.23, -97.78, 0.5],
};
const hash = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return (h >>> 0) / 4294967296; };

function serpFor(body: any) {
  const [lat, lng] = String(body.location_coordinate).split(',').map(Number);
  const scored = Object.entries(HOMES).map(([cid, [hl, hg, strength]]) => {
    const miles = Math.hypot((lat - hl) * 69, (lng - hg) * 59);
    return { cid, score: strength - miles * 0.07 + (hash(`${cid}${body.keyword}${lat}${lng}`) - 0.5) * 0.18 };
  });
  for (let i = 0; i < 15; i++) scored.push({ cid: String(9000000000 + i), score: 0.05 + hash(`f${i}${body.keyword}${lat}${lng}`) * 0.42 });
  return scored.sort((a, b) => b.score - a.score).map((x, i) => mockItem(x.cid, i + 1));
}

const realFetch = globalThis.fetch;
export function installMock() {
globalThis.fetch = (async (input: any, init?: any) => {
  const t0 = performance.now();
  try {
    return await handle(input, init);
  } finally {
    mockCpu.micros += (performance.now() - t0) * 1000;
  }
}) as typeof fetch;
}

async function handle(input: any, init?: any): Promise<Response> {
  const url = String(input?.url ?? input);
  if (url.startsWith('https://challenges.cloudflare.com')) return reply({ success: true });
  if (url.startsWith('https://api.resend.com')) {
    const b = JSON.parse(init.body);
    emails.push({ to: b.to[0], subject: b.subject });
    return reply({ id: 'x' });
  }
  if (!url.startsWith('http://mock-dfs/')) return realFetch(input, init);
  const p = url.replace('http://mock-dfs/', '');
  const body = init?.body ? JSON.parse(init.body) : null;
  if (p === 'serp/google/maps/live/advanced') {
    return ok([{ status_code: 20000, cost: 0.002, result: [{ items: [mockItem(CIDS.you, 1), mockItem(CIDS.cedar, 2)] }] }], 0.002);
  }
  if (p.endsWith('/task_post')) {
    const family = p.replace('/task_post', '');
    const out = body.map((t: any, i: number) => {
      if (family === 'serp/google/maps' && state.failTasks > 0 && (state.heavy || i % 4 === 0)) {
        state.failTasks--;
        return { status_code: 40501, status_message: 'Invalid Field: location_coordinate' };
      }
      const id = `t${nextId++}`;
      tasks.set(id, { family, body: t, reads: 0 });
      return { id, status_code: 20100, cost: family === 'serp/google/maps' ? 0.0006 : 0.00075 };
    });
    return ok(out, out.reduce((s: number, t: any) => s + (t.cost ?? 0), 0));
  }
  if (p.endsWith('/tasks_ready')) {
    readyCalls++;
    seen.tasksReady++;
    const family = p.replace('/tasks_ready', '');
    const ids = [...tasks.entries()].filter(([, t]) => t.family === family && t.reads === 0).map(([id]) => ({ id }));
    return ok([{ status_code: 20000, result: readyCalls % 3 === 0 ? ids.slice(0, 0) : ids }]);
  }
  const get = /^(.*)\/task_get\/(?:advanced\/)?(t\d+)$/.exec(p);
  if (get) {
    const t = tasks.get(get[2])!;
    t.reads++;
    // Asked for by id: the first few asks find the task still queued, like the real thing.
    if (state.neverReady || t.reads <= state.notReadyFirst) return ok([{ status_code: 40602, status_message: 'Task In Queue', cost: 0, result: null }]);
    const cid = String(t.body.cid ?? String(t.body.keyword).replace('cid:', ''));
    const stamp = t.family.includes('reviews') ? (cid === CIDS.you ? '2026-07-20 12:00:00 +00:00' : '2026-10-18 12:00:00 +00:00') : (cid === CIDS.you ? '2026-05-01 12:00:00 +00:00' : '2026-10-15 12:00:00 +00:00');
    const items = t.family === 'serp/google/maps' ? serpFor(t.body) : [{ timestamp: stamp, post_date: stamp }];
    return ok([{ status_code: 20000, cost: 0, result: [{ items }] }]);
  }
  return new Response('not found', { status: 404 });
}
