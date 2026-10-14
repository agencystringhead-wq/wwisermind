/* The email signature for therapists: table-based HTML with inline styles only, so it survives the
   way email clients rewrite markup. No classes, no external CSS, no web fonts. Text takes no colour
   of its own, so a client's light or dark mode decides it; links and the divider use mid-tones that
   read on both. The one image is an optional logo or photo, with a URL placeholder to replace. */

export type SignatureOptions = {
  /** An optional logo or photo to the left of the details. */
  logo: boolean;
  /** An optional confidentiality notice under the details. */
  confidentiality: boolean;
  /** An optional line saying the inbox is not monitored for emergencies. */
  emergency: boolean;
};

export const SIGNATURE_PLACEHOLDERS = [
  '[Name]',
  '[Credentials]',
  '[Title]',
  '[Practice name]',
  '[Phone]',
  '[Website]',
  '[Booking link]',
  '[License number and state]',
] as const;

export const LOGO_PLACEHOLDER = '[Logo or photo image URL]';

export const CONFIDENTIALITY_NOTICE =
  'This email and any attachments are confidential and meant only for the person it is addressed to. If you received it by mistake, please tell the sender and delete it.';

export const EMERGENCY_NOTICE =
  'This email is not monitored for emergencies. If you are in crisis, call or text 988 (US) or your local emergency number.';

const font = 'font-family:Arial,Helvetica,sans-serif;';
const link = 'color:#146ef5;text-decoration:none;';
const small = 'font-size:12px;line-height:1.5;color:#6b6b6b;';

/** The signature as one HTML string, indented so it reads well in the code block. */
export function buildSignatureHtml({ logo, confidentiality, emergency }: SignatureOptions): string {
  const details = [
    `<div style="${font}font-size:16px;line-height:1.4;font-weight:bold;">[Name], [Credentials]</div>`,
    `<div style="${font}font-size:14px;line-height:1.5;">[Title], [Practice name]</div>`,
    `<div style="${font}font-size:14px;line-height:1.5;padding-top:8px;">[Phone] &nbsp;|&nbsp; <a href="[Website]" style="${link}">[Website]</a></div>`,
    `<div style="${font}font-size:14px;line-height:1.5;"><a href="[Booking link]" style="${link}font-weight:bold;">Book an appointment</a></div>`,
    `<div style="${font}${small}padding-top:8px;">[License number and state]</div>`,
  ];

  const logoCell = logo
    ? [
        '      <td valign="top" style="padding:0 16px 0 0;">',
        `        <img src="${LOGO_PLACEHOLDER}" width="72" alt="" style="display:block;border:0;width:72px;height:auto;" />`,
        '      </td>',
      ]
    : [];

  /* The first notice carries the divider line above it; one under it sits a little closer. */
  const notice = (text: string, first: boolean) => [
    '  <tr>',
    `    <td style="${font}${small}${
      first ? 'padding-top:12px;border-top:1px solid #cccccc;' : 'padding-top:8px;'
    }">${text}</td>`,
    '  </tr>',
  ];

  return [
    '<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:480px;width:100%;border-collapse:collapse;">',
    '  <tr>',
    '    <td style="padding:0;">',
    '      <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;border-collapse:collapse;">',
    '        <tr>',
    ...logoCell.map((line) => `    ${line}`),
    '          <td valign="top" style="padding:0;">',
    ...details.map((line) => `            ${line}`),
    '          </td>',
    '        </tr>',
    '      </table>',
    '    </td>',
    '  </tr>',
    ...(emergency ? notice(EMERGENCY_NOTICE, true) : []),
    ...(confidentiality ? notice(CONFIDENTIALITY_NOTICE, !emergency) : []),
    '</table>',
  ].join('\n');
}

/** The preview swaps the logo placeholder for a plain grey square, so the preview shows where the
    image goes. The code the visitor copies keeps the placeholder. */
export const previewHtml = (html: string): string =>
  html.replace(
    LOGO_PLACEHOLDER,
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' rx='8' fill='%23e5e5e5'/%3E%3C/svg%3E",
  );
