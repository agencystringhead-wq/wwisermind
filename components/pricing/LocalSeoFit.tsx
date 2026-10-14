import Link from 'next/link';
import { serviceIcons } from '@/components/ui/icons';
import type { FitCallout, FitCard } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 3, shared: a 2x2 grid of check cards and the callout band under it. */
export default function LocalSeoFit({
  copy,
  cards,
  callout,
  tone = 'white',
}: {
  copy: { title: string; sub?: string };
  cards: FitCard[];
  callout: FitCallout;
  tone?: 'white' | 'grey';
}) {
  return (
    <section className={tone === 'grey' ? styles.sectionGrey : styles.section}>
      <div className="container">
        <header className={styles.head}>
          <h2 className={styles.heading}>{copy.title}</h2>
          {copy.sub ? <p className={styles.lede}>{copy.sub}</p> : null}
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
          {callout.link ? (
            <Link href={callout.link.href} className={styles.calloutLink}>
              {callout.link.label} <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
