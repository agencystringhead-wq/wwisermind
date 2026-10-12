import Image from 'next/image';
import Link from 'next/link';
import { getPricingEntry } from '@/lib/pricing';
import { siteConfig } from '@/lib/site';
import SeeAllPrices from './SeeAllPrices';
import styles from './Pricing.module.css';

const trust = [
  'Only therapists and psychologists',
  'No long-term contracts',
  'Every price on the page',
];

/** Frame 1. Two columns and nothing animates on entrance. The picture is the One Week
    Website's own: the repo holds no screenshot of a finished site, so the closest existing
    image stands in until one is made. It loads eagerly, being the largest thing above the
    fold. */
export default function PricingHero() {
  const { image } = getPricingEntry('one-week-website');

  return (
    <section className={styles.hero}>
      <div className={`container ${styles.heroGrid}`}>
        <div>
          <p className={styles.eyebrow}>Pricing</p>
          <h1 className={styles.heroTitle}>Simple, honest pricing for therapy practices</h1>
          <p className={styles.heroSub}>
            Pick a package, see what it includes, and know what it costs before you book a call.
          </p>

          <div className={styles.heroActions}>
            <Link href={siteConfig.bookingPage} className={styles.button}>
              Book Your Free Call
            </Link>
            <SeeAllPrices className={styles.textLink} />
          </div>

          <ul className={styles.trust}>
            {trust.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
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
