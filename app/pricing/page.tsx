import { routes } from '@/lib/routes';
import type { Metadata } from 'next';
import PricingPage from '@/components/pricing/PricingPage';
import { pricingPage } from '@/lib/pricing';
import { siteConfig, absUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: pricingPage.meta.title,
  description: pricingPage.meta.description,
  alternates: { canonical: absUrl(routes.pricing.hub) },
};

export default function Page() {
  return <PricingPage />;
}
