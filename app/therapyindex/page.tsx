import type { Metadata } from 'next';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import Hub, { joinNames } from '@/components/therapyindex/Hub';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';
import { BRAND } from '@/lib/therapyindex/config';
import { getHubStats, getMarketViews } from '@/lib/therapyindex/data';

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
    openGraph: { type: 'website', siteName: BRAND, title, description, url },
    twitter: { card: 'summary', title, description },
  };
}

export default function Page() {
  return (
    <>
      <Breadcrumbs
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Therapy Index', href: routes.therapyIndex.hub },
        ]}
      />
      <Hub />
    </>
  );
}
