import Image from 'next/image';
import Link from 'next/link';
import { getPricingEntry } from '@/lib/pricing';
import { localSeoHero, trustItems } from '@/lib/pricing/local-seo';
import SeeAllPrices from './SeeAllPrices';
import styles from './LocalSeo.module.css';

/** Frame 1. Nothing animates on entrance. The picture is the Local SEO package's own card
    image from /pricing, loaded eagerly as the largest thing above the fold. The trust strip
    is not rendered while the array is empty. */
export default function LocalSeoHero() {
  const { image } = getPricingEntry('local-seo');

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroGrid}`}>
        <div>
          <p className={styles.eyebrow}>Pricing / Local SEO</p>
          <h1 className={styles.heroTitle}>{localSeoHero.title}</h1>
          <p className={styles.heroSub}>{localSeoHero.sub}</p>

          <div className={styles.heroActions}>
            <Link href={localSeoHero.primary.href} className={styles.button}>
              {localSeoHero.primary.label}
            </Link>
            <SeeAllPrices className={styles.textLink} label={localSeoHero.secondary.label} />
          </div>

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
