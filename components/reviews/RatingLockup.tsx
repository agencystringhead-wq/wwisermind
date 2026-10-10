import { formatRating, reviewCountLabel, reviewsSummary } from '@/lib/reviews';
import { StarIcon } from '@/components/ui/icons';
import styles from './Reviews.module.css';

/**
 * The hero's rating: the number, five stars and the count, all read from lib/reviews.ts.
 * The stars are filled to the rating's share of the row, so a 4.6 would show four and a
 * little over half of the fifth. It sits on the hero's dark ground and takes its colours
 * from the dark tokens the hero section sets.
 */
export default function RatingLockup() {
  const { rating, outOf } = reviewsSummary;
  const share = Math.max(0, Math.min(1, rating / outOf));

  return (
    <div className={styles.lockup}>
      <p className={styles.lockupNumber}>
        {formatRating(rating)}
        <span className={styles.lockupOutOf}>/{outOf}</span>
      </p>

      <span className={styles.lockupRule} aria-hidden="true" />

      <div className={styles.lockupSide}>
        <span
          className={styles.lockupStars}
          role="img"
          aria-label={`${formatRating(rating)} out of ${outOf} stars`}
        >
          <span className={styles.lockupRow}>
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon key={i} className={styles.lockupStarOff} />
            ))}
          </span>
          <span className={`${styles.lockupRow} ${styles.lockupFill}`} style={{ width: `${share * 100}%` }}>
            {Array.from({ length: 5 }, (_, i) => (
              <StarIcon key={i} className={styles.lockupStar} />
            ))}
          </span>
        </span>
        <p className={styles.lockupCount}>{reviewCountLabel()}</p>
      </div>
    </div>
  );
}
