/* Just enough Cloudflare types for the Local Map Assessment functions (the scorecard keeps its own in lib/scorecard/server/env.ts). */

export interface LmStmt {
  bind(...values: unknown[]): LmStmt;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta?: { changes?: number } }>;
}
export interface LmDb {
  prepare(query: string): LmStmt;
  batch(statements: LmStmt[]): Promise<unknown[]>;
}

export interface LmEnv {
  DB: LmDb;
  DATAFORSEO_LOGIN?: string;
  DATAFORSEO_PASSWORD?: string;
  /** Only for tests against a local stand-in server. Leave unset in production. */
  DATAFORSEO_BASE?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
  LEAD_NOTIFY_EMAIL?: string;
  SITE_ORIGIN?: string;
}

export type LmCtx = {
  request: Request;
  env: LmEnv;
  waitUntil(promise: Promise<unknown>): void;
};
