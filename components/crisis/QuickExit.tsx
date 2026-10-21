'use client';

import { useEffect } from 'react';
import styles from './CrisisResources.module.css';

/* Where the quick exit goes: an ordinary search for the weather, so the next screen looks like
   nothing. `replace` swaps this page out of the history, so the back button does not return here. */
const EXIT_URL = 'https://www.google.com/search?q=weather';

const leave = () => window.location.replace(EXIT_URL);

/** True while a header menu is open: the desktop mega menu's trigger, or the mobile drawer's burger. */
const menuIsOpen = () =>
  document.body.dataset.drawerOpen === 'true' ||
  document.querySelector(
    '[aria-controls^="mega-"][aria-expanded="true"], [aria-controls="mobile-menu"][aria-expanded="true"]',
  ) !== null;

/**
 * The quick exit for the crisis resources pages: a button fixed at the bottom right that is always
 * on screen, and the Esc key, both of which leave this site at once. It is used on the directory and
 * the state pages, never on the help now widget page, which is for therapists.
 *
 * Esc listens on the window in the capture phase, ahead of the header's own handler, and stands down
 * if a header menu is open: that press belongs to the menu, which closes it, and the next one leaves.
 * Nothing here is tracked: no analytics, no request, no storage. It is a real button, so the keyboard
 * reaches it with Tab and Enter or Space; the accessible name contains the visible words.
 */
export default function QuickExit() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.isComposing) return;
      if (menuIsOpen()) return;
      leave();
    };

    window.addEventListener('keydown', onKeyDown, true);
    return () => window.removeEventListener('keydown', onKeyDown, true);
  }, []);

  return (
    <button type="button" className={styles.quickExit} aria-label="Leave this site quickly" onClick={leave}>
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
        <path
          d="M6 6l12 12M18 6 6 18"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      Leave this site
    </button>
  );
}
