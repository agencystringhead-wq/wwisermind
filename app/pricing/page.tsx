import type { Metadata } from 'next';
import PricingPage from '@/components/pricing/PricingPage';
import { pricingPage } from '@/lib/pricing';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: pricingPage.meta.title,
  description: pricingPage.meta.description,
  alternates: { canonical: `${siteConfig.url}/pricing` },
};

export default function Page() {
  return <PricingPage />;
}
