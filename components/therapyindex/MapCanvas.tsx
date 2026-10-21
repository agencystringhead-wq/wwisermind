'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { KIND_COLOUR, type MapPoint } from './mapShared';
import styles from './market.module.css';

/** Dot radius in px: 3 for a score of 0 up to 16 for 100. */
const radius = (score: number) => 3 + (Math.max(0, Math.min(100, score)) / 100) * 13;

/**
 * The practice map. Leaflet with OpenStreetMap tiles: client-only, and loaded
 * by MarketMap only once it is near the screen. Dot size is the practice's score, colour is its type. Dots are
 * drawn on one canvas, so a few hundred of them stay cheap; the lowest-scoring are drawn first so the
 * leaders sit on top.
 */
export default function MapCanvas({ points, bounds }: { points: MapPoint[]; bounds: [[number, number], [number, number]] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const map = L.map(el, {
      preferCanvas: true,
      scrollWheelZoom: false,
      zoomAnimation: !reduced,
      fadeAnimation: !reduced,
      markerZoomAnimation: !reduced,
      attributionControl: true,
    });

    /* OpenStreetMap's own tiles, softened to grey in CSS so the coloured dots carry the page. CARTO's free tiles now
       need an API key, and a tile without one is stamped over with a watermark. */
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(map);

    [...points]
      .sort((a, b) => a.score - b.score)
      .forEach((p) => {
        const colour = KIND_COLOUR[p.kind];
        const marker = L.circleMarker([p.lat, p.lng], {
          radius: radius(p.score),
          color: colour,
          weight: 1,
          fillColor: colour,
          fillOpacity: 0.55,
        }).addTo(map);

        /* Built with DOM nodes, never an HTML string, so a practice name can not inject markup. */
        const box = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = p.name;
        const detail = document.createElement('div');
        detail.textContent = p.detail;
        box.append(title, detail);
        if (p.href) {
          const link = document.createElement('a');
          link.href = p.href;
          link.textContent = 'See the profile';
          link.style.display = 'inline-block';
          link.style.marginTop = '4px';
          box.append(link);
        }
        marker.bindPopup(box);
      });

    map.fitBounds(bounds, { padding: [24, 24], maxZoom: 13 });

    // Wheel zoom only after the map has been clicked or tapped, so the page still scrolls past it.
    map.once('click', () => map.scrollWheelZoom.enable());

    return () => {
      map.remove();
    };
  }, [points, bounds]);

  return <div ref={ref} className={styles.mapCanvas} role="img" aria-label="Map of the practices in this report" />;
}
