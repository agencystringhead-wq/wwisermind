'use client';

import { createElement, useEffect, useRef, useState, type ReactNode } from 'react';
import useScrollProgress from './useScrollProgress';
import styles from './Reveal.module.css';

/* Where a group's reveal runs, as fractions of the viewport height measured to the top of
   the group: it begins as the top crosses ENTER and is complete once the top has risen
   another SPAN. A group near the foot of the page can never scroll that far, so the range
   is pulled up to end where the page does. */
const ENTER = 0.9;
const SPAN = 0.32;

/** How far into the range each later item starts, as a share of the whole: the heading
    leads, the copy follows, the picture arrives last. */
const STAGE = 0.16;

/** The smoothing on the scroll value, in milliseconds; see `useScrollProgress`. */
const DAMPING = 140;

const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';

const clamp = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const smooth = (x: number) => x * x * (3 - 2 * x);
const round = (value: number) => Math.round(value * 1000) / 1000;

/**
 * A group of elements that arrive as the page reaches them: a small rise and a fade, one
 * after another in a set order, keyed to scroll rather than to time.
 *
 * Any descendant carrying `data-reveal="n"` is an item, and `n` is its place in the order:
 * 0 leads, 1 follows, 2 after that. Each item gets a `--t` from 0 to 1 and the stylesheet
 * turns that into `opacity` and a `translateY` — nothing else changes, so the browser only
 * ever composites. The shared scroll-progress hook drives it: the range is measured up
 * front and re-measured on resize, the scroll handler reads `scrollY` and nothing else, an
 * IntersectionObserver keeps it detached while the group is off screen, and the value is
 * smoothed before it is painted so a wheel's steps arrive as a glide.
 *
 * The value only ever moves forward. Progress is derived from where the page is, but what
 * is painted is the furthest it has reached — so scrolling back up leaves everything where
 * it landed, the way a page that has been read stays read. A group already in view on
 * arrival glides in from nothing rather than simply being there.
 *
 * Under reduced motion the hook never runs and the stylesheet draws every item in its
 * final state; the stylesheet gates the starting state on the same query the component
 * reads, so the page is laid out for the motion before hydration and nothing jumps when
 * the driver starts.
 */
export default function Reveal({
  as = 'div',
  className,
  damping = DAMPING,
  children,
}: {
  as?: 'div' | 'section' | 'header' | 'article' | 'figure' | 'ul' | 'li';
  className?: string;
  /** A longer glide for a block that arrives on page load rather than on scroll. */
  damping?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const items = useRef<{ node: HTMLElement; stage: number }[]>([]);
  const reached = useRef(0);
  const [motion, setMotion] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(MOTION_QUERY);
    const sync = () => setMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  useScrollProgress(ref, {
    enabled: motion,
    damping,
    from: 0,
    measure: (group) => {
      const height = window.innerHeight || 1;
      const top = group.getBoundingClientRect().top + window.scrollY;
      const length = height * SPAN;
      /* `start` goes negative for a group already in view on arrival — the range then
         reads 1 at the top of the page, and the glide from `from: 0` is what shows it.
         Clamped at zero it would read 0 there and wait for a scroll that never comes. */
      const furthest = Math.max(0, document.documentElement.scrollHeight - height);
      const start = Math.min(top - height * ENTER, furthest - length);

      items.current = Array.from(group.querySelectorAll<HTMLElement>('[data-reveal]')).map(
        (node) => ({ node, stage: Math.max(0, parseInt(node.dataset.reveal ?? '0', 10) || 0) }),
      );

      return { start, length: Math.max(1, length) };
    },
    onProgress: (progress) => {
      if (progress <= reached.current) return;
      reached.current = progress;

      const last = items.current.reduce((max, item) => Math.max(max, item.stage), 0);
      const window_ = Math.max(0.2, 1 - last * STAGE);

      for (const { node, stage } of items.current) {
        const t = round(smooth(clamp((progress - stage * STAGE) / window_)));
        node.style.setProperty('--t', String(t));
      }
    },
  });

  /* Off the driver, the stylesheet's resting layout takes the nodes back. */
  useEffect(() => {
    if (motion) return;
    for (const { node } of items.current) node.style.removeProperty('--t');
  }, [motion]);

  return createElement(
    as,
    { ref, className: className ? `${styles.group} ${className}` : styles.group },
    children,
  );
}
