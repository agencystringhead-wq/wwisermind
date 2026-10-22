/* Shared types for the website scorecard. Used by the Pages Functions, the scoring code and the UI. */

export type CategoryId = 'speed' | 'found' | 'booking' | 'trust' | 'growth';

export type CheckId =
  | 'psi_perf'
  | 'psi_lcp'
  | 'psi_cls'
  | 'viewport'
  | 'https'
  | 'title'
  | 'meta_desc'
  | 'single_h1'
  | 'schema'
  | 'sitemap'
  | 'robots_ok'
  | 'img_alt'
  | 'booking_cta'
  | 'tel_link'
  | 'contact_page'
  | 'fees_info'
  | 'accepting'
  | 'telehealth'
  | 'bios_credentials'
  | 'privacy_policy'
  | 'crisis_info';

export type CheckStatus = 'found' | 'notFound' | 'unknown';

export type CheckResult = {
  status: CheckStatus;
  /** 0 to 1. Only meaningful when status is not 'unknown'. */
  score: number;
  /** A short plain note, such as "62 out of 100 on a phone". */
  detail?: string;
};

export type Platform = 'wordpress' | 'wix' | 'squarespace' | 'other';

export type ScanResult = {
  /** The address we scanned, as we normalized it. */
  url: string;
  finalUrl: string | null;
  /** True when we could not read the homepage (challenge page, 403, timeout, not HTML). */
  blocked: boolean;
  blockedReason: string | null;
  /** True when something timed out or failed and the result is incomplete. */
  partial: boolean;
  platform: Platform | null;
  psychologyTodayUrl: string | null;
  checks: Partial<Record<CheckId, CheckResult>>;
  /** Soft warning about open text fields on a contact form. 'unknown' when there was no form to read. */
  privacyFlag: 'flag' | 'ok' | 'unknown';
  pagesChecked: string[];
  metrics: { perf: number | null; lcpMs: number | null; cls: number | null };
  scannedAt: number;
  /** Speed (PageSpeed) runs separately: 'pending' until /api/scorecard/speed has filled it in. */
  speed?: 'pending' | 'done' | 'failed';
};

export type Answers = Record<string, string>;

export type ScoredCategory = {
  id: CategoryId;
  label: string;
  /** 0 to 100, or null when nothing in the category could be checked or answered. */
  score: number | null;
  note: string;
};

export type Fix = {
  id: string;
  label: string;
  why: string;
  what: string;
  category: CategoryId;
};

export type ReportCheck = {
  id: string;
  category: CategoryId;
  label: string;
  status: CheckStatus;
  text: string;
  source: 'scan' | 'you';
};

export type Report = {
  id: string;
  createdAt: number;
  rulesVersion: number;
  websiteUrl: string;
  practiceName: string;
  overall: number | null;
  tier: { id: string; name: string; description: string } | null;
  categories: ScoredCategory[];
  fixes: Fix[];
  checks: ReportCheck[];
  scanNote: string | null;
  privacyFlag: 'flag' | 'ok' | 'unknown';
  platform: Platform | null;
  psychologyTodayUrl: string | null;
  /** True when they told us they have a physical office. Drives the local map tool line. */
  hasOffice: boolean;
};
