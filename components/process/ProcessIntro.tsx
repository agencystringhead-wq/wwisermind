import { processPage } from '@/lib/process';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Process.module.css';

/**
 * Frame 2 — the intro statement, on white. One centred sentence pair with the shared scroll
 * reveal, and a lot of air around it. The homepage's Our Process copy, tightened.
 */
export default function ProcessIntro() {
  return (
    <section className={styles.intro}>
      <div className="container">
        <ScrollReveal
          text={processPage.intro.statement}
          className={styles.statement}
          start={0.85}
          end={0.4}
        />
        <span className={styles.introRule} aria-hidden="true" />
      </div>
    </section>
  );
}
