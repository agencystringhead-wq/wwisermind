import Image from 'next/image';
import Link from 'next/link';
import { processSection } from '@/lib/site';
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
  const { badge, headingLead, headingRest, cta, steps, launchImage } = processSection;

  const ctaLink = (
    <Link href={cta.href} className={styles.link}>
      <LinkArrow />
      <span className={styles.linkText}>{cta.label}</span>
    </Link>
  );

  return (
    <section className={styles.section}>
      <ArrowPattern />

      <div className={`container ${styles.inner}`}>
        <p className={styles.badge}>{badge}</p>

        <h2 className={styles.heading}>
          {headingLead}
          <span className={styles.headingMuted}>{headingRest}</span>
        </h2>

        <div className={styles.steps}>
          <article className={`${styles.card} ${styles.cardTop}`}>
            <Image
              src="/images/pattern2.webp"
              alt=""
              width={1573}
              height={285}
              className={`${styles.blob} ${styles.blobOne}`}
            />
            <div className={styles.cardBody}>
              <h3 className={styles.stepTitle}>{steps[0].title}</h3>
              <p className={styles.stepBody}>{steps[0].body}</p>
              {ctaLink}
            </div>
          </article>

          <article className={`${styles.card} ${styles.cardBottom}`}>
            <Image
              src="/images/pattern1.webp"
              alt=""
              width={509}
              height={425}
              className={`${styles.blob} ${styles.blobTwo}`}
            />
            <div className={styles.cardBody}>
              <h3 className={styles.stepTitle}>{steps[1].title}</h3>
              <p className={styles.stepBody}>{steps[1].body}</p>
              {ctaLink}
            </div>
          </article>
        </div>

        <div className={styles.launch}>
          <div className={styles.launchImage}>
            <Image src={launchImage.src} alt={launchImage.alt} fill sizes="100vw" />
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
