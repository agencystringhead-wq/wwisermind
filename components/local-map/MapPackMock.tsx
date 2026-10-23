import { mapPack } from '@/lib/local-map-assessment';
import BrowserFrame from './BrowserFrame';
import styles from './lma.module.css';

const stars = (rating: number) => '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));

/** A made-up Google Maps results list: three invented practices in the map pack. */
export default function MapPackMock() {
  return (
    <BrowserFrame url="google.com/maps/search/therapist+near+me">
      <div className={styles.pack}>
        <p className={styles.packQuery}>therapist near me</p>
        <ol className={styles.packList}>
          {mapPack.map((p, i) => (
            <li key={p.name} className={styles.packItem}>
              <span className={styles.packRank} aria-hidden="true">{i + 1}</span>
              <div>
                <p className={styles.packName}>{p.name}</p>
                <p className={styles.packMeta}>
                  <b>{p.rating.toFixed(1)}</b> <span className={styles.packStars} aria-label={`${p.rating} stars`}>{stars(p.rating)}</span> ({p.reviews})
                </p>
                <p className={styles.packMeta}>
                  {p.kind} · {p.distance} · <span className={styles.packOpen}>Open now</span>
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </BrowserFrame>
  );
}
