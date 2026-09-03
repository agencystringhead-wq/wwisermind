'use client';

import { useEffect, useId, useState } from 'react';
import { formatterFor } from '@/components/layout/FooterClocks';
import { worldMap, type WorldMapCountry } from '@/lib/world-map';
import styles from './WorldMap.module.css';

export type MapPlace = {
  id: WorldMapCountry;
  name: string;
  role: 'from' | 'client';
  timeZone: string;
};

type Props = {
  places: MapPlace[];
  legend: { from: string; clients: string };
  /** the one-sentence description a screen reader gets for the figure */
  label: string;
};

/**
 * A dotted world map with the four countries picked out, each carrying a live marker that
 * opens a tooltip with the country's name and its local time.
 *
 * Inline SVG from lib/world-map.ts — no mapping library, no tiles, no keys. The markers are
 * HTML buttons laid over the SVG at the same coordinates, so they are real focusable
 * controls with the site's focus ring, and the tooltip is HTML too, so its type is the
 * page's. The marker is the Recent Launches dot, composed, so the pulse is that keyframe
 * and stops where that one stops.
 *
 * Hovering either the marker or the country's own dots opens the tooltip; on touch a tap
 * toggles it and a tap anywhere else closes it. The time ticks only while a tooltip is
 * open, and uses the clock strip's formatter so the two read alike.
 */
export default function WorldMap({ places, legend, label }: Props) {
  const [active, setActive] = useState<WorldMapCountry | null>(null);
  const [now, setNow] = useState<Date | null>(null);
  const tipId = useId();

  /* Tick while a tooltip is up, re-aimed at each whole second like the clock strip. */
  useEffect(() => {
    if (!active) return;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const date = new Date();
      setNow(date);
      timer = setTimeout(tick, 1000 - (date.getTime() % 1000));
    };
    tick();
    return () => clearTimeout(timer);
  }, [active]);

  /* A tap or a click outside the map, or Escape, closes the tooltip — a touch user has no
     mouseleave to do it for them. */
  useEffect(() => {
    if (!active) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!(event.target as Element).closest?.(`[data-map-id="${tipId}"]`)) setActive(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active, tipId]);

  const { width, height, land, countries } = worldMap;
  const current = places.find((place) => place.id === active) ?? null;
  const time = current && now ? formatterFor(current.timeZone).format(now) : null;

  /* Percent positions from the viewBox, so the HTML layer lines up with the SVG at any
     size. A marker near either edge anchors its tooltip to that edge instead of centring
     it, so the tooltip never runs out of the frame. */
  const at = (id: WorldMapCountry) => {
    const [x, y] = countries[id].marker;
    const fx = x / width;
    return {
      left: `${(fx * 100).toFixed(2)}%`,
      top: `${((y / height) * 100).toFixed(2)}%`,
      edge: fx < 0.22 ? styles.tipLeft : fx > 0.78 ? styles.tipRight : '',
    };
  };

  return (
    <figure className={styles.figure} aria-label={label} data-map-id={tipId}>
      <ul className="sr-only">
        {places.map((place) => (
          <li key={place.id}>
            {place.name} — {place.role === 'from' ? legend.from : legend.clients}
          </li>
        ))}
      </ul>

      <div className={styles.stage}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${width} ${height}`}
          aria-hidden="true"
          focusable="false"
        >
          <path d={land} className={styles.land} />
          {places.map((place) => (
            <path
              key={place.id}
              d={countries[place.id].dots}
              className={`${styles.dots} ${place.role === 'from' ? styles.dotsFrom : styles.dotsClient}`}
              data-active={active === place.id || undefined}
            />
          ))}
          {/* The hit layer: the same dots again, invisible, with a stroke wide enough that
              neighbours touch — so the whole country answers the pointer, not just the
              two pixels of each dot. On top of the visible layer, so nothing sits between
              it and the pointer. */}
          {places.map((place) => (
            <path
              key={`${place.id}-hit`}
              d={countries[place.id].dots}
              className={styles.hit}
              onMouseEnter={() => setActive(place.id)}
              onMouseLeave={() => setActive((value) => (value === place.id ? null : value))}
            />
          ))}
        </svg>

        {places.map((place) => {
          const pos = at(place.id);
          const open = active === place.id;

          return (
            <button
              type="button"
              key={place.id}
              className={styles.marker}
              style={{ left: pos.left, top: pos.top }}
              aria-label={place.name}
              aria-expanded={open}
              aria-describedby={open ? `${tipId}-tip` : undefined}
              onMouseEnter={() => setActive(place.id)}
              onMouseLeave={() => setActive((value) => (value === place.id ? null : value))}
              onFocus={() => setActive(place.id)}
              onBlur={() => setActive((value) => (value === place.id ? null : value))}
              onClick={() => setActive((value) => (value === place.id ? null : place.id))}
            >
              <span
                className={`${styles.pin} ${place.role === 'from' ? styles.pinFrom : ''}`}
                aria-hidden="true"
              />
            </button>
          );
        })}

        {current ? (
          <div
            role="tooltip"
            id={`${tipId}-tip`}
            className={`${styles.tip} ${at(current.id).edge}`}
            style={{ left: at(current.id).left, top: at(current.id).top }}
          >
            <span className={styles.tipName}>{current.name}</span>
            {/* The server never renders a tooltip, so the time is always a client value —
                no placeholder is needed to keep hydration deterministic. */}
            <span className={styles.tipTime}>{time ?? '--:--:--'}</span>
          </div>
        ) : null}
      </div>

      <figcaption className={styles.legend}>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchFrom}`} aria-hidden="true" />
          {legend.from}
        </span>
        <span className={styles.legendItem}>
          <span className={`${styles.swatch} ${styles.swatchClient}`} aria-hidden="true" />
          {legend.clients}
        </span>
      </figcaption>
    </figure>
  );
}
