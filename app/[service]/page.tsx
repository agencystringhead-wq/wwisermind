import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ServicePage from '@/components/services/ServicePage';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import {
  SERVICE_PARAMS,
  SERVICE_PRICING,
  SERVICE_PATHS,
  routes,
  serviceKeyForParam,
  type ServiceKey,
} from '@/lib/routes';
import { getService } from '@/lib/services';
import { absUrl, siteConfig } from '@/lib/site';

/* One page per service, at a flat keyword URL (lib/routes.ts has the list). All of them are
   rendered at build time: the site is a static export, so anything outside the list is a 404
   rather than a page built on request. */
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICE_PARAMS.map((service) => ({ service }));
}

type Params = { params: Promise<{ service: string }> };

async function load(params: Params['params']) {
  const { service: param } = await params;
  const key = serviceKeyForParam(param);
  const service = key ? getService(key) : undefined;
  return key && service ? { key, service } : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = await load(params);
  if (!found) return {};
  const { key, service } = found;
  const url = absUrl(SERVICE_PATHS[key]);

  return {
    title: service.seo.title,
    description: service.seo.description,
    /* A stub is a page of TODO markers; a search engine should not file it. The flag comes
       off with the copy, and nothing else about the page changes. */
    robots: service.draft ? { index: false, follow: true } : undefined,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title: service.seo.title,
      description: service.seo.description,
      url,
    },
  };
}

export default async function Page({ params }: Params) {
  const found = await load(params);
  if (!found) notFound();
  const { key, service } = found;

  const url = absUrl(SERVICE_PATHS[key]);

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

  /* The pricing page that prices this service, when there is one: linked from here with its
     name, and linking back. */
  const pricingHref = (SERVICE_PRICING as Partial<Record<ServiceKey, string>>)[key];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ServicePage
        service={service}
        afterHero={
          <Breadcrumbs
            trail={[
              { label: 'Home', href: routes.home },
              { label: 'Services', href: routes.services.hub },
              { label: service.name, href: SERVICE_PATHS[key] },
            ]}
            related={
              pricingHref
                ? { label: `See ${service.name} pricing`, href: pricingHref }
                : undefined
            }
          />
        }
      />
    </>
  );
}
