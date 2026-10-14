import { getPricingEntry } from '@/lib/pricing';
import { siteConfig } from '@/lib/site';
import {
  PRICE_CURRENCY,
  afterCopy,
  afterPlans,
  fitCallout,
  fitCards,
  fitCopy,
  finalCta,
  offerDescription,
  oneTimeOffer,
  oneTimeSeoFaqCopy,
  oneTimeSeoFaqs,
  oneTimeSeoHero,
  oneTimeSeoMeta,
  oneTimeSeoPath,
  pricingCopy,
  processCopy,
  processStages,
  totalPrice,
  trustItems,
} from '@/lib/pricing/one-time-seo';
import LocalSeoCta from './LocalSeoCta';
import LocalSeoFaq from './LocalSeoFaq';
import LocalSeoFit from './LocalSeoFit';
import LocalSeoHero from './LocalSeoHero';
import LocalSeoProcess from './LocalSeoProcess';
import OneTimeSeoOptions from './OneTimeSeoOptions';
import OneTimeSeoPhases from './OneTimeSeoPhases';
import PricingOffer from './PricingOffer';
import PricingUpsell from './PricingUpsell';
import PricingCrumbs from './PricingCrumbs';

/**
 * /pricing/one-time-seo. The third of the /pricing sub-pages: the hero, check cards, offer
 * card, timeline, upsell band, closing CTA and FAQ are shared with the other two, fed from
 * lib/pricing/one-time-seo.ts.
 *
 * Structured data: FAQPage from the strings the accordion prints, and a Service with one
 * Offer at the project total, its description saying it is three monthly payments.
 */
export default function OneTimeSeoPage() {
  const url = `${siteConfig.url}${oneTimeSeoPath}`;

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: oneTimeSeoFaqs.map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: { '@type': 'Answer', text: item.body },
    })),
  };

  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: oneTimeOffer.name,
    serviceType: 'SEO project',
    description: oneTimeSeoMeta.description,
    url,
    provider: { '@type': 'Organization', name: 'wwisermind', url: siteConfig.url },
    audience: { '@type': 'Audience', audienceType: 'Therapists and psychologists' },
    offers: {
      '@type': 'Offer',
      name: oneTimeOffer.name,
      description: offerDescription,
      price: totalPrice,
      priceCurrency: PRICE_CURRENCY,
      url: `${url}#pricing`,
    },
  };

  const json = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(faqData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(serviceData) }} />
      <LocalSeoHero
        hero={oneTimeSeoHero}
        trustItems={trustItems}
        image={getPricingEntry('one-time-seo').image}
      />
      <PricingCrumbs label="One-Time SEO" path={oneTimeSeoPath} service="one-time-seo" />
      <LocalSeoFit copy={fitCopy} cards={fitCards} callout={fitCallout} />
      <OneTimeSeoPhases />
      <PricingOffer copy={pricingCopy} offer={oneTimeOffer} />
      <LocalSeoProcess copy={processCopy} stages={processStages} tone="grey" />
      <OneTimeSeoOptions />
      <PricingUpsell copy={afterCopy} plans={afterPlans} />
      <LocalSeoCta cta={finalCta} />
      <LocalSeoFaq copy={oneTimeSeoFaqCopy} items={oneTimeSeoFaqs} />
    </>
  );
}
