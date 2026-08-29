import Image from 'next/image';
import Link from 'next/link';
import { practice } from '@/lib/site';
import CountUp from '@/components/ui/CountUp';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Practice.module.css';

/* The project's own arrow — no icon package here, and this is the same glyph the built
   widget has always used, so the two cards stay one family. */
function UpArrow({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 32" fill="currentColor" aria-hidden="true">
      <path d="M12 0l10.5 12.5H16V32H8V12.5H1.5L12 0z" />
    </svg>
  );
}

/* One window for both paragraphs, so the two rows scrub at the same rate. */
const REVEAL_START = 0.95;
const REVEAL_END = 0.3;

function LinkArrow() {
  return (
    <svg
      className={styles.linkArrow}
      width="14"
      height="10"
      viewBox="0 0 14 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M1 5h11" />
      <path d="M8.5 1.5L12 5l-3.5 3.5" />
    </svg>
  );
}

export default function Practice() {
  const { headingLead, headingRest, metric, rows } = practice;

  return (
    <section className={styles.section}>
      <div className="container">
        {/* The two halves were a fixed black/grey split; the reveal carries that contrast
            itself now, word by word, so they join back into one sentence. */}
        <ScrollReveal text={`${headingLead} ${headingRest}`} className={styles.heading} />

        <div className={styles.rows}>
          {rows.map((row) => {
            /* Optional on the row rather than required, so a truthiness check rather than the
               `in` narrowing the problem cards use — their two shapes are a real union, this
               is one shape with a field a row may or may not fill in. Both rows fill it in. */
            const { metricImage } = row;

            return (
            <div
              className={`${styles.row} ${row.photoFirst ? styles.rowReverse : ''}`}
              key={row.title}
            >
              <div className={styles.panel}>
                <div className={styles.panelInner}>
                  {/* A row that brings its own metric card renders that instead of the built
                      one — the file already contains the back card, the label, the figure and
                      the chart, so composing the two would double every part of it. */}
                  {metricImage ? (
                    /* Graph as the image, figure as real text over it. The wrapper is the
                       container the overlay sizes itself against, so every part of the
                       figure scales with the card rather than with the page. */
                    <div className={styles.card}>
                      <Image
                        src={metricImage.src}
                        alt={metricImage.alt}
                        width={metricImage.width}
                        height={metricImage.height}
                        className={styles.cardImage}
                      />
                      <div className={styles.cardText}>
                        <p className={styles.cardLabel}>{metricImage.label}</p>
                        <p className={styles.cardMetric}>
                          <UpArrow className={styles.cardArrow} />
                          <CountUp to={metricImage.value} className={styles.cardValue} />
                          <span className={styles.cardUnit}>{metricImage.unit}</span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.widget}>
                      <span className={styles.widgetBack} aria-hidden="true" />

                      <div className={styles.widgetBody}>
                        {/* One weight across the whole label: the image card's has no bolded
                            first word, and matching it means this one loses its <strong>. */}
                        <p className={styles.metricLabel}>{metric.label}</p>
                        <p className={styles.metric}>
                          <UpArrow className={styles.metricArrow} />
                          <CountUp to={metric.value} className={styles.metricValue} />
                          <span className={styles.metricUnit}>{metric.unit}</span>
                        </p>
                        <span className={styles.bar} aria-hidden="true" />
                        <span className={`${styles.bar} ${styles.barShort}`} aria-hidden="true" />
                      </div>

                      <Image
                        src="/images/arrow.webp"
                        alt=""
                        width={128}
                        height={128}
                        className={styles.widgetIcon}
                      />
                    </div>
                  )}

                  <h3 className={styles.title}>{row.title}</h3>
                  {/* Body copy, so it renders as a <p> rather than the component's default
                      h2. The window is widened from the headline default because these are
                      four times the words: at 0.75→0.35 a whole paragraph would sweep past in
                      a third of a screen. 0.95→0.30 lets it start as it clears the fold and
                      land while it still sits comfortably above the middle. */}
                  <ScrollReveal
                    as="p"
                    text={row.body}
                    className={styles.body}
                    start={REVEAL_START}
                    end={REVEAL_END}
                  />

                  <Link href={row.link.href} className={styles.link}>
                    <LinkArrow />
                    <span className={styles.linkText}>{row.link.label}</span>
                  </Link>
                </div>
              </div>

              <div className={styles.photo}>
                <video
                  poster={row.background.poster}
                  aria-label={row.background.alt}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                >
                  {row.background.sources.map((source) => (
                    <source key={source.src} src={source.src} type={source.type} />
                  ))}
                </video>
              </div>
            </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
