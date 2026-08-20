'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import type { NavItem } from '@/lib/site';
import styles from './Footer.module.css';

type Tab = {
  id: string;
  label: string;
  items: NavItem[];
};

/** Pixels per second the ticker travels. Slow enough to read a passing item, per the
    reference at unitedcarriers.com, whose footer ticker drifts rather than races. */
const SPEED = 55;

/** Fallback while the track has not been measured — also what a no-JS render would use. */
const FALLBACK_DURATION = 40;

function ItemList({ items, clone }: { items: NavItem[]; clone?: boolean }) {
  return (
    <ul className={styles.tabItems} aria-hidden={clone || undefined}>
      {items.map((item) => (
        <li className={styles.tabItem} key={item.label}>
          <Link href={item.href} className={styles.tabLink} tabIndex={clone ? -1 : undefined}>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * The Services / AI Tools row. The two labels are a real tab list — one list of links is in
 * the document at a time, not both stacked — so the pill switches content rather than
 * decorating it.
 *
 * The list itself is a marquee, as on the reference site: the track holds the items twice and
 * slides left by exactly half its width, so the second copy is under the cursor at the moment
 * the first runs out and the loop has no seam. Only `transform` animates, so the scroll never
 * leaves the compositor.
 *
 * The duration is measured rather than fixed. A fixed one would run the four-item AI Tools
 * list at less than half the speed of the nine-item Services list; deriving it from the track
 * width instead keeps both moving at the same px/s whatever is in them.
 *
 * Arrow keys move between the tabs the way a tab list is expected to, and only the selected
 * tab is in the tab order, so a keyboard user lands on the pill once and steps into the links
 * with a single Tab press.
 */
export default function FooterTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(0);
  const [duration, setDuration] = useState(FALLBACK_DURATION);
  const trackRef = useRef<HTMLDivElement>(null);
  const baseId = useId();
  const panelId = `${baseId}-panel`;

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let live = true;

    /* Half the track is one copy of the list, which is exactly how far the animation travels. */
    const measure = () => {
      if (!live) return;
      const distance = track.scrollWidth / 2;
      if (distance > 0) setDuration(distance / SPEED);
    };

    measure();

    /* The first measurement lands before the webfont does, so it reads the fallback's widths
       — around 25% narrow here, which would run the ticker that much fast for the rest of the
       session. `fonts.ready` is the one signal that reliably fires for that swap; the observer
       below rides on the rendering steps, which a backgrounded or non-compositing page does
       not run. Both are cheap, and between them the resize that matters is never missed. */
    document.fonts?.ready.then(measure).catch(() => {});

    const observer = new ResizeObserver(measure);
    observer.observe(track);

    return () => {
      live = false;
      observer.disconnect();
    };
  }, [active]);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0;
    if (!step) return;

    event.preventDefault();
    const next = (active + step + tabs.length) % tabs.length;
    setActive(next);
    event.currentTarget.querySelectorAll('button')[next]?.focus();
  };

  return (
    <div className={styles.tabs}>
      <div
        className={styles.tabList}
        role="tablist"
        aria-label="Footer services"
        onKeyDown={onKeyDown}
      >
        {tabs.map((tab, index) => (
          <button
            type="button"
            key={tab.id}
            id={`${baseId}-tab-${tab.id}`}
            role="tab"
            aria-selected={index === active}
            aria-controls={panelId}
            tabIndex={index === active ? 0 : -1}
            className={styles.tab}
            onClick={() => setActive(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* keyed on the tab so React swaps the marquee outright and the fade replays */}
      <div
        className={styles.marquee}
        id={panelId}
        role="tabpanel"
        aria-labelledby={`${baseId}-tab-${tabs[active].id}`}
        key={tabs[active].id}
      >
        <div
          className={styles.marqueeTrack}
          ref={trackRef}
          style={{ animationDuration: `${duration}s` }}
        >
          <ItemList items={tabs[active].items} />
          <ItemList items={tabs[active].items} clone />
        </div>
      </div>
    </div>
  );
}
