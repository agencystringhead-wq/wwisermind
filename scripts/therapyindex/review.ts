import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { normaliseDomain, practiceKey } from '../../lib/therapyindex/directories';
import { MARKETS } from '../../lib/therapyindex/markets';
import { isRankEligible } from '../../lib/therapyindex/score';
import type { Decision, Snapshot } from '../../lib/therapyindex/types';
import { buildResult, writeResult } from './normalise';
import { DATA_DIR, latestRawDate, RawStore } from './store';

/* Manual review of each market's top 30 eligible practices.
     npm run therapyindex:review-export   writes data/therapyindex/review/top30.csv with an empty "decision" column
     npm run therapyindex:review-apply    reads your decisions from that CSV (or the file path given after --) into
                                          lib/therapyindex/overrides.ts, rebuilds every snapshot from cache (free) and rewrites the CSV
   decision: keep | chain | medical | nonprofit | exclude   (blank = no change) */

const CSV_FILE = path.join(DATA_DIR, 'review', 'top30.csv');
const OVERRIDES_FILE = path.join(process.cwd(), 'lib', 'therapyindex', 'overrides.ts');
const DECISIONS: Decision[] = ['keep', 'chain', 'medical', 'nonprofit', 'exclude'];
const HEADER = ['market', 'rank', 'key', 'name', 'website', 'google_categories', 'rating', 'reviews', 'score', 'current_tags', 'decision'];

const esc = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((x) => x !== '')) rows.push(row);
      row = [];
    } else cell += c;
  }
  row.push(cell);
  if (row.some((x) => x !== '')) rows.push(row);
  return rows;
}

function readSnapshot(slug: string): Snapshot | null {
  const file = path.join(DATA_DIR, `${slug}.json`);
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, 'utf8')) as Snapshot) : null;
}

function exportCsv(): string {
  const lines = [HEADER.join(',')];
  for (const m of MARKETS) {
    const snap = readSnapshot(m.slug);
    if (!snap) continue;
    snap.practices.filter(isRankEligible).slice(0, 30).forEach((p, i) => {
      const tags = [
        p.isChain && 'chain', p.isMedical && 'medical', p.isNonprofit && 'nonprofit',
        !p.hasMapListing && 'no map listing',
        Object.values(p.mapRankBySearch).some((r) => r <= 3) && 'in map pack',
        p.aiMentions.chatgpt + p.aiMentions.claude > 0 && 'named by AI',
        p.website && !p.lighthouse && 'lighthouse not tested',
        p.manualDecision && `decided: ${p.manualDecision}`,
      ].filter(Boolean);
      lines.push([
        m.slug, i + 1, practiceKey(normaliseDomain(p.website), p.mapsCid), p.name, p.website, p.categories.join(' | '),
        p.rating, p.reviewCount ?? 0, p.visibilityScore, tags.join('; '), '',
      ].map(esc).join(','));
    });
  }
  fs.mkdirSync(path.dirname(CSV_FILE), { recursive: true });
  try {
    fs.writeFileSync(CSV_FILE, lines.join('\n') + '\n');
    return CSV_FILE;
  } catch (e) {
    // A spreadsheet that has the file open locks it (Excel on Windows). Write the fresh list beside it instead of failing.
    const code = (e as NodeJS.ErrnoException).code;
    if (code !== 'EBUSY' && code !== 'EPERM' && code !== 'EACCES') throw e;
    const next = path.join(path.dirname(CSV_FILE), 'top30-next.csv');
    fs.writeFileSync(next, lines.join('\n') + '\n');
    console.warn(`top30.csv is open in another program and could not be replaced; wrote ${next} instead. Close the spreadsheet and rename it.`);
    return next;
  }
}

/** Existing entries of the PRACTICE_DECISIONS block, with their trailing comments, so hand edits survive. */
function existingBlock(source: string): Map<string, { decision: Decision; note: string }> {
  const entries = new Map<string, { decision: Decision; note: string }>();
  const block = source.match(/\/\/ BEGIN PRACTICE_DECISIONS([\s\S]*?)\/\/ END PRACTICE_DECISIONS/);
  // Windows checkouts can leave CRLF line endings: split on either, or every line would fail the pattern and be dropped.
  const lines = (block?.[1] ?? '').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*'([^']+)':\s*'(\w+)',(?:\s*\/\/\s*(.*))?$/);
    if (m && DECISIONS.includes(m[2] as Decision)) entries.set(m[1], { decision: m[2] as Decision, note: m[3] ?? '' });
  }
  // Never rewrite the block if a line that looks like an entry was not understood: that would silently delete a decision.
  const looksLikeEntry = lines.filter((l) => /^\s*'[^']+'\s*:/.test(l)).length;
  if (looksLikeEntry !== entries.size) {
    throw new Error(`overrides.ts: ${looksLikeEntry} decision lines but only ${entries.size} understood; fix the block by hand first.`);
  }
  return entries;
}

function applyDecisions(file: string = CSV_FILE): void {
  if (!fs.existsSync(file)) throw new Error(`${file} not found. Run therapyindex:review-export first.`);
  const rows = parseCsv(fs.readFileSync(file, 'utf8'));
  const head = rows[0];
  const col = (name: string) => head.indexOf(name);
  const [iKey, iName, iDecision, iMarket] = [col('key'), col('name'), col('decision'), col('market')];
  if ([iKey, iName, iDecision].some((i) => i < 0)) throw new Error('CSV header is missing key, name or decision.');

  const source = fs.readFileSync(OVERRIDES_FILE, 'utf8');
  const entries = existingBlock(source);
  const changes: string[] = [];
  for (const r of rows.slice(1)) {
    const decision = (r[iDecision] ?? '').trim().toLowerCase();
    if (!decision) continue;
    if (!DECISIONS.includes(decision as Decision)) throw new Error(`Row "${r[iName]}" (${r[iMarket]}): "${decision}" is not one of ${DECISIONS.join(' / ')}.`);
    const key = r[iKey];
    if (!key) throw new Error(`Row "${r[iName]}" has no key.`);
    if (entries.get(key)?.decision !== decision) changes.push(`${r[iName]} -> ${decision}`);
    entries.set(key, { decision: decision as Decision, note: r[iName] });
  }

  const body = [...entries.entries()]
    .map(([key, { decision, note }]) => `  '${key}': '${decision}',${note ? ` // ${note.replace(/\s+/g, ' ')}` : ''}`)
    .join('\n');
  const next = source.replace(
    /\/\/ BEGIN PRACTICE_DECISIONS[\s\S]*?\/\/ END PRACTICE_DECISIONS/,
    `// BEGIN PRACTICE_DECISIONS\nexport const PRACTICE_DECISIONS: Record<string, Decision> = {\n${body}\n};\n// END PRACTICE_DECISIONS`,
  );
  fs.writeFileSync(OVERRIDES_FILE, next);
  console.log(changes.length ? `Applied ${changes.length} decision(s):\n  ${changes.join('\n  ')}` : 'No new decisions in the CSV.');
  console.log(`overrides.ts now holds ${entries.size} practice decision(s).`);
}

/** Rebuild every market from its newest raw cache. Runs in a fresh process so the updated overrides.ts is the one loaded. */
async function rebuildAll(): Promise<void> {
  for (const m of MARKETS) {
    const date = latestRawDate(m.slug);
    if (!date) continue;
    const result = buildResult(m, date, new RawStore(m.slug, date));
    writeResult(result);
    const s = result.snapshot.summary;
    console.log(`${m.slug} (${date}): ${s.totalPractices} practices, ${s.chainLocations} chains, ${s.medicalPractices} medical, ${s.nonprofitPractices} nonprofit, ${s.fewReviewPractices} few reviews`);
  }
}

async function main(): Promise<void> {
  const command = process.argv[2];
  if (command === 'export') {
    console.log(`Wrote ${exportCsv()}`);
  } else if (command === 'apply') {
    // An optional path reads decisions from another file: `npm run therapyindex:review-apply -- path/to/decided.csv`.
    applyDecisions(process.argv[3] ? path.resolve(process.argv[3]) : CSV_FILE);
    // Re-import overrides in a child process: this process still holds the old PRACTICE_DECISIONS.
    const run = spawnSync(process.execPath, ['--import', 'tsx', 'scripts/therapyindex/review.ts', 'rebuild'], { stdio: 'inherit' });
    if (run.status !== 0) process.exit(run.status ?? 1);
  } else if (command === 'rebuild') {
    await rebuildAll();
    console.log(`Wrote ${exportCsv()} (decision column cleared)`);
  } else {
    console.error('Usage: tsx scripts/therapyindex/review.ts export | apply');
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
