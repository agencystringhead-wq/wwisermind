/* Just enough Cloudflare types for the scorecard functions, so the repo needs no extra type package. */

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
}
export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch(statements: D1PreparedStatement[]): Promise<unknown[]>;
}

export interface Env {
  DB: D1Database;
  PSI_API_KEY?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
  TURNSTILE_SECRET_KEY?: string;
  LEAD_NOTIFY_EMAIL?: string;
  SITE_ORIGIN?: string;
}

export type Ctx<P extends string = never> = {
  request: Request;
  env: Env;
  params: Record<P, string>;
  waitUntil(promise: Promise<unknown>): void;
};
