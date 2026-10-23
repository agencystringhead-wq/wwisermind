/* A failed check logs why (Turnstile's error codes and the hostname it saw) and never the token or the secret. */
const logFail = (reason: string, extra: Record<string, unknown> = {}) =>
  console.warn(JSON.stringify({ turnstile: 'failed', reason, ...extra }));

export async function verifyTurnstile(secret: string | undefined, token: unknown, ip: string | null): Promise<boolean> {
  if (!secret) return (logFail('no-secret-configured'), false);
  if (typeof token !== 'string' || !token || token.length > 2048) return (logFail('missing-or-oversize-token'), false);
  const form = new FormData();
  form.set('secret', secret);
  form.set('response', token);
  if (ip) form.set('remoteip', ip);
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
    const data = (await res.json()) as { success?: boolean; 'error-codes'?: string[]; hostname?: string };
    if (data.success === true) return true;
    logFail('siteverify-rejected', { codes: data['error-codes'] ?? [], hostname: data.hostname ?? null, httpStatus: res.status });
    return false;
  } catch (error) {
    logFail('siteverify-unreachable', { error: error instanceof Error ? error.message : 'unknown' });
    return false;
  }
}
