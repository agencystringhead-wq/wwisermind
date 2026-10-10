'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import { formatRating, initials, reviewsPage, reviewsSummary, type Review } from '@/lib/reviews';
import { StarIcon } from '@/components/ui/icons';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from '@/components/services/Section.module.css';
import hover from '@/components/ui/MediaHover.module.css';
import styles from './Reviews.module.css';

type Filter = 'all' | 'group' | 'solo';

/**
 * One card. The quote is always whole in the page; past `truncateAfter` characters it is
 * clamped to a few lines with a Read more button that carries `aria-expanded`, so the full
 * text is there for a screen reader and for the keyboard either way.
 */
function ReviewCard({ review }: { review: Review }) {
  const [open, setOpen] = useState(false);
  const quoteId = useId();
  const long = review.quote.length > reviewsPage.wall.truncateAfter;
  const where = [review.practice, review.location].filter(Boolean).join(', ');
  const stars = Math.round(reviewsSummary.rating);

  return (
    <article className={`${styles.card} ${hover.frame}`}>
      <span className={hover.shine} aria-hidden="true" />

      <span
        className={styles.cardStars}
        role="img"
        aria-label={`${formatRating(reviewsSummary.rating)} out of ${reviewsSummary.outOf} stars`}
      >
        {Array.from({ length: stars }, (_, i) => (
          <StarIcon key={i} className={styles.cardStar} />
        ))}
      </span>

      <blockquote
        id={quoteId}
        className={`${styles.cardQuote} ${long && !open ? styles.clamped : ''}`}
      >
        <p>&ldquo;{review.quote}&rdquo;</p>
      </blockquote>

      {long ? (
        <button
          type="button"
          className={styles.more}
          aria-expanded={open}
          aria-controls={quoteId}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? 'Show less' : 'Read more'}
        </button>
      ) : null}

      <footer className={styles.cardFoot}>
        {review.photo ? (
          <Image
            src={review.photo}
            alt=""
            width={44}
            height={44}
            className={styles.cardAvatar}
          />
        ) : (
          <span className={styles.cardAvatar} aria-hidden="true">
            <span className={styles.cardInitials}>{initials(review.name)}</span>
          </span>
        )}
        <span className={styles.cardWho}>
          <span className={styles.cardName}>{review.name}</span>
          <span className={styles.cardWhere}>{where}</span>
        </span>
        <span className={styles.cardMeta}>
          <span className={styles.badge}>{reviewsSummary.source}</span>
          {review.date ? <span className={styles.cardDate}>{review.date}</span> : null}
        </span>
      </footer>
    </article>
  );
}

/**
 * Frame 3 — the wall: every review that is not the featured one, as a balanced masonry
 * (CSS columns, so a short card never leaves a hole beside a tall one). Each card arrives
 * through the shared Reveal on its own, so a long wall is staged as it is scrolled into
 * rather than all at once at the top. The All / Group practices / Solo practices row only
 * exists once eight or more reviews carry a tag; below that there is nothing to filter.
 */
export default function ReviewsWall({ items, ground }: { items: Review[]; ground: string }) {
  const { wall } = reviewsPage;
  const [filter, setFilter] = useState<Filter>('all');

  const tagged = items.filter((r) => r.tag).length;
  const showFilter = tagged >= wall.filterMinTagged;
  const visible = showFilter && filter !== 'all' ? items.filter((r) => r.tag === filter) : items;

  const options: { key: Filter; label: string }[] = [
    { key: 'all', label: wall.filters.all },
    { key: 'group', label: wall.filters.group },
    { key: 'solo', label: wall.filters.solo },
  ];

  return (
    <section className={`${section.section} ${ground}`}>
      <div className="container">
        <Reveal as="header" className={section.head}>
          <p className={section.eyebrow} data-reveal="0">
            {wall.eyebrow}
          </p>
          <ScrollReveal text={wall.heading} className={section.heading} />
        </Reveal>

        {showFilter ? (
          <div className={styles.filters} role="group" aria-label="Filter reviews">
            {options.map((o) => (
              <button
                type="button"
                key={o.key}
                className={`${styles.pill} ${filter === o.key ? styles.pillOn : ''}`}
                aria-pressed={filter === o.key}
                onClick={() => setFilter(o.key)}
              >
                {o.label}
              </button>
            ))}
          </div>
        ) : null}

        <ul className={styles.wall}>
          {visible.map((review) => (
            <Reveal as="li" className={styles.wallItem} key={review.id}>
              <div data-reveal="0">
                <ReviewCard review={review} />
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
