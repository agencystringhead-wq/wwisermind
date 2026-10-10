import { hasRealUrl, reviewsPage, reviewsSummary } from '@/lib/reviews';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from '@/components/services/Section.module.css';
import styles from './Reviews.module.css';

/**
 * Frame 4 — a centred, unpushy prompt. The button is drawn only once `googleWriteReviewUrl`
 * is a real address; until then the warm copy stands on its own.
 */
export default function ReviewsWorked({ ground }: { ground: string }) {
  const { worked } = reviewsPage;
  const url = reviewsSummary.googleWriteReviewUrl;

  return (
    <section className={`${section.section} ${ground}`}>
      <Reveal as="div" className={`container ${section.head}`}>
        <p className={section.eyebrow} data-reveal="0">
          {worked.eyebrow}
        </p>
        <ScrollReveal text={worked.heading} className={section.heading} />
        <p className={styles.workedBody} data-reveal="2">
          {worked.body}
        </p>
        {hasRealUrl(url) ? (
          <a
            href={url}
            className={styles.workedButton}
            target="_blank"
            rel="noreferrer"
            data-reveal="3"
          >
            {worked.button}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </Reveal>
    </section>
  );
}
