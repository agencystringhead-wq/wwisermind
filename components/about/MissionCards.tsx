'use client';

import { useId, useState } from 'react';
import styles from './AboutMission.module.css';

export type MissionItem = {
  title: string;
  heading: string;
  body: string;
  points: string[];
};

/**
 * Two surfaced disclosure cards, one open at a time. Each card is its own tinted block —
 * not rows on a shared ground — so the column has weight whether a card is open or shut.
 * The panel animates on grid-template-rows, and a closed panel is inert so its text stays
 * out of the tab order.
 */
export default function MissionCards({ items }: { items: MissionItem[] }) {
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <div className={styles.cards}>
      {items.map((item, i) => {
        const isOpen = open === i;
        const panelId = `${baseId}-panel-${i}`;
        return (
          <div
            key={item.title}
            className={`${styles.card} ${isOpen ? styles.cardOpen : ''}`}
          >
            <button
              type="button"
              className={styles.cardHead}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpen(isOpen ? -1 : i)}
            >
              <span className={styles.cardTitle}>{item.title}</span>
              <span className={styles.cardIcon} aria-hidden="true" />
            </button>

            <div id={panelId} role="region" className={styles.panel} inert={!isOpen}>
              <div className={styles.panelInner}>
                <h3 className={styles.panelHeading}>{item.heading}</h3>
                <p className={styles.panelBody}>{item.body}</p>
                <ul className={styles.points}>
                  {item.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
