import type { ProcessStage } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 5, shared: three stages joined by a line, horizontal on a desktop and vertical on a
    phone. `tone` picks the section ground so neighbours can alternate. */
export default function LocalSeoProcess({
  copy,
  stages,
  tone = 'white',
}: {
  copy: { title: string; sub: string };
  stages: ProcessStage[];
  tone?: 'white' | 'grey';
}) {
  return (
    <section className={tone === 'grey' ? styles.sectionGrey : styles.section}>
      <div className="container">
        <header className={styles.head}>
          <h2 className={styles.heading}>{copy.title}</h2>
          <p className={styles.lede}>{copy.sub}</p>
        </header>

        <ol className={styles.stages}>
          {stages.map((stage) => (
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
