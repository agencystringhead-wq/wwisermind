import { sendEmail } from '../../scorecard/server/email';

/* Two short emails, in the scorecard's plain style: the lead alert to wwisermind, and a note to the therapist with the link back to the tool.
   Inline styles, every piece of visitor text escaped. Neither email ever carries anything about the therapist's client, because the server never has it. */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const INK = '#111111';
const MUTED = '#5a5a5a';
const LINE = '#e9e6e0';
const BLUE = '#146ef5';
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

export const toolUrl = (origin: string) => `${origin}/free-tools/good-faith-estimate/`;

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

export type GfeLead = { firstName: string; email: string; practice: string; city: string };

export function leadAlert(lead: GfeLead) {
  const row = (k: string, v: string) =>
    `<tr><td style="padding:4px 12px 4px 0;color:${MUTED};font-size:14px;vertical-align:top;">${esc(k)}</td><td style="padding:4px 0;font-size:14px;">${esc(v)}</td></tr>`;
  const inner = `
<h1 style="margin:0 0 12px;font-size:22px;">New Good Faith Estimate tool lead</h1>
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 6px;">
${row('Name', lead.firstName)}${row('Email', lead.email)}${row('Practice', lead.practice)}${row('City', lead.city)}
</table>
<p style="margin:12px 0 0;font-size:13px;color:${MUTED};">They downloaded an estimate. We never receive anything about their client.</p>`;
  return { subject: `New GFE tool lead: ${lead.practice}`.slice(0, 150), html: shell(inner, `${lead.firstName} downloaded a Good Faith Estimate`) };
}

export function welcome(firstName: string, origin: string) {
  const url = toolUrl(origin);
  const inner = `
<h1 style="margin:0 0 12px;font-size:24px;line-height:1.2;">Your Good Faith Estimate tool</h1>
<p style="margin:0 0 14px;">Hi ${esc(firstName)}, thanks for trying the free Good Faith Estimate tool. Your PDF is on your device. Your client’s details were never sent to us.</p>
<p style="margin:0 0 22px;">When you need another estimate, for a new client or a change in fees, you can come back to the same page any time.</p>
<p style="margin:0 0 24px;"><a href="${esc(url)}" style="display:inline-block;background:${BLUE};color:#ffffff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:999px;">Open the tool</a></p>
<p style="margin:0;font-size:13px;color:${MUTED};">This tool follows the standard CMS form, but it is not legal advice. If you are unsure whether a client needs an estimate, check with your licensing board or a compliance adviser.</p>`;
  return { subject: 'Your Good Faith Estimate tool', html: shell(inner, 'The link back to your free Good Faith Estimate tool') };
}

export { sendEmail };
