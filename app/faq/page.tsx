import type { Metadata } from 'next';
import FaqPage from '@/components/faq/FaqPage';
import { faqPage } from '@/lib/faq';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: faqPage.meta.title,
  description: faqPage.meta.description,
  alternates: { canonical: `${siteConfig.url}/faq` },
};

export default function Page() {
  return <FaqPage />;
}
