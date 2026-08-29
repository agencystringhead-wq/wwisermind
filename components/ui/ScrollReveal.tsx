'use client';

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import styles from './ScrollReveal.module.css';

/* Where the reveal runs, as fractions of the viewport height measured to the top of the
   block: it starts as the sentence enters the lower third and is finished by the time it
   sits around the middle. Defaults suit a two-line section headline; callers with a longer
   or smaller-set block pass their own, because the same window spent on four times the words
   is four times the pace. */
const START = 0.75;
const END = 0.35;

/** Roughly how many words are mid-transition at once. Above one, the edge between read and
    unread stops looking like a cursor stepping along and becomes a soft front. */
const WORDS_IN_FLIGHT = 3;

/** Rounding the per-word value means most frames only write the handful of words actually
    changing, rather than all of them. */
const STEPS = 50;

const clamp = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/**
 * A section heading revealed by scroll position rather than by time.
 *
 * Every word is its own span carrying a `--t` from 0 to 1, and the colour is a `color-mix`
 * between the muted and ink tokens driven by that number — so the interpolation is the
 * browser's job and JS only ever writes one number per word. Progress comes from the block's
 * own position in the viewport, which makes it a scrubber: scrolling back up runs it
 * backwards, because the value is derived from where the page *is*, never accumulated from
 * where it has been.
 *
 * The sentence is also set on the container as an `aria-label`, so a screen reader gets one
 * clean sentence rather than three dozen fragments, and the text stays selectable.
 *
 * `className` is the calling section's own heading class. Everything about how the type looks
 * — size, weight, tracking, how wide it is allowed to run — stays there; this component owns
 * only the reveal, so two sections can share the effect without sharing a scale.
 *
 * `as` is the element to render. It defaults to the h2 the section headlines want, and body
 * copy passes 'p' so that borrowing the effect does not invent a heading in the outline.
 */
export default function ScrollReveal({
  text,
  className,
  as: Tag = 'h2',
  start: startAt = START,
  end: endAt = END,
}: {
  text: string;
  className?: string;
  as?: 'h2' | 'h3' | 'p' | 'blockquote';
  /** Both as fractions of viewport height, measured to the top of the block: `start` is
      where the first word begins to turn and `end` is where the last one lands. */
  start?: number;
  end?: number;
}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const wordRefs = useRef<HTMLSpanElement[]>([]);
  const lastValues = useRef<number[]>([]);

  const words = useMemo(() => text.trim().split(/\s+/), [text]);

  /* Layout effect, not effect: the first paint would otherwise show the CSS default — every
     word already ink — and then drop the ones below the fold back to grey a frame later. */
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

    let frame = 0;
    let queued = false;
    let lastProgress = -1;

    const progressNow = () => {
      const rect = container.getBoundingClientRect();
      const height = window.innerHeight || 1;
      const from = height * startAt;
      const to = height * endAt;
      return clamp((from - rect.top) / (from - to));
    };

    /* One word's share of the whole, widened so neighbours overlap. */
    const width = Math.min(0.5, WORDS_IN_FLIGHT / Math.max(words.length, 1));
    const spread = 1 - width;

    const paint = (progress: number) => {
      const nodes = wordRefs.current;
      const last = lastValues.current;

      for (let i = 0; i < nodes.length; i += 1) {
        const start = nodes.length === 1 ? 0 : (i / (nodes.length - 1)) * spread;
        const value = Math.round(clamp((progress - start) / width) * STEPS) / STEPS;

        if (last[i] !== value) {
          last[i] = value;
          nodes[i]?.style.setProperty('--t', String(value));
        }
      }
    };

    const apply = () => {
      const progress = progressNow();
      if (progress === lastProgress) return;
      lastProgress = progress;
      paint(progress);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      frame = requestAnimationFrame(() => {
        queued = false;
        apply();
      });
    };

    const start = () => {
      if (reduced.matches) {
        /* motion off: the sentence is simply read, in full contrast, and nothing listens */
        lastProgress = -1;
        paint(1);
        return;
      }

      apply();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
    };

    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      queued = false;
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };

    const onPreferenceChange = () => {
      stop();
      lastValues.current = [];
      start();
    };

    start();
    reduced.addEventListener('change', onPreferenceChange);

    return () => {
      stop();
      reduced.removeEventListener('change', onPreferenceChange);
    };
  }, [words, startAt, endAt]);

  /* The webfont lands after first paint and rewraps the block, which moves it up or down the
     page; without a re-measure the reveal would keep scrubbing against stale geometry. */
  useEffect(() => {
    document.fonts?.ready.then(() => window.dispatchEvent(new Event('resize'))).catch(() => {});
  }, []);

  return (
    <Tag
      className={className ? `${styles.reveal} ${className}` : styles.reveal}
      aria-label={text}
      ref={(node: HTMLElement | null) => {
        containerRef.current = node;
      }}
    >
      {words.map((word, index) => (
        <span
          className={styles.word}
          key={`${word}-${index}`}
          ref={(node) => {
            if (node) wordRefs.current[index] = node;
          }}
        >
          {word}{' '}
        </span>
      ))}
    </Tag>
  );
}
