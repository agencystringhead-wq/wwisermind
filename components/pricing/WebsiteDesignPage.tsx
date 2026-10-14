import { siteConfig } from '@/lib/site';
import {
  PRICE_CURRENCY,
  callBand,
  compareColumns,
  compareCopy,
  compareRows,
  everyWebsite,
  finalCta,
  fitCallout,
  fitCards,
  fitCopy,
  heroImage,
  offers,
  packages,
  pricingCopy,
  processCopy,
  processNote,
  processStages,
  projects,
  projectsCopy,
  trustItems,
  upsellCopy,
  upsellPlans,
  websiteDesignFaqCopy,
  websiteDesignFaqs,
  websiteDesignHero,
  websiteDesignMeta,
  websiteDesignPath,
  whyCards,
  whyCopy,
} from '@/lib/pricing/website-design';
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
import PricingCrumbs from './PricingCrumbs';

/**
 * /pricing/website-design. The fifth /pricing sub-page: the hero, check cards, package
 * grid, timeline, comparison table, projects, why-us cards, upsell band, CTA and FAQ are
 * shared with the others, fed from lib/pricing/website-design.ts.
 *
 * Structured data: FAQPage from the strings the accordion prints, and a Service with two
 * Offers: the one-time price, and the monthly price with its commitment in the unit text.
 */
export default function WebsiteDesignPage() {
  const url = `${siteConfig.url}${websiteDesignPath}`;

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: websiteDesignFaqs.map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: { '@type': 'Answer', text: item.body },
    })),
  };

  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: 'One-week website design for therapists',
    serviceType: 'Website design',
    description: websiteDesignMeta.description,
    url,
    provider: { '@type': 'Organization', name: 'wwisermind', url: siteConfig.url },
    audience: { '@type': 'Audience', audienceType: 'Therapists and psychologists' },
    offers: offers.map((offer) => ({
      '@type': 'Offer',
      name: offer.name,
      price: offer.price,
      priceCurrency: PRICE_CURRENCY,
      ...(offer.unitText
        ? {
            priceSpecification: {
              '@type': 'UnitPriceSpecification',
              price: offer.price,
              priceCurrency: PRICE_CURRENCY,
              unitText: offer.unitText,
            },
          }
        : {}),
      url: `${url}#pricing`,
    })),
  };

  const json = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(faqData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(serviceData) }} />
      <LocalSeoHero hero={websiteDesignHero} trustItems={trustItems} image={heroImage} />
      <PricingCrumbs label="One-Week Website" path={websiteDesignPath} service="one-week-website" />
      <LocalSeoFit copy={fitCopy} cards={fitCards} callout={fitCallout} />
      <LocalSeoPackages
        id="pricing"
        copy={pricingCopy}
        packages={packages}
        every={everyWebsite}
        band={callBand}
        columns={2}
      />
      <LocalSeoProcess copy={processCopy} stages={processStages} note={processNote} />
      <PricingCompare copy={compareCopy} columns={compareColumns} rows={compareRows} />
      <LocalSeoProjects id="projects" copy={projectsCopy} projects={projects} />
      <PricingWhy copy={whyCopy} cards={whyCards} />
      <PricingUpsell copy={upsellCopy} plans={upsellPlans} />
      <LocalSeoFaq copy={websiteDesignFaqCopy} items={websiteDesignFaqs} />
      <LocalSeoCta cta={finalCta} />
    </>
  );
}
