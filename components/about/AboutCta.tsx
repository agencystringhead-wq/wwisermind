import { routes } from '@/lib/routes';
import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import styles from './AboutCta.module.css';

/**
 * Section 8 — Closing CTA (light blue-to-yellow ground).
 *
 * Reference: large heading left-aligned (navy); short supporting line; CTA button;
 * tall photo on the right.
 *
 * Photo — launch-and-grow.webp (91 kB) or similar closing-energy image.
 * ⚠️ PLACEHOLDER — replace photo once a more contextual closing image exists.
 */
export default function AboutCta() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {/* LEFT — copy + CTA */}
        <Reveal as="div" className={styles.copy}>
          <h2 className={styles.heading} data-reveal="0">
            Let&apos;s build the practice<br />you deserve to run.
          </h2>
          <p className={styles.paragraph} data-reveal="1">
            No templates. No guesswork. Strategy-led design and marketing built
            around your practice, your clients, your goals.
          </p>
          <Link href={routes.contact} className={styles.button} data-reveal="2">
            Book your free call
          </Link>
        </Reveal>

        {/* RIGHT — photo */}
        <figure className={styles.photo} data-reveal="1">
          <Image
            src="/images/launch-and-grow.webp"
            alt="A therapist confident in their practice growth"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 580px"
            className={styles.photoImg}
          />
        </figure>
      </div>
    </section>
  );
}
