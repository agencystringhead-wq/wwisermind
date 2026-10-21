'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import styles from './market.module.css';
import ti from './ti.module.css';

export type DirectoryRow = {
  slug: string;
  name: string;
  href: string | null;
  location: string;
  rating: number | null;
  reviews: number;
  /** Best Google Maps position across the tracked searches. */
  mapRank: number | null;
  score: number;
  scoreText: string;
  /** Position among the practices that can be ranked; null for chains, medical, nonprofit and few-review practices. */
  rank: number | null;
  labels: { id: 'chain' | 'medical' | 'nonprofit' | 'few' | 'nomap'; text: string }[];
};

type SortKey = 'rank' | 'name' | 'reviews' | 'map' | 'score';

const labelClass: Record<DirectoryRow['labels'][number]['id'], string> = {
  chain: ti.tagChain,
  medical: ti.tagMedical,
  nonprofit: ti.tagNonprofit,
  few: ti.tagFew,
  nomap: ti.tag,
};

/** The full directory. Sorting happens in the browser; the rows arrive already in score order and the table is
    complete in the HTML without JavaScript. */
export default function DirectoryTable({ rows }: { rows: DirectoryRow[] }) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'score', dir: 'desc' });

  const sorted = useMemo(() => {
    const value = (r: DirectoryRow): number | string | null =>
      sort.key === 'rank' ? r.rank : sort.key === 'name' ? r.name.toLowerCase() : sort.key === 'reviews' ? r.reviews : sort.key === 'map' ? r.mapRank : r.score;
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = value(a);
      const bv = value(b);
      if (av === null && bv === null) return 0;
      if (av === null) return 1; // empty values always last
      if (bv === null) return -1;
      const cmp = typeof av === 'string' && typeof bv === 'string' ? av.localeCompare(bv) : Number(av) - Number(bv);
      return sort.dir === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [rows, sort]);

  const header = (key: SortKey, label: string, numeric = false) => (
    <th
      scope="col"
      className={numeric ? ti.num : undefined}
      aria-sort={sort.key === key ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <button
        type="button"
        onClick={() => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'name' || key === 'rank' || key === 'map' ? 'asc' : 'desc' }))}
      >
        {label}
      </button>
    </th>
  );

  return (
    <div>
      <div className={styles.dirScroll} tabIndex={0} aria-label="Full directory, scrolls">
        <table className={`${ti.table} ${styles.dirTable}`}>
          <thead>
            <tr>
              {header('rank', 'Rank', true)}
              {header('name', 'Practice')}
              <th scope="col">Location</th>
              {header('reviews', 'Rating', true)}
              {header('map', 'Best map', true)}
              {header('score', 'Score', true)}
              <th scope="col">Labels</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.slug}>
                <td className={ti.num}>{row.rank ?? '–'}</td>
                <td className={styles.dirName}>{row.href ? <Link href={row.href}>{row.name}</Link> : row.name}</td>
                <td className={styles.dirLoc}>{row.location}</td>
                <td className={ti.num}>{row.rating !== null ? `${row.rating} (${row.reviews})` : '–'}</td>
                <td className={ti.num}>{row.mapRank !== null ? `#${row.mapRank}` : '–'}</td>
                <td className={ti.num}>
                  {row.score < 5 ? <span className={`${styles.score} ${styles.scoreLow}`}>{row.scoreText}</span> : <span className={styles.score}>{row.scoreText}</span>}
                </td>
                <td>
                  <span className={ti.tags}>
                    {row.labels.map((l) => (
                      <span key={l.id} className={`${ti.tag} ${labelClass[l.id]}`}>{l.text}</span>
                    ))}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.dirNote}>
        Rank is shown for practices with ten or more Google reviews that are not national chains, medical clinics or nonprofits. The others keep their real score here.
      </p>
    </div>
  );
}
