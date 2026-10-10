import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import AboutMarquee from './AboutMarquee';
import styles from './AboutHero.module.css';

/**
 * Section 1 — Hero (white ground).
 *
 * Reference layout:
 *   - Left-aligned mono eyebrow + two-line headline + paragraph
 *   - Two images on a 63/37 grid: left wide + taller, right narrow + shorter
 *   - Stat card overlaid on left image (yellow accent, #fafb87)
 *   - Logo marquee below the images
 *
 * STAT CARD: using "2" real case studies as the verified figure.
 * ⚠️ PLACEHOLDER — replace statValue / statLabel with a real practice count once available.
 *
 * IMAGE NOTES:
 *   Left  — wwisermind-built-in-India-for-world-therapists.webp (team / office shot, 113 kB)
 *   Right — about-therapist-working.webp (AI-generated, therapist at desk, 44 kB)
 *   Prompt used: "A mental health therapist, a professional woman, sitting at a minimal
 *   clean desk reviewing handwritten clinical notes, warm focused expression, soft diffused
 *   window light, dark navy blue background wall, very subtle blue accent, minimalist office
 *   setting, photorealistic portrait photography, 35mm lens, shallow depth of field"
 */

const statValue = '2+';           // ⚠️ PLACEHOLDER — supply real practice count
const statLabel = 'Practices launched and growing'; // ⚠️ PLACEHOLDER — adjust label

export default function AboutHero() {
  return (
    <section className={styles.section}>
      <div className="container">
        {/* ── text block ─────────────────────────────── */}
        <Reveal as="header" damping={260} className={styles.textBlock}>
          <p className={styles.eyebrow} data-reveal="0">About us</p>
          <div className={styles.headlineRow}>
            <div className={styles.headlineCol} data-reveal="1">
              <ScrollReveal
                as="h1"
                text={"Strategic care.\nReal-world results."}
                className={styles.headline}
              />
            </div>
            <p className={styles.paragraph} data-reveal="2">
              wwisermind is a design and marketing studio built only for therapists and
              psychologists. We make websites, SEO and AI visibility work — so the right
              clients find you, and when they land on your site they feel they are already
              in the right place.
            </p>
          </div>
        </Reveal>

        {/* ── asymmetric image pair ──────────────────── */}
        <Reveal className={styles.images}>
          {/* LEFT — wider, taller, stat card overlay */}
          <figure className={`${styles.imgFrame} ${styles.imgLeft}`} data-reveal="0">
            <Image
              src="/images/wwisermind-built-in-India-for-world-therapists.webp"
              alt="The wwisermind team — built in India for therapists around the world"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1023px) 60vw, 720px"
              className={styles.img}
              priority
            />
            <span className={styles.shine} aria-hidden="true" />

            {/* Stat card — yellow accent */}
            <div className={styles.stat} aria-label={`${statValue} ${statLabel}`}>
              <span className={styles.statValue}>{statValue}</span>
              <span className={styles.statLabel}>{statLabel}</span>
            </div>
          </figure>

          {/* RIGHT — narrower, shorter, offset lower */}
          <figure className={`${styles.imgFrame} ${styles.imgRight}`} data-reveal="1">
            <Image
              src="/images/about-therapist-working.webp"
              alt="A therapist reviewing clinical notes at a minimal desk"
              fill
              sizes="(max-width: 640px) 80vw, (max-width: 1023px) 38vw, 440px"
              className={styles.img}
            />
            <span className={styles.shine} aria-hidden="true" />
          </figure>
        </Reveal>
      </div>

      {/* ── logo marquee ────────────────────────────── */}
      <AboutMarquee />
    </section>
  );
}
