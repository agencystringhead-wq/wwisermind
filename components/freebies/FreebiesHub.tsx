import Link from 'next/link';
import Breadcrumbs from '@/components/ui/Breadcrumbs';
import { serviceIcons } from '@/components/ui/icons';
import { ctaLabel, freebiePath, freebies, hubCta, hubHero } from '@/lib/freebies';
import { routes } from '@/lib/routes';
import local from '@/components/pricing/LocalSeo.module.css';
import LocalSeoCta from '@/components/pricing/LocalSeoCta';
import styles from './Freebies.module.css';

/** The /freebies/ hub: a text hero, a breadcrumb row, the grid of every freebie in order, and the
    closing call to action. A coming-soon freebie is a muted card with a "Coming soon" pill and a
    "Get notified" link to its page, where the email form is. */
export default function FreebiesHub() {
  return (
    <>
      <section className={local.section}>
        <div className={`container ${styles.pageHero}`}>
          <p className={local.eyebrow}>{hubHero.eyebrow}</p>
          <h1 className={local.heroTitle}>{hubHero.title}</h1>
          <p className={`${local.heroSub} ${styles.lede}`}>{hubHero.sub}</p>
        </div>
      </section>

      <Breadcrumbs
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Freebies', href: routes.freebies.hub },
        ]}
      />

      <section className={local.sectionGrey}>
        <div className="container">
          <ul className={styles.grid}>
            {freebies.map((freebie) => {
              const Icon = serviceIcons[freebie.icon];
              const soon = freebie.status === 'comingSoon';

              return (
                <li
                  className={`${styles.card} ${soon ? styles.cardSoon : ''}`}
                  key={freebie.slug}
                >
                  <div className={styles.cardTop}>
                    <span className={styles.icon}>
                      <Icon />
                    </span>
                    <span className={`${styles.pill} ${soon ? styles.pillSoon : ''}`}>
                      {soon ? 'Coming soon' : freebie.typeLabel}
                    </span>
                  </div>
                  <h2 className={styles.cardTitle}>{freebie.title}</h2>
                  <p className={styles.cardBody}>{freebie.shortDescription}</p>
                  <Link href={freebiePath(freebie)} className={styles.cardLink}>
                    {ctaLabel(freebie)} <span aria-hidden="true">→</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <LocalSeoCta cta={{ ...hubCta, button: hubCta.button }} />
    </>
  );
}
