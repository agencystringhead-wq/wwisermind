import { routes } from '@/lib/routes';
import ReviewsNumbers from '@/components/reviews/ReviewsNumbers';
import section from '@/components/services/Section.module.css';
import { PRICE_CURRENCY, pricingEntries, pricingFaqs } from '@/lib/pricing';
import { siteConfig, absUrl } from '@/lib/site';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import ToolCallout from '@/components/tools/ToolCallout';
import PricingFaq from './PricingFaq';
import PricingFeatured from './PricingFeatured';
import PricingHero from './PricingHero';
import PricingPackages from './PricingPackages';

/**
 * /pricing. Header, footer, the floating contact bar and the two yellow bars come from the
 * root layout, and the footer's own "ready to move faster?" block is the closing CTA, as on
 * every other page.
 *
 * The proof strip is the reviews page's "prefer numbers?" frame, dropped in unchanged.
 *
 * Structured data: FAQPage from the same strings the accordion prints, and one Offer per
 * package that has a real price and is allowed to show it. While every price is null there
 * are no offers, and none is emitted.
 */
export default function PricingPage() {
  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: pricingFaqs.map((item) => ({
      '@type': 'Question',
      name: item.title,
      acceptedAnswer: { '@type': 'Answer', text: item.body },
    })),
  };

  const offers = pricingEntries
    .filter((entry) => entry.showPrice && entry.startingPrice !== null)
    .map((entry) => ({
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: entry.name,
      description: entry.shortDescription,
      url: `${siteConfig.url}${entry.href}`,
      provider: { '@type': 'Organization', name: 'wwisermind', url: siteConfig.url },
      offers: {
        '@type': 'Offer',
        price: entry.startingPrice,
        priceCurrency: PRICE_CURRENCY,
        ...(entry.priceUnit === '/mo'
          ? {
              priceSpecification: {
                '@type': 'UnitPriceSpecification',
                price: entry.startingPrice,
                priceCurrency: PRICE_CURRENCY,
                unitText: 'MONTH',
              },
            }
          : {}),
        url: absUrl(routes.section(routes.pricing.hub, entry.id)),
      },
    }));

  const json = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json(faqData) }} />
      {offers.map((offer) => (
        <script
          key={offer.name}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: json(offer) }}
        />
      ))}
      <PricingHero />
      <Breadcrumbs
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Pricing', href: routes.pricing.hub },
        ]}
      />
      <ReviewsNumbers ground={section.grey} />
      <PricingFeatured />
      <PricingPackages />
      <PricingFaq />
      <ToolCallout
        variant="compact"
        toolIds={['website-scorecard']}
        eyebrow="Not sure what you need?"
        placement="pricing-hub"
      />
    </>
  );
}
