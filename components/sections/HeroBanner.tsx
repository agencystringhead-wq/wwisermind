import Image from 'next/image';
import Link from 'next/link';
import { heroBanner } from '@/lib/site';
import styles from './HeroBanner.module.css';

function Star() {
  return (
    <svg className={styles.star} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.6l3.1 6.3 6.9 1-5 4.87 1.18 6.87L12 17.4l-6.18 3.24L7 13.77l-5-4.87 6.9-1L12 1.6z" />
    </svg>
  );
}

function QuoteMark() {
  return (
    <svg className={styles.quote} viewBox="0 0 17 17" fill="currentColor" aria-hidden="true">
      <path d="M4 0h4.4L5.4 17H1L4 0zm8 0h4.4l-3 17H9l3-17z" />
    </svg>
  );
}

export default function HeroBanner() {
  const { image, headingLines, brandWord, brandHref, linkLabel, linkHref, testimonial } =
    heroBanner;
  const [brandBefore, brandAfter] = headingLines[1].split('{brand}');

  return (
    <section className={styles.section}>
      <div className={styles.banner}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="100vw"
          priority
          className={styles.image}
        />

        <div className={styles.inner}>
          <div className={styles.textWrap}>
            <div className="container">
              <h3 className={styles.heading}>
                {headingLines[0]}
                <br className={styles.lineBreak} />{' '}
                {brandBefore}
                <Link href={brandHref} className={styles.brand}>
                  {brandWord}
                </Link>
                {brandAfter}
                <br className={styles.lineBreak} /> {headingLines[2]}
              </h3>

              <Link href={linkHref} className={styles.storyLink}>
                {linkLabel}
              </Link>
            </div>
          </div>

          <figure className={styles.card}>
            <div className={styles.cardTop}>
              <div
                className={styles.stars}
                role="img"
                aria-label={`${testimonial.rating} out of 5 stars`}
              >
                {Array.from({ length: testimonial.rating }, (_, i) => (
                  <Star key={i} />
                ))}
              </div>
              <QuoteMark />
            </div>

            <blockquote className={styles.quoteText}>{testimonial.quote}</blockquote>

            <figcaption className={styles.author}>
              <Image
                src={testimonial.author.avatar}
                alt={testimonial.author.name}
                width={88}
                height={88}
                className={styles.avatar}
              />
              <div>
                <div className={styles.authorName}>{testimonial.author.name}</div>
                <div className={styles.authorRole}>{testimonial.author.role}</div>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
