import { whyNowCards, whyNowCopy, whyNowSummary } from '@/lib/pricing/ongoing-seo';
import local from './LocalSeo.module.css';
import styles from './OngoingSeo.module.css';

/** Frame 3: three cards (no figures) and a summary band. The platforms the AI card names are
    printed as small labels. */
export default function OngoingSeoWhyNow() {
  return (
    <section className={local.sectionGrey}>
      <div className="container">
        <header className={local.head}>
          <p className={local.eyebrow}>{whyNowCopy.eyebrow}</p>
          <h2 className={local.heading}>{whyNowCopy.title}</h2>
        </header>

        <ul className={styles.whyNowGrid}>
          {whyNowCards.map((card) => (
            <li className={styles.whyNowCard} key={card.title}>
              <h3 className={styles.whyNowTitle}>{card.title}</h3>
              <p className={styles.whyNowBody}>{card.body}</p>
              {card.labels ? (
                <ul className={styles.labels}>
                  {card.labels.map((label) => (
                    <li key={label}>{label}</li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>

        <div className={styles.summary}>
          <p className={styles.summaryLead}>{whyNowSummary.lead}</p>
          <p className={styles.summaryBody}>{whyNowSummary.body}</p>
        </div>
      </div>
    </section>
  );
}
