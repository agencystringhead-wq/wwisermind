import { announcement } from '@/lib/site';
import styles from './TopBar.module.css';

export default function TopBar() {
  return (
    <div className={styles.topbar}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.text}>
          <span className={styles.label}>{announcement.label} :</span>{' '}
          {announcement.text}{' '}
          <a className={styles.link} href={announcement.href}>
            {announcement.linkLabel}
          </a>
        </p>
      </div>
    </div>
  );
}
