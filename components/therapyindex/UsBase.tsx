import { US_BORDERS, US_OUTLINE } from '@/lib/therapyindex/us-map';
import styles from './markets.module.css';

/** The static part of the hub map: the nation fill and the state borders. A server component, so the path data stays out of the page's JavaScript. */
export default function UsBase() {
  return (
    <g>
      <path className={styles.nation} d={US_OUTLINE} />
      <path className={styles.borders} d={US_BORDERS} />
    </g>
  );
}
