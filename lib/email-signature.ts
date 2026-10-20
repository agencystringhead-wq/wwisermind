/* The email signature generator's engine: what the form holds, how a signature is built from it,
   and the small helpers (URLs, colours) the builder and the form share.

   The HTML it writes is table-based with inline styles only, because email apps rewrite markup:
   no classes, no external CSS, no web fonts, no base64 images, Arial throughout, 480px at most.
   Text takes no colour of its own in the styles with no background, so a client's light or dark
   mode decides it. The card style paints its own background, so it sets its own text colour too.

   Everything here is pure and self-contained (no imports), so it renders the same on the server
   and in the browser, and runs under plain Node for a quick check. Every value a visitor types is
   escaped before it goes into the markup. */

export type SignatureStyle = 'classic' | 'photo' | 'card' | 'minimal';
export type ImageShape = 'round' | 'square';
export type EmergencyRegion = 'us' | 'au' | 'ie' | 'uk';

export type SignatureValues = {
  name: string;
  credentials: string;
  pronouns: string;
  title: string;
  practice: string;
  phone: string;
  website: string;
  bookingUrl: string;
  bookingLabel: string;
  license: string;
  imageUrl: string;
  imageShape: ImageShape;
  accent: string;
  style: SignatureStyle;
  confidentiality: boolean;
  confidentialityText: string;
  noHealthDetails: boolean;
  emergency: boolean;
  emergencyRegion: EmergencyRegion;
};

/* --- the words ---------------------------------------------------------------------------- */

export const DEFAULT_ACCENT = '#146ef5';
export const DEFAULT_BOOKING_LABEL = 'Book an appointment';

export const CONFIDENTIALITY_TEXT =
  'This email may contain confidential information intended only for the recipient. If you received it in error, please let me know and delete it.';

export const HEALTH_DETAILS_TEXT =
  "Please don't share clinical or personal health details by email.";

export const EMERGENCY_TEXT: Record<EmergencyRegion, string> = {
  us: "If you're in crisis, call or text 988, or call 911.",
  au: "If you're in crisis, call Lifeline on 13 11 14, or 000 in an emergency.",
  ie: "If you're in crisis, call Samaritans on 116 123, or 112 / 999 in an emergency.",
  uk: "If you're in crisis, call Samaritans on 116 123, or 999 in an emergency.",
};

export const EMERGENCY_REGIONS: { id: EmergencyRegion; label: string }[] = [
  { id: 'us', label: 'United States' },
  { id: 'au', label: 'Australia' },
  { id: 'ie', label: 'Ireland' },
  { id: 'uk', label: 'United Kingdom' },
];

/** Six calm colours that all keep white text readable on a button of that colour. */
export const ACCENT_PRESETS: { name: string; hex: string }[] = [
  { name: 'Blue', hex: '#146ef5' },
  { name: 'Teal', hex: '#0f766e' },
  { name: 'Forest', hex: '#2f6b4f' },
  { name: 'Slate', hex: '#3f5a80' },
  { name: 'Plum', hex: '#6d4c8f' },
  { name: 'Terracotta', hex: '#a14e2f' },
];

/** A believable sample so the preview is never empty. The domain is a reserved one, so a sample
    that gets pasted by mistake does not point at somebody's real site. */
export const SAMPLE_VALUES: SignatureValues = {
  name: 'Dr. Maya Ellis',
  credentials: 'PsyD',
  pronouns: 'she/her',
  title: 'Licensed Psychologist',
  practice: 'Harbor Light Therapy',
  phone: '(555) 010-2468',
  website: 'harborlight.example.com',
  bookingUrl: 'harborlight.example.com/book',
  bookingLabel: DEFAULT_BOOKING_LABEL,
  license: 'Licensed in California, PSY 12345',
  imageUrl: '',
  imageShape: 'round',
  accent: DEFAULT_ACCENT,
  style: 'classic',
  confidentiality: true,
  confidentialityText: CONFIDENTIALITY_TEXT,
  noHealthDetails: false,
  emergency: false,
  emergencyRegion: 'us',
};

/* --- helpers: text, URLs, colours --------------------------------------------------------- */

const clean = (value: string) => value.trim().replace(/\s+/g, ' ');

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** An address a link or image can safely point at, or '' for none. A missing https:// is added;
    anything with a scheme other than http or https (javascript:, data:, mailto:) is dropped. */
export function normalizeUrl(input: string): string {
  const value = input.trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[a-z][a-z0-9+.-]*:/i.test(value) && !/^[^/]*\.[^/]*:\d+/.test(value)) return '';
  return `https://${value.replace(/^\/\//, '')}`;
}

/** The address as it reads in the signature: no protocol, no lone trailing slash. */
export function displayUrl(url: string): string {
  return url.replace(/^https?:\/\//i, '').replace(/\/$/, '');
}

/** True once an address looks complete enough to be worth fetching an image from. */
export function looksLikeUrl(input: string): boolean {
  const url = normalizeUrl(input);
  if (!url) return false;
  try {
    const host = new URL(url).hostname;
    return /\.[a-z]{2,}$/i.test(host);
  } catch {
    return false;
  }
}

/** "#abc", "abc", "#AABBCC" or "aabbcc" as a lower-case "#rrggbb", or null if it is not a colour. */
export function normalizeHex(input: string): string | null {
  const value = input.trim().replace(/^#/, '').toLowerCase();
  if (/^[0-9a-f]{3}$/.test(value)) {
    return `#${value
      .split('')
      .map((c) => c + c)
      .join('')}`;
  }
  return /^[0-9a-f]{6}$/.test(value) ? `#${value}` : null;
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** White or near-black, whichever reads better on a button of this colour. */
export const textOn = (hex: string): string =>
  contrastRatio(hex, '#ffffff') >= contrastRatio(hex, '#111111') ? '#ffffff' : '#111111';

/** The colour mixed with white: 0 is white, 1 is the colour itself. */
export function tint(hex: string, amount: number): string {
  const mixed = channels(hex).map((v) => Math.round(255 - (255 - v) * amount));
  return `#${mixed.map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

/* --- the parts every style shares --------------------------------------------------------- */

const font = 'font-family:Arial,Helvetica,sans-serif;';
const muted = 'color:#6b6b6b;';

/** One entry on the contact line. How it may wrap decides what a narrow screen does to the line: a
    phone number never breaks, and a web address breaks only if it has to. */
type Item = { html: string; wrap: 'never' | 'if-needed' };

type Parts = {
  nameLine: string;
  titleLine: string;
  /** The phone and the website, each as markup, or fewer if one is empty. */
  contactItems: Item[];
  bookingUrl: string;
  bookingLabel: string;
  license: string;
  imageUrl: string;
  notices: string[];
  accent: string;
  inkOnCard: boolean;
};

/** Everything the form held, cleaned: empty fields become empty strings, URLs are normalised. */
function prepare(values: SignatureValues): Parts & { plain: PlainParts } {
  const name = clean(values.name);
  const credentials = clean(values.credentials);
  const pronouns = clean(values.pronouns);
  const title = clean(values.title);
  const practice = clean(values.practice);
  const phone = clean(values.phone);
  const website = normalizeUrl(values.website);
  const bookingUrl = normalizeUrl(values.bookingUrl);
  const bookingLabel = clean(values.bookingLabel) || DEFAULT_BOOKING_LABEL;
  const license = clean(values.license);
  const imageUrl = normalizeUrl(values.imageUrl);
  const accent = normalizeHex(values.accent) ?? DEFAULT_ACCENT;

  const nameText = [name, credentials].filter(Boolean).join(', ');
  const nameLine = nameText
    ? `${escapeHtml(nameText)}${
        pronouns
          ? ` <span style="font-size:13px;font-weight:normal;${muted}">(${escapeHtml(pronouns)})</span>`
          : ''
      }`
    : pronouns
      ? `<span style="font-weight:normal;${muted}">(${escapeHtml(pronouns)})</span>`
      : '';

  const titleText = [title, practice].filter(Boolean).join(', ');
  const titleLine = escapeHtml(titleText);

  const telDigits = phone.replace(/[^\d+]/g, '');
  const phoneHtml = phone
    ? telDigits.replace(/\+/g, '').length >= 5
      ? `<a href="tel:${escapeHtml(telDigits)}" style="color:inherit;text-decoration:none;">${escapeHtml(phone)}</a>`
      : escapeHtml(phone)
    : '';
  const websiteHtml = website
    ? `<a href="${escapeHtml(website)}" style="color:${accent};text-decoration:none;">${escapeHtml(displayUrl(website))}</a>`
    : '';
  const contactItems: Item[] = [
    ...(phoneHtml ? [{ html: phoneHtml, wrap: 'never' as const }] : []),
    ...(websiteHtml ? [{ html: websiteHtml, wrap: 'if-needed' as const }] : []),
  ];

  const notices: string[] = [];
  if (values.emergency) notices.push(EMERGENCY_TEXT[values.emergencyRegion]);
  if (values.noHealthDetails) notices.push(HEALTH_DETAILS_TEXT);
  const confidentiality = clean(values.confidentialityText);
  if (values.confidentiality && confidentiality) notices.push(confidentiality);

  return {
    nameLine,
    titleLine,
    contactItems,
    bookingUrl,
    bookingLabel,
    license,
    imageUrl,
    notices,
    accent,
    inkOnCard: values.style === 'card',
    plain: {
      nameText: [nameText, pronouns ? `(${pronouns})` : ''].filter(Boolean).join(' '),
      titleText,
      contactText: [phone, website ? displayUrl(website) : ''].filter(Boolean).join(' | '),
      booking: bookingUrl ? `${bookingLabel}: ${bookingUrl}` : '',
      license,
      notices,
    },
  };
}

type PlainParts = {
  nameText: string;
  titleText: string;
  contactText: string;
  booking: string;
  license: string;
  notices: string[];
};

/** A line of the details, or nothing if it is empty. */
const row = (content: string, style: string): string[] =>
  content ? [`<div style="${font}${style}">${content}</div>`] : [];

const indent = (lines: string[], spaces: number) => lines.map((line) => `${' '.repeat(spaces)}${line}`);

/** Items on one line with a "|" between them. One item is plain text. Two or more are cells of a
    one-row table, the "|" a cell of its own, so when a narrow screen wraps the line the bar stays
    between the items instead of ending up at the edge of a line. */
function inline(items: Item[], style: string): string[] {
  if (items.length === 0) return [];
  const [pad, cellStyle] = [/padding-top:\d+px;/.exec(style)?.[0] ?? '', style.replace(/padding-top:\d+px;/, '')];
  if (items.length === 1) return [`<div style="${font}${style}">${items[0].html}</div>`];
  const wrapCss = { never: 'white-space:nowrap;', 'if-needed': 'word-break:break-word;overflow-wrap:anywhere;' };
  const cells = items.flatMap((item, index) => [
    ...(index ? [`<td style="${font}${cellStyle}padding:0 8px;white-space:nowrap;">|</td>`] : []),
    `<td valign="top" style="${font}${cellStyle}padding:0;${wrapCss[item.wrap]}">${item.html}</td>`,
  ]);
  return [
    `<div style="${pad}">`,
    '  <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">',
    `    <tr>${cells.join('')}</tr>`,
    '  </table>',
    '</div>',
  ];
}

/** The booking link as bold text in the accent colour. */
function bookingLink(parts: Parts): string[] {
  if (!parts.bookingUrl) return [];
  return row(
    `<a href="${escapeHtml(parts.bookingUrl)}" style="color:${parts.accent};font-weight:bold;text-decoration:none;">${escapeHtml(parts.bookingLabel)}</a>`,
    'font-size:14px;line-height:1.5;padding-top:6px;',
  );
}

/** The booking link as a button: a table cell with the colour on it, which is the one button every
    mail app draws. The label colour is chosen to stay readable on whatever accent was picked. */
function bookingButton(parts: Parts): string[] {
  if (!parts.bookingUrl) return [];
  const label = textOn(parts.accent);
  return [
    '<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin-top:10px;">',
    '  <tr>',
    `    <td bgcolor="${parts.accent}" style="background-color:${parts.accent};border-radius:4px;">`,
    `      <a href="${escapeHtml(parts.bookingUrl)}" style="${font}display:inline-block;padding:8px 16px;font-size:14px;line-height:1.2;font-weight:bold;color:${label};text-decoration:none;">${escapeHtml(parts.bookingLabel)}</a>`,
    '    </td>',
    '  </tr>',
    '</table>',
  ];
}

/** The name, role, contact line, license line and booking link, in the order every style uses. */
function details(parts: Parts, booking: 'link' | 'button'): string[] {
  return [
    ...row(parts.nameLine, 'font-size:16px;line-height:1.4;font-weight:bold;'),
    ...row(parts.titleLine, 'font-size:14px;line-height:1.5;'),
    ...inline(parts.contactItems, 'font-size:14px;line-height:1.5;padding-top:6px;'),
    ...(booking === 'button' ? bookingButton(parts) : bookingLink(parts)),
    ...row(escapeHtml(parts.license), `font-size:12px;line-height:1.5;${muted}padding-top:8px;`),
  ];
}

function imageTag(parts: Parts, shape: ImageShape): string {
  const round = shape === 'round';
  const size = round ? 80 : 96;
  const attrs = round ? `width="${size}" height="${size}"` : `width="${size}"`;
  const css = round
    ? `display:block;border:0;width:${size}px;height:${size}px;border-radius:50%;`
    : `display:block;border:0;width:${size}px;height:auto;`;
  return `<img src="${escapeHtml(parts.imageUrl)}" ${attrs} alt="" style="${css}" />`;
}

/** The notices under the main block: a hairline above the first, the rest a little closer. */
function noticeRows(parts: Parts): string[] {
  return parts.notices.flatMap((text, index) => [
    '  <tr>',
    `    <td style="${font}font-size:12px;line-height:1.5;${muted}${
      index === 0 ? 'padding-top:12px;border-top:1px solid #cccccc;' : 'padding-top:6px;'
    }">${escapeHtml(text)}</td>`,
    '  </tr>',
  ]);
}

const OPEN =
  '<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="max-width:480px;width:100%;border-collapse:collapse;">';

/** One row of the outer table holding a block of lines. */
const block = (content: string[], extra = ''): string[] => [
  '  <tr>',
  `    <td style="padding:0;${extra}">`,
  ...indent(content, 6),
  '    </td>',
  '  </tr>',
];

/* --- the four styles ---------------------------------------------------------------------- */

function classic(parts: Parts): string[] {
  return [OPEN, ...block(details(parts, 'link')), ...noticeRows(parts), '</table>'];
}

/** Image left, details right, a thin accent line between them. With no image the line goes too. */
function photo(parts: Parts, shape: ImageShape): string[] {
  const text = details(parts, 'button');
  const cells = parts.imageUrl
    ? [
        '<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">',
        '  <tr>',
        '    <td valign="top" style="padding:0 16px 0 0;">',
        `      ${imageTag(parts, shape)}`,
        '    </td>',
        `    <td valign="top" style="padding:0 0 0 16px;border-left:2px solid ${parts.accent};">`,
        ...indent(text, 6),
        '    </td>',
        '  </tr>',
        '</table>',
      ]
    : text;
  return [OPEN, ...block(cells), ...noticeRows(parts), '</table>'];
}

/** A soft tinted block with an accent bar on its left edge. It paints its own background, so it
    sets its own text colour as well rather than leaving it to a dark-mode client to guess. */
function card(parts: Parts, shape: ImageShape): string[] {
  const tinted = tint(parts.accent, 0.08);
  const text = details(parts, 'button');
  const inside = parts.imageUrl
    ? [
        '<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">',
        '  <tr>',
        '    <td valign="top" style="padding:0 16px 0 0;">',
        `      ${imageTag(parts, shape)}`,
        '    </td>',
        '    <td valign="top" style="padding:0;">',
        ...indent(text, 6),
        '    </td>',
        '  </tr>',
        '</table>',
      ]
    : text;
  return [
    OPEN,
    '  <tr>',
    `    <td bgcolor="${tinted}" style="background-color:${tinted};border-left:4px solid ${parts.accent};padding:16px 18px;color:#1f1f1f;">`,
    ...indent(inside, 6),
    '    </td>',
    '  </tr>',
    ...noticeRows(parts),
    '</table>',
  ];
}

/** The name, one line of contact details (the phone and the website) and the booking link, and
    nothing else: no role, practice or license line. Three items would be too wide for a phone. */
function minimal(parts: Parts): string[] {
  const lines = [
    ...row(parts.nameLine, 'font-size:15px;line-height:1.4;font-weight:bold;'),
    ...inline(parts.contactItems, 'font-size:14px;line-height:1.5;'),
    ...bookingLink(parts),
  ];
  return [OPEN, ...block(lines), ...noticeRows(parts), '</table>'];
}

/* --- the output --------------------------------------------------------------------------- */

/** True when the form holds nothing a signature could be made from. */
export function isEmptySignature(values: SignatureValues): boolean {
  const p = prepare(values);
  return !(p.nameLine || p.titleLine || p.contactItems.length || p.bookingUrl || p.license || p.notices.length);
}

/** The signature as one HTML string, indented so it reads well in the code panel. */
export function buildSignatureHtml(values: SignatureValues): string {
  const parts = prepare(values);
  switch (values.style) {
    case 'photo':
      return photo(parts, values.imageShape).join('\n');
    case 'card':
      return card(parts, values.imageShape).join('\n');
    case 'minimal':
      return minimal(parts).join('\n');
    default:
      return classic(parts).join('\n');
  }
}

/** The same signature as plain text, for the text/plain half of the clipboard and for any app that
    cannot take HTML. */
export function buildSignatureText(values: SignatureValues): string {
  const { plain } = prepare(values);
  const lines = [plain.nameText, plain.titleText, plain.contactText, plain.booking, plain.license].filter(Boolean);
  if (plain.notices.length) lines.push('', ...plain.notices);
  return lines.join('\n');
}
