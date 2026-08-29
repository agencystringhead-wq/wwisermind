import Image from 'next/image';
import Link from 'next/link';
import { processSection } from '@/lib/site';
import GradientDrift from '@/components/ui/GradientDrift';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Process.module.css';

/** The design places this at its natural size, flush with the viewport's right edge. */
function ArrowPattern() {
  return (
    <Image
      src="/images/arrow-up.webp"
      alt=""
      width={349}
      height={258}
      className={styles.arrows}
      aria-hidden="true"
    />
  );
}

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

export default function Process() {
  const { badge, headingLead, headingRest, cta, steps, launchBackground } = processSection;

  const ctaLink = (
    <Link href={cta.href} className={styles.link}>
      <LinkArrow />
      <span className={styles.linkText}>{cta.label}</span>
    </Link>
  );

  return (
    <section className={styles.section}>
      <GradientDrift pausedClass={styles.motionPaused} />
      <ArrowPattern />

      <div className={`container ${styles.inner}`}>
        <p className={styles.badge}>{badge}</p>

        {/* The two halves were a fixed black/grey split; the reveal carries that contrast
            itself now, word by word, so they join back into one sentence.

            The window is widened from the headline default: this is 46 words where the
            problems headline is 8, and the default 0.75→0.35 would run all of them past in
            360px of scroll — one word every 8px. 0.95→0.25 spends 630px on them, the same
            pace per word the practice paragraphs run at, and still lands the last word with
            the whole block in view. */}
        <ScrollReveal
          text={`${headingLead}${headingRest}`}
          className={styles.heading}
          start={0.95}
          end={0.25}
        />

        <div className={styles.steps}>
          <article className={`${styles.card} ${styles.cardTop}`}>
            <span className={`${styles.blobWrap} ${styles.blobOne}`} aria-hidden="true">
              <Image
                src="/images/pattern2.webp"
                alt=""
                width={1573}
                height={285}
                className={styles.blob}
              />
            </span>
            <div className={styles.cardBody}>
              <h3 className={styles.stepTitle}>{steps[0].title}</h3>
              <p className={styles.stepBody}>{steps[0].body}</p>
              {ctaLink}
            </div>
          </article>

          <article className={`${styles.card} ${styles.cardBottom}`}>
            <span className={`${styles.blobWrap} ${styles.blobTwo}`} aria-hidden="true">
              <Image
                src="/images/pattern1.webp"
                alt=""
                width={509}
                height={425}
                className={styles.blob}
              />
            </span>
            <div className={styles.cardBody}>
              <h3 className={styles.stepTitle}>{steps[1].title}</h3>
              <p className={styles.stepBody}>{steps[1].body}</p>
              {ctaLink}
            </div>
          </article>
        </div>

        <div className={styles.launch}>
          <div className={styles.launchImage}>
            <video
              poster={launchBackground.poster}
              aria-label={launchBackground.alt}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              {launchBackground.sources.map((source) => (
                <source key={source.src} src={source.src} type={source.type} />
              ))}
            </video>
          </div>

          <div className={styles.launchCard}>
            <h3 className={styles.stepTitle}>{steps[2].title}</h3>
            <p className={styles.stepBody}>{steps[2].body}</p>
            {ctaLink}
          </div>
        </div>
      </div>
    </section>
  );
}
