import { json, newReportId } from '../../../lib/scorecard/server/http';
import { verifyTurnstile } from '../../../lib/scorecard/server/turnstile';
import { CACHE_DAYS, KEYWORD_COUNT, RADIUS_OPTIONS, REPORTS_PER_DAY } from '../../../lib/local-map/rules';
import { leadAlert, reportStarted, sendEmail } from '../../../lib/local-map/server/email';
import type { LmCtx } from '../../../lib/local-map/server/env';
import { originOf, sendReadyEmails, sender } from '../../../lib/local-map/server/leads';
import { clientIp, underDailyLimit } from '../../../lib/local-map/server/limits';
import { startScan } from '../../../lib/local-map/server/pipeline';
import { instrument } from '../../../lib/local-map/server/trace';
import type { Listing } from '../../../lib/local-map/types';

/* POST /api/local-map/start
   { listing, centre?, keywords[4], radius, lead: { firstName, email, website? }, turnstileToken, company }
   Checks Turnstile and the daily limits, saves the lead, and either reuses a report made for the same place, keywords and radius
   within the last 7 days, or posts the 100 checks to DataForSEO (one request, plus two for your own reviews and posts) and returns the
   new report's id at once. No results are processed here: the report page polls the status endpoint for that.
   Outside requests: Turnstile 1, DataForSEO 3, two emails 2. */

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';
const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const bad = (message = 'That did not look right. Please try again.') => json({ error: 'bad_request', message }, 400);

export const onRequestPost = ({ request, env, waitUntil }: LmCtx) =>
  instrument('start', env, request, async (e, trace) => {
    let body: Record<string, any>;
    try {
      body = (await request.json()) as Record<string, any>;
    } catch {
      return bad();
    }
    if (clean(body.company, 50)) return bad(); // a hidden field people leave empty and simple bots fill in

    const raw = body.listing ?? {};
    const name = clean(raw.name, 150);
    const lat = num(raw.lat) ?? num(body.centre?.lat);
    const lng = num(raw.lng) ?? num(body.centre?.lng);
    if (!name || lat === null || lng === null || Math.abs(lat) > 90 || Math.abs(lng) > 180) return bad('We need your practice and a point on the map to start from.');

    const listing: Listing = {
      name,
      address: clean(raw.address, 200) || null,
      cid: /^\d{6,25}$/.test(String(raw.cid ?? '')) ? String(raw.cid) : null,
      placeId: /^[A-Za-z0-9_-]{10,200}$/.test(String(raw.placeId ?? '')) ? String(raw.placeId) : null,
      lat,
      lng,
      rating: num(raw.rating),
      reviews: num(raw.reviews),
      photos: num(raw.photos),
      category: clean(raw.category, 80) || null,
      additionalCategories: Array.isArray(raw.additionalCategories) ? raw.additionalCategories.slice(0, 4).map((c: unknown) => clean(c, 80)).filter(Boolean) : [],
      website: clean(raw.website, 300) || null,
    };

    const keywords = (Array.isArray(body.keywords) ? body.keywords : []).map((k: unknown) => clean(k, 60).toLowerCase()).filter((k: string) => k.length >= 3);
    if (new Set(keywords).size !== KEYWORD_COUNT || keywords.length !== KEYWORD_COUNT) return bad('Please choose four different search terms.');
    const radius = Number(body.radius);
    if (!(RADIUS_OPTIONS as readonly number[]).includes(radius)) return bad('Please choose a radius of 1, 3 or 5 miles.');

    const lead = body.lead ?? {};
    const firstName = clean(lead.firstName, 60);
    const email = clean(lead.email, 200).toLowerCase();
    const website = clean(lead.website, 300) || null;
    if (!firstName || !EMAIL.test(email)) return json({ error: 'invalid_lead', message: 'Please check your first name and email.' }, 400);

    const ip = clientIp(request);
    trace.fetches += 1; // Turnstile
    if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken, ip))) {
      return json({ error: 'turnstile', message: 'We couldn’t confirm you’re a person. Please try the check again.' }, 400);
    }
    const limited = json({ error: 'rate_limited', message: 'You have reached today’s limit of three reports. Please try again tomorrow.' }, 429);
    if (!(await underDailyLimit(e, 'report-ip', ip, REPORTS_PER_DAY))) return limited;
    if (!(await underDailyLimit(e, 'report-email', email, REPORTS_PER_DAY))) return limited;

    const origin = originOf(request, e);
    const notifyTo = env.LEAD_NOTIFY_EMAIL || 'admin@wwisermind.com';
    const placeKey = listing.cid ?? listing.placeId ?? `${lat.toFixed(3)},${lng.toFixed(3)}:${name.toLowerCase()}`;
    /* The grid is centred on the practice, or on the pin the visitor dropped: the pin is part of the key. */
    const centreKey = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    const cacheKey = `${placeKey}|${centreKey}|${[...keywords].sort().join(',')}|${radius}`;
    const now = Date.now();

    const insertLead = (reportId: string) =>
      e.DB.prepare('INSERT INTO lm_leads (report_id, first_name, email, website, practice, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)').bind(reportId, firstName, email, website, name, now).run();
    /* The lead alert to wwisermind. The visitor's own email is sent by the caller, since it depends on whether the report is ready. */
    const alertLead = (id: string, cached: boolean) => {
      trace.fetches += 1;
      waitUntil(
        (async () => {
          const mail = leadAlert({ firstName, email, website, practice: name, address: listing.address, keywords, radiusMiles: radius }, id, origin, cached);
          const ok = await sendEmail(env.RESEND_API_KEY, { from: sender(e), to: notifyTo, replyTo: email, ...mail });
          if (ok) await e.DB.prepare('UPDATE lm_leads SET notified = 1 WHERE report_id = ?1 AND email = ?2').bind(id, email).run();
        })(),
      );
    };
    /* "Your report is being prepared", with the link: reopening it carries on if they close the page. */
    const mailVisitorLink = (id: string) => {
      trace.fetches += 1;
      waitUntil(sendEmail(env.RESEND_API_KEY, { from: sender(e), to: email, ...reportStarted(firstName, listing.name, origin, id) }));
    };

    /* The same place, keywords and radius within a week reuses the finished report, or the one still being made. */
    const hit = await e.DB.prepare(
      `SELECT id, status FROM lm_reports WHERE cache_key = ?1 AND created_at > ?2 AND (status = 'done' OR (status NOT IN ('failed', 'done') AND created_at > ?3))
       ORDER BY created_at DESC LIMIT 1`,
    )
      .bind(cacheKey, now - CACHE_DAYS * 86_400_000, now - 20 * 60_000)
      .first<{ id: string; status: string }>();
    if (hit) {
      trace.reportId = hit.id;
      trace.phase = 'cached';
      await insertLead(hit.id);
      alertLead(hit.id, true);
      if (hit.status === 'done') waitUntil(sendReadyEmails(e, hit.id, origin));
      else mailVisitorLink(hit.id);
      return json({ id: hit.id, cached: true });
    }

    const id = newReportId();
    trace.reportId = id;
    trace.phase = 'new';
    try {
      await startScan(e, { id, listing, keywords, radiusMiles: radius, centre: { lat, lng }, cacheKey });
    } catch (err) {
      console.error(JSON.stringify({ lm: true, event: 'start-failed', message: err instanceof Error ? err.message : String(err) }));
      return json({ error: 'scan_unavailable', message: 'We could not start your scan just now. Nothing was charged and your details are safe. Please try again in a few minutes.' }, 503);
    }
    await insertLead(id);
    alertLead(id, false);
    mailVisitorLink(id);
    return json({ id });
  });
