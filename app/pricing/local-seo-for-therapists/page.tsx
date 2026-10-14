import type { Metadata } from 'next';
import LocalSeoPage from '@/components/pricing/LocalSeoPage';
import { localSeoMeta, localSeoPath } from '@/lib/pricing/local-seo';
import { siteConfig } from '@/lib/site';

const url = `${siteConfig.url}${localSeoPath}`;

export const metadata: Metadata = {
  title: localSeoMeta.title,
  description: localSeoMeta.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: localSeoMeta.title,
    description: localSeoMeta.description,
    url,
  },
};

export default function Page() {
  return <LocalSeoPage />;
}
