import { sendEmail } from '../../scorecard/server/email';
import type { Report } from '../types';

/* Two emails, in the scorecard's plain style: the lead alert to wwisermind when someone starts a report, and "your report is
   ready" to the visitor when it finishes. Inline styles, every piece of visitor text escaped. */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const INK = '#111111';
const MUTED = '#5a5a5a';
const LINE = '#e9e6e0';
const BLUE = '#146ef5';
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export const reportUrl = (origin: string, id: string) => `${origin}/free-tools/local-map-assessment/report/?id=${id}`;

function shell(inner: string, preheader: string) {
  return `<!doctype html><html lang="en"><body style="margin:0;padding:0;background:#f5f5f5;">
<span style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;"><tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid ${LINE};border-radius:16px;">
<tr><td style="padding:32px 32px 28px;font-family:${FONT};color:${INK};font-size:16px;line-height:1.6;">${inner}</td></tr>
</table>
<p style="font-family:${FONT};font-size:12px;color:${MUTED};margin:16px 0 0;">wwisermind · websites and search visibility for therapists</p>
</td></tr></table></body></html>`;
}

const button = (href: string, label: string) =>
  `<a href="${esc(href)}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">${esc(label)}</a>`;

export type LeadInfo = { firstName: string; email: string; website: string | null; practice: string; address: string | null; keywords: string[]; radiusMiles: number };

export function leadAlert(lead: LeadInfo, id: string, origin: string, cached: boolean) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:${MUTED};font-size:14px;vertical-align:top;">${esc(k)}</td><td style="padding:4px 0;font-size:14px;">${esc(v)}</td></tr>`;
  const inner = `
<h1 style="margin:0 0 12px;font-size:22px;">New Local Map Assessment lead</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
${row('Name', lead.firstName)}${row('Email', lead.email)}${row('Practice', lead.practice)}${row('Address', lead.address ?? 'hidden (service area)')}${row('Website', lead.website ?? 'not given')}
${row('Keywords', lead.keywords.join(', '))}${row('Radius', `${lead.radiusMiles} miles`)}${row('Report', cached ? 'reused a report from the last 7 days' : 'new scan')}
</table>
<p style="margin:0;"><a href="${esc(reportUrl(origin, id))}" style="color:${BLUE};">Open their report</a> (it may still be scanning)</p>`;
  return { subject: `New Local Map Assessment lead: ${lead.practice}`.slice(0, 150), html: shell(inner, `${lead.firstName} started a Local Map Assessment`) };
}

export function stallAlert(info: { practice: string; firstName: string; email: string; reportId: string; origin: string; status: string; error: string | null; checksDone: number; checksTotal: number; retries: number }) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:${MUTED};font-size:14px;vertical-align:top;">${esc(k)}</td><td style="padding:4px 0;font-size:14px;">${esc(v)}</td></tr>`;
  const inner = `
<h1 style="margin:0 0 12px;font-size:22px;">Local Map Assessment scan is stalled</h1>
<p style="margin:0 0 14px;">This scan has made no progress for 5 minutes of the visitor's time on the page. They have been told it is taking longer than usual and that we will email their report when it is ready.</p>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
${row('Practice', info.practice)}${row('Visitor', `${info.firstName} <${info.email}>`)}${row('State', info.status)}${row('Checks collected', `${info.checksDone} of ${info.checksTotal}`)}${row('Retries', String(info.retries))}${row('Last error', info.error ?? 'none')}
</table>
<p style="margin:0;"><a href="${esc(reportUrl(info.origin, info.reportId))}" style="color:${BLUE};">Open the report</a> (opening it also moves the scan along)</p>`;
  return { subject: `STALLED Local Map Assessment: ${info.practice}`.slice(0, 150), html: shell(inner, 'A scan has stopped making progress') };
}

export function reportStarted(firstName: string, practice: string, origin: string, id: string) {
  const url = reportUrl(origin, id);
  const inner = `
<p style="margin:0 0 6px;font-size:14px;color:${MUTED};">your Local Map Assessment</p>
<h1 style="margin:0 0 12px;font-size:26px;line-height:1.2;">We are checking ${esc(practice)}</h1>
<p style="margin:0 0 14px;">Hi ${esc(firstName)}, your scan has started. It takes about three minutes, and the report is on this page.</p>
<p style="margin:24px 0;">${button(url, 'Open your report')}</p>
<p style="margin:0 0 14px;">Keep the page open while the progress bar runs. If you close it, just open this link again and the scan will pick up where it stopped.</p>
<p style="margin:0;font-size:13px;color:${MUTED};">This page is private. Anyone with the link can see it, so share it only with people you trust. We read only public Google information.</p>`;
  return { subject: 'Your Local Map Assessment is on its way', html: shell(inner, 'Open this link any time to see your report') };
}

export function reportReady(report: Report, firstName: string, origin: string) {
  const url = reportUrl(origin, report.id);
  const inner = `
<p style="margin:0 0 6px;font-size:14px;color:${MUTED};">your Local Map Assessment</p>
<h1 style="margin:0 0 4px;font-size:28px;line-height:1.15;">${report.overall} out of 100</h1>
<p style="margin:0 0 18px;font-weight:600;">${esc(report.practice.name)}</p>
<p style="margin:0 0 14px;">Hi ${esc(firstName)}, your report is ready. It shows where ${esc(report.practice.name)} appears on Google Maps across 25 points around you, which practices appear above you, and a short list of what to fix first.</p>
<p style="margin:24px 0;">${button(url, 'Open your report')}</p>
<p style="margin:0 0 6px;">Would a second pair of eyes help? We offer a free 30 minute call to go through it with you. No pressure either way.</p>
<p style="margin:0 0 24px;"><a href="${esc(origin)}/contact/#book" style="color:${BLUE};">Book a free call</a></p>
<p style="margin:0;font-size:13px;color:${MUTED};">This page is private. Anyone with the link can see it, so share it only with people you trust. We read only public Google information, and Google results vary from person to person, so treat the map as a guide rather than a guarantee.</p>`;
  return { subject: `Your Local Map Assessment: ${report.overall} out of 100`, html: shell(inner, `Your Local Map Assessment is ready`) };
}

export { sendEmail };
