import { analyzePage, type Link, type PageInfo } from './analyze';
import { SCAN_LIMITS, THRESHOLDS } from './rules';
import type { CheckId, CheckResult, Platform, ScanResult } from './types';

/* The automatic scan. Runs in a Cloudflare Worker (Pages Function) and in Node (scripts/scorecard).
   It reads the homepage and up to three more pages, a sitemap and robots.txt, and asks Google
   PageSpeed for the mobile numbers, all inside one time budget. Anything that fails is marked
   "couldn't check" instead of failing the scan. */

const UA = 'Mozilla/5.0 (compatible; wwisermind-scorecard/1.0; +https://wwisermind.com/free-tools/website-scorecard-for-therapists/)';

const TRACKING_PARAM = /^(utm_|fbclid|gclid|msclkid|mc_|_ga|igshid|ref$)/i;

export type StepId = 'homepage' | 'pages' | 'files' | 'speed';
export type StepEvent = { step: StepId; state: 'start' | 'done' };

/* --- URL handling ------------------------------------------------------------------------- */

export function isPublicHost(host: string): boolean {
  const h = host.toLowerCase().replace(/\.$/, '');
  if (!h || h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return false;
  if (h.includes(':')) return false; // IPv6 literal
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) return false; // IPv4 literal
  if (!h.includes('.')) return false;
  return /^[a-z0-9.-]+$/.test(h) || /^xn--/.test(h);
}

/** Returns the address to scan (the site's homepage, https) and a cache key, or null if it is not usable. */
export function normalizeUrl(input: string): { url: string; key: string } | null {
  let raw = (input || '').trim();
  if (!raw || raw.length > 300) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(raw)) raw = `https://${raw}`;
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
  if (u.username || u.password) return null;
  if (u.port && u.port !== '80' && u.port !== '443') return null;
  if (!isPublicHost(u.hostname)) return null;
  /* Tracking parameters and fragments never matter to the scan: we read the homepage only. */
  for (const k of [...u.searchParams.keys()]) if (TRACKING_PARAM.test(k)) u.searchParams.delete(k);
  const host = u.hostname.toLowerCase();
  return { url: `https://${host}/`, key: host.replace(/^www\./, '') };
}

/* --- fetching ----------------------------------------------------------------------------- */

type Fetched = {
  ok: boolean;
  status: number;
  finalUrl: string;
  body: string;
  headers: Headers | null;
  blocked: string | null;
  contentType: string;
};

const BLOCK_MARKERS = /just a moment|cf-browser-verification|challenge-platform|attention required|px-captcha|access denied|enable javascript and cookies/i;

async function readCapped(res: Response, max: number): Promise<string> {
  if (!res.body) return '';
  const reader = res.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (size < max) {
    const { done, value } = await reader.read();
    if (done || !value) break;
    chunks.push(value);
    size += value.byteLength;
  }
  reader.cancel().catch(() => undefined);
  const all = new Uint8Array(Math.min(size, max));
  let off = 0;
  for (const c of chunks) {
    const slice = c.subarray(0, Math.max(0, Math.min(c.byteLength, all.length - off)));
    all.set(slice, off);
    off += slice.byteLength;
  }
  return new TextDecoder('utf-8', { fatal: false }).decode(all);
}

async function fetchText(url: string, timeoutMs: number, wantHtml = true): Promise<Fetched> {
  let current = url;
  const fail = (reason: string, status = 0): Fetched => ({
    ok: false, status, finalUrl: current, body: '', headers: null, blocked: reason, contentType: '',
  });
  for (let hop = 0; hop < 6; hop += 1) {
    let host: string;
    try {
      host = new URL(current).hostname;
    } catch {
      return fail('bad address');
    }
    if (!isPublicHost(host)) return fail('not a public address');
    let res: Response;
    try {
      res = await fetch(current, {
        redirect: 'manual',
        signal: AbortSignal.timeout(timeoutMs),
        headers: { 'user-agent': UA, accept: wantHtml ? 'text/html,application/xhtml+xml' : '*/*', 'accept-language': 'en-US,en;q=0.9' },
      });
    } catch (e) {
      const timedOut = e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError');
      return fail(timedOut ? 'timed out' : 'could not connect');
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      try {
        current = new URL(res.headers.get('location')!, current).toString();
      } catch {
        return fail('bad redirect');
      }
      res.body?.cancel().catch(() => undefined);
      continue;
    }
    const contentType = res.headers.get('content-type') ?? '';
    let body = '';
    try {
      body = await readCapped(res, SCAN_LIMITS.maxBodyBytes);
    } catch {
      return fail('read failed', res.status);
    }
    const challenged = res.headers.get('cf-mitigated') === 'challenge' || ([401, 403, 429, 503].includes(res.status) && BLOCK_MARKERS.test(body.slice(0, 4000)));
    if (challenged) return { ...fail('the site asked for a human check', res.status), body: '' };
    if (res.status >= 400) return { ...fail(`the site answered ${res.status}`, res.status), headers: res.headers };
    /* Inline CSS is most of a page builder's HTML and none of it matters here, so it goes before parsing. */
    body = body.replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
    return { ok: true, status: res.status, finalUrl: current, body, headers: res.headers, blocked: null, contentType };
  }
  return fail('too many redirects');
}

/* --- PageSpeed Insights ------------------------------------------------------------------- */

type Psi = { perf: number | null; lcpMs: number | null; cls: number | null };

async function runPsi(url: string, key: string | undefined, timeoutMs: number, onError?: (why: string) => void): Promise<Psi | null> {
  if (!key) return null;
  const api = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  api.searchParams.set('url', url);
  api.searchParams.set('strategy', 'mobile');
  api.searchParams.set('category', 'performance');
  api.searchParams.set('key', key);
  try {
    const res = await fetch(api, { signal: AbortSignal.timeout(Math.max(1000, timeoutMs)) });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
      onError?.(`PageSpeed answered ${res.status}: ${(err.error?.message ?? 'no message').slice(0, 200)}`);
      return null;
    }
    const data = (await res.json()) as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number | null } };
        audits?: Record<string, { numericValue?: number }>;
      };
    };
    const lh = data.lighthouseResult;
    if (!lh) {
      onError?.('PageSpeed answered without a result');
      return null;
    }
    return {
      perf: lh.categories?.performance?.score ?? null,
      lcpMs: lh.audits?.['largest-contentful-paint']?.numericValue ?? null,
      cls: lh.audits?.['cumulative-layout-shift']?.numericValue ?? null,
    };
  } catch (e) {
    onError?.(e instanceof Error && (e.name === 'TimeoutError' || e.name === 'AbortError') ? 'PageSpeed took too long' : 'could not reach PageSpeed');
    return null;
  }
}

/* --- helpers for the checks --------------------------------------------------------------- */

const found = (detail?: string, score = 1): CheckResult => ({ status: 'found', score, detail });
const notFound = (detail?: string, score = 0): CheckResult => ({ status: 'notFound', score, detail });
const unknown: CheckResult = { status: 'unknown', score: 0 };
const yes = (ok: boolean, detail?: string): CheckResult => (ok ? found(detail) : notFound(detail));

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));
const lerpDown = (value: number, good: number, poor: number) => clamp01((poor - value) / (poor - good));

const SCHEMA_TYPES = /^(LocalBusiness|MedicalBusiness|Psychologist|MedicalClinic|MedicalOrganization|ProfessionalService|Physician|HealthAndBeautyBusiness|Organization)$/;
const LOCAL_SCHEMA = /^(LocalBusiness|MedicalBusiness|Psychologist|MedicalClinic|MedicalOrganization|ProfessionalService|Physician|HealthAndBeautyBusiness)$/;

const BOOKING_TEXT =
  /\b(book|schedule|request|set up|make)\b[^.]{0,24}\b(appointment|consult\w*|call|session|intake|time|now|online|visit)\b|\bfree\b[^.]{0,20}\b(consult\w*|call|chat|phone)\b|\bbook now\b|\bget started\b|\bnew clients?\b|\bappointments?\b|\bintake\b|\bschedule\b/i;
const CONTACT_TEXT = /\b(contact( me| us)?|get in touch|reach out|say hello|inquire|inquiry)\b/i;
const BOOKING_HOST = /(simplepractice|calendly|janeapp|acuityscheduling|squareup\.com\/appointments|zocdoc|tebra|cal\.com|theranest|jane\.app|setmore|youcanbook|appointlet|tidycal|healthie)/i;

const CREDENTIALS =
  /\b(LCSW-?C?|LICSW|LISW|LMSW|LPC-?[SCA]?|LPCC|LCPC|LMFT|LMHC|LCMHC|LMHP|LCADC|LMHCA|LMFTA|LMFT-A|LSW|LSCSW|LCSWA|LCMHCA|LPC-A|AMFT|APCC|PMHNP|PsyD|Psy\.D\.?|Ph\.?D\.?|MFT|APCC|NCC|LCAT|LPCS)\b/;

const STATES =
  /\b(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new hampshire|new jersey|new mexico|new york|north carolina|north dakota|ohio|oklahoma|oregon|pennsylvania|rhode island|south carolina|south dakota|tennessee|texas|utah|vermont|virginia|washington|west virginia|wisconsin|wyoming)\b|\b(licensed in|serving (clients|residents)|residents of|located in)\b/i;

function pickLinks(links: Link[], base: string, test: RegExp): string | null {
  let origin: string;
  try {
    origin = new URL(base).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
  for (const l of links) {
    if (!l.href || /^(mailto:|tel:|javascript:|#)/i.test(l.href)) continue;
    if (!test.test(l.href) && !test.test(l.text)) continue;
    try {
      const u = new URL(l.href, base);
      if (u.hostname.replace(/^www\./, '') !== origin) continue;
      if (u.pathname === '/' || /\.(pdf|jpe?g|png|webp|zip)$/i.test(u.pathname)) continue;
      return u.origin + u.pathname;
    } catch {
      /* skip */
    }
  }
  return null;
}

function detectPlatform(home: PageInfo, headers: Headers | null): Platform {
  const html = home.html;
  const gen = home.generator.toLowerCase();
  if (gen.includes('wix') || headers?.get('x-wix-request-id') || /static\.parastorage\.com|wixstatic\.com/i.test(html)) return 'wix';
  if (gen.includes('squarespace') || /static1\.squarespace\.com|squarespace-cdn\.com|squarespace\.com\/universal/i.test(html)) return 'squarespace';
  if (gen.includes('wordpress') || /\/wp-content\/|\/wp-includes\//i.test(html)) return 'wordpress';
  return 'other';
}

/* --- the scan ----------------------------------------------------------------------------- */

export async function runScan(
  input: string,
  opts: { psiKey?: string; onStep?: (e: StepEvent) => void; deferSpeed?: boolean } = {},
): Promise<ScanResult> {
  const norm = normalizeUrl(input);
  const startedAt = Date.now();
  const empty: ScanResult = {
    url: norm?.url ?? input,
    finalUrl: null,
    blocked: true,
    blockedReason: 'that address did not look right',
    partial: true,
    platform: null,
    psychologyTodayUrl: null,
    checks: {},
    privacyFlag: 'unknown',
    pagesChecked: [],
    metrics: { perf: null, lcpMs: null, cls: null },
    scannedAt: startedAt,
  };
  if (!norm) return empty;

  const deadline = startedAt + SCAN_LIMITS.budgetMs;
  const left = () => Math.max(500, deadline - Date.now());
  const slice = () => Math.min(SCAN_LIMITS.perRequestMs, left());
  const step = (s: StepId, state: 'start' | 'done') => opts.onStep?.({ step: s, state });

  /* PageSpeed is the slow one, so it starts first and runs alongside everything else. */
  if (!opts.deferSpeed) step('speed', 'start');
  const psiPromise: Promise<Psi | null> = opts.deferSpeed
    ? Promise.resolve(null)
    : runPsi(norm.url, opts.psiKey, left() - 500).then((r) => {
        step('speed', 'done');
        return r;
      });

  step('homepage', 'start');
  const home = await fetchText(norm.url, slice());
  step('homepage', 'done');

  if (!home.ok) {
    step('pages', 'start');
    step('pages', 'done');
    step('files', 'start');
    step('files', 'done');
    const psi = await psiPromise;
    const checks: ScanResult['checks'] = {};
    addPsiChecks(checks, psi);
    return {
      ...empty,
      finalUrl: home.finalUrl,
      blockedReason: home.blocked,
      checks,
      metrics: psi ?? empty.metrics,
    };
  }

  const base = home.finalUrl;
  const homeInfo = analyzePage(home.body);
  if (homeInfo.text.length < 80 && homeInfo.links.length < 2) {
    /* A page with almost no readable content is usually a script-only app or a placeholder. */
    step('pages', 'start');
    step('pages', 'done');
    step('files', 'start');
    step('files', 'done');
    const psi = await psiPromise;
    const checks: ScanResult['checks'] = {};
    addPsiChecks(checks, psi);
    return { ...empty, finalUrl: base, blockedReason: 'the page has no readable text for us', checks, metrics: psi ?? empty.metrics };
  }

  const origin = new URL(base).origin;
  const aboutUrl = pickLinks(homeInfo.links, base, /(team|clinicians?|therapists|staff|bios?\b)/i) ?? pickLinks(homeInfo.links, base, /(about|meet)/i);
  const feesUrl = pickLinks(homeInfo.links, base, /\b(fees?|rates?|insurances?|investment|pricing|cost|payment)\b/i);
  const contactUrl = pickLinks(homeInfo.links, base, /\b(contact|get-?in-?touch|schedule|appointments?|book)\b/i);
  const wanted = [...new Set([aboutUrl, feesUrl, contactUrl].filter((u): u is string => !!u))].slice(0, SCAN_LIMITS.maxPagesExtra);

  step('pages', 'start');
  const pagesP = Promise.all(wanted.map((u) => fetchText(u, slice()))).then((r) => {
    step('pages', 'done');
    return r;
  });
  step('files', 'start');
  const filesP = Promise.all([
    fetchText(`${origin}/robots.txt`, slice(), false),
    fetchText(`${origin}/sitemap.xml`, slice(), false),
  ]).then((r) => {
    step('files', 'done');
    return r;
  });

  const [extra, [robots, sitemapMain], psi] = await Promise.all([pagesP, filesP, psiPromise]);

  let sitemap = sitemapMain;
  const robotsText = robots.ok ? robots.body : '';
  const isSitemap = (f: Fetched) => f.ok && /<urlset|<sitemapindex/i.test(f.body);
  if (!isSitemap(sitemap)) {
    const declared = /^\s*sitemap:\s*(\S+)/im.exec(robotsText)?.[1];
    const alt = [declared, `${origin}/sitemap_index.xml`, `${origin}/wp-sitemap.xml`].filter((u): u is string => !!u && Date.now() < deadline - 500);
    for (const u of alt.slice(0, 2)) {
      const f = await fetchText(u, slice(), false);
      if (isSitemap(f)) {
        sitemap = f;
        break;
      }
    }
  }

  const pageInfos = extra.filter((e) => e.ok).map((e) => ({ url: e.finalUrl, info: analyzePage(e.body) }));
  const all = [homeInfo, ...pageInfos.map((p) => p.info)];
  const allText = all.map((p) => p.text).join(' ');
  const allLinks = all.flatMap((p) => p.links);
  const partial = extra.some((e) => !e.ok) || (opts.psiKey && !opts.deferSpeed ? psi === null : false) || (!robots.ok && robots.status !== 404) || Date.now() >= deadline;

  const checks: ScanResult['checks'] = {};
  addPsiChecks(checks, psi, !!opts.psiKey);

  checks.https = yes(new URL(base).protocol === 'https:');
  checks.viewport = yes(homeInfo.hasViewport);
  checks.title = homeInfo.title.length >= THRESHOLDS.titleMinChars ? found(homeInfo.title.slice(0, 80)) : notFound();
  checks.meta_desc = homeInfo.metaDescription.length >= THRESHOLDS.metaDescMinChars ? found() : notFound();
  checks.single_h1 = yes(homeInfo.h1Count === 1, `${homeInfo.h1Count} found`);

  const types = all.flatMap((p) => [...p.jsonLdTypes, ...p.microdataTypes]);
  checks.schema = yes(types.some((t) => LOCAL_SCHEMA.test(t)), types.find((t) => SCHEMA_TYPES.test(t)));

  checks.sitemap = isSitemap(sitemap) ? found() : sitemap.status === 0 ? unknown : notFound();

  if (homeInfo.noindex) checks.robots_ok = notFound('the homepage has a noindex tag');
  else if (robots.ok) {
    const blocksAll = /user-agent:\s*\*\s*(?:\r?\n\s*(?:#.*)?)*?disallow:\s*\/\s*(?:\r?\n|$)/i.test(robotsText);
    checks.robots_ok = blocksAll ? notFound('robots.txt blocks all crawlers') : found();
  } else if (robots.status === 404) checks.robots_ok = found('no robots.txt, so nothing is blocked');
  else checks.robots_ok = unknown;

  const alt = homeInfo.images;
  checks.img_alt =
    alt.total === 0
      ? unknown
      : alt.withAlt / alt.total >= THRESHOLDS.altCoverageFound
        ? found(`${alt.withAlt} of ${alt.total}`, alt.withAlt / alt.total)
        : notFound(`${alt.withAlt} of ${alt.total}`, alt.withAlt / alt.total);

  const topBooking = homeInfo.topActions.some((l) => BOOKING_TEXT.test(l.text) || BOOKING_HOST.test(l.href));
  const topContact = homeInfo.topActions.some((l) => CONTACT_TEXT.test(l.text));
  /* In the header or first screen is full marks. Anywhere else on the homepage still counts, a little less:
     a visitor can find it, but has to scroll. */
  const anywhereBooking = homeInfo.links.some((l) => BOOKING_TEXT.test(l.text) || BOOKING_HOST.test(l.href));
  checks.booking_cta = topBooking
    ? found('in the header or first screen')
    : anywhereBooking
      ? found('further down the homepage, not in the header', 0.75)
      : topContact
        ? notFound('there is a contact link, but we couldn’t find a booking or consultation button', 0.5)
        : notFound();

  checks.tel_link = yes(all.some((p) => p.hasTel));
  const hasContactLink = allLinks.some((l) => /contact/i.test(l.href) || /^contact/i.test(l.text));
  checks.contact_page = yes(hasContactLink || (contactUrl !== null && extra.some((e) => e.ok && e.finalUrl === contactUrl)));

  const feeHit = /\b(insurances?|out[- ]of[- ]network|superbill|sliding[- ]scale|self[- ]pay|private[- ]pay|session fees?|fees?|rates?|cost)\b[^.]{0,80}\$|\$\s?\d{2,3}\b|\b(insurances?|in[- ]network|out[- ]of[- ]network|superbill|sliding[- ]scale|self[- ]pay|private[- ]pay)\b/i.exec(allText);
  checks.fees_info = yes(!!feeHit || (feesUrl !== null && extra.some((e) => e.ok && e.finalUrl === feesUrl)));

  checks.accepting = yes(/\b(accepting|taking|open to|now (accepting|scheduling)|currently (accepting|seeing))\b[^.]{0,30}\b(new )?(clients|patients)\b|\bnew (clients|patients) (are )?welcome\b|\bopenings? (available|for)\b/i.test(allText));

  const tele = /\btele-?health\b|\btele-?therapy\b|\bonline (therapy|counseling|counselling|sessions)\b|\bvirtual (sessions|therapy|appointments)\b|\bvideo sessions?\b/i.test(allText);
  checks.telehealth = tele ? (STATES.test(allText) ? found() : notFound('telehealth is mentioned, but we couldn’t find the states served', 0.5)) : notFound();

  checks.bios_credentials = yes(all.some((p) => CREDENTIALS.test(p.textCase)));
  checks.privacy_policy = yes(allLinks.some((l) => /privacy/i.test(l.href) || /privacy/i.test(l.text)));
  checks.crisis_info = yes(/\b988\b|\b911\b|crisis (line|text|hotline|resources?)|suicide (prevention|hotline)|emergency room|in case of (an )?emergency|mental health emergency/i.test(allText));

  /* Soft privacy warning: a form with open text fields on a page with no note about sensitive details. */
  const formPages = all.filter((p) => p.forms.length > 0);
  const openForm = formPages.find((p) => p.forms.some((f) => f.hasOpenText));
  const privacyFlag: ScanResult['privacyFlag'] = openForm ? (openForm.hasSensitiveNote ? 'ok' : 'flag') : formPages.length ? 'ok' : 'unknown';

  const pt = allLinks.find((l) => /psychologytoday\.com\/(us\/)?(therapists|profile)/i.test(l.href));

  return {
    url: norm.url,
    finalUrl: base,
    blocked: false,
    blockedReason: null,
    partial,
    platform: detectPlatform(homeInfo, home.headers),
    psychologyTodayUrl: pt ? pt.href : null,
    checks,
    privacyFlag,
    pagesChecked: [base, ...pageInfos.map((p) => p.url)],
    metrics: psi ?? { perf: null, lcpMs: null, cls: null },
    scannedAt: startedAt,
    speed: opts.deferSpeed ? 'pending' : psi ? 'done' : 'failed',
  };
}

/** The PageSpeed half of a scan, run on its own because it can take longer than the rest of the scan put together. */
export async function runSpeed(url: string, key: string | undefined, timeoutMs: number) {
  let error = 'unknown';
  const psi = await runPsi(url, key, timeoutMs, (why) => (error = why));
  const checks: ScanResult['checks'] = {};
  addPsiChecks(checks, psi, true);
  return psi ? { checks, metrics: psi, error: null } : { checks: null, metrics: null, error };
}

function addPsiChecks(checks: Partial<Record<CheckId, CheckResult>>, psi: Psi | null, keyed = true) {
  if (!psi || !keyed) {
    checks.psi_perf = unknown;
    checks.psi_lcp = unknown;
    checks.psi_cls = unknown;
    return;
  }
  const t = THRESHOLDS;
  if (psi.perf !== null) {
    const s = clamp01(psi.perf / t.psiPerfFullMarks);
    checks.psi_perf = { status: s >= 0.6 ? 'found' : 'notFound', score: s, detail: `${Math.round(psi.perf * 100)} out of 100 on a phone` };
  } else checks.psi_perf = unknown;
  if (psi.lcpMs !== null) {
    const s = lerpDown(psi.lcpMs, t.lcpGoodMs, t.lcpPoorMs);
    checks.psi_lcp = { status: s >= 0.6 ? 'found' : 'notFound', score: s, detail: `${(psi.lcpMs / 1000).toFixed(1)} seconds` };
  } else checks.psi_lcp = unknown;
  if (psi.cls !== null) {
    const s = lerpDown(psi.cls, t.clsGood, t.clsPoor);
    checks.psi_cls = { status: s >= 0.6 ? 'found' : 'notFound', score: s, detail: `shift score ${psi.cls.toFixed(2)}` };
  } else checks.psi_cls = unknown;
}
