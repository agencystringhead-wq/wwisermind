import Image from 'next/image';
import { siteConfig } from '@/lib/site';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './AboutTeam.module.css';

/**
 * Section 6 — Team (white ground).
 *
 * Three cards: a tinted gradient shell, a framed portrait with zoom hover, and a bar on
 * the photo carrying name, role and a LinkedIn icon button.
 *
 * ⚠️ PLACEHOLDER — LinkedIn URLs are "#" until real profile URLs are supplied.
 * ⚠️ PLACEHOLDER — Ashish and Kmelia portraits use slider images; replace with real portraits.
 */

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const team = [
  {
    name: 'SrikaantH',
    role: 'Co-founder & Strategy Lead',
    photo: '/images/Srikaanth-Founder-wwisermind.webp',
    photoAlt: 'SrikaantH, co-founder of wwisermind',
    linkedin: siteConfig.social.find((item) => item.id === 'linkedin')?.href ?? '#',
  },
  {
    name: 'Ashish Kumar',
    role: 'Design & Development',
    photo: '/images/slider1.webp', // ⚠️ PLACEHOLDER — replace with Ashish's portrait
    photoAlt: 'Ashish Kumar, design and development at wwisermind',
    linkedin: '#', // ⚠️ PLACEHOLDER
  },
  {
    name: 'Kmelia McKenzie',
    role: 'Client Success & SEO',
    photo: '/images/slider3.webp', // ⚠️ PLACEHOLDER — replace with Kmelia's portrait
    photoAlt: 'Kmelia McKenzie, client success and SEO at wwisermind',
    linkedin: '#', // ⚠️ PLACEHOLDER
  },
];

export default function AboutTeam() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal as="header" className={styles.header}>
          <p className={styles.eyebrow} data-reveal="0">The team</p>
          <ScrollReveal
            text={"The people behind\nthe studio."}
            className={styles.heading}
          />
        </Reveal>

        <Reveal as="ul" className={styles.cards}>
          {team.map((member, i) => (
            <li key={member.name} className={styles.card} data-reveal={String(i)}>
              {/* Framed portrait: consistent ratio, border + shadow, zoom on hover */}
              <figure className={styles.portrait}>
                <Image
                  src={member.photo}
                  alt={member.photoAlt}
                  fill
                  sizes="(max-width: 640px) 90vw, (max-width: 1023px) 40vw, 380px"
                  className={styles.portraitImg}
                />

                {/* Name, role and the LinkedIn icon button share one bar on the photo */}
                <figcaption className={styles.bar}>
                  <span className={styles.who}>
                    <span className={styles.name}>{member.name}</span>
                    <span className={styles.role}>{member.role}</span>
                  </span>
                  <a
                    href={member.linkedin}
                    className={styles.linkedin}
                    aria-label={`${member.name} on LinkedIn`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <LinkedInIcon />
                  </a>
                </figcaption>
              </figure>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
