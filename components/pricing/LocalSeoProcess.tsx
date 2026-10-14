import Link from 'next/link';
import type { ProcessStage } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 5, shared: stages joined by a line, horizontal on a desktop and vertical on a phone.
    The column count follows the number of stages (three for the other pages, four for the
    ongoing roadmap). `tone` picks the section ground so neighbours can alternate. */
export default function LocalSeoProcess({
  copy,
  stages,
  tone = 'white',
  note,
  link,
}: {
  copy: { eyebrow?: string; title: string; sub?: string };
  stages: ProcessStage[];
  tone?: 'white' | 'grey';
  /** A line under the timeline. */
  note?: string;
  /** A small line of text and a link under the timeline. */
  link?: { text: string; label: string; href: string };
}) {
  return (
    <section className={tone === 'grey' ? styles.sectionGrey : styles.section}>
      <div className="container">
        <header className={styles.head}>
          {copy.eyebrow ? <p className={styles.eyebrow}>{copy.eyebrow}</p> : null}
          <h2 className={styles.heading}>{copy.title}</h2>
          {copy.sub ? <p className={styles.lede}>{copy.sub}</p> : null}
        </header>

        <ol
          className={styles.stages}
          style={{ '--stage-count': stages.length } as React.CSSProperties}
        >
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

        {note ? <p className={styles.stagesNote}>{note}</p> : null}
        {link ? (
          <p className={styles.stagesNote}>
            {link.text}{' '}
            <Link href={link.href} className={styles.inlineLink}>
              {link.label}
            </Link>
          </p>
        ) : null}
      </div>
    </section>
  );
}
