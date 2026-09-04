import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServicePage from '@/components/services/ServicePage';
import { SERVICE_SLUGS, getService } from '@/lib/services';
import { siteConfig } from '@/lib/site';

/* One page per slug, all of them rendered at build time — the site is a static export, so
   a slug outside the list is a 404 rather than a page built on request. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_SLUGS.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};

  return {
    title: service.seo.title,
    description: service.seo.description,
    /* A stub is a page of TODO markers; a search engine should not file it. The flag comes
       off with the copy, and nothing else about the page changes. */
    robots: service.draft ? { index: false, follow: true } : undefined,
    alternates: { canonical: `${siteConfig.url}/services/${service.slug}` },
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const url = `${siteConfig.url}/services/${service.slug}`;

  /* Schema.org Service, with the provider and the audience the site is built for. No
     offer: the pages carry no price. */
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: service.name,
    serviceType: service.name,
    category: service.category,
    description: service.seo.description,
    url,
    provider: {
      '@type': 'Organization',
      name: 'wwisermind',
      url: siteConfig.url,
    },
    audience: {
      '@type': 'Audience',
      audienceType: 'Therapists and psychologists',
    },
    areaServed: ['US', 'GB', 'AU'],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ServicePage service={service} />
    </>
  );
}
