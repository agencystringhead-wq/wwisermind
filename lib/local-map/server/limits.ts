import { sha256Hex } from '../../scorecard/server/http';
import type { LmEnv } from './env';

/** Counts one use against `kind:value` for today (UTC). Returns false once `limit` is passed. The value is hashed, never stored. */
export async function underDailyLimit(env: LmEnv, kind: string, value: string, limit: number): Promise<boolean> {
  const key = `${kind}:${(await sha256Hex(`wwisermind-lm:${kind}:${value.toLowerCase()}`)).slice(0, 32)}`;
  const day = Math.floor(Date.now() / 86_400_000);
  await env.DB.prepare(
    'INSERT INTO lm_limits (bucket_key, day, count) VALUES (?1, ?2, 1) ON CONFLICT (bucket_key, day) DO UPDATE SET count = count + 1',
  )
    .bind(key, day)
    .run();
  const row = await env.DB.prepare('SELECT count FROM lm_limits WHERE bucket_key = ?1 AND day = ?2').bind(key, day).first<{ count: number }>();
  if (Math.random() < 0.02) await env.DB.prepare('DELETE FROM lm_limits WHERE day < ?1').bind(day - 3).run();
  return (row?.count ?? 1) <= limit;
}

export const clientIp = (request: Request) => request.headers.get('cf-connecting-ip') ?? 'unknown';
