import type { StatusResponse } from '@/lib/local-map/types';

/** Where the pages talk to the Pages Functions. Set NEXT_PUBLIC_LOCAL_MAP_API to point a local `next dev` at a running backend;
    leave it empty in production (same origin). */
export const API = `${process.env.NEXT_PUBLIC_LOCAL_MAP_API ?? ''}/api/local-map`;

export const REPORT_PATH = '/local-map-assessment/report/';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const FRIENDLY = 'Something went wrong on our side. Please try again in a moment.';

export async function call<T>(route: string, init?: { body?: unknown }): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}/${route}`, init?.body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(init.body) } : undefined);
  } catch {
    throw new ApiError('We couldn’t reach the server. Please check your connection and try again.', 0);
  }
  const data = (await res.json().catch(() => ({}))) as T & { message?: string };
  if (!res.ok) throw new ApiError(data.message || FRIENDLY, res.status);
  return data;
}

export const fetchStatus = (id: string) => call<StatusResponse>(`status?id=${encodeURIComponent(id)}`);
