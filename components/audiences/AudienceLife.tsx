import Image from 'next/image';
import type { Audience } from '@/lib/audiences';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import shared from './Audience.module.css';
import styles from './AudienceLife.module.css';

/**
 * Frame 5: the context, as the reference's "beyond the office" block — the mono eyebrow
 * in the left column, the heading and a short paragraph in the right, two photographs
 * side by side across the container, and a paragraph under them. Here it shows the
 * practice itself: how a group or a solo practitioner actually spends the day, and what
 * the site has to do about it.
 */
export default function AudienceLife({ audience }: { audience: Audience }) {
  const { eyebrow, heading, paragraph, photos, caption } = audience.life;

  return (
    <section className={`${shared.section} ${shared.light}`}>
      <div className="container">
        <Reveal className={styles.head}>
          <p className={shared.eyebrow} data-reveal="0">
            {eyebrow}
          </p>
          <div className={styles.copy}>
            <div data-reveal="0">
              <ScrollReveal text={heading} className={`${shared.title} ${styles.heading}`} />
            </div>
            <p className={`${shared.body} ${styles.paragraph}`} data-reveal="1">
              {paragraph}
            </p>
          </div>
        </Reveal>

        <Reveal className={styles.photos}>
          {photos.map((photo, index) => (
            <figure
              className={`${shared.figure} ${styles.photo}`}
              key={photo.src}
              data-reveal={index}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1340px) 48vw, 638px"
                style={{ objectPosition: photo.position }}
              />
              <span className={shared.shine} aria-hidden="true" />
            </figure>
          ))}
          <p className={`${shared.body} ${styles.caption}`} data-reveal="2">
            {caption}
          </p>
        </Reveal>
      </div>
    </section>
  );
}
