import type { Decision, OverrideTag } from './types';

/* ==========================================================================
   Manual corrections, applied by the normaliser on its next run (npm run therapyindex:normalise).
   ========================================================================== */

/** Organic results: bare domain (no www) -> the tag it should always get. Wins over everything, including the
    automatic directory list. Candidates are in data/therapyindex/review/<market>.json. */
export const DOMAIN_OVERRIDES: Record<string, OverrideTag> = {
  // Not local practices (flagged in the Austin review):
  'soundsofsaving.org': 'other',
  'therapylab.com': 'other',
  // 'example-counseling.com': 'local-no-map',
};

/** Names in AI answers to ignore completely (not a practice, not an institution worth recording). Matched on the
    normalised name, so spelling and "The" / "LLC" differences do not matter. */
export const AI_NAME_EXCLUSIONS: string[] = [
  'National Social Anxiety Center', // franchise network
];

/** Decisions on individual practices. Key: the practice's website domain, or "cid:<Google Maps CID>" when it has no
    website of its own (or shares one with a directory or chain).
      keep      independent practice: clears any automatic chain / medical / nonprofit tag
      chain     treat as a national or multi-location chain
      medical   interventional psychiatry or psychiatry-only
      nonprofit nonprofit or community organisation
      exclude   not a licensed practice: removed from the snapshot entirely
    chain, medical and nonprofit practices stay in the directory with their real score but never take a top-10 or
    leader slot. The block below is rewritten by `npm run therapyindex:review-apply` from the "decision" column of
    data/therapyindex/review/top30.csv; entries you add by hand are kept. */
// BEGIN PRACTICE_DECISIONS
export const PRACTICE_DECISIONS: Record<string, Decision> = {
  'suzannebartholomewlcsw.com': 'keep', // Suzanne Bartholomew, LCSW (therapist who also offers ketamine-assisted therapy)
  'texaspsychiatrygroup.com': 'medical', // Texas Psychiatry Group
  'familyhouston.org': 'nonprofit', // Family Houston
  'lifecoachaustin.com': 'exclude', // Life Coach Austin (not a licensed practice)
  'therapybyangelina.com': 'keep', // Therapy by Dr. Angelina
  'mymoderntherapy.com': 'keep', // Modern Therapy
  'griefrecoveryhouston.com': 'keep', // Grief Recovery Center
  'eddinscounseling.com': 'keep', // Eddins Counseling & Therapy Group - Montrose
  'resiliencecounselinghtx.com': 'keep', // Resilience Counseling and Wellness
  'jenk.global': 'keep', // Jenifer Knighton Counseling and Educational Services
  'onebehavioralhealth.com': 'medical', // One Behavioral Health
  'houston-therapy.com': 'keep', // Houston Therapy
  'thrivingchildcenter.com': 'keep', // Thriving Child Center PLLC
  'kevinsmithphd.com': 'keep', // Kevin G. Smith, Ph.D. And Associates P.C.
  'thelovettcenter.com': 'keep', // The Lovett Center
  'wilsoncounseling.org': 'keep', // Wilson Counseling
  'geodehealth.com': 'chain', // Geode Health
  'heightscouplestherapy.com': 'keep', // Heights Couples Therapy
  'houstonanxiety.com': 'keep', // Houston Anxiety and Wellness Center
  'beckystidham.com': 'keep', // Becky Stidham & Associates
  'districtcounseling.center': 'keep', // District Counseling of Spring Branch
  'therapyandcohouston.com': 'keep', // Therapy and Co
  'vastcounselingservices.com': 'keep', // Vast Counseling Services
  'ajanatherapy.com': 'keep', // Ajana Therapy & Clinical Services
  'extraordinarylife.us': 'keep', // eXtraordinaryLIFE Christian Counseling & Coaching
  'houstonmindandbrain.com': 'medical', // Houston Mind & Brain
  'psychplus.com': 'medical', // PsychPlus Heights Clinic - Psychiatrist and Therapist
  'montrosecenter.org': 'nonprofit', // The Montrose Center
  'bosplace.org': 'nonprofit', // Bo's Place
  'deepcentered.com': 'keep', // Deep Centered Mental Health (DCMH) - Downtown Austin
  'evaluationsforimmigration.com': 'exclude', // Evaluations for Immigration
  'therapyandmor.com': 'keep', // Therapy & Mor
  'beingcounseling.com': 'keep', // Being Counseling
  'drdivanyoung.com': 'exclude', // Dr. D Ivan Young, ICF-MCC, NBC-HWC
  'gracetherapyaustin.com': 'keep', // Grace Therapy and Wellness, PLLC - Downtown Location One
  'justmind.org': 'keep', // Just Mind Counseling
  'theraedagroup.com': 'keep', // Delicia S. Mclean, Ph.D, MHA
  'bloomtherapytx.com': 'keep', // Bloom Therapy
  'atxtraumatherapycenter.com': 'keep', // Austin Trauma Therapy Center
  'austincounselingassociates.com': 'keep', // Austin Counseling Associates
  'alethiacounseling.com': 'keep', // Alethia Counseling Austin
  'austincts.com': 'keep', // Austin Counseling and Trauma Specialists
  'herpsychotherapy.com': 'keep', // EMDR and Relationship Therapy
  'unitivecounseling.com': 'keep', // Unitive Counseling Services
  'atx-counseling.com': 'keep', // ATX Counseling
  'therapyaustin.com': 'keep', // Therapy Austin - Central Austin
  'austinchildguidance.org': 'nonprofit', // Austin Child Guidance Center
  'austinfamilycounseling.com': 'keep', // Austin Family Counseling
  'austinpsychotherapyservices.com': 'keep', // Austin Psychotherapy Services
  'carlislecollective.co': 'keep', // Carlisle Collective
  'austincta.com': 'keep', // Austin Center For Therapy and Assessment, LLC
  'psychologicalassessmentsaustin.com': 'exclude', // Austin Psychological and Testing Center
  'decadescounseling.com': 'keep', // Decades Counseling
  'gramercyclinic.com': 'keep', // Gramercy Counseling
  'emotionalsupportanimalsoftexas.com': 'exclude', // Miki Tesh, Ph.D., LCSW
  'racineanxiety.com': 'keep', // Racine Anxiety
  'rrchildrenstherapy.com': 'exclude', // Round Rock Children’s Therapy Center
  'threeoakstexas.com': 'keep', // Three Oaks Counseling & Psychiatry
  'brianabass.org': 'keep', // Briana Bass Therapy, LPC
  'louislaves-webb.com': 'keep', // Louis Laves-Webb, LCSW, LPC-S & Associates
  'alisonkatehealing.com': 'exclude', // Alison Kate Holistic Healing and Therapy
  'autonomytherapyatx.com': 'keep', // Autonomy Therapy
  'lorancoaching.com': 'exclude', // Loran Coaching
  'wholetherapydenver.com': 'keep', // WholeTherapy
  'birchpsychology.com': 'keep', // Birch Psychology Denver
  'discoverpeacewithin.com': 'keep', // Discover Peace Within
  'nayaclinics.com': 'chain', // Naya Clinics
  'integratedbhs.com': 'keep', // Integrated Behavioral Health
  'wellnesspsychgroup.com': 'keep', // Wellness & Psychotherapy Group
  'bestlifetherapy.com': 'keep', // Best Life Therapy
  'coloradotherapycollective.com': 'keep', // Colorado Therapy Collective
  'mindfulcounselingdenver.com': 'keep', // Mindful Counseling, EMDR
  'panoramapsychology.com': 'keep', // Panorama Psychology - Highland
  'modernlovecounseling.com': 'keep', // Modern Love Counseling
  'fullbloomcounseling.com': 'keep', // Full Bloom Counseling
  'scottkohner.com': 'keep', // Scott Kohner MSW, LCSW
  'coloradorelationshiprecovery.com': 'keep', // Colorado Relationship Recovery
  'mydenvertherapy.com': 'keep', // My Denver Therapy
  'therapywithbrea.com': 'keep', // Therapy with Brea
  'cid:8259296367552068721': 'keep', // Creative Care and Wellness, PLLC - Haley March, LCSW
  'denverwellnesscounseling.com': 'keep', // Denver Wellness Counseling
  'insightcounselingcenter.com': 'keep', // Insight Counseling & Wellness Center
  'denverwellnessassociates.com': 'medical', // Denver Wellness Associates
  'chadleyzobolastherapy.com': 'keep', // Chadley Zobolas Therapy Group
  'sophiaoconnortherapy.com': 'keep', // Sophia L. O'Connor MA, CST, LPC
  'coloradocft.com': 'keep', // Colorado Couples & Family Therapy
  'individualrelationshipcenter.com': 'keep', // Individual and Relationship Therapy Center | Individual Counseling
  'natalieworobelcounseling.com': 'keep', // Natalie Worobel Counseling
  'peakinteractivewellness.com': 'medical', // Peak Interactive Wellness
  'effectivetherapysolutions.com': 'keep', // Anxiety Solutions of Denver
  'marlercounseling.com': 'keep', // Marler Counseling LLC
  'denvertherapyandcounseling.com': 'keep', // Denver Therapy
  'peoplehouse.org': 'nonprofit', // People House
};
// END PRACTICE_DECISIONS
