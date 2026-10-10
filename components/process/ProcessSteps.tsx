'use client';

import { useEffect, useRef, useState } from 'react';
import { processPage } from '@/lib/process';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import useScrollProgress from '@/components/ui/useScrollProgress';
import section from '@/components/services/Section.module.css';
import ConfirmChip from './ConfirmChip';
import styles from './Process.module.css';

const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';

/**
 * Frame 3 — the three steps, the body of the page.
 *
 * Three full-width blocks down a thin blue rail that fills as the page scrolls. The fill is
 * driven by the shared scroll hook, which measures once, reads `scrollY` and nothing else,
 * pauses while the list is off screen and smooths the value; the only property that moves is
 * the fill's `scaleY`. Each block arrives through the shared Reveal in a set order — the
 * numeral, then the title, the paragraph, the two cards, and last the walk-away line.
 *
 * Under reduced motion the hook never runs and the stylesheet draws the rail full and every
 * block in place.
 */
export default function ProcessSteps() {
  const { eyebrow, heading, items } = processPage.steps;
  const listRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLSpanElement | null>(null);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOTION_QUERY);
    const sync = () => setMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useScrollProgress(listRef, {
    enabled: motion,
    damping: 120,
    measure: (list) => {
      const height = window.innerHeight || 1;
      const top = list.getBoundingClientRect().top + window.scrollY;
      /* Starts as the list's top reaches 55% of the way down the screen, and is full when
         its foot has risen to the same line. */
      return { start: top - height * 0.55, length: Math.max(1, list.offsetHeight) };
    },
    onProgress: (progress) => {
      railRef.current?.style.setProperty('--p', String(progress));
    },
  });

  /* Off the driver, the stylesheet's resting state (a full rail) takes it back. */
  useEffect(() => {
    if (!motion) railRef.current?.style.removeProperty('--p');
  }, [motion]);

  return (
    <section className={styles.steps}>
      <div className="container">
        <Reveal as="header" className={section.head}>
          <p className={section.eyebrow} data-reveal="0">
            {eyebrow}
          </p>
          <ScrollReveal text={heading} className={section.heading} />
        </Reveal>

        <div className={styles.list} ref={listRef}>
          <span className={styles.rail} aria-hidden="true">
            <span className={styles.railFill} ref={railRef} />
          </span>

          {items.map((step) => (
            <Reveal as="article" className={styles.block} key={step.numeral}>
              <span className={styles.node} data-reveal="0" aria-hidden="true" />

              <div className={styles.tile} data-reveal="0" aria-hidden="true">
                <span className={styles.numeral}>{step.numeral}</span>
              </div>

              <div className={styles.stepBody}>
                <h3 className={styles.stepTitle} data-reveal="1">
                  {step.title}
                </h3>
                <p className={styles.stepText} data-reveal="2">
                  {step.body}
                </p>

                <div className={styles.parts} data-reveal="3">
                  {[step.yourPart, step.ourPart].map((part, i) => (
                    <div
                      className={`${styles.part} ${i === 0 ? styles.partYou : styles.partUs}`}
                      key={part.label}
                    >
                      <p className={styles.partLabel}>{part.label}</p>
                      <p className={styles.partText}>
                        {part.body}
                        <ConfirmChip question={(part as { confirm?: string }).confirm} />
                      </p>
                    </div>
                  ))}
                </div>

                <p className={styles.walk} data-reveal="4">
                  <span className={styles.walkLead}>{step.walkAway.lead}</span>{' '}
                  {step.walkAway.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
