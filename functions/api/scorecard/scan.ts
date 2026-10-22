import { normalizeUrl, runScan, type StepEvent } from '../../../lib/scorecard/scan';
import { SCAN_LIMITS } from '../../../lib/scorecard/rules';
import type { Ctx } from '../../../lib/scorecard/server/env';
import { SCAN_PER_HOUR, json, underLimit } from '../../../lib/scorecard/server/http';

/* POST /api/scorecard/scan  { url }
   Streams newline-delimited JSON: {"step":"homepage","state":"start"|"done"} lines as the scan
   works (homepage, pages, files), then one final {"result": ScanResult, "scanId": "..."} line. A cached scan (same site
   within 24 hours) answers straight away. Errors are plain JSON with a status code. */
export const onRequestPost = async ({ request, env, waitUntil }: Ctx) => {
  let body: { url?: unknown };
  try {
    body = (await request.json()) as { url?: unknown };
  } catch {
    return json({ error: 'bad_request', message: 'That did not look right. Please try again.' }, 400);
  }
  const norm = typeof body.url === 'string' ? normalizeUrl(body.url) : null;
  if (!norm) {
    return json({ error: 'bad_url', message: 'That web address does not look right. Try something like yourpractice.com.' }, 400);
  }

  const enc = new TextEncoder();
  const headers = { 'content-type': 'application/x-ndjson; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' };
  const line = (o: unknown) => enc.encode(`${JSON.stringify(o)}\n`);

  const cached = await env.DB.prepare('SELECT scan_json FROM scan_cache WHERE url_key = ?1 AND created_at > ?2')
    .bind(norm.key, Date.now() - SCAN_LIMITS.cacheHours * 3_600_000)
    .first<{ scan_json: string }>();
  if (cached) {
    const steps = (['homepage', 'pages', 'files'] as const)
      .map((step) => `${JSON.stringify({ step, state: 'done' })}\n`)
      .join('');
    const result = `${JSON.stringify({ result: JSON.parse(cached.scan_json), scanId: norm.key, cached: true })}\n`;
    return new Response(steps + result, { headers });
  }

  if (!(await underLimit(env, request, 'scan', SCAN_PER_HOUR))) {
    return json(
      { error: 'rate_limited', message: 'We have run a few scans from your connection this hour already. You can still answer the questions and get your score.' },
      429,
    );
  }

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();
  waitUntil(
    (async () => {
      try {
        const scan = await runScan(norm.url, {
          psiKey: env.PSI_API_KEY,
          /* PageSpeed can take 20 to 40 seconds, so it runs in its own request (see speed.ts) while the visitor answers the quiz. */
          deferSpeed: !!env.PSI_API_KEY,
          onStep: (e: StepEvent) => void writer.write(line(e)).catch(() => undefined),
        });
        if (!scan.blocked) {
          await env.DB.prepare(
            'INSERT INTO scan_cache (url_key, scan_json, created_at) VALUES (?1, ?2, ?3) ON CONFLICT (url_key) DO UPDATE SET scan_json = ?2, created_at = ?3',
          )
            .bind(norm.key, JSON.stringify(scan), Date.now())
            .run();
        }
        await writer.write(line({ result: scan, scanId: scan.blocked ? null : norm.key }));
      } catch {
        await writer
          .write(line({ error: 'scan_failed', message: 'We could not finish the scan. You can still answer the questions.' }))
          .catch(() => undefined);
      } finally {
        await writer.close().catch(() => undefined);
      }
    })(),
  );
  return new Response(readable, { headers });
};
