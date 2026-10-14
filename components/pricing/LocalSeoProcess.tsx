import { processCopy, processStages } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 5: three stages joined by a line, horizontal on a desktop and vertical on a phone. */
export default function LocalSeoProcess() {
  return (
    <section className={styles.section}>
      <div className="container">
        <header className={styles.head}>
          <h2 className={styles.heading}>{processCopy.title}</h2>
          <p className={styles.lede}>{processCopy.sub}</p>
        </header>

        <ol className={styles.stages}>
          {processStages.map((stage) => (
            <li className={styles.stage} key={stage.title}>
              <span className={styles.stageDot} aria-hidden="true" />
              <p className={styles.eyebrow}>{stage.when}</p>
              <h3 className={styles.stageTitle}>{stage.title}</h3>
              <ul className={styles.stageSteps}>
                {stage.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
