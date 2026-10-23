import Link from 'next/link';
import LocalSeoCta from '@/components/pricing/LocalSeoCta';
import ToolCallout from '@/components/tools/ToolCallout';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { categoryHubs, type CategoryHubId } from '@/lib/categories';
import { pricingEntries } from '@/lib/pricing';
import { routes, SERVICE_PRICING, type ServiceKey } from '@/lib/routes';
import { services } from '@/lib/services';
import { absUrl, megaPanels, siteConfig } from '@/lib/site';
import type { ToolId } from '@/lib/tools';
import local from '@/components/pricing/LocalSeo.module.css';
import styles from './CategoryHub.module.css';

type HubCard = {
  key: string;
  name: string;
  href: string;
  tagline: string;
  body: string;
  /** Printed only when the pricing data has a real number for it; never typed here. */
  startingAt?: string;
};

/** The one free tool each hub points to. */
const hubTool: Partial<Record<CategoryHubId, ToolId>> = {
  'website-design': 'website-scorecard',
  marketing: 'local-map-assessment',
  ai: 'therapy-index',
  'who-we-help': 'website-scorecard',
};

/** "$1,500" for a pricing entry that has a number and is allowed to show it, otherwise nothing. */
function startingPrice(slug: string): string | undefined {
  const href = (SERVICE_PRICING as Partial<Record<ServiceKey, string>>)[slug as ServiceKey];
  const entry = href ? pricingEntries.find((item) => item.href === href) : undefined;
  if (!entry || !entry.showPrice || entry.startingPrice === null) return undefined;
  const amount = `$${entry.startingPrice.toLocaleString('en-US')}`;
  return entry.priceUnit === '/mo' ? `${amount}/mo` : amount;
}

/** The cards for a hub: a service category's services, straight from lib/services.ts, or the two
    audiences with the text their menu card already has. */
function cardsFor(id: CategoryHubId): HubCard[] {
  if (id === 'who-we-help') {
    return (megaPanels['Who We Help']?.columns ?? [])
      .flatMap((column) => column.links)
      .map((link) => ({
        key: link.href,
        name: link.label,
        href: link.href,
        tagline: link.desc ?? '',
        body: link.body ?? '',
      }));
  }

  return services
    .filter((service) => service.category === id && !service.draft)
    .map((service) => ({
      key: service.slug,
      name: service.name,
      href: routes.services.page(service.slug),
      tagline: service.tagline,
      body: service.heroOutcome,
      startingAt: startingPrice(service.slug),
    }));
}

/**
 * A category hub: the services (or the two audiences) of one kind as cards, one free tool, and a
 * closing call to book. The H1, intro and meta words are lib/categories.ts's; the cards are read
 * from the data, so a service added there appears here with no edit. Nothing animates.
 */
export default function CategoryHub({ id }: { id: Exclude<CategoryHubId, 'free-resources'> }) {
  const hub = categoryHubs[id];
  const cards = cardsFor(id);
  const toolId = hubTool[id];

  const url = absUrl(hub.route);
  const collection = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${url}#page`,
    name: hub.h1,
    description: hub.metaDescription,
    url,
    isPartOf: { '@type': 'WebSite', name: siteConfig.name, url: siteConfig.url },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: cards.map((card, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: card.name,
        url: absUrl(card.href),
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collection).replace(/</g, '\\u003c') }}
      />

      <section className={local.section}>
        <div className={`container ${styles.hero}`}>
          <h1 className={local.heroTitle}>{hub.h1}</h1>
          <p className={`${local.heroSub} ${styles.lede}`}>{hub.intro}</p>
        </div>
      </section>

      <Breadcrumbs
        trail={[
          { label: 'Home', href: routes.home },
          { label: hub.name, href: hub.route },
        ]}
      />

      <section className={local.sectionGrey}>
        <div className="container">
          <ul className={`${styles.grid} ${cards.length === 3 || cards.length === 6 ? styles.grid3 : ''}`}>
            {cards.map((card) => (
              <li className={styles.card} key={card.key}>
                {card.tagline ? <p className={styles.tagline}>{card.tagline}</p> : null}
                <h2 className={styles.name}>
                  <Link href={card.href}>{card.name}</Link>
                </h2>
                {card.body ? <p className={styles.body}>{card.body}</p> : null}
                <p className={styles.foot}>
                  {card.startingAt ? (
                    <span className={styles.price}>Starting at {card.startingAt}</span>
                  ) : null}
                  <Link href={card.href} className={styles.more}>
                    Learn more <span aria-hidden="true">→</span>
                  </Link>
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {toolId ? <ToolCallout variant="wide" toolId={toolId} placement={`category-${id}`} /> : null}

      <LocalSeoCta
        cta={{
          title: 'Not sure where to start?',
          sub: 'Book a free 30-minute call. We will look at your practice and tell you honestly what would help.',
          button: { label: 'Book Your Free Call', href: siteConfig.bookingPage },
        }}
      />
    </>
  );
}
