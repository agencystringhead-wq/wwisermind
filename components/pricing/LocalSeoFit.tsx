import { serviceIcons } from '@/components/ui/icons';
import type { FitCallout, FitCard } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 3, shared: a 2x2 grid of check cards and the callout band under it. */
export default function LocalSeoFit({
  copy,
  cards,
  callout,
}: {
  copy: { title: string; sub: string };
  cards: FitCard[];
  callout: FitCallout;
}) {
  return (
    <section className={styles.section}>
      <div className="container">
        <header className={styles.head}>
          <h2 className={styles.heading}>{copy.title}</h2>
          <p className={styles.lede}>{copy.sub}</p>
        </header>

        <ul className={styles.fitGrid}>
          {cards.map((card) => {
            const Icon = serviceIcons[card.icon];

            return (
              <li className={styles.fitCard} key={card.title}>
                <span className={styles.fitIcon}>
                  <Icon />
                </span>
                <div>
                  <h3 className={styles.fitTitle}>{card.title}</h3>
                  <p className={styles.fitBody}>{card.body}</p>
                </div>
              </li>
            );
          })}
        </ul>

        <div className={styles.callout}>
          <h3 className={styles.calloutTitle}>{callout.title}</h3>
          <p className={styles.calloutBody}>{callout.body}</p>
        </div>
      </div>
    </section>
  );
}
