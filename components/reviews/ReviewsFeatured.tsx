import Image from 'next/image';
import Link from 'next/link';
import { caseStudies } from '@/lib/services';
import { initials, reviewsPage, type Review } from '@/lib/reviews';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from '@/components/services/Section.module.css';
import styles from './Reviews.module.css';

/**
 * Frame 2 — the featured review as one large pull-quote. The quote carries the shared
 * scroll reveal word by word; the round photo sits on a blue-to-yellow gradient shape. The
 * "See the … project" link appears only when the reviewer's practice is one of the case
 * studies, so it can never point at the wrong project.
 */
export default function ReviewsFeatured({
  review,
  ground,
}: {
  review: Review;
  ground: string;
}) {
  const { featured } = reviewsPage;
  const study = Object.values(caseStudies).find((c) => c.name === review.practice);
  const where = [review.practice, review.location].filter(Boolean).join(', ');

  return (
    <section className={`${section.section} ${ground}`}>
      <div className={`container ${styles.featured}`}>
        <Reveal as="div" className={styles.portraitWrap}>
          <div className={styles.portraitStage} data-reveal="0">
            <span className={styles.blob} aria-hidden="true" />
            <span className={styles.blobRing} aria-hidden="true" />
            {review.photo ? (
              <Image
                src={review.photo}
                alt={review.name}
                width={240}
                height={240}
                className={styles.portrait}
              />
            ) : (
              <span className={styles.portrait} aria-hidden="true">
                <span className={styles.portraitInitials}>{initials(review.name)}</span>
              </span>
            )}
          </div>
        </Reveal>

        <figure className={styles.featuredBody}>
          <p className={section.eyebrow}>{featured.eyebrow}</p>
          <span className={styles.bigQuote} aria-hidden="true">
            &ldquo;
          </span>
          <ScrollReveal as="blockquote" text={review.quote} className={styles.featuredQuote} />

          <figcaption className={styles.byline}>
            <span className={styles.bylineName}>{review.name}</span>
            <span className={styles.bylineWhere}>
              {where}
              {review.date ? ` · ${review.date}` : ''}
            </span>
          </figcaption>

          {study ? (
            <Link href={featured.projectLinkHref} className={styles.textLink}>
              {featured.projectLinkLabel(study.name)}
              <span aria-hidden="true"> →</span>
            </Link>
          ) : null}
        </figure>
      </div>
    </section>
  );
}
