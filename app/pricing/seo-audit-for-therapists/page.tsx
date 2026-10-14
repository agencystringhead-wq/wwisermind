import type { Metadata } from 'next';
import SeoAuditPage from '@/components/pricing/SeoAuditPage';
import { seoAuditMeta, seoAuditPath } from '@/lib/pricing/seo-audit';
import { siteConfig } from '@/lib/site';

const url = `${siteConfig.url}${seoAuditPath}`;

export const metadata: Metadata = {
  title: seoAuditMeta.title,
  description: seoAuditMeta.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: seoAuditMeta.title,
    description: seoAuditMeta.description,
    url,
  },
};

export default function Page() {
  return <SeoAuditPage />;
}
