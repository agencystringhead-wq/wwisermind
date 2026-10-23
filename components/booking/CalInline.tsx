'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '@/lib/site';
import { calConfig, initCal } from './cal';
import styles from './CalInline.module.css';

/* The embed library stays out of the page's own JS: it is fetched with the calendar. */
const Cal = dynamic(() => import('@calcom/embed-react'), { ssr: false });

/**
 * The inline calendar. It sits in a fixed-height frame with a quiet skeleton in the same
 * footprint, so the page below never moves while Cal loads. Used on /contact only.
 *
 * Cal's script is not requested until the frame is within a screen or so of the viewport, so
 * the rest of the contact page loads and scrolls without it.
 */
const NEAR = '800px 0px';
export default function CalInline() {
  const [ready, setReady] = useState(false);
  const [near, setNear] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const { namespace, calLink, origin } = siteConfig.booking;

  useEffect(() => {
    const node = wrap.current;
    if (!node || typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: NEAR },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!near) return;
    void initCal().then((cal) => {
      cal('on', { action: 'linkReady', callback: () => setReady(true) } as never);
    });
    /* If Cal never reports in, drop the skeleton rather than leave it over the calendar. */
    const t = window.setTimeout(() => setReady(true), 10000);
    return () => window.clearTimeout(t);
  }, [near]);

  return (
    <div className={styles.wrap} ref={wrap}>
      <div className={styles.skeleton} data-hidden={ready || undefined} aria-hidden="true">
        <span className={styles.bar} />
        <span className={styles.grid}>
          {Array.from({ length: 35 }, (_, i) => (
            <span key={i} className={styles.cell} />
          ))}
        </span>
      </div>
      {near ? (
        <Cal
          namespace={namespace}
          calLink={calLink}
          calOrigin={origin}
          config={calConfig as never}
          style={{ width: '100%', overflow: 'visible' }}
        />
      ) : null}
    </div>
  );
}
