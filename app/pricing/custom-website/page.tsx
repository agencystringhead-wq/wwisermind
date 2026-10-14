import type { Metadata } from 'next';
import CustomWebsitePage from '@/components/pricing/CustomWebsitePage';
import { customWebsiteMeta, customWebsitePath } from '@/lib/pricing/custom-website';
import { siteConfig } from '@/lib/site';

const url = `${siteConfig.url}${customWebsitePath}`;

export const metadata: Metadata = {
  title: customWebsiteMeta.title,
  description: customWebsiteMeta.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: customWebsiteMeta.title,
    description: customWebsiteMeta.description,
    url,
  },
};

export default function Page() {
  return <CustomWebsitePage />;
}
