import type { Metadata } from 'next';
import CarePlansPage from '@/components/pricing/CarePlansPage';
import { carePlansMeta, carePlansPath } from '@/lib/pricing/care-plans';
import { siteConfig } from '@/lib/site';

const url = `${siteConfig.url}${carePlansPath}`;

export const metadata: Metadata = {
  title: carePlansMeta.title,
  description: carePlansMeta.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: carePlansMeta.title,
    description: carePlansMeta.description,
    url,
  },
};

export default function Page() {
  return <CarePlansPage />;
}
