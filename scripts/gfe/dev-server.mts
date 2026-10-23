/**
 * A local backend for trying the Good Faith Estimate form without credentials:
 *   npx tsx scripts/gfe/dev-server.mts          (listens on :8789)
 *   NEXT_PUBLIC_GFE_API=http://localhost:8789 npm run dev
 * Serves the real lead function over an in-memory SQLite database; Turnstile and Resend are pretend and print what they would send.
 * Not for production.
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { onRequestPost } from '../../functions/api/gfe/lead.ts';
import { strictD1 } from '../local-map/fake-d1.mts';
import type { LmEnv } from '../../lib/local-map/server/env.ts';

const realFetch = globalThis.fetch;
globalThis.fetch = (async (input: any, init?: any) => {
  const url = String(input);
  if (url.includes('turnstile')) return new Response(JSON.stringify({ success: true }));
  if (url.includes('resend.com')) {
    const m = JSON.parse(init.body);
    console.log(`email to ${m.to}: ${m.subject}`);
    return new Response('{}');
  }
  return realFetch(input, init);
}) as typeof fetch;

const sqlite = new DatabaseSync(':memory:');
for (const m of ['0002_local_map.sql', '0004_gfe.sql']) sqlite.exec(fs.readFileSync(path.join(process.cwd(), 'migrations', m), 'utf8'));
const env: LmEnv = { DB: strictD1(sqlite) as any, RESEND_API_KEY: 'k', TURNSTILE_SECRET_KEY: 's' };

http
  .createServer(async (req, res) => {
    const cors = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type', 'access-control-allow-methods': 'POST,OPTIONS' };
    if (req.method === 'OPTIONS') return void res.writeHead(204, cors).end();
    if (req.method !== 'POST' || req.url !== '/api/gfe/lead') return void res.writeHead(404, cors).end('not found');
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    const request = new Request('http://localhost:8789/api/gfe/lead', { method: 'POST', headers: { 'cf-connecting-ip': '127.0.0.1', 'content-type': 'application/json' }, body: Buffer.concat(chunks) });
    const pending: Promise<unknown>[] = [];
    const out = await onRequestPost({ request, env, waitUntil: (p: Promise<unknown>) => pending.push(p) });
    res.writeHead(out.status, { ...Object.fromEntries(out.headers), ...cors }).end(await out.text());
    await Promise.all(pending);
    console.log('stored leads:', JSON.stringify(sqlite.prepare('SELECT first_name, email, practice, city, notified, welcomed FROM gfe_leads').all()));
  })
  .listen(8789, () => console.log('gfe dev backend on http://localhost:8789'));
