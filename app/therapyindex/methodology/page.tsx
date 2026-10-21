import type { Metadata } from 'next';
import MethodologyPage from '@/components/therapyindex/MethodologyPage';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';
import { BRAND } from '@/lib/therapyindex/config';
import { LOW_VISIBILITY_BELOW } from '@/lib/therapyindex/config';
import { MIN_REVIEWS_FOR_RANKING } from '@/lib/therapyindex/markets';
import { ogImages, ogUrl } from '@/lib/therapyindex/og';

export function generateMetadata(): Metadata {
  const title = `How the Therapy Index Works: Sources, Scoring and Eligibility | ${BRAND}`;
  const description = `The sources, searches, scoring weights and ranking rules behind the Therapy Index. A practice needs ${MIN_REVIEWS_FOR_RANKING} Google reviews to be ranked; scores under ${LOW_VISIBILITY_BELOW} show as low visibility.`;
  const url = absUrl(routes.therapyIndex.methodology);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: BRAND, title, description, url, images: ogImages('methodology', title) },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl('methodology')] },
  };
}

export default function Page() {
  return <MethodologyPage />;
}
