import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import TimelineDot from './TimelineDot';
import styles from './AboutStory.module.css';

/**
 * Section 4 — Story / Timeline (white ground).
 *
 * Reference: left = heading + intro paragraph; right = vertical timeline with
 * connecting line and four milestone entries revealed on scroll.
 *
 * ⚠️ PLACEHOLDER — replace milestone date, title and body with real dates and copy
 * once the studio's history is ready to publish.
 */

const milestones = [
  {
    date: '2023',
    title: 'The idea takes shape',
    body: 'Placeholder — the moment the studio was conceived, what problem we were determined to solve, and who was in the room.', // ⚠️ PLACEHOLDER
  },
  {
    date: 'Early 2024',
    title: 'First client. First site.',
    body: 'Placeholder — describe the first therapist we worked with, what we built, and what we learned from going live for the first time.', // ⚠️ PLACEHOLDER
  },
  {
    date: 'Late 2024',
    title: 'Results that proved the model',
    body: 'Placeholder — the case study result that validated the approach: conversion lift, new patient enquiries, the figure that made the work undeniable.', // ⚠️ PLACEHOLDER
  },
  {
    date: '2025',
    title: 'Expanding the studio',
    body: 'Placeholder — new services, new team members, and the direction we are headed as we grow the studio and deepen our focus on mental health practitioners.', // ⚠️ PLACEHOLDER
  },
];

export default function AboutStory() {
  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        {/* LEFT — intro */}
        <Reveal as="div" className={styles.left}>
          <p className={styles.eyebrow} data-reveal="0">Our story</p>
          <ScrollReveal
            text={"How we got\nhere."}
            className={styles.heading}
          />
          <p className={styles.intro} data-reveal="2">
            wwisermind started with a simple observation: private-practice therapists were
            spending their energy on care, but no one had built the digital infrastructure to
            get them found. We set out to fix that — specifically, and without distraction.
          </p>
        </Reveal>

        {/* RIGHT — timeline */}
        <Reveal as="div" className={styles.timeline}>
          <div className={styles.line} aria-hidden="true" />

          {milestones.map((m, i) => (
            <div key={m.date} className={styles.entry} data-reveal={String(i)}>
              <TimelineDot />
              <div className={styles.entryContent}>
                <span className={styles.date}>{m.date}</span>
                <h3 className={styles.entryTitle}>{m.title}</h3>
                <p className={styles.entryBody}>{m.body}</p>
              </div>
            </div>
          ))}

          <p className={styles.closing}>
            <em>And we&apos;re only getting started.</em>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
