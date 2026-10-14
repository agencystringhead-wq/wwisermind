import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import type { Metadata } from 'next';
import FaqPage from '@/components/faq/FaqPage';
import { faqPage } from '@/lib/faq';
import { siteConfig, absUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: faqPage.meta.title,
  description: faqPage.meta.description,
  alternates: { canonical: absUrl(routes.faq) },
};

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'FAQ', href: routes.faq },
        ]}
      />
      <FaqPage />
    </>
  );
}
