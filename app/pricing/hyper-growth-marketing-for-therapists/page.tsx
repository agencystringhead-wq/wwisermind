import type { Metadata } from 'next';
import HyperGrowthPage from '@/components/pricing/HyperGrowthPage';
import { hyperGrowthMeta, hyperGrowthPath } from '@/lib/pricing/hyper-growth';
import { siteConfig } from '@/lib/site';

const url = `${siteConfig.url}${hyperGrowthPath}`;

export const metadata: Metadata = {
  title: hyperGrowthMeta.title,
  description: hyperGrowthMeta.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: hyperGrowthMeta.title,
    description: hyperGrowthMeta.description,
    url,
  },
};

export default function Page() {
  return <HyperGrowthPage />;
}
