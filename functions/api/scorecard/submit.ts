import { normalizeUrl } from '../../../lib/scorecard/scan';
import { buildReport, cleanAnswers } from '../../../lib/scorecard/score';
import type { ScanResult } from '../../../lib/scorecard/types';
import type { Ctx } from '../../../lib/scorecard/server/env';
import { leadEmail, sendEmail, summaryEmail } from '../../../lib/scorecard/server/email';
import { SUBMIT_PER_HOUR, json, newReportId, underLimit } from '../../../lib/scorecard/server/http';
import { verifyTurnstile } from '../../../lib/scorecard/server/turnstile';

/* POST /api/scorecard/submit
   { scanId, url, answers, lead: { name, email, practice, cityState }, turnstileToken, company }
   Checks Turnstile, scores the answers against the stored scan, saves the report and the lead,
   sends both emails, and returns { id }. A failed email never fails the submission. */

const clean = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '';

const EMAIL = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

export const onRequestPost = async ({ request, env, waitUntil }: Ctx) => {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: 'bad_request', message: 'That did not look right. Please try again.' }, 400);
  }

  /* A hidden field that people leave empty and simple bots fill in. */
  if (clean(body.company, 50)) return json({ error: 'bad_request', message: 'That did not look right. Please try again.' }, 400);

  const lead = body.lead as Record<string, unknown> | undefined;
  const name = clean(lead?.name, 100);
  const email = clean(lead?.email, 200).toLowerCase();
  const practice = clean(lead?.practice, 150);
  const cityState = clean(lead?.cityState, 100);
  if (!name || !practice || !cityState || !EMAIL.test(email)) {
    return json({ error: 'invalid_lead', message: 'Please check your name, email, practice name and city and state.' }, 400);
  }

  const ip = request.headers.get('cf-connecting-ip');
  if (!(await verifyTurnstile(env.TURNSTILE_SECRET_KEY, body.turnstileToken, ip))) {
    return json({ error: 'turnstile', message: 'We couldn’t confirm you’re a person. Please try the check again.' }, 400);
  }
  if (!(await underLimit(env, request, 'submit', SUBMIT_PER_HOUR))) {
    return json({ error: 'rate_limited', message: 'That is a lot of reports from one connection. Please try again in an hour.' }, 429);
  }

  /* The scan comes from our own cache, not from the browser, so scores cannot be edited from outside. */
  let scan: ScanResult | null = null;
  if (typeof body.scanId === 'string' && /^[a-z0-9.-]{3,253}$/.test(body.scanId)) {
    const row = await env.DB.prepare('SELECT scan_json FROM scan_cache WHERE url_key = ?1').bind(body.scanId).first<{ scan_json: string }>();
    if (row) scan = JSON.parse(row.scan_json) as ScanResult;
  }

  const answers = cleanAnswers(body.answers, scan);
  if (!answers) return json({ error: 'invalid_answers', message: 'Some answers are missing. Please go back and finish the questions.' }, 400);

  const norm = typeof body.url === 'string' ? normalizeUrl(body.url) : null;
  const websiteUrl = norm?.url ?? clean(body.url, 300);

  const id = newReportId();
  const report = buildReport({ id, websiteUrl, practiceName: practice, scan, answers });
  const now = report.createdAt;

  await env.DB.batch([
    env.DB.prepare(
      'INSERT INTO reports (id, website_url, scan_json, answers_json, report_json, rules_version, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
    ).bind(id, websiteUrl, scan ? JSON.stringify(scan) : null, JSON.stringify(answers), JSON.stringify(report), report.rulesVersion, now),
    env.DB.prepare(
      'INSERT INTO leads (report_id, name, email, practice_name, city_state, website_url, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)',
    ).bind(id, name, email, practice, cityState, websiteUrl, now),
  ]);

  /* Links in the emails point back at the site the report was made on. On a pages.dev preview that is the preview
     itself, so a test email opens the test report; everywhere else it is the canonical SITE_ORIGIN. */
  const requestUrl = new URL(request.url);
  const origin = requestUrl.hostname.endsWith('.pages.dev') ? requestUrl.origin : env.SITE_ORIGIN || 'https://wwisermind.com';
  const from = env.RESEND_FROM || 'wwisermind <scorecard@wwisermind.com>';
  const notifyTo = env.LEAD_NOTIFY_EMAIL || 'admin@wwisermind.com';
  const firstName = name.split(' ')[0];

  waitUntil(
    (async () => {
      const summary = summaryEmail(report, firstName, origin);
      const lead_ = leadEmail(report, { name, email, practice, cityState }, answers, origin);
      const [sentSummary, sentLead] = await Promise.all([
        sendEmail(env.RESEND_API_KEY, { from, to: email, ...summary }),
        sendEmail(env.RESEND_API_KEY, { from, to: notifyTo, replyTo: email, ...lead_ }),
      ]);
      await env.DB.prepare('UPDATE leads SET summary_sent = ?1, notified = ?2 WHERE report_id = ?3')
        .bind(sentSummary ? 1 : 0, sentLead ? 1 : 0, id)
        .run();
    })(),
  );

  return json({ id });
};
