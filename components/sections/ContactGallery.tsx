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
    four and a fifth, as the reference's does. A null score clips the fill to nothing. */
function Stars({ score, outOf }: { score: number | null; outOf: number }) {
  const share = score === null ? 0 : Math.max(0, Math.min(1, score / outOf));
  const label = score === null ? 'no score yet' : `${score} out of ${outOf} stars`;

  return (
    <span className={styles.stars} role="img" aria-label={label}>
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

/**
 * The photo mosaic straddling the hero's lower edge, as on the mental-health reference.
 *
 * Three photographs and two flat tiles on one grid, measured in lib/site.ts. Every tile has
 * the same radius and the same gap, so it reads as one piece; the photographs take the
 * MediaHover frame, so the zoom and the sweep are the homepage's, not a copy of them.
 *
 * The reviews tile is a placeholder for now — see `gallery.reviews` in lib/site.ts.
 */
export default function ContactGallery() {
  const { photos, accent, reviews } = contactPage.gallery;

  return (
    <section className={styles.section} aria-label="The practice, the studio, and the people">
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
              priority={key === 'tall'}
            />
            <span className={styles.shine} aria-hidden="true" />
          </figure>
        ))}

        <div className={`${styles.flat} ${styles.accent}`}>
          <p className={styles.accentText}>{accent}</p>
        </div>

        <div className={`${styles.flat} ${styles.stat}`}>
          {reviews.items.map((item) => (
            <div className={styles.review} key={item.platform}>
              <p className={styles.platform}>{item.platform}</p>
              <p className={styles.score}>
                {item.score === null ? '–' : item.score.toFixed(1)}
                <span className={styles.outOf}>/{reviews.outOf}</span>
              </p>
              <Stars score={item.score} outOf={reviews.outOf} />
            </div>
          ))}

          {/* TODO: remove once real scores are in — the tile is a placeholder until then. */}
          <p className={styles.note}>{reviews.note}</p>
        </div>
      </div>
    </section>
  );
}
