import { json } from '../../../lib/scorecard/server/http';
import { verifyTurnstile } from '../../../lib/scorecard/server/turnstile';
import type { LmCtx } from '../../../lib/local-map/server/env';
import { originOf, sender } from '../../../lib/local-map/server/leads';
import { clientIp, underDailyLimit } from '../../../lib/local-map/server/limits';
import { instrument } from '../../../lib/local-map/server/trace';
import { leadAlert, sendEmail, welcome } from '../../../lib/gfe/server/email';

/* POST /api/gfe/lead
   { firstName, email, practice, city, turnstileToken, company }
   Checks Turnstile and a daily limit, saves the lead, and sends two emails (the alert to wwisermind, and the link back to the tool).
   It receives ONLY those four fields. The Good Faith Estimate itself is built in the browser and never reaches this function, so there is
   nothing about the therapist's client to log or store. Any other field in the request body is ignored and never read.
   Light on purpose, for the Workers free plan: one small invocation. Outside requests: Turnstile 1, emails 2. D1 queries: limit 2, insert 1,
   then 1 update after the emails (sent after the response, with waitUntil). */

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const bad = (message = 'That did not look right. Please try again.') => json({ error: 'bad_request', message }, 400);

export const GFE_PER_DAY = 10;

export const onRequestPost = ({ request, env, waitUntil }: LmCtx) =>
  instrument('gfe-lead', env, request, async (e, trace) => {
    let body: Record<string, unknown>;
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      return bad();
    }
    if (clean(body.company, 50)) return bad(); // a hidden field people leave empty and simple bots fill in

    const firstName = clean(body.firstName, 60);
    const email = clean(body.email, 200).toLowerCase();
    const practice = clean(body.practice, 150);
    const city = clean(body.city, 100);
    if (!firstName || !practice || !city || !EMAIL.test(email)) {
      return json({ error: 'invalid_lead', message: 'Please check your first name, email, practice name and city.' }, 400);
    }

    const ip = clientIp(request);
    trace.fetches += 1; // Turnstile
    if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken, ip))) {
      return json({ error: 'turnstile', message: 'We couldn’t confirm you’re a person. Please try the check again.' }, 400);
    }
    if (!(await underDailyLimit(e, 'gfe-ip', ip, GFE_PER_DAY))) {
      return json({ error: 'rate_limited', message: 'That is a lot of downloads from one connection today. Please try again tomorrow.' }, 429);
    }

    const insert = await e.DB.prepare('INSERT INTO gfe_leads (first_name, email, practice, city, created_at) VALUES (?1, ?2, ?3, ?4, ?5) RETURNING id')
      .bind(firstName, email, practice, city, Date.now())
      .first<{ id: number }>();
    const id = insert?.id ?? null;

    const origin = originOf(request, e);
    const notifyTo = env.LEAD_NOTIFY_EMAIL || 'admin@wwisermind.com';
    trace.fetches += 2;
    waitUntil(
      (async () => {
        const [alertOk, welcomeOk] = await Promise.all([
          sendEmail(env.RESEND_API_KEY, { from: sender(e), to: notifyTo, replyTo: email, ...leadAlert({ firstName, email, practice, city }) }),
          sendEmail(env.RESEND_API_KEY, { from: sender(e), to: email, ...welcome(firstName, origin) }),
        ]);
        if (id !== null) await e.DB.prepare('UPDATE gfe_leads SET notified = ?1, welcomed = ?2 WHERE id = ?3').bind(alertOk ? 1 : 0, welcomeOk ? 1 : 0, id).run();
      })(),
    );

    return json({ ok: true });
  });
