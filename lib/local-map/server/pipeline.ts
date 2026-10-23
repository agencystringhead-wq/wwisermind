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
import type { GridPoint, Listing, Progress, SerpRow } from '../types';
import type { LmEnv, LmStmt } from './env';
import { getTask, gridTask, postTasks, profileRef, readyIds, reviewsTask, updatesTask, type Family } from './dfs';
import { newestStamp, toRows } from './parse';

/* The scan, built for a Pages Function on the free plan: 10 ms of CPU and 50 outside requests per invocation.

   Nothing here is done in one long request. `startScan` only posts the tasks (one request for all 100 grid checks, two for your own
   reviews and posts) and saves their ids. After that the report page asks for the status every few seconds, and EACH POLL DOES ONE KIND OF
   WORK, chosen from the report's state:

     scanning   collect: fetch at most FETCH_PER_POLL finished tasks, keep only the first 20 results of each as one small row in lm_cells,
                and tick them off. Once about half the grid is in, one poll instead does the early pick (below).
     selecting  read the cells once, pick the final four practices ahead of you, ask for any reviews and posts not asked for yet.
     profiles   collect the reviews and posts (at most FETCH_PER_POLL, shared with the above).
     building   read the cells once, score, build the gap table and the fixes, save the finished report.
     done       nothing: the stored report is handed back as it is, never parsed.

   What a poll reads and writes is small and bounded: the report row (task list about 10 KB), at most FETCH_PER_POLL cells, and the
   state. The 170 KB of results is never read or rewritten by a collecting poll. Independent work still runs side by side, since the
   queue at DataForSEO is the slow part: your own reviews and posts are asked for at the start, and the eight likeliest practices ahead of
   you are asked for once about half the grid is in. `lock_until` makes sure only one poll works on a report at a time.

   Because the scan only moves while a poll arrives, the clock for timeouts counts only time the page was actually polling (`act`): a
   visitor who closes the tab and opens the link ten minutes later resumes where they stopped instead of finding checks timed out. */

/** One DataForSEO task: s is 0 waiting, 1 collected, 2 failed or timed out. */
type TaskRef = { id: string | null; p: number; k: number; s: 0 | 1 | 2; f: Family; ref?: string; e?: string; l?: boolean };
type Tasks = { grid: TaskRef[]; prof: TaskRef[] };
type Results = { extras: Extras };
/** `act` is milliseconds the page has spent polling; marks ending in Act are `act` readings. Other marks are wall-clock, for timing logs. */
type Timings = {
  posted: number;
  act: number;
  lastPoll: number;
  postedAct?: number;
  early?: boolean;
  youPosted?: number;
  firstReady?: number;
  competitorsEarly?: number;
  gridDone?: number;
  gridDoneAct?: number;
  profilesPosted?: number;
  profPostedAct?: number;
  finished?: number;
};

export type Status = 'scanning' | 'selecting' | 'profiles' | 'building' | 'done' | 'failed';

type Row = {
  id: string;
  listing_json: string;
  keywords_json: string;
  radius_mi: number;
  centre_json: string;
  points_json: string;
  status: Status;
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

/** The most a gap between polls counts toward a timeout in one go: a poll after a long gap counts as a few seconds, not minutes. */
const MAX_ACT_STEP_MS = 10_000;

/* --- cost log ------------------------------------------------------------------------------------ */

export async function logCost(env: LmEnv, reportId: string | null, step: string, calls: number, tasks: number, cost: number, ms: number, note?: string) {
  await env.DB.prepare('INSERT INTO lm_cost_log (report_id, step, calls, tasks, cost, ms, note, at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)')
    .bind(reportId, step, calls, tasks, cost, ms, note ?? null, Date.now())
    .run();
}

/* --- start --------------------------------------------------------------------------------------- */

export type StartInput = { id: string; listing: Listing; keywords: string[]; radiusMiles: number; centre: { lat: number; lng: number }; cacheKey: string };

/** Creates the report, posts all 100 checks in one request and your own reviews and posts tasks. No results are processed here. Throws if DataForSEO cannot be reached. */
export async function startScan(env: LmEnv, input: StartInput): Promise<void> {
  const now = Date.now();
  const points = makeGrid(input.centre.lat, input.centre.lng, input.radiusMiles);
  const refs = gridRefs(points, input.keywords.length);

  const timings: Timings = { posted: now, act: 0, lastPoll: now, postedAct: 0 };
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
      JSON.stringify({ extras: {} } satisfies Results),
      JSON.stringify(timings),
      cost + you.cost,
      RULES_VERSION,
      now,
    )
    .run();
}

const gridRefs = (points: GridPoint[], keywordCount: number): TaskRef[] =>
  points.flatMap((p) => Array.from({ length: keywordCount }, (_, k): TaskRef => ({ id: null, p: p.i, k, s: 0, f: 'grid' })));

/* --- status: the text the page gets ----------------------------------------------------------------- */

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

const FAILED_MESSAGE = 'We could not finish checking every point this time. Your results so far are saved, so trying again only repeats the checks that did not finish.';

/** The JSON the status endpoint sends. A finished report is the stored text, spliced in as it is: never parsed and never stringified again. */
function statusText(r: Row, hurry: boolean): string {
  if (r.status === 'done' && r.report_json) {
    return `{"status":"done","progress":{"pointsDone":25,"pointsTotal":25,"checksDone":100,"checksTotal":100},"report":${r.report_json}}`;
  }
  const progress = progressOf(JSON.parse(r.tasks_json) as Tasks, 25);
  if (r.status === 'failed') return JSON.stringify({ status: 'failed', progress, message: FAILED_MESSAGE, canRetry: r.retries < RETRIES_PER_REPORT });
  return JSON.stringify({ status: 'scanning', progress, hurry });
}

/** Loads the report, does one step of work if it is not finished and `advanceWork` is set, and returns the status JSON (null if there is no such report). */
export async function loadStatus(env: LmEnv, id: string, advanceWork: boolean, onDone?: (reportId: string) => Promise<void>): Promise<string | null> {
  const row = await env.DB.prepare(`SELECT ${COLUMNS} FROM lm_reports WHERE id = ?1`).bind(id).first<Row>();
  if (!row) return null;
  const active = row.status === 'scanning' || row.status === 'selecting' || row.status === 'profiles' || row.status === 'building';
  if (!advanceWork || !active) return statusText(row, false);
  const out = await advance(env, row, onDone);
  return statusText(out?.row ?? row, out?.hurry ?? false);
}

/* --- one poll's work ----------------------------------------------------------------------------- */

type Meter = { spent: number; posted: number; calls: number; longest: number; collected: number; gets: number };
type Count = (c: { cost: number; ms: number }) => void;

async function advance(env: LmEnv, row: Row, onDone?: (reportId: string) => Promise<void>): Promise<{ row: Row; hurry: boolean } | null> {
  const now = Date.now();
  const claim = await env.DB.prepare('UPDATE lm_reports SET lock_until = ?1 WHERE id = ?2 AND lock_until < ?3').bind(now + 25_000, row.id, now).run();
  if (!claim.meta?.changes) return null;

  const tasks = JSON.parse(row.tasks_json) as Tasks;
  const results = JSON.parse(row.results_json) as Results;
  const timings = JSON.parse(row.timings_json) as Timings;
  const listing = JSON.parse(row.listing_json) as Listing;
  const keywordCount = (JSON.parse(row.keywords_json) as string[]).length;
  const pointsTotal = 25;
  let status = row.status;
  let error = row.error;
  let competitorsJson = row.competitors_json;
  let reportJson = row.report_json;
  let finishedNow = false;
  let hurry = false;
  let step = row.status === 'scanning' ? 'poll_grid' : `poll_${row.status}`;
  const cellWrites: LmStmt[] = [];
  const meter: Meter = { spent: 0, posted: 0, calls: 0, longest: 0, collected: 0, gets: FETCH_PER_POLL };
  const count: Count = (c) => {
    meter.calls += 1;
    meter.spent += c.cost;
    meter.longest = Math.max(meter.longest, c.ms);
  };

  /* The visitor's time on the page: a long gap (a closed tab) counts as one short step, so nothing times out while they are away. */
  timings.act += Math.min(now - timings.lastPoll, MAX_ACT_STEP_MS);
  timings.lastPoll = now;

  try {
    if (status === 'scanning') {
      const gridDone = tasks.grid.filter((t) => t.s === 1).length;
      const settled = tasks.grid.every((t) => t.s !== 0);

      if (settled) {
        status = 'selecting';
        hurry = true;
      } else if (!timings.early && gridDone / tasks.grid.length >= EARLY_COMPETITORS_SHARE) {
        /* Early pick: from the half of the grid that is in, ask for the reviews and posts of the likeliest practices ahead of you. */
        const cells = await loadCells(env, row.id, pointsTotal, keywordCount);
        const out = await postProfiles(env, row.id, tasks.prof, wanted(cells, listing, EARLY_CANDIDATES), `competitors, early (up to ${EARLY_CANDIDATES}): ${gridDone} of ${tasks.grid.length} grid checks in`);
        meter.calls += out.calls;
        meter.spent += out.cost;
        meter.posted += out.cost;
        timings.early = true;
        timings.competitorsEarly = now;
        timings.profilesPosted = now;
        timings.profPostedAct = timings.act;
        step = 'early_pick';
        hurry = true;
      } else {
        /* Collect: reviews and posts first (they have the longest wait), then what is left of this poll's few fetches for the grid. */
        await collectProfiles(env, tasks, results, meter, count);
        await collectGrid(env, row.id, tasks, cellWrites, timings, meter, count, now);
        hurry = meter.gets === 0; // used the whole allowance: more finished checks are probably waiting
        if (tasks.grid.every((t) => t.s !== 0)) {
          status = 'selecting';
          hurry = true;
        }
      }
    } else if (status === 'selecting') {
      timings.gridDone = now;
      timings.gridDoneAct = timings.act;
      const done = tasks.grid.filter((t) => t.s === 1).length;
      if (done / tasks.grid.length < MIN_DONE_SHARE) {
        status = 'failed';
        error = 'scan_incomplete';
      } else {
        /* The final four may differ a little from the early pick: ask for any that are missing (these wait only a short grace). */
        const cells = await loadCells(env, row.id, pointsTotal, keywordCount);
        const out = await postProfiles(env, row.id, tasks.prof, wanted(cells, listing), 'final top four, missing ones only', true);
        meter.calls += out.calls;
        meter.spent += out.cost;
        meter.posted += out.cost;
        if (out.calls) {
          timings.profilesPosted = now;
          timings.profPostedAct = timings.act;
        }
        competitorsJson = JSON.stringify(pickCompetitors(cells, listing));
        status = 'profiles';
      }
    } else if (status === 'profiles') {
      await collectProfiles(env, tasks, results, meter, count);
      hurry = meter.gets === 0;
      const sinceGrid = timings.act - (timings.gridDoneAct ?? timings.act);
      if (sinceGrid > LATE_PROFILE_GRACE_MS) {
        for (const t of tasks.prof) if (t.s === 0 && t.l) (t.s = 2), (t.e = 'late: built without it');
      }
      const base = Math.max(timings.gridDoneAct ?? 0, timings.profPostedAct ?? 0);
      if (tasks.prof.some((t) => t.s === 0) && timings.act - base > PROFILE_TIMEOUT_MS) {
        for (const t of tasks.prof) if (t.s === 0) (t.s = 2), (t.e = 'timed out');
      }
      if (tasks.prof.every((t) => t.s !== 0)) {
        status = 'building';
        hurry = true;
      }
    } else if (status === 'building') {
      const cells = await loadCells(env, row.id, pointsTotal, keywordCount);
      reportJson = JSON.stringify(finalise(row, listing, cells, JSON.parse(competitorsJson ?? '[]'), results.extras, now));
      timings.finished = now;
      status = 'done';
      finishedNow = true;
      step = 'build';
    }
  } catch (e) {
    /* DataForSEO could not be reached at all (or refused our login). Keep what we have; the visitor can retry. */
    error = e instanceof Error ? e.message.slice(0, 200) : 'error';
    if (e instanceof Error && 'code' in e && [401, 40100, 40101].includes((e as { code?: number }).code ?? 0)) status = 'failed';
    console.error(JSON.stringify({ lm: true, event: 'advance-error', reportId: row.id, step, message: error }));
  }

  const writes: LmStmt[] = [
    ...cellWrites,
    env.DB.prepare(
      `UPDATE lm_reports SET status = ?1, error = ?2, tasks_json = ?3, results_json = ?4, competitors_json = ?5, report_json = ?6, timings_json = ?7,
         total_cost = total_cost + ?8, finished_at = ?9, lock_until = 0 WHERE id = ?10`,
    ).bind(status, error, JSON.stringify(tasks), JSON.stringify(results), competitorsJson, reportJson, JSON.stringify(timings), meter.spent, finishedNow ? now : null, row.id),
  ];
  /* A poll that made no outside request has nothing to log in the cost table. */
  if (meter.calls) {
    writes.push(
      env.DB.prepare('INSERT INTO lm_cost_log (report_id, step, calls, tasks, cost, ms, note, at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)').bind(
        row.id,
        step,
        meter.calls,
        meter.collected,
        meter.spent - meter.posted,
        meter.longest,
        error,
        now,
      ),
    );
  }
  await env.DB.batch(writes);

  if (finishedNow && onDone) await onDone(row.id).catch(() => undefined);
  return {
    row: { ...row, status, error, tasks_json: JSON.stringify(tasks), competitors_json: competitorsJson, report_json: reportJson, timings_json: JSON.stringify(timings) },
    hurry,
  };
}

/** Collects the finished reviews and posts tasks. A task is looked at only once it shows in the ready list. */
async function collectProfiles(env: LmEnv, tasks: Tasks, results: Results, meter: Meter, count: Count) {
  for (const family of ['reviews', 'updates'] as const) {
    const mine = tasks.prof.filter((t) => t.s === 0 && t.id && t.f === family);
    if (!mine.length || meter.gets <= 0) continue;
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

/** Collects finished grid checks with what is left of this poll's allowance: each becomes one small row in lm_cells. Times out any that never come back. */
async function collectGrid(env: LmEnv, reportId: string, tasks: Tasks, writes: LmStmt[], timings: Timings, meter: Meter, count: Count, now: number) {
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
            /* Keep only what the report needs from the response, and let the rest go. */
            writes.push(env.DB.prepare('INSERT OR REPLACE INTO lm_cells (report_id, p, k, rows_json) VALUES (?1, ?2, ?3, ?4)').bind(reportId, t.p, t.k, JSON.stringify(toRows(got.items))));
            t.s = 1;
            meter.collected += 1;
          }
        } catch (e) {
          t.e = e instanceof Error ? e.message : 'fetch failed';
        }
      }),
    );
  }
  if (tasks.grid.some((t) => t.s === 0 && t.id) && timings.act - (timings.postedAct ?? 0) > GRID_TIMEOUT_MS) {
    for (const t of tasks.grid) if (t.s === 0) (t.s = 2), (t.e = 'timed out');
  }
}

/* --- reading the cells back (once per step that needs them) ------------------------------------------- */

async function loadCells(env: LmEnv, reportId: string, pointsTotal: number, keywordCount: number): Promise<Cells> {
  const rows = await env.DB.prepare('SELECT p, k, rows_json FROM lm_cells WHERE report_id = ?1').bind(reportId).all<{ p: number; k: number; rows_json: string }>();
  const cells: Cells = Array.from({ length: pointsTotal }, () => Array.from({ length: keywordCount }, () => null));
  for (const r of rows.results) cells[r.p][r.k] = JSON.parse(r.rows_json) as SerpRow[];
  return cells;
}

/* --- reviews and posts: for you, then for the four ahead of you --------------------------------------- */

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

function finalise(row: Row, listing: Listing, cells: Cells, competitors: { key: string; name: string }[], extras: Extras, now: number) {
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
    cells,
    competitors,
    extras,
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
    timings.postedAct = timings.act;
    timings.lastPoll = Date.now();
    await env.DB.prepare("UPDATE lm_reports SET status = 'scanning', error = NULL, tasks_json = ?1, timings_json = ?2, retries = retries + 1, total_cost = total_cost + ?3, lock_until = 0 WHERE id = ?4")
      .bind(JSON.stringify(tasks), JSON.stringify(timings), cost, id)
      .run();
    return 'ok';
  } catch {
    return 'unavailable';
  }
}
