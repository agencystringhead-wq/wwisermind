/**
 * A local backend for building the Local Map Assessment pages without credentials:
 *   npx tsx scripts/local-map/dev-server.mts          (listens on :8788)
 *   NEXT_PUBLIC_LOCAL_MAP_API=http://localhost:8788 npm run dev
 * It serves the real Pages Functions over an in-memory SQLite database, with the pretend DataForSEO from mock-dfs.mts.
 * The pretend scan answers a poll at a time, so the progress screen has something to show. Not for production.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { onRequestGet as geocode } from '../../functions/api/local-map/geocode.ts';
import { onRequestPost as lookup } from '../../functions/api/local-map/lookup.ts';
import { onRequestPost as retry } from '../../functions/api/local-map/retry.ts';
import { onRequestPost as start } from '../../functions/api/local-map/start.ts';
import { onRequestGet as status } from '../../functions/api/local-map/status.ts';
import type { LmEnv } from '../../lib/local-map/server/env.ts';
import { installMock, emails } from './mock-dfs.mts';

installMock();
const sqlite = new DatabaseSync(':memory:');
for (const m of ['0002_local_map.sql', '0003_local_map_cells.sql']) sqlite.exec(fs.readFileSync(path.join(process.cwd(), 'migrations', m), 'utf8'));
const stmt = (sql: string, args: unknown[] = []): any => ({
  bind: (...v: unknown[]) => stmt(sql, v),
  first: async () => (sqlite.prepare(sql).get(...(args as any[])) as any) ?? null,
  all: async () => ({ results: sqlite.prepare(sql).all(...(args as any[])) as any[] }),
  run: async () => ({ meta: { changes: Number(sqlite.prepare(sql).run(...(args as any[])).changes) } }),
});
const env: LmEnv = {
  DB: { prepare: (sql: string) => stmt(sql), batch: async (list: any[]) => Promise.all(list.map((s) => s.run())) } as any,
  DATAFORSEO_LOGIN: 'x', DATAFORSEO_PASSWORD: 'y', DATAFORSEO_BASE: 'http://mock-dfs', RESEND_API_KEY: 'k', TURNSTILE_SECRET_KEY: 's',
};

const routes: Record<string, (ctx: any) => Promise<Response>> = {
  'POST /api/local-map/lookup': lookup, 'POST /api/local-map/start': start, 'GET /api/local-map/status': status, 'POST /api/local-map/retry': retry, 'GET /api/local-map/geocode': geocode,
};

http
  .createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost:8788');
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS' };
    if (req.method === 'OPTIONS') return void res.writeHead(204, cors).end();
    const handler = routes[`${req.method} ${url.pathname}`];
    if (!handler) return void res.writeHead(404, cors).end('not found');
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const request = new Request(url, { method: req.method, headers: { 'cf-connecting-ip': '127.0.0.1', 'content-type': 'application/json' }, body: chunks.length ? Buffer.concat(chunks) : undefined });
    const pending: Promise<unknown>[] = [];
    const out = await handler({ request, env, waitUntil: (p: Promise<unknown>) => pending.push(p) });
    res.writeHead(out.status, { ...Object.fromEntries(out.headers), ...cors }).end(await out.text());
    Promise.all(pending).then(() => emails.length && console.log('emails so far:', emails.map((e) => `${e.to}: ${e.subject}`).join(' | ')));
  })
  .listen(8788, () => console.log('local-map dev backend on http://localhost:8788'));
