import { CheckIcon } from '@/components/ui/icons';
import { phases, phasesCopy } from '@/lib/pricing/one-time-seo';
import local from './LocalSeo.module.css';
import styles from './OneTimeSeo.module.css';

/** Frame 3: the three phases, side by side on a desktop. Each is the Local SEO package card
    (white shell, title, check-badge rows) with a large number on top; the rows have a label
    and no value, so the value column is simply absent. */
export default function OneTimeSeoPhases() {
  return (
    <section className={local.sectionGrey} id="phases">
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{phasesCopy.title}</h2>
          <p className={local.lede}>{phasesCopy.sub}</p>
        </header>

        <ol className={styles.phaseGrid}>
          {phases.map((phase, index) => (
            <li className={`${local.pkg} ${styles.phaseCard}`} key={phase.title}>
              <span className={styles.phaseNumber} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={local.pkgName}>{phase.title}</h3>
              <p className={`${local.pkgFor} ${styles.phasePurpose}`}>{phase.purpose}</p>

              <ul className={local.pkgRows}>
                {phase.items.map((item) => (
                  <li className={local.pkgRow} key={item}>
                    <span className={local.rowLabel}>
                      <span className={local.rowCheck}>
                        <CheckIcon />
                      </span>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
