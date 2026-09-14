import Image from 'next/image';
import type { Audience } from '@/lib/audiences';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import shared from './Audience.module.css';
import styles from './AudienceHero.module.css';

/**
 * Frame 1: the hero, as the reference's top block — the breadcrumb in the mono face, the
 * two-line headline at the page's largest scale with the word reveal on it, and under it
 * two photographs side by side at different heights: the left one flush under the
 * headline, the right one pushed down by the short paragraph that sits above it.
 *
 * Two reveal groups rather than one: the headline arrives on page load, and the
 * photographs — which may sit below the fold on a short screen — arrive when the page
 * reaches them. The headline's group glides in longer than a scrolled frame does.
 */
export default function AudienceHero({ audience }: { audience: Audience }) {
  const { headline, paragraph, photos } = audience.hero;
  const sizes = '(max-width: 640px) 100vw, (max-width: 1340px) 48vw, 627px';

  return (
    <section className={`${shared.section} ${shared.light} ${styles.section}`}>
      <div className="container">
        <Reveal as="header" damping={260}>
          <nav aria-label="Breadcrumb" data-reveal="0">
            <ol className={styles.crumb}>
              <li>Who we help</li>
              <li aria-current="page">
                <span className={styles.crumbArrow} aria-hidden="true">
                  ↳
                </span>
                {audience.name}
              </li>
            </ol>
          </nav>

          <div className={styles.headline} data-reveal="1">
            <ScrollReveal as="h1" text={headline} className={styles.title} />
          </div>
        </Reveal>

        <Reveal className={styles.grid}>
          <figure className={`${shared.figure} ${styles.photo}`} data-reveal="1">
            <Image
              src={photos.left.src}
              alt={photos.left.alt}
              fill
              sizes={sizes}
              style={{ objectPosition: photos.left.position }}
              priority
            />
            <span className={shared.shine} aria-hidden="true" />
          </figure>

          <div className={styles.aside}>
            <p className={`${shared.body} ${styles.paragraph}`} data-reveal="0">
              {paragraph}
            </p>

            <figure className={`${shared.figure} ${styles.photo}`} data-reveal="2">
              <Image
                src={photos.right.src}
                alt={photos.right.alt}
                fill
                sizes={sizes}
                style={{ objectPosition: photos.right.position }}
                priority
              />
              <span className={shared.shine} aria-hidden="true" />
            </figure>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
