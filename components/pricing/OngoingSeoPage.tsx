import { siteConfig } from '@/lib/site';
import {
  PRICE_CURRENCY,
  contractTerms,
  everyPlan,
  finalCta,
  heroImage,
  includedCards,
  includedCopy,
  ongoingSeoFaqCopy,
  ongoingSeoFaqs,
  ongoingSeoHero,
  ongoingSeoMeta,
  ongoingSeoPath,
  plans,
  plansCopy,
  resultCards,
  resultsCopy,
  roadmapCopy,
  roadmapStages,
  showResults,
  startSmall,
  trustItems,
} from '@/lib/pricing/ongoing-seo';
import LocalSeoCta from './LocalSeoCta';
import LocalSeoFaq from './LocalSeoFaq';
import LocalSeoHero from './LocalSeoHero';
import LocalSeoPackages from './LocalSeoPackages';
import LocalSeoProcess from './LocalSeoProcess';
import LocalSeoResults from './LocalSeoResults';
import OngoingSeoProblem from './OngoingSeoProblem';
import OngoingSeoWhy from './OngoingSeoWhy';
import OngoingSeoWhyNow from './OngoingSeoWhyNow';
import PricingChecks from './PricingChecks';

/**
 * /pricing/seo. The fourth /pricing sub-page: the hero, plan cards, check grid, roadmap,
 * results, CTA and FAQ are shared with the others, fed from lib/pricing/ongoing-seo.ts.
 *
 * Structured data: FAQPage from the strings the accordion prints, and a Service with one
 * Offer per plan, each priced per month.
 */
export default function OngoingSeoPage() {
  const url = `${siteConfig.url}${ongoingSeoPath}`;

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ongoingSeoFaqs.map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: { '@type': 'Answer', text: item.body },
    })),
  };

  const offers = plans
    .filter((plan) => plan.price !== undefined)
    .map((plan) => ({
      '@type': 'Offer',
      name: plan.name,
      price: plan.price,
      priceCurrency: PRICE_CURRENCY,
      priceSpecification: {
        '@type': 'UnitPriceSpecification',
        price: plan.price,
        priceCurrency: PRICE_CURRENCY,
        unitText: 'per month',
      },
      url: `${url}#plans`,
    }));

  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: 'Ongoing SEO, AEO & GEO for therapists',
    serviceType: 'Search engine optimisation',
    description: ongoingSeoMeta.description,
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
      <LocalSeoHero hero={ongoingSeoHero} trustItems={trustItems} image={heroImage} />
      <OngoingSeoProblem />
      <OngoingSeoWhyNow />
      <PricingChecks copy={includedCopy} cards={includedCards} tone="white" />
      <LocalSeoPackages
        id="plans"
        copy={plansCopy}
        packages={plans}
        every={everyPlan}
        terms={contractTerms}
        more={startSmall}
      />
      <LocalSeoProcess copy={roadmapCopy} stages={roadmapStages} />
      <OngoingSeoWhy />
      <LocalSeoResults copy={resultsCopy} cards={resultCards} show={showResults} />
      <LocalSeoFaq copy={ongoingSeoFaqCopy} items={ongoingSeoFaqs} />
      <LocalSeoCta cta={finalCta} />
    </>
  );
}
