import type { ToolPreviewKind } from '@/lib/tools';
import styles from './ToolPreviews.module.css';

/**
 * The picture on each tool's callout: a small drawing of what the tool gives you, in inline SVG
 * and CSS, so there is no image file to load. They are decoration only: aria-hidden, no real
 * names, and no number that reads as a result (the scorecard's dial shows a made-up sample).
 *
 * Colours are the site's tokens plus the three the Local Map Assessment already uses for its
 * own grid. The hover motion lives in ToolPreviews.module.css and runs from whichever
 * ancestor carries data-tool-card.
 */

const ROWS = [0, 1, 2, 3, 4];

/** The map grid's dots: green near the pin, amber a ring out, red beyond. */
function dotShade(row: number, col: number): string {
  const distance = Math.abs(row - 2) + Math.abs(col - 2);
  if (distance <= 1) return styles.dotGood;
  if (distance === 2) return styles.dotMid;
  return styles.dotLow;
}

function Scorecard() {
  return (
    <svg className={styles.svg} viewBox="40 6 120 144" aria-hidden="true" focusable="false">
      <circle cx="100" cy="50" r="34" className={styles.dialTrack} />
      <circle cx="100" cy="50" r="34" className={styles.dialRing} transform="rotate(-90 100 50)" />
      <text x="100" y="51" className={styles.dialValue}>
        68
      </text>
      {[
        { y: 106, ok: true, w: 66 },
        { y: 122, ok: true, w: 52 },
        { y: 138, ok: false, w: 60 },
      ].map((row) => (
        <g key={row.y}>
          {row.ok ? (
            <>
              <circle cx="58" cy={row.y} r="6" className={styles.tickDisc} />
              <path
                d={`M55 ${row.y} l2.2 2.4 l4-4.6`}
                className={styles.tick}
              />
            </>
          ) : (
            <>
              <circle cx="58" cy={row.y} r="6" className={styles.crossDisc} />
              <path
                d={`M55.6 ${row.y - 2.4} l4.8 4.8 M60.4 ${row.y - 2.4} l-4.8 4.8`}
                className={styles.cross}
              />
            </>
          )}
          <rect x="72" y={row.y - 2.5} width={row.w} height="5" rx="2.5" className={styles.bar} />
        </g>
      ))}
    </svg>
  );
}

function LocalMap() {
  return (
    <svg className={styles.svg} viewBox="0 0 160 140" aria-hidden="true" focusable="false">
      {ROWS.map((row) =>
        ROWS.map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={30 + col * 25}
            cy={20 + row * 25}
            r="8"
            className={dotShade(row, col)}
          />
        )),
      )}
      <g className={styles.pin}>
        <path
          d="M80 56 c-9 0 -14 6.4 -14 13.4 c0 9 14 21.6 14 21.6 s14 -12.600 14 -21.600 c0 -7 -5 -13.400 -14 -13.400z"
          className={styles.pinBody}
        />
        <circle cx="80" cy="69.500" r="4.500" className={styles.pinEye} />
      </g>
    </svg>
  );
}

function Estimate() {
  const items = [
    { y: 40, name: 46, amount: 18 },
    { y: 56, name: 38, amount: 22 },
    { y: 72, name: 50, amount: 16 },
    { y: 88, name: 42, amount: 20 },
  ];
  return (
    <svg className={styles.svg} viewBox="0 0 160 140" aria-hidden="true" focusable="false">
      <g className={styles.sheet}>
        <rect x="30" y="6" width="100" height="128" rx="8" className={styles.paper} />
        <rect x="40" y="16" width="52" height="8" rx="4" className={styles.titleBar} />
        {items.map((item) => (
          <g key={item.y}>
            <rect x="40" y={item.y} width={item.name} height="4" rx="2" className={styles.bar} />
            <rect
              x={120 - item.amount}
              y={item.y}
              width={item.amount}
              height="4"
              rx="2"
              className={styles.bar}
            />
          </g>
        ))}
        <line x1="40" y1="102" x2="120" y2="102" className={styles.rule} />
        <rect x="38" y="108" width="84" height="18" rx="4" className={styles.totalBand} />
        <rect x="44" y="114" width="26" height="6" rx="3" className={styles.ink} />
        <rect x="92" y="113" width="24" height="8" rx="4" className={styles.ink} />
      </g>
    </svg>
  );
}

function Index() {
  const widths = [78, 62, 46, 30];
  return (
    <svg className={styles.svg} viewBox="0 0 200 140" aria-hidden="true" focusable="false">
      {widths.map((width, index) => {
        const y = 14 + index * 30;
        return (
          <g key={width}>
            <rect x="12" y={y - 8} width="176" height="26" rx="8" className={styles.rowCard} />
            <text x="26" y={y + 5} className={styles.rank}>
              {index + 1}
            </text>
            <rect x="40" y={y + 2} width="48" height="6" rx="3" className={styles.bar} />
            <rect x="100" y={y + 1} width="78" height="8" rx="4" className={styles.scoreTrack} />
            <rect x="100" y={y + 1} width={width} height="8" rx="4" className={styles.scoreBar} />
          </g>
        );
      })}
    </svg>
  );
}

function Crisis() {
  return (
    <svg className={styles.svg} viewBox="0 0 160 140" aria-hidden="true" focusable="false">
      <g className={styles.phone}>
        <rect x="48" y="4" width="64" height="132" rx="13" className={styles.phoneBody} />
        <rect x="70" y="10" width="20" height="4" rx="2" className={styles.bar} />
        <rect x="56" y="24" width="48" height="52" rx="7" className={styles.miniCard} />
        <circle cx="94" cy="35" r="3.500" className={styles.dot} />
        <rect x="62" y="32" width="22" height="5" rx="2.500" className={styles.scoreBar} />
        <rect x="62" y="45" width="36" height="4" rx="2" className={styles.bar} />
        <rect x="62" y="54" width="30" height="4" rx="2" className={styles.bar} />
        <rect x="62" y="63" width="34" height="4" rx="2" className={styles.bar} />
        <rect x="56" y="90" width="48" height="22" rx="11" className={styles.helpButton} />
        <text x="80" y="101.500" className={styles.helpText}>
          Help now
        </text>
      </g>
    </svg>
  );
}

const previews: Record<ToolPreviewKind, () => React.JSX.Element> = {
  dial: Scorecard,
  map: LocalMap,
  document: Estimate,
  ranking: Index,
  phone: Crisis,
};

export default function ToolPreview({ kind }: { kind: ToolPreviewKind }) {
  const Preview = previews[kind];
  return <Preview />;
}
