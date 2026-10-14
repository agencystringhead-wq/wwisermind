import { getPricingEntry } from '@/lib/pricing';
import { siteConfig } from '@/lib/site';
import {
  PRICE_CURRENCY,
  auditOffer,
  checkCards,
  checksCopy,
  compareColumns,
  compareCopy,
  compareRows,
  auditPrice,
  finalCta,
  pricingCopy,
  processCopy,
  processStages,
  seoAuditFaqCopy,
  seoAuditFaqs,
  seoAuditHero,
  seoAuditMeta,
  seoAuditPath,
  signsCallout,
  signsCards,
  signsCopy,
  trustItems,
  upsellCopy,
  upsellPlans,
} from '@/lib/pricing/seo-audit';
import LocalSeoCta from './LocalSeoCta';
import LocalSeoFaq from './LocalSeoFaq';
import LocalSeoFit from './LocalSeoFit';
import LocalSeoHero from './LocalSeoHero';
import LocalSeoProcess from './LocalSeoProcess';
import PricingChecks from './PricingChecks';
import PricingCompare from './PricingCompare';
import PricingOffer from './PricingOffer';
import PricingUpsell from './PricingUpsell';

/**
 * /pricing/seo-audit. The sibling of /pricing/local-seo: the hero, check cards, timeline,
 * closing CTA and FAQ are that page's components fed from lib/pricing/seo-audit.ts.
 *
 * Structured data: FAQPage from the strings the accordion prints, and a Service with one
 * Offer at the flat price, no recurring unit.
 */
export default function SeoAuditPage() {
  const url = `${siteConfig.url}${seoAuditPath}`;

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: seoAuditFaqs.map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: { '@type': 'Answer', text: item.body },
    })),
  };

  const serviceData = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${url}#service`,
    name: auditOffer.name,
    serviceType: 'SEO audit',
    description: seoAuditMeta.description,
    url,
    provider: { '@type': 'Organization', name: 'wwisermind', url: siteConfig.url },
    audience: { '@type': 'Audience', audienceType: 'Therapists and psychologists' },
    offers: {
      '@type': 'Offer',
      name: auditOffer.name,
      price: auditPrice,
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
        hero={seoAuditHero}
        trustItems={trustItems}
        image={getPricingEntry('seo-audit').image}
      />
      <LocalSeoFit copy={signsCopy} cards={signsCards} callout={signsCallout} />
      <PricingChecks id="whats-checked" copy={checksCopy} cards={checkCards} tone="grey" />
      <PricingOffer copy={pricingCopy} offer={auditOffer} />
      <LocalSeoProcess copy={processCopy} stages={processStages} tone="grey" />
      <PricingCompare
        copy={compareCopy}
        columns={[...compareColumns]}
        rows={compareRows.map((row) => ({ criteria: row.criteria, cells: [row.free, row.audit] }))}
      />
      <PricingUpsell copy={upsellCopy} plans={upsellPlans} />
      <LocalSeoCta cta={finalCta} />
      <LocalSeoFaq copy={seoAuditFaqCopy} items={seoAuditFaqs} />
    </>
  );
}
