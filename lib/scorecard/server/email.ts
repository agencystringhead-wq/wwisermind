import type { Report } from '../types';

/* Plain, clean HTML emails. Inline styles only, table layout, and every piece of visitor text is escaped. */

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const INK = '#111111';
const MUTED = '#5a5a5a';
const LINE = '#e9e6e0';
const BLUE = '#146ef5';
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export function resultUrl(origin: string, id: string) {
  return `${origin}/free-tools/website-scorecard-for-therapists/r/${id}/`;
}

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

function button(href: string, label: string) {
  return `<a href="${esc(href)}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">${esc(label)}</a>`;
}

export function summaryEmail(report: Report, firstName: string, origin: string) {
  const url = resultUrl(origin, report.id);
  const cats = report.categories
    .map(
      (c) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid ${LINE};font-size:15px;">${esc(c.label)}</td><td align="right" style="padding:8px 0;border-bottom:1px solid ${LINE};font-size:15px;font-weight:600;">${c.score === null ? 'not checked' : `${c.score} / 100`}</td></tr>`,
    )
    .join('');
  const fixes = report.fixes
    .map(
      (f, i) =>
        `<p style="margin:0 0 14px;"><strong>${i + 1}. ${esc(f.label)}</strong><br><span style="color:${MUTED};">${esc(f.why)}</span><br>${esc(f.what)}</p>`,
    )
    .join('');
  const inner = `
<p style="margin:0 0 6px;font-size:14px;color:${MUTED};">your website scorecard</p>
<h1 style="margin:0 0 4px;font-size:28px;line-height:1.15;">${report.overall === null ? 'Your results' : `${report.overall} out of 100`}</h1>
${report.tier ? `<p style="margin:0 0 18px;font-weight:600;">${esc(report.tier.name)}</p><p style="margin:0 0 22px;">${esc(report.tier.description)}</p>` : ''}
<p style="margin:0 0 14px;">Hi ${esc(firstName)}, here is the summary for ${esc(report.practiceName)}. The full report, with everything we checked, is on your private page.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">${cats}</table>
${report.fixes.length ? `<h2 style="margin:0 0 12px;font-size:18px;">Where to start</h2>${fixes}` : ''}
${report.scanNote ? `<p style="color:${MUTED};font-size:14px;">${esc(report.scanNote)}</p>` : ''}
<p style="margin:24px 0;">${button(url, 'Open your full report')}</p>
<p style="margin:0 0 6px;">Want a second pair of eyes on it? We offer a free 30 minute call to go through your results together. No pressure.</p>
<p style="margin:0 0 24px;"><a href="${esc(origin)}/contact/#book" style="color:${BLUE};">Book a free call</a></p>
<p style="margin:0;font-size:13px;color:${MUTED};">This page is private. Anyone with the link can see it, so share it only with people you trust. Our checks look for common signs and can miss things, so treat the results as a starting point.</p>`;
  return {
    subject: `Your website scorecard${report.overall === null ? '' : `: ${report.overall} out of 100`}`,
    html: shell(inner, report.overall === null ? 'Your website scorecard' : `You scored ${report.overall} out of 100`),
  };
}

export function leadEmail(
  report: Report,
  lead: { name: string; email: string; practice: string; cityState: string },
  answers: Record<string, string>,
  origin: string,
) {
  const url = resultUrl(origin, report.id);
  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:${MUTED};font-size:14px;vertical-align:top;">${esc(k)}</td><td style="padding:4px 0;font-size:14px;">${esc(v)}</td></tr>`;
  const inner = `
<h1 style="margin:0 0 12px;font-size:22px;">New website scorecard lead</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px;">
${row('Name', lead.name)}${row('Email', lead.email)}${row('Practice', lead.practice)}${row('Location', lead.cityState)}${row('Website', report.websiteUrl)}${row('Platform', report.platform ?? 'unknown')}
${row('Score', report.overall === null ? 'n/a' : `${report.overall} (${report.tier?.name ?? ''})`)}${row('Inquiries a month', answers.inquiries ?? '')}${row('Practice type', answers.practice_type ?? '')}${row('Goal', answers.goal ?? '')}
</table>
<p style="margin:0 0 6px;"><strong>Top fixes</strong></p>
<p style="margin:0 0 18px;">${report.fixes.map((f) => esc(f.label)).join('<br>') || 'None'}</p>
<p style="margin:0;"><a href="${esc(url)}" style="color:${BLUE};">Open their report</a></p>`;
  return { subject: `New website scorecard lead: ${lead.practice}`.slice(0, 150), html: shell(inner, `${lead.name} finished the scorecard`) };
}

export async function sendEmail(
  apiKey: string | undefined,
  msg: { from: string; to: string; subject: string; html: string; replyTo?: string },
): Promise<boolean> {
  if (!apiKey) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: msg.from,
        to: [msg.to],
        subject: msg.subject,
        html: msg.html,
        ...(msg.replyTo ? { reply_to: msg.replyTo } : {}),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
