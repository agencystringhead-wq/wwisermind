'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { homeIntro } from '@/lib/site';
import styles from './HomeIntro.module.css';

function ArrowUp() {
  return (
    <svg className={styles.arrow} viewBox="0 0 24 22" fill="currentColor" aria-hidden="true">
      <path d="M12 1.4c.5 0 1 .3 1.2.8l8.6 16.4c.5.9-.5 1.9-1.4 1.5L12 16.6l-8.4 3.5c-.9.4-1.9-.6-1.4-1.5L10.8 2.2c.2-.5.7-.8 1.2-.8z" />
    </svg>
  );
}

const { headingLead, headingRest, eyebrow, viewAll, projects, slideRepeat } = homeIntro;

/** The two real projects, repeated so the slider has something to slide through. */
const slides = Array.from({ length: slideRepeat }, () => projects).flat();

export default function HomeIntro() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(slides.length / projects.length);

  const perPage = projects.length;

  /** Snap positions come straight off the rendered cards, so the maths stays right
      whatever the breakpoint does to the card width. */
  const onScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    if (!cards.length) return;
    const origin = cards[0].offsetLeft;
    const target = track.scrollLeft + origin;
    let nearest = 0;
    let best = Infinity;
    cards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft - target);
      if (distance < best) {
        best = distance;
        nearest = index;
      }
    });
    setPage(Math.min(Math.floor(nearest / perPage), pageCount - 1));
  }, [pageCount, perPage]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => track.removeEventListener('scroll', onScroll);
  }, [onScroll]);

  const goToPage = (index: number) => {
    const track = trackRef.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const card = cards[Math.min(index * perPage, cards.length - 1)];
    if (!card) return;
    track.scrollTo({ left: card.offsetLeft - cards[0].offsetLeft, behavior: 'smooth' });
    setPage(index);
  };

  return (
    <section className={styles.section}>
      <div className={styles.block}>
        <div className="container">
          <div className={styles.headingRow}>
            <h2 className={styles.heading}>
              {headingLead}
              <span className={styles.headingMuted}>{headingRest}</span>
            </h2>
          </div>

          <div className={styles.metaRow}>
            <p className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              {eyebrow}
            </p>
            <Link href={viewAll.href} className={styles.viewAll}>
              {viewAll.label}
            </Link>
          </div>

          <div className={styles.slider}>
            <div className={styles.track} ref={trackRef}>
              {slides.map((project, index) => (
                <article className={styles.slide} key={`${project.name}-${index}`}>
                  <figure className={styles.figure}>
                    <Image
                      src={project.image}
                      alt={`${project.name} project`}
                      fill
                      sizes="(max-width: 640px) 84vw, (max-width: 1023px) 45vw, 640px"
                    />
                  </figure>

                  <div className={styles.stats}>
                    <Link href={project.href} className={styles.name}>
                      {project.name}
                    </Link>
                    {project.stats.map((stat) => (
                      <p className={styles.stat} key={stat.label}>
                        <ArrowUp />
                        <span className={styles.statValue}>{stat.value}</span>
                        <span className={styles.statLabel}>{stat.label}</span>
                      </p>
                    ))}
                  </div>
                </article>
              ))}
            </div>

            <div className={styles.dots} role="tablist" aria-label="Project slides">
              {Array.from({ length: pageCount }, (_, index) => (
                <button
                  key={index}
                  type="button"
                  role="tab"
                  aria-selected={page === index}
                  aria-label={`Go to slide ${index + 1}`}
                  className={`${styles.dotButton} ${page === index ? styles.dotActive : ''}`}
                  onClick={() => goToPage(index)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
