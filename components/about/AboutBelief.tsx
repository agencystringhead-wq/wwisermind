import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './AboutBelief.module.css';

/**
 * Frame 5 — belief statement.
 *
 * Dark grey ground. One large statement, centred, revealed by scroll. Generous
 * space around it. No stat row — we have no verified figures.
 *
 * Draft copy shown here — review and confirm before finalising.
 */

/*
 * DRAFT — BELIEF STATEMENT
 *
 * The copy below is a draft in the wwisermind voice. Please read it and let me
 * know if the tone and emphasis are right, or if you would like a different angle.
 * I will finalise it once you have reviewed it.
 */
const BELIEF =
  'We do not work in marketing.\nWe work in trust.\nEvery word we write, every page we build,\nis meant to earn it.';

export default function AboutBelief() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.inner}>
          <ScrollReveal
            text={BELIEF}
            className={styles.statement}
            start={0.88}
            end={0.2}
          />
        </div>
      </div>
    </section>
  );
}
