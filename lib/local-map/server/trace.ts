import type { LmCtx, LmDb, LmEnv, LmStmt } from './env';

/* Free-plan watching. A Pages Function on the free plan gets 10 ms of CPU and 50 outside requests per invocation, and Cloudflare kills
   an invocation that goes over without telling us which one. So every invocation here:
     - logs a "begin" line before it works and an "end" line after (a begin with no end is an invocation that was killed, and the
       begin line says which function and which phase it was);
     - counts its outside requests and its D1 queries, and sends the counts back in an x-lm-trace header and in the end line;
     - logs a warning when either count gets close to its limit, and an error line (with the same counts) when it throws, including
       "Too many subrequests".
   CPU time itself cannot be measured from inside a Worker (the clock only moves when it waits), so it is read from Cloudflare's own
   metrics and from the local test, which counts CPU for every invocation. */

export type Trace = { fn: string; reportId: string | null; phase: string; fetches: number; queries: number; started: number };

export const FETCH_WARN = 35; // of 50
export const QUERY_WARN = 35; // of 50

export function newTrace(fn: string): Trace {
  return { fn, reportId: null, phase: '', fetches: 0, queries: 0, started: Date.now() };
}

/** The same environment, with every D1 statement counted into `trace`. A batch counts each of its statements. */
export function traced(env: LmEnv, trace: Trace): LmEnv & { trace: Trace } {
  const wrap = (stmt: LmStmt): LmStmt => ({
    bind: (...v) => wrap(stmt.bind(...v)),
    first: (...a) => ((trace.queries += 1), stmt.first(...(a as []))),
    all: (...a) => ((trace.queries += 1), stmt.all(...(a as []))),
    run: () => ((trace.queries += 1), stmt.run()),
  });
  const DB: LmDb = {
    prepare: (q) => wrap(env.DB.prepare(q)),
    batch: (list) => ((trace.queries += list.length), env.DB.batch(list)),
  };
  return { ...env, DB, trace };
}

const line = (t: Trace, extra: Record<string, unknown> = {}) => ({
  lm: true,
  fn: t.fn,
  reportId: t.reportId,
  phase: t.phase,
  fetches: t.fetches,
  queries: t.queries,
  wallMs: Date.now() - t.started,
  ...extra,
});

export const traceHeader = (t: Trace) => `fn=${t.fn};fetches=${t.fetches};queries=${t.queries};wallMs=${Date.now() - t.started};phase=${t.phase}`;

/**
 * Runs one function with the begin and end lines, the counts, the header and the error log. `work` gets the traced environment and
 * returns the Response. An exception becomes a logged error and a friendly JSON 500 rather than an unexplained failure.
 */
export async function instrument(fn: string, env: LmEnv, request: Request, work: (env: LmEnv & { trace: Trace }, trace: Trace) => Promise<Response>): Promise<Response> {
  const trace = newTrace(fn);
  const e = traced(env, trace);
  const id = new URL(request.url).searchParams.get('id');
  if (id) trace.reportId = id;
  console.log(JSON.stringify(line(trace, { event: 'begin' })));
  try {
    const res = await work(e, trace);
    const out = new Response(res.body, res);
    out.headers.set('x-lm-trace', traceHeader(trace));
    const warn = trace.fetches >= FETCH_WARN || trace.queries >= QUERY_WARN;
    (warn ? console.warn : console.log)(JSON.stringify(line(trace, { event: warn ? 'end-near-limit' : 'end', status: res.status })));
    return out;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      JSON.stringify(
        line(trace, {
          event: 'error',
          message,
          tooManySubrequests: /too many subrequests/i.test(message),
          stack: err instanceof Error ? err.stack?.split('\n').slice(0, 4).join(' | ') : undefined,
        }),
      ),
    );
    return new Response(JSON.stringify({ error: 'server_error', message: 'Something went wrong on our side. Please try again in a moment.' }), {
      status: 500,
      headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', 'x-lm-trace': traceHeader(trace) },
    });
  }
}

export type { LmCtx };
