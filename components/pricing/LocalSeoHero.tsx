import Image from 'next/image';
import Link from 'next/link';
import SeeAllPrices from './SeeAllPrices';
import styles from './LocalSeo.module.css';

export type PricingHeroData = {
  eyebrow: string;
  title: string;
  sub: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  /** A small line under the buttons. */
  note?: string;
};

/** Frame 1, shared by the /pricing sub-pages. Nothing animates on entrance. The picture is
    the package's own card image from /pricing, loaded eagerly as the largest thing above the
    fold. The trust strip is not rendered while the array is empty. The secondary link scrolls
    to the section its href names when that is an anchor, and is a plain link otherwise. */
export default function LocalSeoHero({
  hero,
  trustItems,
  image,
}: {
  hero: PricingHeroData;
  trustItems: string[];
  image: { src: string; width: number; height: number; alt: string };
}) {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroGrid}`}>
        <div>
          <p className={styles.eyebrow}>{hero.eyebrow}</p>
          <h1 className={styles.heroTitle}>{hero.title}</h1>
          <p className={styles.heroSub}>{hero.sub}</p>

          <div className={styles.heroActions}>
            <Link href={hero.primary.href} className={styles.button}>
              {hero.primary.label}
            </Link>
            {hero.secondary.href.startsWith('#') ? (
              <SeeAllPrices
                className={styles.textLink}
                label={hero.secondary.label}
                target={hero.secondary.href.replace('#', '')}
              />
            ) : (
              <Link href={hero.secondary.href} className={styles.textLink}>
                {hero.secondary.label} <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          {hero.note ? <p className={styles.heroNote}>{hero.note}</p> : null}

          {trustItems.length > 0 ? (
            <ul className={styles.trust}>
              {trustItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : null}
        </div>

        <div className={styles.heroMedia}>
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            className={styles.heroImage}
            priority
            sizes="(max-width: 1023px) 100vw, 620px"
          />
        </div>
      </div>
    </section>
  );
}
