import type { Report } from '../types';
import type { LmEnv } from './env';
import { reportReady, sendEmail } from './email';

/** Links in emails point back at the site the report was made on: a pages.dev preview opens its own report, everywhere else is SITE_ORIGIN. */
export function originOf(request: Request, env: LmEnv): string {
  const url = new URL(request.url);
  return url.hostname.endsWith('.pages.dev') ? url.origin : env.SITE_ORIGIN || 'https://wwisermind.com';
}

export const sender = (env: LmEnv) => env.RESEND_FROM || 'wwisermind <scorecard@wwisermind.com>';

/** Sends "your report is ready" to everyone who asked for this report and has not had it yet. A failed email never fails anything. */
export async function sendReadyEmails(env: LmEnv, reportId: string, origin: string, reportOverride?: Report): Promise<void> {
  const row = await env.DB.prepare('SELECT report_json FROM lm_reports WHERE id = ?1').bind(reportId).first<{ report_json: string | null }>();
  const report = reportOverride ?? (row?.report_json ? (JSON.parse(row.report_json) as Report) : null);
  if (!report) return;
  const leads = await env.DB.prepare('SELECT id, first_name, email FROM lm_leads WHERE report_id = ?1 AND report_sent = 0')
    .bind(reportId)
    .all<{ id: number; first_name: string; email: string }>();
  for (const lead of leads.results) {
    const mail = reportReady(report, lead.first_name, origin);
    const sent = await sendEmail(env.RESEND_API_KEY, { from: sender(env), to: lead.email, ...mail });
    if (sent) await env.DB.prepare('UPDATE lm_leads SET report_sent = 1 WHERE id = ?1').bind(lead.id).run();
  }
}
