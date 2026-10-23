import Link from 'next/link';
import local from '@/components/pricing/LocalSeo.module.css';
import { SERVICE_PRICING, routes, type ServiceKey } from '@/lib/routes';
import { categoryHubs } from '@/lib/categories';
import { services } from '@/lib/services';
import styles from './ServicesHub.module.css';

/** Every service, grouped by the category it already has, each linked to its own page and, when
    there is one, to the pricing page that prices it. */
export default function ServicesHub() {
  const groups = services
    .filter((service) => !service.draft)
    .reduce<Record<string, typeof services>>((acc, service) => {
      (acc[service.category] ??= []).push(service);
      return acc;
    }, {});

  return (
    <section className={local.section}>
      <div className="container">
        <header className={local.head}>
          <p className={local.eyebrow}>Services</p>
          <h1 className={local.heading}>Website, search and AI services for therapists</h1>
          <p className={local.lede}>
            Every service we offer, built for therapists and group practices. Each has its own
            page, and most have a pricing page too.
          </p>
        </header>

        {Object.entries(groups).map(([category, list]) => (
          <div className={styles.group} key={category}>
            <h2 className={styles.groupTitle}>
              <Link href={categoryHubs[category as keyof typeof categoryHubs].route}>
                {categoryHubs[category as keyof typeof categoryHubs].name}
              </Link>
            </h2>
            <ul className={styles.grid}>
              {list.map((service) => {
                const pricing = (SERVICE_PRICING as Partial<Record<ServiceKey, string>>)[service.slug];

                return (
                  <li className={styles.card} key={service.slug}>
                    <h3 className={styles.name}>
                      <Link href={routes.services.page(service.slug)}>{service.name}</Link>
                    </h3>
                    <p className={styles.body}>{service.heroOutcome}</p>
                    <p className={styles.links}>
                      <Link href={routes.services.page(service.slug)}>
                        How {service.name} works
                      </Link>
                      {pricing ? <Link href={pricing}>See {service.name} pricing</Link> : null}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
