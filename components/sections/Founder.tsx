import Image from 'next/image';
import { founder } from '@/lib/site';
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
  const { portrait, quoteLead, quoteRest, attribution } = founder;

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
          />

          <figure className={styles.quoteColumn}>
            <QuoteMark />

            <blockquote className={styles.quote}>
              {quoteLead}
              <span className={styles.quoteRest}>{quoteRest}</span>
            </blockquote>

            <figcaption className={styles.attribution}>{attribution}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
