/* Scan one or more sites from the command line and print the scorecard. For testing the scanner:
     PSI_API_KEY=... npx tsx scripts/scorecard/scan-cli.ts example.com
   Without PSI_API_KEY the speed checks are marked "couldn't check". */
import { buildReport, cleanAnswers, questionsFor } from '../../lib/scorecard/score';
import { runScan } from '../../lib/scorecard/scan';

const urls = process.argv.slice(2);
if (!urls.length) {
  console.error('usage: tsx scripts/scorecard/scan-cli.ts <url> [<url> ...]');
  process.exit(1);
}

async function main() {
for (const u of urls) {
  const t0 = Date.now();
  const scan = await runScan(u, { psiKey: process.env.PSI_API_KEY });
  console.log(`\n=== ${u} (${((Date.now() - t0) / 1000).toFixed(1)}s) ===`);
  console.log(`blocked: ${scan.blocked}${scan.blockedReason ? ` (${scan.blockedReason})` : ''}  partial: ${scan.partial}  platform: ${scan.platform}  PT: ${scan.psychologyTodayUrl ?? '-'}  privacy flag: ${scan.privacyFlag}`);
  console.log('pages:', scan.pagesChecked.join(', '));
  for (const [id, c] of Object.entries(scan.checks)) console.log(`  ${id.padEnd(17)} ${c.status.padEnd(9)} ${c.score.toFixed(2)} ${c.detail ?? ''}`);
  /* A neutral set of answers, to see the shape of the report. */
  const answers: Record<string, string> = {};
  /* A middling set of answers: each scored question gets the option nearest 0.7, context questions the first option. */
  for (const q of questionsFor(scan)) {
    const scored = q.options.filter((o) => o.score !== undefined);
    answers[q.id] = scored.length ? scored.reduce((a, b) => (Math.abs(b.score! - 0.7) < Math.abs(a.score! - 0.7) ? b : a)).id : q.options[0].id;
  }
  const report = buildReport({ id: 'test', websiteUrl: scan.url, practiceName: 'Test', scan, answers: cleanAnswers(answers, scan) ?? {} });
  console.log(`overall ${report.overall} (${report.tier?.name})`, report.categories.map((c) => `${c.id}:${c.score}`).join(' '));
  console.log('fixes:', report.fixes.map((f) => f.id).join(', '));
}
}

main();
