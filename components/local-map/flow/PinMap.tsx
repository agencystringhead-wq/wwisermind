'use client';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import styles from './flow.module.css';

/**
 * "Drop a pin": a small map for a practice whose address Google hides. Tap or click to place the centre of the 5 x 5 grid.
 * OpenStreetMap tiles softened to grey in CSS (the same choice as the Therapy Index map: CARTO's free tiles now need an API key).
 */
export default function PinMap({ centre, zoom, pin, onPick }: { centre: [number, number]; zoom: number; pin: [number, number] | null; onPick: (lat: number, lng: number) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.CircleMarker | null>(null);
  const pick = useRef(onPick);
  pick.current = onPick;

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { scrollWheelZoom: false, attributionControl: true }).setView(centre, zoom);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
    }).addTo(m);
    m.on('click', (e: L.LeafletMouseEvent) => pick.current(e.latlng.lat, e.latlng.lng));
    m.once('click', () => m.scrollWheelZoom.enable());
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
      marker.current = null;
    };
    // The map is made once; the centre only seeds it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const m = map.current;
    if (!m) return;
    marker.current?.remove();
    marker.current = null;
    if (pin) {
      marker.current = L.circleMarker(pin, { radius: 9, color: '#ffffff', weight: 3, fillColor: '#146ef5', fillOpacity: 1 }).addTo(m);
    }
  }, [pin]);

  useEffect(() => {
    map.current?.setView(centre, zoom);
  }, [centre, zoom]);

  return <div ref={el} className={styles.pinMap} role="application" aria-label="Map: tap to place the center of your service area" />;
}
