'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { problems } from '@/lib/site';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Problems.module.css';

function ArrowIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={direction === 'right' ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M19 12H5" />
      <path d="M11 6l-6 6 6 6" />
    </svg>
  );
}

const { headingLead, headingRest, cards, slideRepeat } = problems;

/** The cards, optionally repeated to give the slider more to slide through. */
const slides = Array.from({ length: slideRepeat }, () => cards).flat();

export default function Problems() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    setAtStart(track.scrollLeft <= 1);
    setAtEnd(track.scrollLeft >= track.scrollWidth - track.clientWidth - 1);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    sync();
    track.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      track.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [sync]);

  const step = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const items = Array.from(track.children) as HTMLElement[];
    if (items.length < 2) return;
    const pitch = items[1].offsetLeft - items[0].offsetLeft;
    const perView = Math.max(1, Math.round(track.clientWidth / pitch));
    track.scrollBy({ left: pitch * perView * direction, behavior: 'smooth' });
  };

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          {/* The two halves were a fixed black/grey split; the reveal carries that contrast
              itself now, word by word, so they join back into one sentence. */}
          <ScrollReveal
            text={`${headingLead} ${headingRest}`}
            className={`${styles.heading} ${styles.headingMeasure}`}
          />

          <div className={styles.controls}>
            <button
              type="button"
              className={styles.control}
              onClick={() => step(-1)}
              disabled={atStart}
              aria-label="Previous problems"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              className={styles.control}
              onClick={() => step(1)}
              disabled={atEnd}
              aria-label="Next problems"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        <div className={styles.slider}>
          <div className={styles.track} ref={trackRef}>
            {slides.map((card, index) => (
              <article className={styles.slide} key={`${card.title}-${index}`}>
                <div className={styles.media}>
                  {/* An image card renders no <video> at all rather than a hidden one, so the
                      clip is never requested. Both fill the same frame and are cropped by it. */}
                  {'image' in card ? (
                    <Image
                      src={card.image.src}
                      alt={card.image.alt}
                      fill
                      sizes="(max-width: 640px) 84vw, (max-width: 1023px) 45vw, 420px"
                      className={styles.still}
                    />
                  ) : (
                    <video
                      poster={card.background.poster}
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                      aria-hidden="true"
                    >
                      {card.background.sources.map((source) => (
                        <source key={source.src} src={source.src} type={source.type} />
                      ))}
                    </video>
                  )}
                  <span className={styles.overlay} aria-hidden="true" />
                  <p className={styles.title}>{card.title}</p>
                </div>
                <p className={styles.caption}>{card.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
