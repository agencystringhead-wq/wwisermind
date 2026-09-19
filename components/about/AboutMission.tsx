import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import styles from './AboutMission.module.css';

/**
 * Frame 3 — mission and vision.
 *
 * Dark grey ground (#1a1a1a — same as the audience dark bands). Two columns,
 * each with a subheading, a paragraph, and three check-marked claims. A wide
 * image below the columns.
 */
export default function AboutMission() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal className={styles.columns}>
          <div className={styles.column} data-reveal="0">
            <h2 className={styles.columnHead}>Our mission</h2>
            <p className={styles.columnBody}>
              To make every therapist and psychologist in private practice as easy to
              find online as a restaurant, a dentist or a plumber — and to make the
              first click feel like the right choice.
            </p>
            <ul className={styles.claims} aria-label="Mission commitments">
              <li className={styles.claim}>
                <span className={styles.check} aria-hidden="true">✓</span>
                Websites that convert visitors into enquiries
              </li>
              <li className={styles.claim}>
                <span className={styles.check} aria-hidden="true">✓</span>
                SEO that puts your practice on the map — literally
              </li>
              <li className={styles.claim}>
                <span className={styles.check} aria-hidden="true">✓</span>
                AI visibility so the tools a new client asks also name you
              </li>
            </ul>
          </div>

          <div className={styles.column} data-reveal="1">
            <h2 className={styles.columnHead}>Our vision</h2>
            <p className={styles.columnBody}>
              A world where no one in genuine need of a therapist fails to find one
              because of a website that was never finished or a directory profile left
              half-filled. The infrastructure of mental health starts with being found.
            </p>
            <ul className={styles.claims} aria-label="Vision commitments">
              <li className={styles.claim}>
                <span className={styles.check} aria-hidden="true">✓</span>
                No practice left invisible to the clients who need it most
              </li>
              <li className={styles.claim}>
                <span className={styles.check} aria-hidden="true">✓</span>
                Marketing that works as honestly as the practice itself does
              </li>
              <li className={styles.claim}>
                <span className={styles.check} aria-hidden="true">✓</span>
                A studio the whole field can trust to do this right
              </li>
            </ul>
          </div>
        </Reveal>

        <Reveal className={styles.imageWrap}>
          <figure className={styles.figure} data-reveal="0">
            <Image
              src="/images/wwisermind-built-for-mental-therapist-only.webp"
              alt="wwisermind — built for mental health therapists only"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1340px) calc(100vw - 40px), 1300px"
              className={styles.image}
            />
            <span className={styles.shine} aria-hidden="true" />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
