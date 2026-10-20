import type { Metadata } from 'next';
import ReferPage from '@/components/refer/ReferPage';
import { referMeta } from '@/lib/refer';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: referMeta.title,
  description: referMeta.description,
  alternates: { canonical: absUrl(routes.refer) },
  openGraph: {
    title: referMeta.title,
    description: referMeta.description,
    url: absUrl(routes.refer),
    type: 'website',
  },
};

export default function Page() {
  return <ReferPage />;
}
