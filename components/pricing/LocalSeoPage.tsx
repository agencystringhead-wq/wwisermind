import { siteConfig } from '@/lib/site';
import {
  PRICE_CURRENCY,
  localSeoFaqs,
  localSeoMeta,
  localSeoPackages,
  localSeoPath,
} from '@/lib/pricing/local-seo';
import LocalSeoBundle from './LocalSeoBundle';
import LocalSeoCta from './LocalSeoCta';
import LocalSeoFaq from './LocalSeoFaq';
import LocalSeoFit from './LocalSeoFit';
import LocalSeoHero from './LocalSeoHero';
import LocalSeoPackages from './LocalSeoPackages';
import LocalSeoProcess from './LocalSeoProcess';
import LocalSeoProjects from './LocalSeoProjects';
import LocalSeoResults from './LocalSeoResults';

/**
 * /pricing/local-seo. Header, footer and the floating bars come from the root layout.
 *
 * Structured data: FAQPage from the same strings the accordion prints, and a Service for
 * local SEO. The Service carries offers only for packages with a real price; while every
 * price is null it has none.
 */
export default function LocalSeoPage() {
  const url = `${siteConfig.url}${localSeoPath}`;

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: localSeoFaqs.map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: { '@type': 'Answer', text: item.body },
    })),
  };

  const offers = localSeoPackages
    .filter((pkg) => pkg.price !== null)
    .map((pkg) => ({
      '@type': 'Offer',
      name: pkg.name,
      price: pkg.price,
      priceCurrency: PRICE_CURRENCY,
      url: `${url}#packages`,
    }));

  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: 'Local SEO for therapists and group practices',
    serviceType: 'Local SEO',
    description: localSeoMeta.description,
    url,
    provider: { '@type': 'Organization', name: 'wwisermind', url: siteConfig.url },
    audience: { '@type': 'Audience', audienceType: 'Therapists and psychologists' },
    ...(offers.length > 0 ? { offers } : {}),
  };

  const json = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(faqData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(serviceData) }} />
      <LocalSeoHero />
      <LocalSeoResults />
      <LocalSeoFit />
      <LocalSeoPackages />
      <LocalSeoProcess />
      <LocalSeoBundle />
      <LocalSeoProjects />
      <LocalSeoCta />
      <LocalSeoFaq />
    </>
  );
}
