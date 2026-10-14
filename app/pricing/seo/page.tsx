import type { Metadata } from 'next';
import OngoingSeoPage from '@/components/pricing/OngoingSeoPage';
import { ongoingSeoMeta, ongoingSeoPath } from '@/lib/pricing/ongoing-seo';
import { siteConfig } from '@/lib/site';

const url = `${siteConfig.url}${ongoingSeoPath}`;

export const metadata: Metadata = {
  title: ongoingSeoMeta.title,
  description: ongoingSeoMeta.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: ongoingSeoMeta.title,
    description: ongoingSeoMeta.description,
    url,
  },
};

export default function Page() {
  return <OngoingSeoPage />;
}
