import { SCAN_LIMITS } from '../rules';
import type { Env } from './env';

export const json = (body: unknown, status = 200, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex', ...extra },
  });

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** 16 random bytes as 22 characters of base64url: unguessable. */
export function newReportId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export const REPORT_ID = /^[A-Za-z0-9_-]{22}$/;

/** Counts one use against `kind:ip` for this hour. Returns false once the limit is passed. */
export async function underLimit(env: Env, request: Request, kind: 'scan' | 'submit', limit: number): Promise<boolean> {
  const ip = request.headers.get('cf-connecting-ip') ?? 'unknown';
  const key = `${kind}:${(await sha256Hex(`wwisermind-scorecard:${ip}`)).slice(0, 32)}`;
  const hour = Math.floor(Date.now() / 3_600_000);
  await env.DB.prepare(
    'INSERT INTO rate_limits (bucket_key, hour, count) VALUES (?1, ?2, 1) ON CONFLICT (bucket_key, hour) DO UPDATE SET count = count + 1',
  )
    .bind(key, hour)
    .run();
  const row = await env.DB.prepare('SELECT count FROM rate_limits WHERE bucket_key = ?1 AND hour = ?2')
    .bind(key, hour)
    .first<{ count: number }>();
  /* Old rows are cleared now and then so the table stays small. */
  if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM rate_limits WHERE hour < ?1').bind(hour - 3).run();
  return (row?.count ?? 1) <= limit;
}

export const SCAN_PER_HOUR = SCAN_LIMITS.perIpPerHour;
export const SUBMIT_PER_HOUR = 10;
