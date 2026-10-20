import type { Metadata } from 'next';
import LegalPage from '@/components/legal/LegalPage';
import { termsAndConditions } from '@/lib/legal';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: termsAndConditions.metaTitle,
  description: termsAndConditions.metaDescription,
  alternates: { canonical: absUrl(routes.termsAndConditions) },
  openGraph: {
    title: termsAndConditions.metaTitle,
    description: termsAndConditions.metaDescription,
    url: absUrl(routes.termsAndConditions),
    type: 'website',
  },
};

export default function Page() {
  return <LegalPage doc={termsAndConditions} path={routes.termsAndConditions} />;
}
