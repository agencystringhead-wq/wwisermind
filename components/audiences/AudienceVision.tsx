import Image from 'next/image';
import { audienceFounder, type Audience } from '@/lib/audiences';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import shared from './Audience.module.css';
import styles from './AudienceVision.module.css';

/**
 * Frame 6: the vision, on the dark ground — the founder's portrait at the left with his
 * name and role under it in the mono byline, and at the right the mono eyebrow on its
 * rule, the statement at the frame's scale with the word reveal on it, and the paragraph
 * that supports it. The portrait is the homepage's; the byline is set the way the footer
 * clocks and the founder frame set theirs.
 */
export default function AudienceVision({ audience }: { audience: Audience }) {
  const { statement, paragraph } = audience.vision;
  const { portrait, name, role } = audienceFounder;

  return (
    <section className={`${shared.section} ${shared.dark} ${styles.section}`}>
      <Reveal className={`container ${styles.grid}`}>
        <figure className={styles.founder} data-reveal="2">
          <span className={`${shared.figure} ${styles.portrait}`}>
            <Image
              src={portrait.src}
              alt={portrait.alt}
              fill
              sizes="(max-width: 640px) 60vw, 292px"
              style={{ objectPosition: portrait.position }}
            />
            <span className={shared.shine} aria-hidden="true" />
          </span>
          <figcaption className={styles.byline}>
            <span className={styles.name}>{name}</span>
            <span className={styles.role}>{role}</span>
          </figcaption>
        </figure>

        <div className={styles.copy}>
          <p className={styles.eyebrow} data-reveal="0">
            <span>Our vision</span>
            <span className={styles.eyebrowRule} aria-hidden="true" />
          </p>
          <div data-reveal="0">
            <ScrollReveal
              text={statement}
              className={`${shared.title} ${shared.onDark} ${styles.statement}`}
            />
          </div>
          <p className={`${shared.bodyOnDark} ${styles.paragraph}`} data-reveal="1">
            {paragraph}
          </p>
        </div>
      </Reveal>
    </section>
  );
}
