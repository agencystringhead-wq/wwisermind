'use client';

import { useMemo, useState } from 'react';
import CtaLink from '@/components/booking/CtaLink';
import { routes } from '@/lib/routes';
import {
  GRID,
  HERO_TERM,
  actionPlan,
  gapRows,
  leaderboard,
  practices,
  rankGrid,
  searchTerms,
  whyBullets,
  type SearchTerm,
} from '@/lib/local-map-assessment';
import VisibilityMap, { zoneName } from './VisibilityMap';
import styles from './lma.module.css';

/**
 * The report, built in HTML: pick one of the four search terms and the map, the leaderboard and the readout change together;
 * tap a dot to see which practices sit above you in that part of town. Everything is the made-up sample from lib/local-map-assessment.
 */
export default function ReportPreview() {
  const [term, setTerm] = useState<SearchTerm>(HERO_TERM);
  const [cell, setCell] = useState(GRID * 2 + 1);

  const grid = useMemo(() => rankGrid(term), [term]);
  const board = useMemo(() => leaderboard(term), [term]);

  const youRank = grid.you[cell];
  const ahead = practices
    .filter((p) => p.id !== 'you')
    .map((p) => ({ name: p.name, rank: grid[p.id][cell] }))
    .filter((p): p is { name: string; rank: number } => p.rank !== null && (youRank === null || p.rank < youRank))
    .sort((a, b) => a.rank - b.rank);

  return (
    <div className={styles.preview}>
      <div className={styles.previewBar}>
        <p className={styles.previewTitle}>Local Map Assessment · sample report</p>
        <div className={styles.chips} role="group" aria-label="Search term">
          {searchTerms.map((t) => (
            <button key={t} type="button" className={`${styles.chip} ${t === term ? styles.chipOn : ''}`} aria-pressed={t === term} onClick={() => setTerm(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.previewTop}>
        <section className={styles.pane} aria-labelledby="pv-map">
          <h3 id="pv-map" className={styles.paneTitle}><span>A</span> Visibility map</h3>
          <VisibilityMap ranks={grid.you} selected={cell} onSelect={setCell} label={`Visibility map for ${term}. Choose a zone to see who ranks above you there.`} />
          <ul className={styles.legend} aria-hidden="true">
            <li><i className={styles.tone_good} />Top 3</li>
            <li><i className={styles.tone_mid} />4 to 10</li>
            <li><i className={styles.tone_low} />11 to 20</li>
            <li><i className={styles.tone_none} />Not found</li>
          </ul>
          <p className={styles.readout} aria-live="polite">
            <b>Zone {zoneName(cell)}:</b>{' '}
            {youRank === null ? 'you are not in the first 20 here.' : `you rank #${youRank} here.`}{' '}
            {ahead.length ? `Ahead of you: ${ahead.slice(0, 3).map((p) => `${p.name} (#${p.rank})`).join(', ')}.` : 'No one in this sample is ahead of you here.'}
          </p>
        </section>

        <section className={styles.pane} aria-labelledby="pv-board">
          <h3 id="pv-board" className={styles.paneTitle}><span>B</span> Practices outranking you</h3>
          <ol className={styles.board}>
            {board.map((row, i) => (
              <li key={row.id} className={`${styles.boardRow} ${row.id === 'you' ? styles.boardYou : ''}`}>
                <span className={styles.boardPos}>{i + 1}</span>
                <div className={styles.boardName}>
                  <p>{row.id === 'you' ? 'You' : row.name}</p>
                  <small>Top 3 in {row.top3} of 25 zones</small>
                  <span className={styles.bar}><i style={{ width: `${row.score}%` }} /></span>
                </div>
                <span className={styles.boardScore}>{row.score}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <section className={styles.paneWide} aria-labelledby="pv-gap">
        <h3 id="pv-gap" className={styles.paneTitle}><span>C</span> Where the gaps are</h3>
        <div className={styles.tableScroll} tabIndex={0} role="region" aria-label="Gap table, scrolls sideways on small screens">
          <table className={styles.gap}>
            <thead>
              <tr>
                <th scope="col">Measure</th>
                <th scope="col">You</th>
                <th scope="col">Top competitors</th>
                <th scope="col">Gap</th>
              </tr>
            </thead>
            <tbody>
              {gapRows.map((r) => (
                <tr key={r.metric}>
                  <th scope="row">
                    {r.metric}
                    <small>{r.note}</small>
                  </th>
                  <td>{r.you}</td>
                  <td>{r.top}</td>
                  <td className={styles.gapVal}>{r.gap}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className={styles.previewBottom}>
        <section className={styles.pane} aria-labelledby="pv-why">
          <h3 id="pv-why" className={styles.paneTitle}><span>D</span> Why other practices are getting found first</h3>
          <ul className={styles.whyList}>
            {whyBullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </section>

        <section className={styles.pane} aria-labelledby="pv-plan">
          <h3 id="pv-plan" className={styles.paneTitle}><span>E</span> Your action plan</h3>
          <ol className={styles.planList}>
            {actionPlan.map((a, i) => (
              <li key={a}>
                <b>{i + 1}</b>
                <span>{a}</span>
              </li>
            ))}
          </ol>
          <div className={styles.help}>
            <p>Want help with this?</p>
            <CtaLink href={routes.contactBook} className={styles.helpLink}>
              Book a free call
            </CtaLink>
          </div>
        </section>
      </div>
    </div>
  );
}
