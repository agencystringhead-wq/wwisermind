'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import PracticeSearch from './PracticeSearch';
import styles from './hero.module.css';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** The hero's "Find your practice" button. It opens the practice search in a dialog: Escape or a click outside closes it, focus is held inside, and focus returns to the button. */
export default function HeroSearch() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      // The search closes its own results on Escape first; a second press closes the dialog.
      const expanded = dialog.current?.querySelector('[aria-expanded="true"]');
      if (expanded) return;
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== 'Tab' || !dialog.current) return;
    const items = Array.from(dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <>
      <button ref={button} type="button" className={styles.findButton} aria-haspopup="dialog" onClick={() => setOpen(true)}>
        Find your practice
        <span aria-hidden="true" className={styles.arrow}>→</span>
      </button>

      {open ? (
        <div className={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div ref={dialog} className={styles.dialog} role="dialog" aria-modal="true" aria-label="Find your practice" onKeyDown={onKeyDown}>
            <div className={styles.dialogHead}>
              <h2 className={styles.dialogTitle}>Find your practice</h2>
              <button type="button" className={styles.dialogClose} onClick={close} aria-label="Close search">
                <span aria-hidden="true">×</span>
              </button>
            </div>
            <PracticeSearch autoFocus inline />
          </div>
        </div>
      ) : null}
    </>
  );
}
