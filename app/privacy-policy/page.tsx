import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { privacyPolicy } from '@/lib/legal';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: privacyPolicy.metaTitle,
  description: privacyPolicy.metaDescription,
  alternates: { canonical: absUrl(routes.privacyPolicy) },
  openGraph: {
    title: privacyPolicy.metaTitle,
    description: privacyPolicy.metaDescription,
    url: absUrl(routes.privacyPolicy),
    type: 'website',
  },
};

export default function Page() {
  return <LegalPage doc={privacyPolicy} path={routes.privacyPolicy} />;
}
