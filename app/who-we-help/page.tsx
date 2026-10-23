import type { Metadata } from 'next';
import CategoryHub from '@/components/categories/CategoryHub';
import { categoryHubs } from '@/lib/categories';
import { absUrl, siteConfig } from '@/lib/site';

const hub = categoryHubs['who-we-help'];
const url = absUrl(hub.route);

export const metadata: Metadata = {
  title: hub.metaTitle,
  description: hub.metaDescription,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: hub.metaTitle,
    description: hub.metaDescription,
    url,
  },
};

export default function Page() {
  return <CategoryHub id="who-we-help" />;
}
