import { GRID, toneOf, type Rank } from '@/lib/local-map-assessment';
import styles from './lma.module.css';

const COLS = 'ABCDE';

export const zoneName = (cell: number) => `${COLS[cell % GRID]}${Math.floor(cell / GRID) + 1}`;

/** A light, map-like ground: blocks, a park, a river and a few streets. Drawn in code so it stays sharp at any size. */
function MapGround() {
  return (
    <svg className={styles.mapGround} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      <rect width="100" height="100" fill="#eef1ec" />
      <path d="M0 78 C22 70 34 86 54 74 S86 60 100 66 L100 76 C86 70 70 84 54 86 S22 80 0 90 Z" fill="#cfe3f3" />
      <rect x="62" y="8" width="26" height="22" rx="3" fill="#d9e9cf" />
      <rect x="6" y="38" width="16" height="14" rx="3" fill="#d9e9cf" />
      <g stroke="#ffffff" strokeWidth="2.2" fill="none" strokeLinecap="round">
        <path d="M0 22 H100" />
        <path d="M0 58 H100" />
        <path d="M30 0 V100" />
        <path d="M70 0 V100" />
        <path d="M0 40 L100 28" strokeWidth="1.4" />
        <path d="M50 0 L56 100" strokeWidth="1.4" />
        <path d="M0 8 H60 M40 90 H100" strokeWidth="1" />
      </g>
    </svg>
  );
}

/**
 * The 5 x 5 visibility grid: a dot for each point we check, coloured by rank (green top 3, amber 4 to 10, red 11 to 20, grey not
 * found). With `onSelect` each dot is a button; without it the map is a picture and says what it shows in one label.
 */
export default function VisibilityMap({
  ranks,
  selected,
  onSelect,
  label,
}: {
  ranks: Rank[];
  selected?: number;
  onSelect?: (cell: number) => void;
  label: string;
}) {
  return (
    <div className={styles.vmap} role={onSelect ? 'group' : 'img'} aria-label={label}>
      <MapGround />
      <div className={styles.vgrid}>
        {ranks.map((rank, i) => {
          const dot = <span className={`${styles.vdot} ${styles[`tone_${toneOf(rank)}`]}`}>{rank === null ? '' : rank}</span>;
          return onSelect ? (
            <button
              key={i}
              type="button"
              className={`${styles.vcell} ${selected === i ? styles.vcellOn : ''}`}
              aria-label={`Zone ${zoneName(i)}: ${rank === null ? 'not in the first 20' : `rank ${rank}`}`}
              aria-pressed={selected === i}
              onClick={() => onSelect(i)}
            >
              {dot}
            </button>
          ) : (
            <span key={i} className={styles.vcell} aria-hidden="true">
              {dot}
            </span>
          );
        })}
      </div>
    </div>
  );
}
