import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import styles from './AboutFounder.module.css';

/**
 * Frame 2 — founder perspective.
 *
 * Light ground. Portrait on the left, copy on the right: mono eyebrow, heading,
 * four paragraphs on why wwisermind exists and why it works only with therapists.
 * Below the copy: the mono byline "SrikaantH · Co-founder, wwisermind".
 *
 * Uses the existing Srikaanth-Founder-wwisermind image (700×700, 63 kB — within norms).
 */
export default function AboutFounder() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal className={styles.grid}>
          <figure className={styles.portraitFrame} data-reveal="0">
            <Image
              src="/images/Srikaanth-Founder-wwisermind.webp"
              alt="SrikaantH, co-founder of wwisermind"
              width={700}
              height={700}
              className={styles.portrait}
              sizes="(max-width: 640px) 80vw, (max-width: 1023px) 40vw, 320px"
            />
            <span className={styles.shine} aria-hidden="true" />
          </figure>

          <div className={styles.copy} data-reveal="1">
            <p className={styles.eyebrow}>Founder Perspective</p>
            <h2 className={styles.heading}>
              We are the only studio built only for this work.
            </h2>

            <div className={styles.body}>
              <p>
                My nephew's autism therapy journey showed me what it takes for a family
                in distress to find the right clinician. They searched online, read
                through practice after practice, and nearly gave up. The practice that
                finally helped them had a site that said plainly who they were and who
                they helped. That was it. No jargon, no clever headlines — just clarity.
              </p>
              <p>
                That experience is the reason wwisermind exists, and it is why we work
                only with therapists and psychologists. This is not a niche we drifted
                into. It is the only thing we do, because it is the thing we actually
                understand. We know the words that make a prospective client feel seen,
                the searches they run when they finally decide to ask for help, and the
                first impression that earns a call.
              </p>
              <p>
                We build in India and work in your timezone. We are open about both
                because they work in your favour: revisions happen while you sleep, and
                agency-grade work runs at a price a solo or group practice can justify.
                No offshore mystery — our team and our process are on this page.
              </p>
              <p>
                Every decision we make, from the headline on your homepage to the
                directory listing a client finds at 11 pm, is made with one question
                in mind: will this help the right person find this practice?
              </p>
            </div>

            <p className={styles.byline}>SrikaantH · Co-founder, wwisermind</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
