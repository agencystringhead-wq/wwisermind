import Image from 'next/image';
import CtaLink from '@/components/booking/CtaLink';
import { siteConfig } from '@/lib/site';
import SeeAllPrices from './SeeAllPrices';
import styles from './Pricing.module.css';

const trust = [
  'Only therapists and psychologists',
  'No long-term contracts',
  'Every price on the page',
];

/** Frame 1. Two columns and nothing animates on entrance. The picture was made for this
    page: one clear price sheet, nothing hidden. It loads eagerly, being the largest thing
    above the fold. */
const image = {
  src: '/images/pricing/pricing-overview-hero.webp',
  width: 1500,
  height: 1000,
  alt: 'A single clear pricing sheet on a therapist desk, nothing hidden',
};

export default function PricingHero() {

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
            <CtaLink href={siteConfig.bookingPage} className={styles.button}>
              Book Your Free Call
            </CtaLink>
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
