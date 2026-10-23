import { HERO_TERM, leaderboard, rankGrid } from '@/lib/local-map-assessment';
import BrowserFrame from './BrowserFrame';
import VisibilityMap from './VisibilityMap';
import styles from './lma.module.css';

/** The hero's picture of a finished report: the map, the score and the top of the leaderboard. Built from the same sample as the preview. */
export default function SampleReport() {
  const ranks = rankGrid(HERO_TERM).you;
  const board = leaderboard(HERO_TERM);
  const place = board.findIndex((r) => r.id === 'you') + 1;
  const you = board[place - 1];
  return (
    <figure className={styles.sample}>
      <BrowserFrame url="wwisermind.com/free-tools/local-map-assessment/sample-report">
        <div className={styles.sampleBody}>
          <div className={styles.sampleHead}>
            <div>
              <p className={styles.sampleKicker}>Sample report</p>
              <p className={styles.sampleTitle}>&ldquo;{HERO_TERM}&rdquo;</p>
            </div>
            <div className={styles.score} aria-label={`Visibility score ${you.score} out of 100`}>
              <b>{you.score}</b>
              <span>/ 100</span>
            </div>
          </div>
          <VisibilityMap ranks={ranks} label={`Sample visibility map for ${HERO_TERM}: 25 points, colored by rank`} />
          <ul className={styles.legend} aria-hidden="true">
            <li><i className={styles.tone_good} />Top 3</li>
            <li><i className={styles.tone_mid} />4 to 10</li>
            <li><i className={styles.tone_low} />11 to 20</li>
            <li><i className={styles.tone_none} />Not found</li>
          </ul>
          <p className={styles.sampleFoot}>
            Top 3 in <b>{you.top3} of 25</b> zones. #{place} of 5 nearby practices.
          </p>
        </div>
      </BrowserFrame>
      <figcaption className={styles.caption}>Sample report · 25 points across your area · 4 search terms</figcaption>
    </figure>
  );
}
