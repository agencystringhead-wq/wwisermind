/* "Medical" practices: interventional psychiatry clinics (ketamine, TMS, Spravato, infusions ...) and psychiatry-only
   practices with no therapy or counseling offering. They stay in the directory with their real score but never take a
   top-10 or leader slot (same treatment as chains). Every flagged practice is listed, with the reason, in
   data/therapyindex/review/<market>-medical.json. */

const INTERVENTIONAL = /ketamine|\btms\b|transcranial|spravato|esketamine|infusion|neurostimulation|stellate/i;
const PSYCHIATRY = /psychiatr/i;
/** Anything that says the practice also offers talk therapy. "Mental health clinic/service" is too generic to count. */
const THERAPY = /therap|counsel|psycholog|psychotherap|social work|marriage|family/i;

/** Why the practice counts as medical, or null when it does not. */
export function medicalReason(name: string, categories: string[]): string | null {
  const text = `${name} | ${categories.join(' | ')}`;
  const interventional = text.match(INTERVENTIONAL);
  if (interventional) return `interventional treatment (${interventional[0].toLowerCase()})`;
  if (PSYCHIATRY.test(text) && !THERAPY.test(text)) return 'psychiatry only (no therapy or counseling terms)';
  return null;
}
