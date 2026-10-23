import { coordinateFor, makeGrid } from '../grid';
import { buildReport, isYou, pickCompetitors, type Cells, type Extras } from '../report';
import {
  EARLY_CANDIDATES,
  EARLY_COMPETITORS_SHARE,
  FETCH_PER_POLL,
  GRID_TIMEOUT_MS,
  LATE_PROFILE_GRACE_MS,
  MIN_DONE_SHARE,
  PROFILE_TIMEOUT_MS,
  RETRIES_PER_REPORT,
  RULES_VERSION,
} from '../rules';
import type { GridPoint, Listing, Progress, SerpRow, StatusResponse } from '../types';
import type { LmEnv } from './env';
import { getTask, gridTask, postTasks, profileRef, readyIds, reviewsTask, updatesTask, type Family } from './dfs';
import { newestStamp, toRows } from './parse';

/* The scan, run in small steps.

   A Pages Function may make only a few dozen outside calls per request, and a report is about a hundred DataForSEO tasks. So the
   work is split: `startScan` posts every grid task in one request (and your own reviews and posts tasks), then returns at once; the
   report page asks for the status every few seconds, and each of those calls collects a slice of the finished tasks (advance).

   The slow part is DataForSEO's queue, so things that do not depend on each other run side by side:
     - your own newest review and post are asked for at the very start;
     - once about 60% of the grid is in, the four practices ahead of you are picked from what we have, and their reviews and posts
       are asked for while the rest of the grid finishes;
     - when the grid is complete, any of the final four that were not in the early pick are asked for, and the report is built as soon
       as everything is back.

   State lives in one row of lm_reports: tasks_json (each task and whether it has come back) and results_json (what has come back).
   `lock_until` makes sure only one poll works on a report at a time. */

/** One DataForSEO task: s is 0 waiting, 1 collected, 2 failed or timed out. */
type TaskRef = { id: string | null; p: number; k: number; s: 0 | 1 | 2; f: Family; ref?: string; e?: string; l?: boolean };
type Tasks = { grid: TaskRef[]; prof: TaskRef[] };
type Results = { grid: Record<string, SerpRow[]>; extras: Extras };
type Timings = Partial<Record<'posted' | 'youPosted' | 'firstReady' | 'competitorsEarly' | 'gridDone' | 'profilesPosted' | 'finished', number>>;

type Row = {
  id: string;
  listing_json: string;
  keywords_json: string;
  radius_mi: number;
  centre_json: string;
  points_json: string;
  status: 'scanning' | 'profiles' | 'done' | 'failed';
  error: string | null;
  tasks_json: string;
  results_json: string;
  competitors_json: string | null;
  report_json: string | null;
  timings_json: string;
  retries: number;
  created_at: number;
};

const COLUMNS =
  'id, listing_json, keywords_json, radius_mi, centre_json, points_json, status, error, tasks_json, results_json, competitors_json, report_json, timings_json, retries, created_at';

/* --- cost log ------------------------------------------------------------------------------------ */

export async function logCost(env: LmEnv, reportId: string | null, step: string, calls: number, tasks: number, cost: number, ms: number, note?: string) {
  await env.DB.prepare('INSERT INTO lm_cost_log (report_id, step, calls, tasks, cost, ms, note, at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)')
    .bind(reportId, step, calls, tasks, cost, ms, note ?? null, Date.now())
    .run();
}

/* --- start --------------------------------------------------------------------------------------- */

export type StartInput = { id: string; listing: Listing; keywords: string[]; radiusMiles: number; centre: { lat: number; lng: number }; cacheKey: string };

/** Creates the report, posts all 100 checks in one request and your own reviews and posts tasks. Throws if DataForSEO cannot be reached at all. */
export async function startScan(env: LmEnv, input: StartInput): Promise<void> {
  const now = Date.now();
  const points = makeGrid(input.centre.lat, input.centre.lng, input.radiusMiles);
  const refs = gridRefs(points, input.keywords.length);

  const timings: Timings = { posted: now };
  const body = refs.map((r) => gridTask(input.keywords[r.k], coordinateFor(points[r.p], input.radiusMiles)));
  const { posted, cost, ms } = await postTasks(env, 'grid', body);
  posted.forEach((p, i) => {
    refs[i].id = p.id;
    if (!p.id) {
      refs[i].s = 2;
      refs[i].e = p.error;
    }
  });
  await logCost(env, input.id, 'post_grid', 1, refs.length, cost, ms, posted.find((p) => p.error)?.error);

  /* Your own newest review and post do not depend on the grid, so they are asked for now and are ready long before it is. */
  const prof: TaskRef[] = [];
  const youRef = input.listing.cid ?? input.listing.placeId;
  const you = youRef ? await postProfiles(env, input.id, prof, [{ ref: 'you', key: youRef }], 'you, at the start') : { calls: 0, cost: 0, ms: 0 };
  if (you.calls) timings.youPosted = now;

  await env.DB.prepare(
    `INSERT INTO lm_reports (id, cache_key, listing_json, keywords_json, radius_mi, centre_json, points_json, status, tasks_json, results_json, timings_json, total_cost, rules_version, created_at)
     VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 'scanning', ?8, ?9, ?10, ?11, ?12, ?13)`,
  )
    .bind(
      input.id,
      input.cacheKey,
      JSON.stringify(input.listing),
      JSON.stringify(input.keywords),
      input.radiusMiles,
      JSON.stringify(input.centre),
      JSON.stringify(points),
      JSON.stringify({ grid: refs, prof } satisfies Tasks),
      JSON.stringify({ grid: {}, extras: {} } satisfies Results),
      JSON.stringify(timings),
      cost + you.cost,
      RULES_VERSION,
      now,
    )
    .run();
}

const gridRefs = (points: GridPoint[], keywordCount: number): TaskRef[] =>
  points.flatMap((p) => Array.from({ length: keywordCount }, (_, k): TaskRef => ({ id: null, p: p.i, k, s: 0, f: 'grid' })));

/* --- status and the work behind it --------------------------------------------------------------- */

const progressOf = (tasks: Tasks, pointsTotal: number): Progress => {
  const byPoint = new Map<number, boolean>();
  for (const t of tasks.grid) byPoint.set(t.p, (byPoint.get(t.p) ?? true) && t.s !== 0);
  return {
    pointsDone: [...byPoint.values()].filter(Boolean).length,
    pointsTotal,
    checksDone: tasks.grid.filter((t) => t.s !== 0).length,
    checksTotal: tasks.grid.length,
  };
};

export async function loadStatus(env: LmEnv, id: string, advanceWork: boolean, onDone?: (reportId: string) => Promise<void>): Promise<StatusResponse | null> {
  const row = await env.DB.prepare(`SELECT ${COLUMNS} FROM lm_reports WHERE id = ?1`).bind(id).first<Row>();
  if (!row) return null;
  return respond(env, row, advanceWork, onDone);
}

const FAILED_MESSAGE = 'We could not finish checking every point this time. Your results so far are saved, so trying again only repeats the checks that did not finish.';

async function respond(env: LmEnv, row: Row, advanceWork: boolean, onDone?: (reportId: string) => Promise<void>): Promise<StatusResponse> {
  let r = row;
  if (advanceWork && (r.status === 'scanning' || r.status === 'profiles')) r = (await advance(env, r, onDone)) ?? r;

  const tasks = JSON.parse(r.tasks_json) as Tasks;
  const progress = progressOf(tasks, 25);
  if (r.status === 'done' && r.report_json) return { status: 'done', progress, report: JSON.parse(r.report_json) };
  if (r.status === 'failed') return { status: 'failed', progress, message: FAILED_MESSAGE, canRetry: r.retries < RETRIES_PER_REPORT };
  return { status: 'scanning', progress };
}

type Meter = { spent: number; posted: number; calls: number; longest: number; collected: number; gets: number };
type Count = (c: { cost: number; ms: number }) => void;

/** One step of work on a report. Returns the updated row, or null if another poll is already working on it. */
async function advance(env: LmEnv, row: Row, onDone?: (reportId: string) => Promise<void>): Promise<Row | null> {
  const now = Date.now();
  const claim = await env.DB.prepare('UPDATE lm_reports SET lock_until = ?1 WHERE id = ?2 AND lock_until < ?3').bind(now + 25_000, row.id, now).run();
  if (!claim.meta?.changes) return null;

  const tasks = JSON.parse(row.tasks_json) as Tasks;
  const results = JSON.parse(row.results_json) as Results;
  const timings = JSON.parse(row.timings_json) as Timings;
  const listing = JSON.parse(row.listing_json) as Listing;
  const keywordCount = (JSON.parse(row.keywords_json) as string[]).length;
  const points = JSON.parse(row.points_json) as GridPoint[];
  let status = row.status;
  let error = row.error;
  let competitorsJson = row.competitors_json;
  let reportJson = row.report_json;
  let finishedNow = false;
  const meter: Meter = { spent: 0, posted: 0, calls: 0, longest: 0, collected: 0, gets: FETCH_PER_POLL };
  const count: Count = (c) => {
    meter.calls += 1;
    meter.spent += c.cost;
    meter.longest = Math.max(meter.longest, c.ms);
  };

  try {
    /* Reviews and posts first (at most ten, and they have the longest wait), then what is left of this poll's budget for the grid. */
    await collectProfiles(env, tasks, results, meter, count);

    if (status === 'scanning') {
      await collectGrid(env, tasks, results, timings, meter, count, now, row.created_at);

      const gridDone = tasks.grid.filter((t) => t.s === 1).length;
      const settled = tasks.grid.every((t) => t.s !== 0);

      /* Once enough of the grid is in, ask for the reviews and posts of the practices ahead of you, so they run alongside the rest. */
      if (!settled && !timings.competitorsEarly && gridDone / tasks.grid.length >= EARLY_COMPETITORS_SHARE) {
        const cells = cellsOf(results, points.length, keywordCount);
        const out = await postProfiles(env, row.id, tasks.prof, wanted(cells, listing, EARLY_CANDIDATES), `competitors, early (up to ${EARLY_CANDIDATES}): ${gridDone} of ${tasks.grid.length} grid checks in`);
        meter.calls += out.calls;
        meter.spent += out.cost;
        meter.posted += out.cost;
        timings.competitorsEarly = now;
        timings.profilesPosted = now;
      }

      if (settled) {
        timings.gridDone = now;
        if (gridDone / tasks.grid.length < MIN_DONE_SHARE) {
          status = 'failed';
          error = 'scan_incomplete';
        } else {
          /* The final four may differ a little from the early pick: ask for any that are missing. */
          const cells = cellsOf(results, points.length, keywordCount);
          const out = await postProfiles(env, row.id, tasks.prof, wanted(cells, listing), 'final top four, missing ones only', true);
          meter.calls += out.calls;
          meter.spent += out.cost;
          meter.posted += out.cost;
          if (out.calls) timings.profilesPosted = now;
          competitorsJson = JSON.stringify(pickCompetitors(cells, listing));
          status = 'profiles';
        }
      }
    }

    if (status === 'profiles') {
      if (now - (timings.gridDone ?? now) > LATE_PROFILE_GRACE_MS) {
        for (const t of tasks.prof) if (t.s === 0 && t.l) (t.s = 2), (t.e = 'late: built without it');
      }
      const base = Math.max(timings.gridDone ?? now, timings.profilesPosted ?? 0);
      if (tasks.prof.some((t) => t.s === 0) && now - base > PROFILE_TIMEOUT_MS) {
        for (const t of tasks.prof) if (t.s === 0) (t.s = 2), (t.e = 'timed out');
      }
      if (tasks.prof.every((t) => t.s !== 0)) {
        const report = finalise(row, listing, results, JSON.parse(competitorsJson ?? '[]'), now);
        reportJson = JSON.stringify(report);
        timings.finished = now;
        status = 'done';
        finishedNow = true;
      }
    }
  } catch (e) {
    /* DataForSEO could not be reached at all (or refused our login). Keep what we have; the visitor can retry. */
    error = e instanceof Error ? e.message.slice(0, 200) : 'error';
    if (e instanceof Error && 'code' in e && [401, 40100, 40101].includes((e as { code?: number }).code ?? 0)) status = 'failed';
  }

  await env.DB.batch([
    env.DB.prepare(
      `UPDATE lm_reports SET status = ?1, error = ?2, tasks_json = ?3, results_json = ?4, competitors_json = ?5, report_json = ?6, timings_json = ?7,
         total_cost = total_cost + ?8, finished_at = ?9, lock_until = 0 WHERE id = ?10`,
    ).bind(status, error, JSON.stringify(tasks), JSON.stringify(results), competitorsJson, reportJson, JSON.stringify(timings), meter.spent, finishedNow ? now : null, row.id),
    env.DB.prepare('INSERT INTO lm_cost_log (report_id, step, calls, tasks, cost, ms, note, at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)').bind(
      row.id,
      row.status === 'scanning' ? 'poll_grid' : 'poll_profiles',
      meter.calls,
      meter.collected,
      meter.spent - meter.posted,
      meter.longest,
      error,
      now,
    ),
  ]);

  if (finishedNow && onDone) await onDone(row.id).catch(() => undefined);
  return { ...row, status, error, tasks_json: JSON.stringify(tasks), results_json: JSON.stringify(results), competitors_json: competitorsJson, report_json: reportJson, timings_json: JSON.stringify(timings) };
}

/** Collects the finished reviews and posts tasks. A task is looked at only once it shows in the ready list. */
async function collectProfiles(env: LmEnv, tasks: Tasks, results: Results, meter: Meter, count: Count) {
  for (const family of ['reviews', 'updates'] as const) {
    const mine = tasks.prof.filter((t) => t.s === 0 && t.id && t.f === family);
    if (!mine.length) continue;
    try {
      const ready = await readyIds(env, family);
      count(ready);
      const batch = mine.filter((t) => ready.ids.has(t.id!)).slice(0, Math.max(0, meter.gets));
      meter.gets -= batch.length;
      await Promise.all(
        batch.map(async (t) => {
          try {
            const got = await getTask(env, family, t.id!);
            count(got);
            if (!got.ready) return;
            if (got.error) {
              t.s = 2;
              t.e = got.error;
              return;
            }
            t.s = 1;
            const cur = (results.extras[t.ref ?? 'you'] ??= { lastReviewAt: null, lastPostAt: null });
            const stamp = newestStamp(got.items);
            if (family === 'reviews') cur.lastReviewAt = stamp;
            else cur.lastPostAt = stamp;
            meter.collected += 1;
          } catch (e) {
            t.e = e instanceof Error ? e.message : 'fetch failed'; // stays waiting: the next poll tries again
          }
        }),
      );
    } catch (e) {
      for (const t of mine) t.e = e instanceof Error ? e.message : 'ready failed';
    }
  }
}

/** Collects finished grid checks with what is left of this poll's budget, and times out any that never come back. */
async function collectGrid(env: LmEnv, tasks: Tasks, results: Results, timings: Timings, meter: Meter, count: Count, now: number, createdAt: number) {
  const pending = tasks.grid.filter((t) => t.s === 0 && t.id);
  if (pending.length && meter.gets > 0) {
    const ready = await readyIds(env, 'grid');
    count(ready);
    const batch = pending.filter((t) => ready.ids.has(t.id!)).slice(0, meter.gets);
    meter.gets -= batch.length;
    if (batch.length && !timings.firstReady) timings.firstReady = now;
    await Promise.all(
      batch.map(async (t) => {
        try {
          const got = await getTask(env, 'grid', t.id!);
          count(got);
          if (!got.ready) return;
          if (got.error) {
            t.s = 2;
            t.e = got.error;
          } else {
            results.grid[`${t.p}:${t.k}`] = toRows(got.items);
            t.s = 1;
            meter.collected += 1;
          }
        } catch (e) {
          t.e = e instanceof Error ? e.message : 'fetch failed';
        }
      }),
    );
  }
  if (tasks.grid.some((t) => t.s === 0 && t.id) && now - (timings.posted ?? createdAt) > GRID_TIMEOUT_MS) {
    for (const t of tasks.grid) if (t.s === 0) (t.s = 2), (t.e = 'timed out');
  }
}

/* --- reviews and posts: for you, then for the four ahead of you --------------------------------------- */

const cellsOf = (results: Results, pointsTotal: number, keywordCount: number): Cells =>
  Array.from({ length: pointsTotal }, (_, p) => Array.from({ length: keywordCount }, (_, k) => results.grid[`${p}:${k}`] ?? null));

/** The practice's own key in the results (its cid or place id as Google shows it), which may differ from what the visitor picked. */
function youKey(cells: Cells, listing: Listing): string | null {
  for (const perPoint of cells) for (const rows of perPoint) for (const row of rows ?? []) if (isYou(row, listing)) return row[0];
  return listing.cid ?? listing.placeId;
}

/** Who needs a reviews and posts lookup, from the results so far: you, and the practices ahead of you. */
const wanted = (cells: Cells, listing: Listing, limit = 4) => [
  { ref: 'you', key: youKey(cells, listing) },
  ...pickCompetitors(cells, listing, limit).map((c) => ({ ref: c.key, key: c.key })),
];

/** Posts a reviews task and a posts task for each target that does not have one yet. Never throws: a failure here only leaves "n/a" in the report. */
async function postProfiles(env: LmEnv, reportId: string, prof: TaskRef[], targets: { ref: string; key: string | null }[], why: string, late = false) {
  const todo = targets.flatMap((t) => {
    if (!t.key || prof.some((p) => p.ref === t.ref)) return [];
    const profile = profileRef(t.key);
    return profile ? [{ ref: t.ref, profile }] : [];
  });
  let calls = 0;
  let cost = 0;
  let ms = 0;
  let note: string = why;
  for (const family of todo.length ? (['reviews', 'updates'] as const) : []) {
    try {
      const body = todo.map((t) => (family === 'reviews' ? reviewsTask(t.profile) : updatesTask(t.profile)));
      const out = await postTasks(env, family, body);
      calls += 1;
      cost += out.cost;
      ms = Math.max(ms, out.ms);
      out.posted.forEach((p, i) => {
        prof.push({ id: p.id, p: 0, k: 0, s: p.id ? 0 : 2, f: family, ref: todo[i].ref, e: p.error, ...(late ? { l: true } : {}) });
        if (p.error) note = `${why}: ${p.error}`;
      });
    } catch (e) {
      note = `${why}: ${e instanceof Error ? e.message : 'post failed'}`;
    }
  }
  if (todo.length) await logCost(env, reportId, 'post_profiles', calls, todo.length * 2, cost, ms, note);
  return { calls, cost, ms };
}

function finalise(row: Row, listing: Listing, results: Results, competitors: { key: string; name: string }[], now: number) {
  const keywords = JSON.parse(row.keywords_json) as string[];
  const points = JSON.parse(row.points_json) as GridPoint[];
  return buildReport({
    id: row.id,
    now,
    listing,
    centre: JSON.parse(row.centre_json),
    radiusMiles: row.radius_mi,
    keywords,
    points,
    cells: cellsOf(results, points.length, keywords.length),
    competitors,
    extras: results.extras,
  });
}

/* --- retry --------------------------------------------------------------------------------------- */

/** Posts again only the checks that did not finish, and puts the report back to scanning. */
export async function retryScan(env: LmEnv, id: string): Promise<'ok' | 'not_found' | 'not_failed' | 'limit' | 'unavailable'> {
  const row = await env.DB.prepare(`SELECT ${COLUMNS} FROM lm_reports WHERE id = ?1`).bind(id).first<Row>();
  if (!row) return 'not_found';
  if (row.status !== 'failed') return 'not_failed';
  if (row.retries >= RETRIES_PER_REPORT) return 'limit';

  const tasks = JSON.parse(row.tasks_json) as Tasks;
  const keywords = JSON.parse(row.keywords_json) as string[];
  const points = JSON.parse(row.points_json) as GridPoint[];
  const todo = tasks.grid.filter((t) => t.s === 2 || (t.s === 0 && !t.id));
  if (!todo.length) return 'not_failed';
  try {
    const body = todo.map((t) => gridTask(keywords[t.k], coordinateFor(points[t.p], row.radius_mi)));
    const { posted, cost, ms } = await postTasks(env, 'grid', body);
    posted.forEach((p, i) => {
      todo[i].id = p.id;
      todo[i].s = p.id ? 0 : 2;
      todo[i].e = p.error;
    });
    await logCost(env, id, 'post_grid', 1, todo.length, cost, ms, 'retry');
    const timings = JSON.parse(row.timings_json) as Timings;
    timings.posted = Date.now();
    delete timings.competitorsEarly; // the early pick is made again from the new results
    await env.DB.prepare("UPDATE lm_reports SET status = 'scanning', error = NULL, tasks_json = ?1, timings_json = ?2, retries = retries + 1, total_cost = total_cost + ?3, lock_until = 0 WHERE id = ?4")
      .bind(JSON.stringify(tasks), JSON.stringify(timings), cost, id)
      .run();
    return 'ok';
  } catch {
    return 'unavailable';
  }
}
