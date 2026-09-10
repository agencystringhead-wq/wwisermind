import Image from 'next/image';
import { contactPage } from '@/lib/site';
import styles from './ContactGallery.module.css';

function Star() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 1.6l3.1 6.3 6.9 1-5 4.87 1.18 6.87L12 17.4l-6.18 3.24L7 13.77l-5-4.87 6.9-1L12 1.6z" />
    </svg>
  );
}

/** Five stars, with a filled copy clipped to the score's share of the row — so a 4.2 shows
    four and a fifth, as the reference's does. */
function Stars({ score, outOf }: { score: number; outOf: number }) {
  const share = Math.max(0, Math.min(1, score / outOf));

  return (
    <span className={styles.stars} role="img" aria-label={`${score} out of ${outOf} stars`}>
      <span className={styles.starRow}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} />
        ))}
      </span>
      <span className={`${styles.starRow} ${styles.starFill}`} style={{ width: `${share * 100}%` }}>
        {Array.from({ length: 5 }, (_, i) => (
          <Star key={i} />
        ))}
      </span>
    </span>
  );
}

/** A whole number stays whole — "5", not "5.0" — and anything else keeps one decimal. */
function formatScore(score: number) {
  return Number.isInteger(score) ? String(score) : score.toFixed(1);
}

type Photo = { src: string; alt: string; position?: string };

/**
 * The photo mosaic straddling the hero's lower edge, as on the mental-health reference.
 *
 * Three photographs and two flat tiles on one grid, measured in lib/site.ts. Every tile has
 * the same radius and the same gap, so it reads as one piece; the photographs take the
 * MediaHover frame, so the zoom and the sweep are the homepage's, not a copy of them.
 *
 * With no props it is the contact page's mosaic. The service pages hand it their own
 * three photographs and accent line; the review tile is the one shared piece either way,
 * and everything it shows comes from `gallery.reviews` in lib/site.ts.
 */
export default function ContactGallery({
  photos = contactPage.gallery.photos,
  accent = contactPage.gallery.accent,
  label = 'The practice, the studio, and the people',
}: {
  photos?: { tall: Photo; mid: Photo; wide: Photo };
  accent?: string;
  label?: string;
} = {}) {
  const { reviews } = contactPage.gallery;

  return (
    <section className={styles.section} aria-label={label}>
      <div className={`container ${styles.grid}`}>
        {(
          [
            ['tall', photos.tall, styles.tall],
            ['mid', photos.mid, styles.mid],
            ['wide', photos.wide, styles.wide],
          ] as const
        ).map(([key, photo, place]) => (
          <figure className={`${styles.photo} ${place}`} key={key}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 42vw"
              style={{ objectPosition: photo.position }}
              /* All three are above the fold at every width and any one of them can be
                 the largest paint, so none of them waits on the lazy loader. */
              priority
            />
            <span className={styles.shine} aria-hidden="true" />
          </figure>
        ))}

        <div className={`${styles.flat} ${styles.accent}`}>
          <p className={styles.accentText}>{accent}</p>
        </div>

        <div className={`${styles.flat} ${styles.stat}`}>
          <div className={styles.review}>
            <p className={styles.platform}>{reviews.source}</p>
            <p className={styles.score}>
              {formatScore(reviews.score)}
              <span className={styles.outOf}>/{reviews.outOf}</span>
            </p>
            <Stars score={reviews.score} outOf={reviews.outOf} />
            <p className={styles.count}>
              {reviews.count} {reviews.count === 1 ? 'review' : 'reviews'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
