import type { ReactNode } from 'react';
import styles from './lma.module.css';

/** A browser window drawn in code: three dots, an address bar, and whatever the page puts inside. */
export default function BrowserFrame({ url, children, className }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={`${styles.frame} ${className ?? ''}`}>
      <div className={styles.frameBar} aria-hidden="true">
        <span className={styles.frameDots}>
          <i />
          <i />
          <i />
        </span>
        <span className={styles.frameUrl}>{url}</span>
      </div>
      <div className={styles.frameBody}>{children}</div>
    </div>
  );
}
