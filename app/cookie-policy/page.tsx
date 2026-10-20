import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { cookiePolicy } from '@/lib/legal';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: cookiePolicy.metaTitle,
  description: cookiePolicy.metaDescription,
  alternates: { canonical: absUrl(routes.cookiePolicy) },
  openGraph: {
    title: cookiePolicy.metaTitle,
    description: cookiePolicy.metaDescription,
    url: absUrl(routes.cookiePolicy),
    type: 'website',
  },
};

export default function Page() {
  return <LegalPage doc={cookiePolicy} path={routes.cookiePolicy} />;
}
