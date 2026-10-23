'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { toneOf } from '@/lib/local-map-assessment';
import type { Report } from '@/lib/local-map/types';
import styles from './flow.module.css';

/**
 * The visibility map: 25 numbered circles over a light basemap, coloured by your rank (green 1 to 3, amber 4 to 10, red 11 to 20, grey
 * not in the first 20, pale where a check did not finish). OpenStreetMap tiles softened to grey in CSS: CARTO's free tiles now need
 * an API key (see the Therapy Index map). Circles are built from numbers only, never from names, so nothing here can inject markup.
 */
export default function ResultsMap({ report, keyword, selected, onSelect }: { report: Report; keyword: number; selected: number | null; onSelect: (point: number) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const pick = useRef(onSelect);
  pick.current = onSelect;

  useEffect(() => {
    if (!el.current) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const m = L.map(el.current, { scrollWheelZoom: false, zoomControl: false, zoomAnimation: !reduced, fadeAnimation: !reduced, markerZoomAnimation: !reduced, zoomSnap: 0.25 });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(m);
    const lats = report.points.map((p) => p.lat);
    const lngs = report.points.map((p) => p.lng);
    m.fitBounds(
      [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)],
      ],
      { padding: [34, 34] },
    );
    L.circleMarker([report.practice.lat, report.practice.lng], { radius: 6, color: '#000', weight: 2, fillColor: '#fff', fillOpacity: 1, interactive: false }).addTo(m);
    L.control.zoom({ position: 'bottomright' }).addTo(m);
    m.once('click', () => m.scrollWheelZoom.enable());
    layer.current = L.layerGroup().addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      layer.current = null;
    };
  }, [report.points, report.practice.lat, report.practice.lng]);

  useEffect(() => {
    const group = layer.current;
    if (!group) return;
    group.clearLayers();
    const result = report.keywords[keyword];
    report.points.forEach((p) => {
      const rank = result.ranks[p.i];
      const missing = result.missing[p.i];
      const tone = missing ? 'unchecked' : toneOf(rank);
      const label = missing ? '?' : rank === null ? '' : String(rank);
      const icon = L.divIcon({
        className: '',
        html: `<span class="lm-dot lm-${tone}${selected === p.i ? ' lm-on' : ''}">${label}</span>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
      const marker = L.marker([p.lat, p.lng], { icon, keyboard: true, title: `Point ${p.i + 1}: ${missing ? 'not checked' : rank === null ? 'not in the first 20' : `rank ${rank}`}` });
      marker.on('click', () => pick.current(p.i));
      marker.addTo(group);
    });
  }, [report, keyword, selected]);

  return <div ref={el} className={styles.resultsMap} role="application" aria-label="Map of your ranking at 25 points around your practice. Choose a circle to see who ranks in the top three there." />;
}
