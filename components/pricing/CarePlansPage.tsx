import { siteConfig } from '@/lib/site';
import {
  PRICE_CURRENCY,
  carePlansFaqCopy,
  carePlansFaqs,
  carePlansHero,
  carePlansMeta,
  carePlansPath,
  compareCopy,
  compareGroups,
  comparePlans,
  everyPlan,
  finalCta,
  finalCtaSecondary,
  finePrint,
  fitCallout,
  fitCards,
  fitCopy,
  heroImage,
  hostCompareColumns,
  hostCompareCopy,
  hostCompareRows,
  offerUnitText,
  offers,
  plans,
  plansCopy,
  processCopy,
  processLink,
  processStages,
  serviceDescription,
  serviceName,
  supportCopy,
  supportIncluded,
  supportNote,
  supportQuoted,
  trustItems,
  upsellCopy,
} from '@/lib/pricing/care-plans';
import { ongoingListing } from '@/lib/pricing/ongoing-seo';
import { websiteDesignListing } from '@/lib/pricing/website-design';
import CarePlansCompare from './CarePlansCompare';
import CarePlansSupport from './CarePlansSupport';
import LocalSeoCta from './LocalSeoCta';
import LocalSeoFaq from './LocalSeoFaq';
import LocalSeoFit from './LocalSeoFit';
import LocalSeoHero from './LocalSeoHero';
import LocalSeoPackages from './LocalSeoPackages';
import LocalSeoProcess from './LocalSeoProcess';
import PricingCompare from './PricingCompare';
import PricingUpsell, { type UpsellPlan } from './PricingUpsell';
import PricingCrumbs from './PricingCrumbs';

/** Names, prices and links come from the website design and Ongoing SEO data files. */
const upsellPlans: UpsellPlan[] = [
  {
    name: websiteDesignListing.name,
    line: `${websiteDesignListing.price}${websiteDesignListing.unit}`,
    href: websiteDesignListing.href,
  },
  { name: ongoingListing.name, line: `${ongoingListing.price}${ongoingListing.unit}`, href: ongoingListing.href },
];

/**
 * /pricing/care-plans. The sixth /pricing sub-page. The hero, check cards, timeline, package
 * grid, hosting comparison, upsell band, FAQ and CTA are shared with the others, fed from
 * lib/pricing/care-plans.ts. The plan comparison table and the support time lists are new.
 *
 * Structured data: FAQPage from the strings the accordion prints, and a Service with three
 * monthly Offers built from the same prices as the cards.
 */
export default function CarePlansPage() {
  const url = `${siteConfig.url}${carePlansPath}`;

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: carePlansFaqs.map((item) => ({
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
    serviceType: 'WordPress maintenance and support',
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
      <LocalSeoHero hero={carePlansHero} trustItems={trustItems} image={heroImage} />
      <PricingCrumbs label="WordPress Care Plans" path={carePlansPath} service="website-care-plans" />
      <LocalSeoFit copy={fitCopy} cards={fitCards} callout={fitCallout} tone="grey" />
      <LocalSeoProcess copy={processCopy} stages={processStages} link={processLink} />
      <LocalSeoPackages
        id="plans"
        copy={plansCopy}
        packages={plans}
        every={everyPlan}
        terms={finePrint}
      />
      <CarePlansCompare copy={compareCopy} plans={comparePlans} groups={compareGroups} />
      <CarePlansSupport
        copy={supportCopy}
        included={supportIncluded}
        quoted={supportQuoted}
        note={supportNote}
      />
      <PricingCompare
        copy={hostCompareCopy}
        columns={hostCompareColumns}
        rows={hostCompareRows}
        tone="white"
      />
      <PricingUpsell copy={upsellCopy} plans={upsellPlans} tone="grey" />
      <LocalSeoFaq copy={carePlansFaqCopy} items={carePlansFaqs} />
      <LocalSeoCta cta={finalCta} secondary={finalCtaSecondary} />
    </>
  );
}
