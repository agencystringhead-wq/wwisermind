import type { Metadata } from 'next';
import FreebiesHub from '@/components/freebies/FreebiesHub';
import { hubMeta } from '@/lib/freebies';
import { routes } from '@/lib/routes';
import { absUrl, siteConfig } from '@/lib/site';

const url = absUrl(routes.freebies.hub);

export const metadata: Metadata = {
  title: hubMeta.title,
  description: hubMeta.description,
  alternates: { canonical: url },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title: hubMeta.title,
    description: hubMeta.description,
    url,
  },
};

export default function Page() {
  return <FreebiesHub />;
}
