import { siteConfig } from '@/lib/site';
import {
  PRICE_CURRENCY,
  compareColumns,
  compareCopy,
  compareHighlight,
  compareRows,
  copyCard,
  copyCopy,
  customWebsiteFaqCopy,
  customWebsiteFaqs,
  customWebsiteHero,
  customWebsiteMeta,
  customWebsitePath,
  everyWebsite,
  finalCta,
  fitCallout,
  fitCards,
  fitCopy,
  heroImage,
  offers,
  packages,
  paymentTerms,
  pricingCopy,
  processCopy,
  processStages,
  projects,
  projectsCopy,
  serviceDescription,
  serviceName,
  trustItems,
  upsellCopy,
  upsellPlans,
  whyCards,
  whyCopy,
} from '@/lib/pricing/custom-website';
import CustomWebsiteCopy from './CustomWebsiteCopy';
import LocalSeoCta from './LocalSeoCta';
import LocalSeoFaq from './LocalSeoFaq';
import LocalSeoFit from './LocalSeoFit';
import LocalSeoHero from './LocalSeoHero';
import LocalSeoPackages from './LocalSeoPackages';
import LocalSeoProcess from './LocalSeoProcess';
import LocalSeoProjects from './LocalSeoProjects';
import PricingCompare from './PricingCompare';
import PricingUpsell from './PricingUpsell';
import PricingWhy from './PricingWhy';

/**
 * /pricing/custom-website. The eighth /pricing sub-page: the hero, check cards, package
 * grid, timeline, comparison table, projects, numbered cards, upsell band, FAQ and CTA are
 * shared with the others, fed from lib/pricing/custom-website.ts. The copywriting add-on is
 * new.
 *
 * Structured data: FAQPage from the strings the accordion prints, and a Service with two
 * "starting at" Offers, each with a minimum price.
 */
export default function CustomWebsitePage() {
  const url = `${siteConfig.url}${customWebsitePath}`;

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: customWebsiteFaqs.map((item) => ({
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
    serviceType: 'Website design',
    description: serviceDescription,
    url,
    provider: { '@type': 'Organization', name: 'wwisermind', url: siteConfig.url },
    audience: { '@type': 'Audience', audienceType: 'Therapists and psychologists' },
    offers: offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      description: 'Starting at',
      priceCurrency: PRICE_CURRENCY,
      priceSpecification: {
        '@type': 'PriceSpecification',
        minPrice: offer.price,
        priceCurrency: PRICE_CURRENCY,
      },
      url: `${url}#pricing`,
    })),
  };

  const json = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(faqData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(serviceData) }} />
      <LocalSeoHero hero={customWebsiteHero} trustItems={trustItems} image={heroImage} />
      <LocalSeoFit copy={fitCopy} cards={fitCards} callout={fitCallout} />
      <LocalSeoPackages
        id="pricing"
        copy={pricingCopy}
        packages={packages}
        every={everyWebsite}
        terms={paymentTerms}
        columns={2}
      />
      <CustomWebsiteCopy copy={copyCopy} card={copyCard} />
      <LocalSeoProcess copy={processCopy} stages={processStages} tone="grey" />
      <PricingCompare
        copy={compareCopy}
        columns={compareColumns}
        rows={compareRows}
        tone="white"
        highlight={compareHighlight}
        highlightFirst
      />
      <LocalSeoProjects id="projects" copy={projectsCopy} projects={projects} tone="grey" />
      <PricingWhy copy={whyCopy} cards={whyCards} tone="white" />
      <PricingUpsell copy={upsellCopy} plans={upsellPlans} tone="grey" />
      <LocalSeoFaq copy={customWebsiteFaqCopy} items={customWebsiteFaqs} />
      <LocalSeoCta cta={finalCta} />
    </>
  );
}
