import type { Metadata } from 'next';
import WebsiteDesignPage from '@/components/pricing/WebsiteDesignPage';
import { websiteDesignMeta, websiteDesignPath } from '@/lib/pricing/website-design';
import { siteConfig } from '@/lib/site';

const url = `${siteConfig.url}${websiteDesignPath}`;

export const metadata: Metadata = {
  title: websiteDesignMeta.title,
  description: websiteDesignMeta.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: websiteDesignMeta.title,
    description: websiteDesignMeta.description,
    url,
  },
};

export default function Page() {
  return <WebsiteDesignPage />;
}
