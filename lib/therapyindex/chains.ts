/* ==========================================================================
   National chains and telehealth networks. A Google Maps result whose website is on one of these domains
   (or whose name starts with one of the name prefixes) stays in practices[] but is flagged isChain: it is
   skipped for Lighthouse and never takes a top-10 or leader slot. Add to this list as you spot more in results.
   Many of these are also marketplaces in DIRECTORY_DOMAINS (directories.ts): there they tag organic results.
   ========================================================================== */

export type Chain = {
  name: string;
  /** Website domains (subdomains count). */
  domains: string[];
  /** Lowercase name starts that identify a location without a website. */
  namePrefixes?: string[];
};

export const CHAINS: Chain[] = [
  { name: 'Thriveworks', domains: ['thriveworks.com'], namePrefixes: ['thriveworks'] },
  { name: 'LifeStance Health', domains: ['lifestance.com'], namePrefixes: ['lifestance'] },
  { name: 'Mindpath Health', domains: ['mindpath.com'], namePrefixes: ['mindpath'] },
  { name: 'Talkspace', domains: ['talkspace.com'], namePrefixes: ['talkspace'] },
  { name: 'BetterHelp', domains: ['betterhelp.com'], namePrefixes: ['betterhelp'] },
  { name: 'Grow Therapy', domains: ['growtherapy.com'], namePrefixes: ['grow therapy'] },
  { name: 'Headway', domains: ['headway.co'], namePrefixes: ['headway'] },
  { name: 'Rula', domains: ['rula.com'], namePrefixes: ['rula'] },
  { name: 'Alma', domains: ['helloalma.com'], namePrefixes: ['alma '] },
  { name: 'SonderMind', domains: ['sondermind.com'], namePrefixes: ['sondermind'] },
  { name: 'Talkiatry', domains: ['talkiatry.com'], namePrefixes: ['talkiatry'] },
  { name: 'Cerebral', domains: ['cerebral.com'], namePrefixes: ['cerebral'] },
  { name: 'Brightside', domains: ['brightside.com'], namePrefixes: ['brightside health'] },
  { name: 'Charlie Health', domains: ['charliehealth.com'], namePrefixes: ['charlie health'] },
  { name: 'Ellie Mental Health', domains: ['elliementalhealth.com'], namePrefixes: ['ellie mental health'] },
  { name: 'Lyra Health', domains: ['lyrahealth.com'], namePrefixes: ['lyra health'] },
  { name: 'Spring Health', domains: ['springhealth.com'], namePrefixes: ['spring health'] },
  { name: 'Two Chairs', domains: ['twochairs.com'], namePrefixes: ['two chairs'] },
  { name: 'Iris Telehealth', domains: ['iristelehealth.com'], namePrefixes: ['iris telehealth'] },
  { name: 'Amwell', domains: ['amwell.com'], namePrefixes: ['amwell'] },
  { name: 'Teladoc / BetterHelp', domains: ['teladoc.com'], namePrefixes: ['teladoc'] },
  { name: 'MDLive', domains: ['mdlive.com'], namePrefixes: ['mdlive'] },
  { name: 'Newport Healthcare', domains: ['newporthealthcare.com'], namePrefixes: ['newport academy', 'newport healthcare'] },
  { name: 'Pathlight', domains: ['pathlightmhs.com'], namePrefixes: ['pathlight'] },
  { name: 'LifeBulb', domains: ['lifebulb.com'], namePrefixes: ['lifebulb'] },
  { name: 'Hightop Health (formerly Roots Behavioral Health)', domains: ['hightophealth.com', 'rootsbehavioralhealth.com'], namePrefixes: ['hightop health', 'roots behavioral health'] },
  { name: 'Mental Health Match', domains: ['mentalhealthmatch.com'] },
];

export function chainFor(domain: string | null, name: string): Chain | null {
  const lower = name.toLowerCase();
  for (const c of CHAINS) {
    if (domain && c.domains.some((d) => domain === d || domain.endsWith(`.${d}`))) return c;
    if (c.namePrefixes?.some((p) => lower.startsWith(p))) return c;
  }
  return null;
}
