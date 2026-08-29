import Image from 'next/image';
import { whyUs } from '@/lib/site';
import BackgroundVideo from '@/components/ui/BackgroundVideo';
import styles from './WhyUs.module.css';

/** Splits a headline once, after its first sentence. The copy is untouched — this only says
    where the two halves are, so CSS can turn the second onto its own line at desktop and let
    it flow back inline on a phone. A headline with no internal full stop stays whole. */
function sentences(title: string) {
  const at = title.indexOf('. ');
  return at === -1 ? [title] : [title.slice(0, at + 1), title.slice(at + 2)];
}

export default function WhyUs() {
  const { label, background, rows } = whyUs;

  return (
    <section className={styles.section}>
      <div className={styles.block} style={{ backgroundColor: background.color }}>
        <BackgroundVideo
          src={background.sources[0].src}
          type={background.sources[0].type}
          poster={background.poster}
          className={styles.backdrop}
        />
        <span className={styles.scrim} aria-hidden="true" />

        <div className={`container ${styles.inner}`}>
          <p className={styles.label}>{label}</p>

          <div className={styles.rows}>
            {/* Four real grid children rather than three with the number tucked inside a
                sub-flex: one column-gap then governs every gap in the row, and all four
                centre on the same axis. */}
            {rows.map((row) => (
              <article className={styles.row} key={row.number}>
                <span className={styles.number}>{row.number}</span>
                {/* The break has to come from the markup: the second sentence is longer
                    than the first sentence plus one word in every row, so no width exists
                    that turns the line at the full stop and still holds the remainder on one
                    line. Grouping does it, and unlike a <br> it can be undone on mobile. */}
                <h3
                  className={
                    sentences(row.title).length === 1
                      ? `${styles.title} ${styles.titleWhole}`
                      : styles.title
                  }
                >
                  {sentences(row.title).map((part, index, all) => (
                    <span className={styles.titleLine} key={part}>
                      {part}
                      {index < all.length - 1 ? ' ' : ''}
                    </span>
                  ))}
                </h3>

                <figure className={styles.figure}>
                  <Image
                    src={row.image}
                    alt={row.imageAlt}
                    fill
                    sizes="(max-width: 1023px) 420px, 220px"
                    style={{ objectPosition: row.imagePosition }}
                  />
                  <span className={styles.shine} aria-hidden="true" />
                </figure>

                <p className={styles.body}>{row.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
