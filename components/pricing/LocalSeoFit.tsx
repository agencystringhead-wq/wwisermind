import { serviceIcons } from '@/components/ui/icons';
import { fitCallout, fitCards, fitCopy } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 3: a 2x2 grid of check cards and the callout band under it. */
export default function LocalSeoFit() {
  return (
    <section className={styles.section}>
      <div className="container">
        <header className={styles.head}>
          <h2 className={styles.heading}>{fitCopy.title}</h2>
          <p className={styles.lede}>{fitCopy.sub}</p>
        </header>

        <ul className={styles.fitGrid}>
          {fitCards.map((card) => {
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
          <h3 className={styles.calloutTitle}>{fitCallout.title}</h3>
          <p className={styles.calloutBody}>{fitCallout.body}</p>
        </div>
      </div>
    </section>
  );
}
