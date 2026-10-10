'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './AboutStory.module.css';

/**
 * A timeline marker that pulses once, in brand blue, the first time it scrolls into view,
 * and again on hover (CSS). Under reduced motion it simply renders in its settled state.
 */
export default function TimelineDot() {
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -25% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${styles.dot} ${seen ? styles.dotSeen : ''}`}
      aria-hidden="true"
    />
  );
}
