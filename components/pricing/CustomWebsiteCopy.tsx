import type { CopyRow } from '@/lib/pricing/custom-website';
import local from './LocalSeo.module.css';
import styles from './CustomWebsite.module.css';

/** The copywriting add-on: text on the left, a small price card on the right, side by side
    from 768px and stacked below. The row tagged "Best value" carries the shared pill. */
export default function CustomWebsiteCopy({
  copy,
  card,
}: {
  copy: { eyebrow: string; title: string; body: string; note: string };
  card: { title: string; rows: CopyRow[] };
}) {
  return (
    <section className={local.section} id="copywriting">
      <div className="container">
        <div className={styles.copyGrid}>
          <div className={styles.copyText}>
            <p className={local.eyebrow}>{copy.eyebrow}</p>
            <h2 className={`${local.heading} ${styles.heading}`}>{copy.title}</h2>
            <p className={styles.copyBody}>{copy.body}</p>
            <p className={styles.copyNote}>{copy.note}</p>
          </div>

          <div className={styles.copyCard}>
            <h3 className={styles.copyCardTitle}>{card.title}</h3>
            <ul className={styles.copyRows}>
              {card.rows.map((row) => (
                <li className={styles.copyRow} key={row.label}>
                  <span className={styles.copyLabel}>
                    {row.label}
                    {row.tag ? <span className={local.pill}>{row.tag}</span> : null}
                  </span>
                  <span className={styles.copyValue}>{row.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
