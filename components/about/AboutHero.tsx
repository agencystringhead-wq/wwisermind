import Image from 'next/image';
import ScrollReveal from '@/components/ui/ScrollReveal';
import Reveal from '@/components/ui/Reveal';
import styles from './AboutHero.module.css';

/**
 * Frame 1 — hero.
 *
 * Mono eyebrow "ABOUT US", a large h1 via ScrollReveal, a supporting paragraph,
 * then a wide image below with the design's proportions. No stat overlay — we have
 * no verified figure to place here.
 */
export default function AboutHero() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal as="header" damping={260}>
          <p className={styles.eyebrow} data-reveal="0">About us</p>
          <div className={styles.headlineWrap} data-reveal="1">
            <ScrollReveal
              as="h1"
              text="We exist for one reason: to help therapists be found by the people who need them."
              className={styles.headline}
            />
          </div>
          <p className={styles.paragraph} data-reveal="2">
            wwisermind is a design and marketing studio built only for therapists and
            psychologists. We work from Pune, India, and we make websites, SEO and AI
            visibility work — so the right clients find you, and when they land on your
            site they feel they are already in the right place.
          </p>
        </Reveal>

        <Reveal className={styles.imageWrap}>
          <figure className={styles.figure} data-reveal="0">
            <Image
              src="/images/wwisermind-built-in-India-for-world-therapists.webp"
              alt="The wwisermind team at work — built in India for therapists around the world"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1340px) calc(100vw - 40px), 1300px"
              className={styles.image}
              priority
            />
            <span className={styles.shine} aria-hidden="true" />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
