import { processPage } from '@/lib/process';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from '@/components/services/Section.module.css';
import ConfirmChip from './ConfirmChip';
import styles from './Process.module.css';

/**
 * Frame 4 — the One Week Website week, Day 1 to Day 7, on the light grey.
 *
 * A strip of seven days on a blue-to-yellow line: on desktop the days run left to right,
 * under 1024px they stack down the same line. The days arrive one after another through the
 * shared Reveal. Which stage lands on which day is not in lib/services.ts, so every day but
 * the last carries a Confirm chip while the page is a draft.
 *
 * The seven days share five reveal stages (0 to 4), not seven: the shared Reveal gives each
 * later stage a smaller window, and past stage 5 an item can never finish arriving.
 */
export default function ProcessTimeline() {
  const { eyebrow, heading, lede, days, before, note } = processPage.timeline;

  return (
    <section className={`${section.section} ${section.grey}`}>
      <div className="container">
        <Reveal as="header" className={section.head}>
          <p className={section.eyebrow} data-reveal="0">
            {eyebrow}
          </p>
          <ScrollReveal text={heading} className={section.heading} />
          <p className={section.lede} data-reveal="2">
            {lede}
          </p>
        </Reveal>

        <p className={styles.before}>
          <span className={styles.beforeLabel}>{before.label}</span>
          {before.detail}
        </p>

        <Reveal as="ol" className={styles.days}>
          {days.map((d, i) => {
            const launch = d.day === 7;
            const cls = [
              styles.day,
              'review' in d && d.review ? styles.dayReview : '',
              launch ? styles.dayLaunch : '',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <li className={cls} key={d.day} data-reveal={String(Math.round((i * 4) / (days.length - 1)))}>
                <span className={styles.dot} aria-hidden="true" />
                <div className={styles.dayCard}>
                  <p className={styles.dayNum}>Day {d.day}</p>
                  <p className={styles.dayLabel}>{d.label}</p>
                  <p className={styles.dayDetail}>
                    {d.detail}
                    <ConfirmChip question={'confirm' in d ? d.confirm : undefined} />
                  </p>
                </div>
              </li>
            );
          })}
        </Reveal>

        <p className={styles.timelineNote}>{note}</p>
      </div>
    </section>
  );
}
