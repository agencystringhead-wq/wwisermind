import Image from 'next/image';
import { founder } from '@/lib/site';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Founder.module.css';

/** The design's quote mark is a pair of squared commas, not a typographic glyph. */
function QuoteMark() {
  return (
    <svg className={styles.mark} viewBox="0 0 86 63" fill="currentColor" aria-hidden="true">
      <path d="M0 0h35v35L22 63H8L0 35z" />
      <path d="M51 0h35v35L73 63H59l-8-28z" />
    </svg>
  );
}

export default function Founder() {
  const { portrait, quote, attribution } = founder;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <Image
            src={portrait.src}
            alt={portrait.alt}
            width={274}
            height={275}
            className={styles.portrait}
            style={{ objectPosition: portrait.position }}
          />

          <figure className={styles.quoteColumn}>
            <QuoteMark />

            {/* Still a quotation, so it keeps its element — the reveal renders whatever tag
                it is handed. The window matches the process passage: 46 words there, 58 here,
                and the headline default would run all of them past in a third of a screen. */}
            <ScrollReveal
              as="blockquote"
              text={quote}
              className={styles.quote}
              start={0.95}
              end={0.25}
            />

            <figcaption className={styles.attribution}>{attribution}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
