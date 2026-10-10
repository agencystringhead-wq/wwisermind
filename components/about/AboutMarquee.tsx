import Image from 'next/image';
import { getFound } from '@/lib/site';
import styles from './AboutMarquee.module.css';

const REPEAT = 3;

/* One track copy — all logos in a single row. */
function Row({ clone }: { clone?: boolean }) {
  const all = [getFound.featured, ...getFound.logos];
  return (
    <ul className={styles.row} aria-hidden={clone || undefined}>
      {all.map((logo) => (
        <li className={styles.item} key={logo.alt}>
          <Image
            src={logo.src}
            alt={clone ? '' : logo.alt}
            width={logo.width}
            height={logo.height}
            className={styles.logo}
          />
        </li>
      ))}
    </ul>
  );
}

/**
 * Logo marquee for the About hero — same mechanics as ContactLogos.
 * Pauses on hover (fine pointer), stops under reduced-motion.
 */
export default function AboutMarquee() {
  return (
    <div className={styles.wrapper}>
      <div className="container">
        <p className={styles.label}>Get found where your clients search</p>
      </div>
      <div className={styles.marquee} aria-label="Directories and AI platforms where clients find therapists">
        <div className={styles.track}>
          <Row />
          {Array.from({ length: REPEAT * 2 - 1 }, (_, i) => (
            <Row clone key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
