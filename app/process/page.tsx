import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import type { Metadata } from 'next';
import ProcessPage from '@/components/process/ProcessPage';
import { processPage } from '@/lib/process';
import { siteConfig, absUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: processPage.meta.title,
  description: processPage.meta.description,
  alternates: { canonical: absUrl(routes.process) },
};

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Our Process', href: routes.process },
        ]}
      />
      <ProcessPage />
    </>
  );
}
