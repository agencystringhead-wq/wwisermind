import Image from 'next/image';
import Link from 'next/link';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './AboutTeam.module.css';

/**
 * Frame 6 — our team.
 *
 * Light ground. Mono eyebrow "OUR TEAM", heading, supporting line, then three
 * member cards in a row. Each card: portrait photo, name, role, LinkedIn link.
 *
 * ⚠️ PLACEHOLDERS — see inline comments:
 *   - LinkedIn URLs: all three use "#" — supply real URLs.
 *   - Ashish photo: placeholder (wwisermind-built-in-India image) — supply a
 *     portrait at 1:1 ratio, ideally 480×480px or larger, WebP preferred.
 *   - Kmelia photo: placeholder (process isometric) — supply a portrait at 1:1
 *     ratio, ideally 480×480px or larger, WebP preferred.
 */

const TEAM = [
  {
    name: 'SrikaantH',
    role: 'Co-founder',
    /* Existing 700×700 WebP — 63 kB, within norms. */
    photo: '/images/Srikaanth-Founder-wwisermind.webp',
    photoAlt: 'SrikaantH, co-founder of wwisermind',
    /* ⚠️ PLACEHOLDER: replace "#" with real LinkedIn URL */
    linkedin: '#',
  },
  {
    name: 'Ashish Kumar',
    role: 'Co-founder',
    /* ⚠️ PLACEHOLDER photo — supply a portrait at 1:1 ratio (480×480px min, WebP).
       Using wwisermind-built-in-India as a stand-in; swap the src below once supplied. */
    photo: '/images/wwisermind-built-in-India-for-world-therapists.webp',
    photoAlt: 'Ashish Kumar, co-founder of wwisermind — placeholder portrait',
    /* ⚠️ PLACEHOLDER: replace "#" with real LinkedIn URL */
    linkedin: '#',
  },
  {
    name: 'Kmelia McKenzie',
    role: 'Head of Business Development',
    /* ⚠️ PLACEHOLDER photo — supply a portrait at 1:1 ratio (480×480px min, WebP).
       Using process isometric as a stand-in; swap the src below once supplied. */
    photo: '/images/process-isometric.webp',
    photoAlt: 'Kmelia McKenzie, Head of Business Development — placeholder portrait',
    /* ⚠️ PLACEHOLDER: replace "#" with real LinkedIn URL */
    linkedin: '#',
  },
];

function LinkedInIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68zm1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export default function AboutTeam() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal as="header" damping={220}>
          <p className={styles.eyebrow} data-reveal="0">Our team</p>
          <ScrollReveal
            text="The people behind the work."
            className={styles.heading}
            start={0.82}
            end={0.4}
          />
          <p className={styles.lede} data-reveal="2">
            A small studio by design. Everyone here works on mental health only.
          </p>
        </Reveal>

        <Reveal className={styles.cards}>
          {TEAM.map((member, index) => (
            <article className={styles.card} key={member.name} data-reveal={String(index)}>
              <figure className={styles.portraitFrame}>
                <Image
                  src={member.photo}
                  alt={member.photoAlt}
                  fill
                  sizes="(max-width: 640px) 80vw, (max-width: 1023px) 40vw, 360px"
                  className={styles.portrait}
                />
                <span className={styles.shine} aria-hidden="true" />
              </figure>

              <div className={styles.meta}>
                <p className={styles.name}>{member.name}</p>
                <p className={styles.role}>{member.role}</p>
                {member.linkedin !== '#' ? (
                  <Link
                    href={member.linkedin}
                    className={styles.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${member.name} on LinkedIn`}
                  >
                    <LinkedInIcon />
                    LinkedIn
                  </Link>
                ) : (
                  <span className={styles.linkedinPlaceholder} aria-hidden="true">
                    <LinkedInIcon />
                    LinkedIn ↗
                  </span>
                )}
              </div>
            </article>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
