'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styles from './hub.module.css';

/** The hero's backdrop: a slow gradient mesh (pure CSS) and the generated shapes image, which drifts a little slower than the page. */
export default function HeroArt() {
  const art = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = art.current;
    if (!node || !window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const y = Math.min(window.scrollY, 900);
      node.style.transform = `translate3d(0, ${(y * 0.14).toFixed(1)}px, 0)`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className={styles.heroArt} aria-hidden="true">
      <div className={styles.mesh}>
        <span className={styles.blobBlue} />
        <span className={styles.blobTeal} />
        <span className={styles.blobViolet} />
        <span className={styles.blobPeach} />
      </div>
      <div ref={art} className={styles.heroShapes}>
        <Image src="/images/therapyindex/hero.webp" alt="" width={1000} height={737} priority fetchPriority="high" sizes="(max-width: 900px) 90vw, 760px" />
      </div>
    </div>
  );
}
