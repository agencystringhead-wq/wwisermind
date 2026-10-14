import { CheckIcon } from '@/components/ui/icons';
import local from './LocalSeo.module.css';
import styles from './CarePlans.module.css';

type Column = { title: string; items: string[] };

function Dash() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M7 12h10" />
    </svg>
  );
}

/** What a plan's support time covers and what is quoted separately: two light columns, side by
    side from 768px and stacked below. */
export default function CarePlansSupport({
  copy,
  included,
  quoted,
  note,
}: {
  copy: { title: string };
  included: Column;
  quoted: Column;
  note: string;
}) {
  return (
    <section className={local.sectionGrey}>
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{copy.title}</h2>
        </header>

        <ul className={styles.supportGrid}>
          <li className={styles.supportCol}>
            <h3 className={styles.supportTitle}>{included.title}</h3>
            <ul className={styles.supportList}>
              {included.items.map((item) => (
                <li key={item}>
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
          </li>
          <li className={`${styles.supportCol} ${styles.supportQuoted}`}>
            <h3 className={styles.supportTitle}>{quoted.title}</h3>
            <ul className={styles.supportList}>
              {quoted.items.map((item) => (
                <li key={item}>
                  <Dash />
                  {item}
                </li>
              ))}
            </ul>
          </li>
        </ul>

        <p className={styles.supportNote}>{note}</p>
      </div>
    </section>
  );
}
