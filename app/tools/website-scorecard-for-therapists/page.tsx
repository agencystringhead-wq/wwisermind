import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ScorecardApp from '@/components/scorecard/ScorecardApp';
import { freebieMetadata } from '@/lib/freebie-metadata';
import { getFreebie } from '@/lib/freebies';

const freebie = getFreebie('website-scorecard-for-therapists');

export const metadata: Metadata = freebie ? freebieMetadata(freebie) : {};

export default function Page() {
  if (!freebie) notFound();
  return <ScorecardApp />;
}
