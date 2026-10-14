import { siteConfig } from '@/lib/site';
import {
  PRICE_CURRENCY,
  everyPlan,
  finalCta,
  finePrint,
  fitCallout,
  fitCards,
  fitCopy,
  heroImage,
  hyperGrowthFaqCopy,
  hyperGrowthFaqs,
  hyperGrowthHero,
  hyperGrowthPath,
  inside,
  insideCopy,
  offerUnitText,
  offers,
  plans,
  plansCopy,
  processCopy,
  processStages,
  resultCards,
  resultsCopy,
  serviceDescription,
  serviceName,
  showResults,
  trustItems,
  whyCards,
  whyCopy,
} from '@/lib/pricing/hyper-growth';
import HyperGrowthInside from './HyperGrowthInside';
import LocalSeoCta from './LocalSeoCta';
import LocalSeoFaq from './LocalSeoFaq';
import LocalSeoFit from './LocalSeoFit';
import LocalSeoHero from './LocalSeoHero';
import LocalSeoPackages from './LocalSeoPackages';
import LocalSeoProcess from './LocalSeoProcess';
import LocalSeoResults from './LocalSeoResults';
import PricingWhy from './PricingWhy';

/**
 * /pricing/hyper-growth. The seventh /pricing sub-page: the hero, check cards, package grid,
 * timeline, numbered cards, results, FAQ and CTA are shared with the others, fed from
 * lib/pricing/hyper-growth.ts. The "What's inside" columns are new.
 *
 * Structured data: FAQPage from the strings the accordion prints, and a Service with three
 * monthly Offers built from the same prices as the cards.
 */
export default function HyperGrowthPage() {
  const url = `${siteConfig.url}${hyperGrowthPath}`;

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: hyperGrowthFaqs.map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: { '@type': 'Answer', text: item.body },
    })),
  };

  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: serviceName,
    serviceType: 'Marketing for therapy practices',
    description: serviceDescription,
    url,
    provider: { '@type': 'Organization', name: 'wwisermind', url: siteConfig.url },
    audience: { '@type': 'Audience', audienceType: 'Therapists and psychologists' },
    offers: offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price,
      priceCurrency: PRICE_CURRENCY,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: offer.price,
        priceCurrency: PRICE_CURRENCY,
        unitText: offerUnitText,
      },
      url: `${url}#plans`,
    })),
  };

  const json = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(faqData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(serviceData) }} />
      <LocalSeoHero hero={hyperGrowthHero} trustItems={trustItems} image={heroImage} />
      <LocalSeoFit copy={fitCopy} cards={fitCards} callout={fitCallout} />
      <LocalSeoPackages
        id="plans"
        copy={plansCopy}
        packages={plans}
        every={everyPlan}
        terms={finePrint}
      />
      <HyperGrowthInside copy={insideCopy} columns={inside} />
      <LocalSeoProcess copy={processCopy} stages={processStages} tone="grey" />
      <PricingWhy copy={whyCopy} cards={whyCards} tone="white" />
      <LocalSeoResults copy={resultsCopy} cards={resultCards} show={showResults} />
      <LocalSeoFaq copy={hyperGrowthFaqCopy} items={hyperGrowthFaqs} />
      <LocalSeoCta cta={finalCta} />
    </>
  );
}
