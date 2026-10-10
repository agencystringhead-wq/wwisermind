import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './AboutFounder.module.css';

/**
 * Section 2 — Founder perspective (white ground).
 *
 * Reference: dominant tall portrait left; right: mono eyebrow, two-line heading,
 * three substantial paragraphs, mono byline.
 *
 * Portrait — Srikaanth-Founder-wwisermind.webp (700×700, 63 kB)
 */
export default function AboutFounder() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {/* LEFT — portrait */}
        <figure className={styles.portrait} data-reveal="0">
          <Image
            src="/images/Srikaanth-Founder-wwisermind.webp"
            alt="SrikaantH — co-founder of wwisermind"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 540px"
            className={styles.portraitImg}
          />
        </figure>

        {/* RIGHT — copy */}
        <Reveal as="div" className={styles.copy}>
          <p className={styles.eyebrow} data-reveal="0">A word from the founder</p>

          <ScrollReveal
            text={"Why I built this\nfor therapists."}
            className={styles.heading}
          />

          <div className={styles.body} data-reveal="2">
            <p>
              I grew up watching what happens when good therapists stay invisible. People who
              needed care found the wrong practitioners, or gave up searching altogether, because
              the clinicians who could help them hadn&apos;t been found. That gap isn&apos;t a
              marketing problem — it&apos;s a reach problem, and reach is something we know how
              to solve.
            </p>
            <p>
              wwisermind exists because mental health care deserves the same strategic
              investment that every other field takes for granted. We bring the same craft to a
              therapist&apos;s website and SEO profile that a corporate brand would spend
              thousands on — and we do it for exactly one vertical, so our knowledge
              compounds rather than scatters.
            </p>
            <p>
              Every decision we make — the copy, the structure, the way your name surfaces in
              AI tools — is built around one outcome: the right client landing on your page and
              feeling, immediately, that they&apos;re already in the right place. That is what
              we are here to do.
            </p>
          </div>

          <p className={styles.byline} data-reveal="2">
            SrikaantH · Co-founder, wwisermind
          </p>
        </Reveal>
      </div>
    </section>
  );
}
