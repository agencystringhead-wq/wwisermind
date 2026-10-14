import type { Metadata } from 'next';
import ServicesHub from '@/components/services/ServicesHub';
import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import { absUrl, siteConfig } from '@/lib/site';

const title = 'Website, SEO and AI Services for Therapists | wwisermind';
const description =
  'Every wwisermind service for therapists and group practices: website design, hosting and care, SEO, local SEO, copywriting, Meta ads and AI search.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absUrl(routes.services.hub) },
  openGraph: {
    type: 'website',
    siteName: siteConfig.name,
    title,
    description,
    url: absUrl(routes.services.hub),
  },
};

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Services', href: routes.services.hub },
        ]}
      />
      <ServicesHub />
    </>
  );
}
