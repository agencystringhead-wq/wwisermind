import type { Metadata } from 'next';
import OneTimeSeoPage from '@/components/pricing/OneTimeSeoPage';
import { oneTimeSeoMeta, oneTimeSeoPath } from '@/lib/pricing/one-time-seo';
import { siteConfig } from '@/lib/site';

const url = `${siteConfig.url}${oneTimeSeoPath}`;

export const metadata: Metadata = {
  title: oneTimeSeoMeta.title,
  description: oneTimeSeoMeta.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: oneTimeSeoMeta.title,
    description: oneTimeSeoMeta.description,
    url,
  },
};

export default function Page() {
  return <OneTimeSeoPage />;
}
