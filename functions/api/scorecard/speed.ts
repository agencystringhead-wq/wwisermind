import { runSpeed } from '../../../lib/scorecard/scan';
import type { ScanResult } from '../../../lib/scorecard/types';
import type { Ctx } from '../../../lib/scorecard/server/env';
import { json } from '../../../lib/scorecard/server/http';

/* POST /api/scorecard/speed  { scanId }
   Runs the PageSpeed (mobile) test for a site the visitor has just scanned and stores the result in
   the cached scan, so the report can score "speed and mobile". The browser starts this as soon as the
   scan finishes and lets it run while the visitor answers the quiz. Only a site that is already in
   the scan cache can be tested, a finished result is never run again, and a failed try is not
   repeated for 10 minutes. */
const RETRY_AFTER_MS = 10 * 60_000;
const PSI_TIMEOUT_MS = 55_000;

export const onRequestPost = async ({ request, env }: Ctx) => {
  let body: { scanId?: unknown };
  try {
    body = (await request.json()) as { scanId?: unknown };
  } catch {
    return json({ error: 'bad_request' }, 400);
  }
  const key = typeof body.scanId === 'string' && /^[a-z0-9.-]{3,253}$/.test(body.scanId) ? body.scanId : null;
  if (!key || !env.PSI_API_KEY) return json({ status: 'unavailable' });

  const row = await env.DB.prepare('SELECT scan_json FROM scan_cache WHERE url_key = ?1').bind(key).first<{ scan_json: string }>();
  if (!row) return json({ status: 'unavailable' });
  const scan = JSON.parse(row.scan_json) as ScanResult & { speedTriedAt?: number };
  if (scan.speed === 'done') return json({ status: 'done' });
  if (scan.speedTriedAt && Date.now() - scan.speedTriedAt < RETRY_AFTER_MS) return json({ status: scan.speed ?? 'failed' });

  /* Mark the try first, so two tabs do not both run it. */
  scan.speedTriedAt = Date.now();
  await env.DB.prepare('UPDATE scan_cache SET scan_json = ?2 WHERE url_key = ?1').bind(key, JSON.stringify(scan)).run();

  const result = await runSpeed(scan.url, env.PSI_API_KEY, PSI_TIMEOUT_MS);
  const fresh = await env.DB.prepare('SELECT scan_json FROM scan_cache WHERE url_key = ?1').bind(key).first<{ scan_json: string }>();
  const latest = (fresh ? JSON.parse(fresh.scan_json) : scan) as ScanResult & { speedTriedAt?: number };
  if (result) {
    latest.checks = { ...latest.checks, ...result.checks };
    latest.metrics = result.metrics;
    latest.speed = 'done';
  } else {
    latest.speed = 'failed';
  }
  await env.DB.prepare('UPDATE scan_cache SET scan_json = ?2 WHERE url_key = ?1').bind(key, JSON.stringify(latest)).run();
  return json({ status: latest.speed });
};
