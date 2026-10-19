'use client';

import Cal from '@calcom/embed-react';
import { useEffect, useState } from 'react';
import { siteConfig } from '@/lib/site';
import { calConfig, initCal } from './cal';
import styles from './CalInline.module.css';

/**
 * The inline calendar. It sits in a fixed-height frame with a quiet skeleton in the same
 * footprint, so the page below never moves while Cal loads. Used on /contact only.
 */
export default function CalInline() {
  const [ready, setReady] = useState(false);
  const { namespace, calLink, origin } = siteConfig.booking;

  useEffect(() => {
    void initCal().then((cal) => {
      cal('on', { action: 'linkReady', callback: () => setReady(true) } as never);
    });
    /* If Cal never reports in, drop the skeleton rather than leave it over the calendar. */
    const t = window.setTimeout(() => setReady(true), 10000);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div className={styles.wrap}>
      <div className={styles.skeleton} data-hidden={ready || undefined} aria-hidden="true">
        <span className={styles.bar} />
        <span className={styles.grid}>
          {Array.from({ length: 35 }, (_, i) => (
            <span key={i} className={styles.cell} />
          ))}
        </span>
      </div>
      <Cal
        namespace={namespace}
        calLink={calLink}
        calOrigin={origin}
        config={calConfig as never}
        style={{ width: '100%', overflow: 'visible' }}
      />
    </div>
  );
}
