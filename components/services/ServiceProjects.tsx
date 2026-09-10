'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { caseStudies, type Service } from '@/lib/services';
import { TrendUpIcon } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import useScrollProgress from '@/components/ui/useScrollProgress';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceProjects.module.css';

/**
 * The pinned range, split three ways. Each is a share of the whole, and the three add up
 * to 1: the first panel settles into place across ARRIVE, then holds still and fully
 * visible across HOLD, and only then does the next panel slide up over it, across SLIDE.
 * With more than two panels the slide phase is shared equally between the ones after the
 * first, one after another. The total distance is `--pin-distance` in the stylesheet.
 */
const ARRIVE = 0.25;
const HOLD = 0.3;
const SLIDE = 1 - ARRIVE - HOLD;

/** How far the first panel sits low, and how faint, before it settles. */
const SETTLE_FROM = 96;
const SETTLE_OPACITY_FROM = 0.4;

/** How far the covered panel shrinks and dims by the time the next has settled over it. */
const SCALE_TO = 0.94;
const OPACITY_TO = 0.55;

/** The smoothing on the scroll value, in milliseconds; see `useScrollProgress`. */
const DAMPING = 110;

const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';

const clamp = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const smooth = (x: number) => x * x * (3 - 2 * x);
const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * Frame 9: completed projects, as the case-study reference — a wide landscape with the
 * words over its top left, a mono eyebrow and a large heading, on a dark wash for the
 * contrast, and the project's figures along the foot.
 *
 * The panels are a stack on a stage that pins under the header while the page scrolls a
 * fixed distance beneath it (`--pin-distance`). The scroll through that distance is the
 * section's clock, in three phases that never overlap: the first panel settles into
 * place, holds — still and whole — while the reader keeps scrolling, and then the next
 * panel rises over it from below and settles in its place, the covered one easing back
 * as it is covered. Every value is derived from where the page is, so scrolling back up
 * runs the three phases in reverse. The value is smoothed before it is painted, so a
 * mouse wheel's steps arrive as a glide; transform and opacity only, one write per panel
 * per frame, by the shared scroll-progress hook, which parks itself while the stage is
 * off screen.
 *
 * Under reduced motion the stage is not sticky, the range has no length and the driver
 * never runs: two panels, one under the other, at rest. The stylesheet gates the pin's
 * geometry and the panels' starting positions on the same query the component reads,
 * so the page is laid out for the motion before hydration and nothing jumps when the
 * driver starts.
 */
export default function ServiceProjects({
  block,
  ground,
}: {
  block: NonNullable<Service['projects']>;
  ground: Ground;
}) {
  const pinRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const gapRef = useRef(24);
  const [motion, setMotion] = useState(false);
  const studies = block.caseStudySlugs.map((slug) => caseStudies[slug]);
  const count = studies.length;

  useEffect(() => {
    const query = window.matchMedia(MOTION_QUERY);
    const sync = () => setMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useScrollProgress(pinRef, {
    enabled: motion && count > 1,
    damping: DAMPING,
    measure: (pin) => {
      const stage = stageRef.current;
      const top = stage ? parseFloat(getComputedStyle(stage).top) || 0 : 0;
      gapRef.current = parseFloat(getComputedStyle(pin).getPropertyValue('--stack-gap')) || 24;
      return {
        start: pin.getBoundingClientRect().top + window.scrollY - top,
        length: Math.max(1, pin.offsetHeight - (stage?.offsetHeight ?? 0)),
      };
    },
    onProgress: (progress) => {
      const panels = panelRefs.current;
      const slides = count - 1;
      const each = SLIDE / slides;

      /* Phase 1: the first panel settles. Frozen at 1 from the end of ARRIVE onward. */
      const settle = smooth(clamp(progress / ARRIVE));

      for (let i = 0; i < count; i += 1) {
        const panel = panels[i];
        if (!panel) continue;

        /* How far this panel has risen over the one before: 0 until its own slice of the
           slide phase begins — after ARRIVE and HOLD, and after every earlier panel has
           settled — and 1 once it has. The first panel never rises; it is the floor. */
        const rise = i === 0 ? 1 : smooth(clamp((progress - ARRIVE - HOLD - each * (i - 1)) / each));
        /* How far the panel after this one has covered it. */
        const covered =
          i < slides ? smooth(clamp((progress - ARRIVE - HOLD - each * i) / each)) : 0;

        const lift = i === 0 ? round(SETTLE_FROM * (1 - settle)) : 0;
        const fade = i === 0 ? SETTLE_OPACITY_FROM + (1 - SETTLE_OPACITY_FROM) * settle : 1;
        const drop = i === 0 ? 0 : round((1 - rise) * 100);
        const scale = round(1 - (1 - SCALE_TO) * covered);
        const opacity = round(fade * (1 - (1 - OPACITY_TO) * covered));

        panel.style.transform =
          i === 0
            ? `translateY(${lift}px) scale(${scale})`
            : `translateY(calc(${drop}% + ${round((1 - rise) * gapRef.current)}px)) scale(${scale})`;
        panel.style.opacity = String(opacity);
      }
    },
  });

  /* Off the driver, the stylesheet's resting layout takes the nodes back. */
  useEffect(() => {
    if (motion) return;
    for (const panel of panelRefs.current) {
      panel?.style.removeProperty('transform');
      panel?.style.removeProperty('opacity');
    }
  }, [motion]);

  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className="container">
        <div className={section.head}>
          <p className={section.eyebrow}>Completed projects</p>
          <ScrollReveal text={block.heading} className={section.heading} />
          <p className={section.lede}>{block.subheading}</p>
        </div>

        <div className={styles.pin} ref={pinRef}>
          <div className={styles.stage} ref={stageRef}>
            {studies.map((study, index) => {
              const image = study.wide ?? {
                src: study.project.image,
                alt: `${study.name} website`,
              };

              return (
                <article
                  className={`${styles.panel} ${index === 0 ? styles.first : styles.next}`}
                  key={study.slug}
                  ref={(node) => {
                    panelRefs.current[index] = node;
                  }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1340px) 100vw, 1300px"
                    className={styles.image}
                    style={{ objectPosition: image.position }}
                  />
                  <span className={styles.wash} aria-hidden="true" />

                  <div className={styles.copy}>
                    <p className={styles.eyebrow}>{study.name}</p>
                    <h3 className={styles.heading}>{study.headline}</h3>
                  </div>

                  <div className={styles.foot}>
                    <ul className={styles.stats}>
                      {study.project.stats.map((stat) => (
                        <li className={styles.stat} key={stat.label}>
                          <span className={styles.statValue}>
                            <TrendUpIcon className={styles.arrow} />
                            {stat.value}
                          </span>
                          <span className={styles.statLabel}>{stat.label}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={`/${study.project.href}`} className={styles.link}>
                      See the project
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
