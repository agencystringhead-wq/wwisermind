'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { KIND_COLOUR, type MapPoint } from './mapShared';
import styles from './market.module.css';

/* Leaflet is a chunk of its own, fetched only when the map is within 400px of the screen. Nothing of it is in the
   page's first load. */
const MapCanvas = dynamic(() => import('./MapCanvas'), { ssr: false });

const LABELS: Record<MapPoint['kind'], string> = {
  practice: 'Practice',
  chain: 'National chain',
  medical: 'Medical',
  nonprofit: 'Nonprofit',
};

export default function MarketMap({ points, bounds }: { points: MapPoint[]; bounds: [[number, number], [number, number]] }) {
  const shell = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = shell.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const kinds = (Object.keys(LABELS) as MapPoint['kind'][]).filter((k) => points.some((p) => p.kind === k));

  return (
    <div>
      <div className={styles.mapShell} ref={shell}>
        {near ? <MapCanvas points={points} bounds={bounds} /> : <div className={styles.mapPlaceholder}>Loading the map</div>}
        <noscript>
          <div className={styles.mapPlaceholder}>The map needs JavaScript. Every practice is also listed in the directory below.</div>
        </noscript>
      </div>
      <div className={styles.legend} aria-label="Map key">
        {kinds.map((k) => (
          <span key={k}>
            <i className={styles.dot} style={{ background: KIND_COLOUR[k] }} /> {LABELS[k]}
          </span>
        ))}
        <span>Bigger dot, higher score</span>
      </div>
      <p className={styles.mapNote}>Map data © OpenStreetMap contributors. Click a dot for the practice.</p>
    </div>
  );
}
