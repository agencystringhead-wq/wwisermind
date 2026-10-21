import type { Metadata } from 'next';
import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import Hub, { joinNames } from '@/components/therapyindex/Hub';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';
import { BRAND } from '@/lib/therapyindex/config';
import { getHubStats, getMarketViews } from '@/lib/therapyindex/data';
import { ogImages, ogUrl } from '@/lib/therapyindex/og';

const cities = () => joinNames(getMarketViews().map((m) => m.city.name));

export function generateMetadata(): Metadata {
  const stats = getHubStats();
  const title = `Therapy Index: Who Therapy Patients Find in ${cities()} | ${BRAND}`;
  const description = `${stats.practices.toLocaleString('en-US')} therapy practices in ${cities()}, measured the same way across Google Maps, Google search and AI answers. Snapshot of ${stats.date}.`;
  const url = absUrl(routes.therapyIndex.hub);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: BRAND, title, description, url, images: ogImages('hub', title) },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl('hub')] },
  };
}

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Therapy Index', href: routes.therapyIndex.hub },
        ]}
      />
      <Hub />
    </>
  );
}
