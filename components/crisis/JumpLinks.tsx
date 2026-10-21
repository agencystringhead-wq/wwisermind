'use client';

import type { MouseEvent } from 'react';
import styles from './CrisisResources.module.css';

/**
 * The row of pill links under the intro, one for each section the page draws.
 *
 * A plain `#id` link adds a history entry, and then the quick exit's `location.replace` would swap
 * out only the newest one: the back button would land on this page again. So a click scrolls to the
 * section itself and rewrites the address in place (`replaceState`), leaving the history as it was.
 * It scrolls smoothly only for a visitor who has not asked for reduced motion, and moves focus to the
 * section so a keyboard or screen reader user lands there too. The links still work as ordinary
 * anchors without script.
 */
export default function JumpLinks({ items }: { items: { id: string; label: string }[] }) {
  const jump = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    window.history.replaceState(null, '', `#${id}`);

    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  };

  return (
    <nav className={styles.jump} aria-label="Jump to a section">
      <ul className={styles.jumpList}>
        {items.map((item) => (
          <li key={item.id}>
            <a className={styles.jumpLink} href={`#${item.id}`} onClick={(event) => jump(event, item.id)}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
