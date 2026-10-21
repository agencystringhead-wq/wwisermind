/* Reads one page of HTML into the few facts the checks need. Plain string work, no DOM, so it runs
   in a Cloudflare Worker and in Node. Deliberately light: pages are capped before they get here. */

export type Link = { href: string; text: string };

export type PageInfo = {
  title: string;
  metaDescription: string;
  h1Count: number;
  hasViewport: boolean;
  noindex: boolean;
  generator: string;
  jsonLdTypes: string[];
  microdataTypes: string[];
  images: { total: number; withAlt: number };
  links: Link[];
  /** Links and buttons in the header or first screen. */
  topActions: Link[];
  /** Visible text, lower-cased and collapsed. */
  text: string;
  /** The same text with its original case, for credentials such as LCSW. */
  textCase: string;
  hasTel: boolean;
  forms: { hasOpenText: boolean }[];
  /** Whether the page text carries a "don't share sensitive details" note. */
  hasSensitiveNote: boolean;
  html: string;
};

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#8217': "'", '#39': "'" };

function decode(s: string): string {
  return s.replace(/&(#?\w+);/g, (m, k: string) => ENTITIES[k] ?? m);
}

function attr(tag: string, name: string): string | null {
  const m = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? decode(m[1] ?? m[2] ?? m[3] ?? '') : null;
}

function strip(html: string): string {
  return decode(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function extractLinks(html: string, limit: number): Link[] {
  const out: Link[] = [];
  const re = /<a\b([^>]*)>([\s\S]*?)<\/a>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < limit) {
    const href = attr(m[1], 'href');
    if (href === null) continue;
    const label = attr(m[1], 'aria-label') ?? '';
    out.push({ href, text: strip(m[2]) || label });
  }
  const bre = /<button\b([^>]*)>([\s\S]*?)<\/button>/gi;
  while ((m = bre.exec(html)) && out.length < limit) {
    out.push({ href: '', text: strip(m[2]) || attr(m[1], 'aria-label') || '' });
  }
  return out;
}

const SENSITIVE_NOTE =
  /(do not|don['’]t|please avoid|avoid|never)\s[^.]{0,80}(sensitive|confidential|private|personal|health|medical|clinical|diagnos)/i;

export function analyzePage(rawHtml: string): PageInfo {
  const html = rawHtml.replace(/<!--[\s\S]*?-->/g, '');

  const jsonLdTypes: string[] = [];
  const ldRe = /<script\b[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi;
  let ld: RegExpExecArray | null;
  while ((ld = ldRe.exec(html))) {
    const typeRe = /"@type"\s*:\s*(\[[^\]]*\]|"[^"]*")/g;
    let t: RegExpExecArray | null;
    while ((t = typeRe.exec(ld[1]))) {
      for (const name of t[1].match(/"([^"]+)"/g) ?? []) jsonLdTypes.push(name.replace(/"/g, ''));
    }
  }
  const microdataTypes = [...html.matchAll(/itemtype\s*=\s*["']https?:\/\/schema\.org\/([A-Za-z]+)/gi)].map((m) => m[1]);

  const body = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ');

  const titleMatch = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  const metas = html.match(/<meta\b[^>]*>/gi) ?? [];
  let metaDescription = '';
  let hasViewport = false;
  let noindex = false;
  let generator = '';
  for (const tag of metas) {
    const name = (attr(tag, 'name') ?? attr(tag, 'property') ?? '').toLowerCase();
    const content = attr(tag, 'content') ?? '';
    if (name === 'description' && !metaDescription) metaDescription = content.trim();
    if (name === 'viewport') hasViewport = true;
    if (name === 'robots' && /noindex/i.test(content)) noindex = true;
    if (name === 'generator') generator = content;
  }

  const imgs = body.match(/<img\b[^>]*>/gi) ?? [];
  let total = 0;
  let withAlt = 0;
  for (const tag of imgs) {
    if (/role\s*=\s*["']presentation|aria-hidden\s*=\s*["']true/i.test(tag)) continue;
    const w = Number(attr(tag, 'width'));
    const h = Number(attr(tag, 'height'));
    if ((w && w <= 2) || (h && h <= 2)) continue;
    total += 1;
    if ((attr(tag, 'alt') ?? '').trim()) withAlt += 1;
  }

  const bodyStart = body.search(/<body\b/i);
  const bodyHtml = bodyStart >= 0 ? body.slice(bodyStart) : body;
  /* Every header and nav block counts as "the header" (page builders often have several), plus the first screen's markup. */
  const chrome = [...(bodyHtml.match(/<header\b[\s\S]*?<\/header>/gi) ?? []).slice(0, 3), ...(bodyHtml.match(/<nav\b[\s\S]*?<\/nav>/gi) ?? []).slice(0, 3)];
  const topHtml = chrome.map((c) => c.slice(0, 20000)).join(' ') + ' ' + bodyHtml.slice(0, 9000);

  const forms: PageInfo['forms'] = [];
  for (const f of body.match(/<form\b[\s\S]*?<\/form>/gi) ?? []) {
    const open =
      /<textarea\b/i.test(f) ||
      /<input\b[^>]*(name|placeholder|aria-label|id)\s*=\s*["'][^"']*(message|reason|bring|help|concern|describe|comment|tell)/i.test(f);
    forms.push({ hasOpenText: open });
  }

  const textCase = strip(body);
  const text = textCase.toLowerCase();
  return {
    title: titleMatch ? strip(titleMatch[1]) : '',
    metaDescription,
    h1Count: (body.match(/<h1\b/gi) ?? []).length,
    hasViewport,
    noindex,
    generator,
    jsonLdTypes,
    microdataTypes,
    images: { total, withAlt },
    links: extractLinks(bodyHtml, 700),
    topActions: extractLinks(topHtml, 120),
    text,
    textCase,
    hasTel: /href\s*=\s*["']tel:/i.test(body),
    forms,
    hasSensitiveNote: SENSITIVE_NOTE.test(textCase),
    html,
  };
}
