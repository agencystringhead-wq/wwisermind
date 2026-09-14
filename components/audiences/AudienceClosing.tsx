import type { Audience } from '@/lib/audiences';
import ScrollReveal from '@/components/ui/ScrollReveal';
import shared from './Audience.module.css';
import styles from './AudienceClosing.module.css';

/**
 * Frame 10: the closing statement, as the opus reference's — one sentence, large, with
 * generous space around it, and nothing else in the frame. Centred here, at the hero's
 * scale, with the word reveal on it so it is read in as the page arrives at its end.
 */
export default function AudienceClosing({ audience }: { audience: Audience }) {
  return (
    <section className={`${shared.section} ${shared.grey} ${styles.section}`}>
      <div className="container">
        <ScrollReveal text={audience.closing} className={styles.statement} start={0.9} end={0.45} />
      </div>
    </section>
  );
}
