/* Sanity checks on lib/scorecard/rules.ts, so a tuning edit cannot quietly break the house rules:
     npm run scorecard:check
   Checks ids and weights, that every category has items, and that no copy has an em dash, an AI-jargon word
   or advice to ask clients for reviews or testimonials. */
import { CATEGORIES, CHECKS, QUESTIONS, TIERS } from '../../lib/scorecard/rules';

const problems: string[] = [];
const texts: { where: string; text: string }[] = [];

const ids = new Set<string>();
for (const c of CHECKS) {
  if (ids.has(c.id)) problems.push(`duplicate id ${c.id}`);
  ids.add(c.id);
  if (!(c.weight > 0)) problems.push(`${c.id}: weight must be above 0`);
  texts.push({ where: c.id, text: [c.label, c.found, c.notFound, c.fix.why, c.fix.what].join(' ') });
}
for (const q of QUESTIONS) {
  if (ids.has(q.id)) problems.push(`duplicate id ${q.id}`);
  ids.add(q.id);
  if (q.category && !(q.weight && q.weight > 0)) problems.push(`${q.id}: scored question needs a weight`);
  for (const o of q.options) if (o.score !== undefined && (o.score < 0 || o.score > 1)) problems.push(`${q.id}/${o.id}: score outside 0 to 1`);
  texts.push({ where: q.id, text: [q.prompt, q.help ?? '', q.label ?? '', q.fix?.why ?? '', q.fix?.what ?? '', ...q.options.map((o) => o.label)].join(' ') });
}
for (const cat of CATEGORIES) {
  const n = CHECKS.filter((c) => c.category === cat.id).length + QUESTIONS.filter((q) => q.category === cat.id).length;
  if (n === 0) problems.push(`category ${cat.id} has no items`);
  texts.push({ where: cat.id, text: `${cat.label} ${cat.blurb}` });
}
for (const t of TIERS) texts.push({ where: `tier ${t.id}`, text: `${t.name} ${t.description}` });

const BANNED = /\b(leverage|utilize|robust|comprehensive|delve|seamless|streamline|cutting-edge|unlock|elevate|empower|testimonials?|reviews?)\b/i;
for (const { where, text } of texts) {
  if (/[—–]/.test(text)) problems.push(`${where}: has an em or en dash`);
  const hit = BANNED.exec(text);
  if (hit) problems.push(`${where}: uses "${hit[0]}"`);
}

const pickedQuestions = QUESTIONS.filter((q) => !q.answersCheck && !q.onlyIfPlatformUnknown).length;
console.log(`${CHECKS.length} checks, ${QUESTIONS.length} questions (${pickedQuestions} always asked), ${CATEGORIES.length} categories`);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('rules ok');
