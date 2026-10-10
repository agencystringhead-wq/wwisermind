import { SHOW_CONFIRM_MARKERS } from '@/lib/process';
import styles from './Process.module.css';

/**
 * A draft marker. Drawn beside any copy the repo does not back, while the page is a draft
 * (`SHOW_CONFIRM_MARKERS` in lib/process.ts). The question it carries is the tooltip and the
 * screen-reader text; set the flag false and every chip disappears with no markup left.
 */
export default function ConfirmChip({ question }: { question?: string }) {
  if (!SHOW_CONFIRM_MARKERS || !question) return null;

  return (
    <span className={styles.chip} title={question}>
      Confirm
      <span className="sr-only">: {question}</span>
    </span>
  );
}
