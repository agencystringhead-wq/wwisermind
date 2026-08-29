import styles from './BottomBar.module.css';

/**
 * A band of the announcement bar's colour closing the page, mirroring the one that opens it.
 *
 * Purely visual, and empty by design, so it is hidden from assistive technology twice over:
 * `aria-hidden` takes it out of the accessibility tree and `role="presentation"` drops the
 * semantics the element would otherwise carry.
 */
export default function BottomBar() {
  return <div className={styles.bottomBar} aria-hidden="true" role="presentation" />;
}
