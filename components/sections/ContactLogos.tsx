import Image from 'next/image';
import { contactPage } from '@/lib/site';
import styles from './ContactLogos.module.css';

/* Each half of the track holds the list this many times. Five marks with their gaps run to
   about 800px, and a half narrower than the container would show its own end as a gap in
   the loop; three copies keep the half past 1300px at every width the container reaches. */
const REPEAT = 3;

function Row({ clone }: { clone?: boolean }) {
  return (
    <ul className={styles.row} aria-hidden={clone || undefined}>
      {contactPage.logos.items.map((logo) => (
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
 * The row of marks under the hero, scrolling continuously as on the mental-health reference.
 *
 * The same marquee the footer's ticker runs: two identical halves side by side, slid left by
 * exactly half the track, so the second half is under the cursor the moment the first runs
 * out and the loop has no seam. Only `transform` animates, so it never leaves the compositor.
 * It pauses under a fine pointer, and under reduced motion it does not run at all — the
 * first list simply sits centred and the copies are dropped.
 *
 * One list is in the accessibility tree; every repeat is decoration and hidden from it, so a
 * screen reader hears five names, not thirty.
 */
export default function ContactLogos() {
  const { label } = contactPage.logos;

  return (
    <section className={styles.section} aria-labelledby="contact-logos-label">
      <div className="container">
        <p className={styles.label} id="contact-logos-label">
          {label}
        </p>

        <div className={styles.marquee}>
          <div className={styles.track}>
            <Row />
            {Array.from({ length: REPEAT * 2 - 1 }, (_, index) => (
              <Row clone key={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
