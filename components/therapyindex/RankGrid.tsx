'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './market.module.css';

export type RankRow = {
  slug: string;
  name: string;
  href: string | null;
  score: number;
  map: Record<string, number>;
  organic: Record<string, number>;
};

const band = (rank: number | undefined) => {
  if (rank === undefined) return styles.b0;
  if (rank === 1) return styles.b1;
  if (rank <= 3) return styles.b2;
  if (rank <= 6) return styles.b3;
  if (rank <= 10) return styles.b4;
  if (rank <= 20) return styles.b5;
  return styles.b0;
};

const short = (keyword: string) => keyword.replace(/ therapist$/, '').replace(/ counseling$/, '').replace(/ counselor$/, '') || keyword;

/** Practices by searches. A toggle switches between each practice's Google Maps position and its Google search
    (organic) position. A dash means the practice did not show for that search. */
export default function RankGrid({ rows, keywords, notTested }: { rows: RankRow[]; keywords: string[]; notTested: string[] }) {
  const [view, setView] = useState<'map' | 'organic'>('map');

  return (
    <div>
      <div className={styles.toggle} role="group" aria-label="Which ranking to show">
        <button type="button" className={styles.toggleBtn} aria-pressed={view === 'map'} onClick={() => setView('map')}>
          Map pack
        </button>
        <button type="button" className={styles.toggleBtn} aria-pressed={view === 'organic'} onClick={() => setView('organic')}>
          Organic
        </button>
      </div>

      <div className={styles.gridWrap} tabIndex={0} aria-label="Ranking grid, scrolls sideways">
        <table className={styles.rankTable}>
          <thead>
            <tr>
              <th scope="col" className={styles.stickyName} style={{ textAlign: 'left' }}>
                Practice
              </th>
              {keywords.map((k) => (
                <th key={k} scope="col" title={k}>
                  {short(k)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.slug}>
                <th scope="row" className={styles.stickyName}>
                  {row.href ? <Link href={row.href}>{row.name}</Link> : row.name}
                </th>
                {keywords.map((k) => {
                  const rank = (view === 'map' ? row.map : row.organic)[k];
                  const untested = view === 'organic' && notTested.includes(k);
                  return (
                    <td key={k} className={`${styles.cellRank} ${untested ? styles.b0 : band(rank)}`}>
                      {untested ? 'n/t' : rank === undefined ? '–' : `#${rank}`}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.bands}>
        <span><i className={styles.b1} /> #1</span>
        <span><i className={styles.b2} /> 2 to 3</span>
        <span><i className={styles.b3} /> 4 to 6</span>
        <span><i className={styles.b4} /> 7 to 10</span>
        <span><i className={styles.b5} /> 11 to 20</span>
        <span>
          – not shown{notTested.length > 0 && view === 'organic' ? ' · n/t not tested' : ''}
        </span>
      </p>
    </div>
  );
}
