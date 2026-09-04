import Image from 'next/image';
import type { Service } from '@/lib/services';
import Accordion from '@/components/ui/Accordion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceProcess.module.css';

/**
 * Frame 10: the process, as the core-values reference — the photograph on the left, and
 * on the right a card with an eyebrow, a heading, a rule, and the rows: each a title with
 * a check in a ring at its end, the first open on its paragraph and the rest closed. The
 * accordion is the shared one in its check setting.
 */
export default function ServiceProcess({
  block,
  ground,
}: {
  block: NonNullable<Service['process']>;
  ground: Ground;
}) {
  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className={`container ${styles.grid}`}>
        <figure className={styles.figure}>
          <Image
            src={block.image.src}
            alt={block.image.alt}
            fill
            sizes="(max-width: 1023px) 100vw, 640px"
            style={{ objectPosition: block.image.position }}
          />
          <span className={styles.shine} aria-hidden="true" />
        </figure>

        <div className={styles.card}>
          <p className={section.eyebrow}>Our process</p>
          <ScrollReveal text={block.heading} className={styles.heading} />
          <span className={styles.rule} aria-hidden="true" />

          <Accordion items={block.rows} indicator="check" defaultOpen={0} className={styles.rows} />
        </div>
      </div>
    </section>
  );
}
