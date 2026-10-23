/* The Good Faith Estimate's data and arithmetic. Money is whole cents throughout, so totals never pick up rounding noise. */

export const SERVICES = [
  { code: '90791', name: 'Intake/Diagnostic Evaluation', short: 'Psychiatric diagnostic evaluation' },
  { code: '90837', name: 'Psychotherapy, 60 minutes', short: 'Psychotherapy, 60 min' },
  { code: '90834', name: 'Psychotherapy, 45 minutes', short: 'Psychotherapy, 45 min' },
  { code: '90832', name: 'Psychotherapy, 30 minutes', short: 'Psychotherapy, 30 min' },
  { code: '90847', name: 'Family/Couples Therapy, with client', short: 'Family/couples therapy, with client' },
  { code: '90846', name: 'Family/Couples Therapy, without client', short: 'Family/couples therapy, without client' },
  { code: '90853', name: 'Group Therapy', short: 'Group psychotherapy' },
] as const;
export type ServiceCode = (typeof SERVICES)[number]['code'];
export const serviceByCode = (code: string) => SERVICES.find((s) => s.code === code);

export const FREQUENCIES = [
  { id: 'weekly', label: 'Every week', perYear: 52 },
  { id: 'biweekly', label: 'Every 2 weeks', perYear: 26 },
  { id: 'monthly', label: 'Once a month', perYear: 12 },
] as const;
export type FrequencyId = (typeof FREQUENCIES)[number]['id'];
export const MAX_MONTHS = 12;
export const MAX_SESSIONS = 520;
export const MAX_ROWS = 12;

/** How many sessions fit in `months` at the given rhythm: 12 months weekly is 52, every 2 weeks 26, monthly 12. */
export function sessionsFor(freq: FrequencyId, months: number): number {
  const f = FREQUENCIES.find((x) => x.id === freq);
  if (!f || !Number.isFinite(months) || months < 1) return 0;
  return Math.max(1, Math.round((f.perYear * Math.min(months, MAX_MONTHS)) / 12));
}

/** "125", "125.5", "$1,250.00" to cents; null if it is not a usable amount. */
export function parseCents(input: string): number | null {
  const t = input.replace(/[$,\s]/g, '');
  if (!/^\d{1,7}(\.\d{1,2})?$/.test(t)) return null;
  return Math.round(Number(t) * 100);
}

export const formatMoney = (cents: number) =>
  `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export type ServiceRow = { id: string; code: string; fee: string; sessions: string };
export type Line = { code: string; name: string; feeCents: number; sessions: number; totalCents: number };

/** The rows that are filled in, as priced lines. A row is ignored while it is empty, and `null` here means a row is half filled. */
export function priceRows(rows: ServiceRow[]): { lines: Line[]; totalCents: number; incomplete: boolean } {
  const lines: Line[] = [];
  let incomplete = false;
  for (const r of rows) {
    const svc = serviceByCode(r.code);
    const feeCents = parseCents(r.fee);
    const sessions = /^\d{1,3}$/.test(r.sessions.trim()) ? Number(r.sessions.trim()) : 0;
    if (!svc && !r.fee.trim() && !r.sessions.trim()) continue;
    if (!svc || feeCents === null || sessions < 1 || sessions > MAX_SESSIONS) {
      incomplete = true;
      continue;
    }
    lines.push({ code: svc.code, name: svc.name, feeCents, sessions, totalCents: feeCents * sessions });
  }
  return { lines, totalCents: lines.reduce((n, l) => n + l.totalCents, 0), incomplete };
}

export type Estimate = {
  practiceName: string;
  providerName: string;
  credentials: string;
  npi: string;
  tin: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  clientName: string;
  clientDob: string; // yyyy-mm-dd
  /** Optional, as on the CMS form. Like the rest of the client's details they stay in the browser. */
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  firstSession: string; // yyyy-mm-dd
  issued: string; // yyyy-mm-dd
  diagnosis: string;
  rows: ServiceRow[];
};

export type Errors = Partial<Record<keyof Estimate | 'rows', string>>;

const ISO = /^\d{4}-\d{2}-\d{2}$/;
const validDate = (s: string) => ISO.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`));

export function validate(e: Estimate): Errors {
  const err: Errors = {};
  const need = (k: keyof Estimate, msg: string) => {
    const v = e[k];
    if (typeof v === 'string' && !v.trim()) err[k] = msg;
  };
  need('practiceName', 'Please add your practice name.');
  need('providerName', 'Please add the provider’s name.');
  need('street', 'Please add the street address.');
  need('city', 'Please add the city.');
  need('state', 'Please add the state.');
  need('zip', 'Please add the ZIP code.');
  need('phone', 'Please add a phone number.');
  need('email', 'Please add an email address.');
  need('clientName', 'Please add the client’s name.');
  if (e.email.trim() && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(e.email.trim())) err.email = 'That email address doesn’t look right.';
  if (e.clientEmail.trim() && !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(e.clientEmail.trim())) err.clientEmail = 'That email address doesn’t look right.';
  if (!/^\d{10}$/.test(e.npi.replace(/\s/g, ''))) err.npi = 'An NPI has 10 digits.';
  if (!/^\d{2}-?\d{7}$/.test(e.tin.trim()) && !/^\d{3}-?\d{2}-?\d{4}$/.test(e.tin.trim())) err.tin = 'A tax ID has 9 digits, such as 12-3456789.';
  if (!validDate(e.clientDob)) err.clientDob = 'Please add the client’s date of birth.';
  if (!validDate(e.firstSession)) err.firstSession = 'Please add the date of the first session.';
  if (!validDate(e.issued)) err.issued = 'Please add the date this estimate is issued.';
  const priced = priceRows(e.rows);
  if (!priced.lines.length) err.rows = 'Please add at least one service with a fee and a number of sessions.';
  else if (priced.incomplete) err.rows = 'One of your services is missing a service, a fee or a number of sessions.';
  return err;
}

/** "2026-10-23" as "October 23, 2026" (the date is read as written, with no time zone shift). */
export function longDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}
export function shortDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${m}/${d}/${y}`;
}
