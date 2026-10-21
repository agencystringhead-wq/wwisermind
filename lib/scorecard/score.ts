import {
  CATEGORIES,
  CHECKS,
  FAIL_BELOW,
  MAX_FIXES,
  QUESTIONS,
  RULES_VERSION,
  TIERS,
  type Question,
} from './rules';
import type {
  Answers,
  CategoryId,
  CheckResult,
  Fix,
  Report,
  ReportCheck,
  ScanResult,
  ScoredCategory,
} from './types';

/* Turns a scan and the quiz answers into a report. No numbers live here: see rules.ts. */

type Item = {
  id: string;
  category: CategoryId;
  weight: number;
  label: string;
  score: number | null;
  fix: { why: string; what: string };
  text: string;
  status: 'found' | 'notFound' | 'unknown';
  source: 'scan' | 'you';
};

/** The questions this visitor is asked, in order, given what the scan found. */
export function questionsFor(scan: ScanResult | null): Question[] {
  return QUESTIONS.filter((q) => {
    if (q.onlyIfPlatformUnknown && scan?.platform) return false;
    if (q.answersCheck) {
      const known = scan?.checks[q.answersCheck];
      if (known && known.status !== 'unknown') return false;
    }
    return true;
  });
}

/** Keeps only answers that match a real question and option. Returns null when an answer is invalid. */
export function cleanAnswers(raw: unknown, scan: ScanResult | null): Answers | null {
  if (!raw || typeof raw !== 'object') return null;
  const input = raw as Record<string, unknown>;
  const out: Answers = {};
  for (const q of questionsFor(scan)) {
    const value = input[q.id];
    if (typeof value !== 'string' || !q.options.some((o) => o.id === value)) return null;
    out[q.id] = value;
  }
  return out;
}

function selfCheck(answer: string | undefined): CheckResult {
  if (answer === 'yes') return { status: 'found', score: 1 };
  if (answer === 'no') return { status: 'notFound', score: 0 };
  return { status: 'unknown', score: 0 };
}

export function buildReport(args: {
  id: string;
  websiteUrl: string;
  practiceName: string;
  scan: ScanResult | null;
  answers: Answers;
  now?: number;
}): Report {
  const { scan, answers } = args;
  const items: Item[] = [];

  for (const rule of CHECKS) {
    if (rule.skipWhen && rule.skipWhen.values.includes(answers[rule.skipWhen.question] ?? '')) continue;
    let result: CheckResult | undefined = scan?.checks[rule.id];
    let source: 'scan' | 'you' = 'scan';
    if (!result || result.status === 'unknown') {
      const self = QUESTIONS.find((q) => q.answersCheck === rule.id);
      if (self && answers[self.id] !== undefined) {
        result = selfCheck(answers[self.id]);
        source = 'you';
      }
    }
    const status = result?.status ?? 'unknown';
    items.push({
      id: rule.id,
      category: rule.category,
      weight: rule.weight,
      label: rule.label,
      score: status === 'unknown' ? null : result!.score,
      fix: rule.fix,
      status,
      source,
      text:
        status === 'found'
          ? rule.found
          : status === 'notFound'
            ? rule.notFound
            : 'We couldn’t check this one.',
    });
  }

  for (const q of QUESTIONS) {
    if (!q.category || !q.weight || !q.fix || !q.reportText) continue;
    const option = q.options.find((o) => o.id === answers[q.id]);
    if (!option || option.score === undefined) continue;
    const good = option.score >= FAIL_BELOW;
    items.push({
      id: q.id,
      category: q.category,
      weight: q.weight,
      label: q.label ?? q.prompt,
      score: option.score,
      fix: q.fix,
      status: good ? 'found' : 'notFound',
      source: 'you',
      text: good ? q.reportText.good : q.reportText.gap,
    });
  }

  const categories: ScoredCategory[] = CATEGORIES.map((cat) => {
    const known = items.filter((i) => i.category === cat.id && i.score !== null);
    const total = known.reduce((sum, i) => sum + i.weight, 0);
    const score = total === 0 ? null : Math.round((100 * known.reduce((s, i) => s + i.weight * i.score!, 0)) / total);
    return { id: cat.id, label: cat.label, score, note: cat.blurb };
  });

  const scored = categories
    .map((c) => ({ c, w: CATEGORIES.find((x) => x.id === c.id)!.weight }))
    .filter((x) => x.c.score !== null);
  const weightSum = scored.reduce((s, x) => s + x.w, 0);
  const overall = weightSum === 0 ? null : Math.round(scored.reduce((s, x) => s + x.w * x.c.score!, 0) / weightSum);

  /* Fix list: what each gap would move the overall score, biggest first. */
  const catWeight = new Map(CATEGORIES.map((c) => [c.id, c.weight]));
  const catTotals = new Map<CategoryId, number>();
  for (const i of items) {
    if (i.score === null) continue;
    catTotals.set(i.category, (catTotals.get(i.category) ?? 0) + i.weight);
  }
  const fixes: Fix[] = items
    .filter((i) => i.score !== null && i.score < FAIL_BELOW)
    .map((i) => ({
      i,
      impact: (i.weight / (catTotals.get(i.category) || 1)) * (catWeight.get(i.category) ?? 0) * (1 - i.score!),
    }))
    .sort((a, b) => b.impact - a.impact)
    .slice(0, MAX_FIXES)
    .map(({ i }) => ({ id: i.id, label: i.label, why: i.fix.why, what: i.fix.what, category: i.category }));

  const tier =
    overall === null ? null : [...TIERS].reverse().find((t) => overall >= t.min) ?? TIERS[0];

  const checks: ReportCheck[] = items.map((i) => ({
    id: i.id,
    category: i.category,
    label: i.label,
    status: i.status,
    text: i.text,
    source: i.source,
  }));

  let scanNote: string | null = null;
  if (!scan) scanNote = 'We didn’t scan your site, so this score comes from your answers only.';
  else if (scan.blocked)
    scanNote = 'We couldn’t read your site automatically, so this score leans on your answers.';
  else if (scan.partial)
    scanNote = 'Some checks ran out of time, so a few items below are marked as not checked.';

  return {
    id: args.id,
    createdAt: args.now ?? Date.now(),
    rulesVersion: RULES_VERSION,
    websiteUrl: args.websiteUrl,
    practiceName: args.practiceName,
    overall,
    tier: tier ? { id: tier.id, name: tier.name, description: tier.description } : null,
    categories,
    fixes,
    checks,
    scanNote,
    privacyFlag: scan?.privacyFlag ?? 'unknown',
    platform: scan?.platform ?? (answersPlatform(answers) as Report['platform']),
    psychologyTodayUrl: scan?.psychologyTodayUrl ?? null,
    hasOffice: answers.office === 'in_person' || answers.office === 'both',
  };
}

function answersPlatform(answers: Answers): string | null {
  const p = answers.platform;
  return p === 'wordpress' || p === 'wix' || p === 'squarespace' || p === 'other' ? p : null;
}
