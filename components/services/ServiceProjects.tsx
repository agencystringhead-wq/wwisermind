'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { caseStudies, type Service } from '@/lib/services';
import { TrendUpIcon } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceProjects.module.css';

/** How far the covered panel shrinks and dims by the time the next has settled over it. */
const SCALE_TO = 0.94;
const OPACITY_TO = 0.55;

/**
 * Frame 9: completed projects, as the case-study reference — a wide landscape with the
 * words over its top left, a mono eyebrow and a large heading, on a dark wash for the
 * contrast, and the project's figures along the foot.
 *
 * The panels are a stack. Each is sticky at the same offset, so as the page scrolls the
 * next one rises over the one before and settles in its place — the browser does that
 * part, and it composites. What the script adds is the covered panel easing back: as the
 * next panel's top travels up the covered one's height, the covered one scales and dims
 * by that fraction. Transform and opacity only, one write per panel per frame, and only
 * while the stack is on screen — an observer attaches the scroll listener as it enters and
 * drops it as it leaves.
 *
 * Under reduced motion the panels are not sticky and the script never runs: two panels,
 * one under the other, at rest.
 */
export default function ServiceProjects({
  block,
  ground,
}: {
  block: NonNullable<Service['projects']>;
  ground: Ground;
}) {
  const stackRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLElement | null)[]>([]);
  const studies = block.caseStudySlugs.map((slug) => caseStudies[slug]);

  useEffect(() => {
    const stack = stackRef.current;
    if (!stack || studies.length < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let frame = 0;
    let queued = false;
    const last: number[] = [];

    const paint = () => {
      const panels = panelRefs.current;
      for (let i = 0; i < panels.length - 1; i += 1) {
        const covered = panels[i];
        const next = panels[i + 1];
        if (!covered || !next) continue;

        const a = covered.getBoundingClientRect();
        const b = next.getBoundingClientRect();
        /* 0 while the next panel's top is below the covered one's foot; 1 once the two
           tops meet. */
        const t = Math.min(1, Math.max(0, (a.bottom - b.top) / a.height));
        const value = Math.round(t * 100) / 100;
        if (last[i] === value) continue;
        last[i] = value;

        covered.style.transform = `scale(${1 - (1 - SCALE_TO) * value})`;
        covered.style.opacity = String(1 - (1 - OPACITY_TO) * value);
      }
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(() => {
        queued = false;
        paint();
      });
    };

    const listen = () => {
      paint();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    };

    const unlisten = () => {
      if (frame) cancelAnimationFrame(frame);
      queued = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) listen();
          else unlisten();
        }
      },
      { rootMargin: '10% 0px' },
    );
    observer.observe(stack);

    return () => {
      observer.disconnect();
      unlisten();
      for (const panel of panelRefs.current) {
        if (!panel) continue;
        panel.style.transform = '';
        panel.style.opacity = '';
      }
    };
  }, [studies.length]);

  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className="container">
        <div className={section.head}>
          <p className={section.eyebrow}>Completed projects</p>
          <ScrollReveal text={block.heading} className={section.heading} />
          <p className={section.lede}>{block.subheading}</p>
        </div>

        <div className={styles.stack} ref={stackRef}>
          {studies.map((study, index) => {
            const image = study.wide ?? {
              src: study.project.image,
              alt: `${study.name} website`,
            };

            return (
              <article
                className={styles.panel}
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
    </section>
  );
}
