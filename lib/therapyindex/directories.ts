import type { OrganicKind } from './types';

/** Therapist directories and marketplaces. Matched against the result's domain (subdomains count). */
export const DIRECTORY_DOMAINS: Record<string, string> = {
  'psychologytoday.com': 'Psychology Today',
  'headway.co': 'Headway',
  'zocdoc.com': 'Zocdoc',
  'growtherapy.com': 'Grow Therapy',
  'helloalma.com': 'Alma',
  'betterhelp.com': 'BetterHelp',
  'talkspace.com': 'Talkspace',
  'therapyden.com': 'TherapyDen',
  'goodtherapy.org': 'GoodTherapy',
  'therapytribe.com': 'TherapyTribe',
  'openpathcollective.org': 'Open Path',
  'zencare.co': 'Zencare',
  'rula.com': 'Rula',
  'thriveworks.com': 'Thriveworks',
  'choosingtherapy.com': 'Choosing Therapy',
  'healthgrades.com': 'Healthgrades',
  'yelp.com': 'Yelp',
  'mentalhealthmatch.com': 'Mental Health Match',
  'therapyportal.com': 'TherapyPortal',
  'sondermind.com': 'SonderMind',
  'cerebral.com': 'Cerebral',
  'brightside.com': 'Brightside',
  'vitals.com': 'Vitals',
  'webmd.com': 'WebMD',
  'facebook.com': 'Facebook',
  'linkedin.com': 'LinkedIn',
};

export function normaliseDomain(urlOrDomain: string | null | undefined): string | null {
  if (!urlOrDomain) return null;
  let host = urlOrDomain.trim().toLowerCase();
  try {
    host = new URL(host.includes('://') ? host : `https://${host}`).hostname;
  } catch {
    return null;
  }
  return host.replace(/^www\./, '') || null;
}

/** The directory's display name when the domain is a known directory, else null. */
export function directoryName(domain: string | null): string | null {
  if (!domain) return null;
  for (const [d, name] of Object.entries(DIRECTORY_DOMAINS)) {
    if (domain === d || domain.endsWith(`.${d}`)) return name;
  }
  return null;
}

export function classifyDomain(domain: string | null, practiceDomains: Set<string>): OrganicKind {
  if (directoryName(domain)) return 'directory';
  if (domain && practiceDomains.has(domain)) return 'local practice';
  return 'other';
}
