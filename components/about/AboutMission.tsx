import Image from 'next/image';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import MissionCards, { type MissionItem } from './MissionCards';
import styles from './AboutMission.module.css';

const items: MissionItem[] = [
  {
    title: 'Our Mission',
    heading: 'Make every therapist as discoverable as their care deserves',
    body: 'Strategy-led web design, search, and AI visibility, built specifically for therapists and psychologists in private practice.',
    points: [
      'Websites that feel like the practice',
      'Search and AI visibility that brings the right clients',
      'One vertical, so our knowledge compounds',
    ],
  },
  {
    title: 'Our Vision',
    heading: 'A world where the right client finds the right therapist',
    body: 'We believe the gap between those two people is a design and discoverability problem — one we are uniquely positioned to close.',
    points: [
      'Reach that matches the quality of care',
      'Found in Google and in AI answers',
      'Clients who feel at home on arrival',
    ],
  },
];

/**
 * Section 3 — Mission / Vision (soft blue tint ground).
 *
 * Reference: centred eyebrow + heading; below, a stack of two surfaced cards on the left
 * and a photo on the right that fills the same height edge to edge.
 */
export default function AboutMission() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal as="header" className={styles.header}>
          <p className={styles.eyebrow} data-reveal="0">What drives us</p>
          <ScrollReveal text={"Mission &\nVision."} className={styles.heading} />
        </Reveal>

        <Reveal as="div" className={styles.grid}>
          <div className={styles.left} data-reveal="1">
            <MissionCards items={items} />
          </div>

          <figure className={styles.photo} data-reveal="2">
            <Image
              src="/images/about/about-mission-first-meeting.webp"
              alt="A therapist welcoming a new client at the door of his practice"
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1023px) 50vw, 640px"
              className={styles.photoImg}
            />
            <span className={styles.photoGlow} aria-hidden="true" />
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
