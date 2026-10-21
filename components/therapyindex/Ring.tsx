import type { CSSProperties } from 'react';
import styles from './hub.module.css';

/** A donut that fills as its reveal group arrives (it reads the group's `--t`; with no motion it is simply full). `value` is 0 to 100. */
export default function Ring({ value, tone = 'coral', label }: { value: number; tone?: 'coral' | 'blue' | 'teal' | 'white'; label: string }) {
  const toneClass = { coral: styles.ringCoral, blue: styles.ringBlue, teal: styles.ringTeal, white: styles.ringWhite }[tone];
  return (
    <svg
      className={`${styles.ring} ${toneClass}`}
      viewBox="0 0 48 48"
      role="img"
      aria-label={label}
      style={{ '--v': Math.max(0, Math.min(100, value)) } as CSSProperties}
    >
      <circle className={styles.ringTrack} cx="24" cy="24" r="19" pathLength="100" />
      <circle className={styles.ringFill} cx="24" cy="24" r="19" pathLength="100" />
    </svg>
  );
}

/** A horizontal bar that fills with its reveal group. `value` is 0 to 100. */
export function Bar({ value, tone = 'teal' }: { value: number; tone?: 'coral' | 'blue' | 'teal' | 'white' }) {
  const toneClass = { coral: styles.barCoral, blue: styles.barBlue, teal: styles.barTeal, white: styles.barWhite }[tone];
  return (
    <span className={`${styles.bar} ${toneClass}`} style={{ '--v': Math.max(0, Math.min(100, value)) } as CSSProperties} aria-hidden="true">
      <span className={styles.barFill} />
    </span>
  );
}
