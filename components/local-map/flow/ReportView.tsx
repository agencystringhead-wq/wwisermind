'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import CtaLink from '@/components/booking/CtaLink';
import { LMA_PATH, toneOf } from '@/lib/local-map-assessment';
import { routes } from '@/lib/routes';
import type { Progress, Report, StatusResponse } from '@/lib/local-map/types';
import lma from '../lma.module.css';
import { ApiError, call, fetchStatus } from './api';
import styles from './flow.module.css';

const ResultsMap = dynamic(() => import('./ResultsMap'), { ssr: false, loading: () => <div className={styles.resultsMap} /> });

const POLL_MS = 3000;

const longDate = (ms: number) => new Date(ms).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

/* ------------------------------------------------------------------------------------------------ */

function ProgressScreen({ progress, name }: { progress: Progress; name?: string }) {
  const share = progress.checksTotal ? Math.round((progress.checksDone / progress.checksTotal) * 100) : 0;
  return (
    <div className={styles.card} role="status" aria-live="polite">
      <span className={styles.spinner} aria-hidden="true" />
      <h1 className={styles.title}>Checking 25 neighbourhoods…</h1>
      <p className={styles.lede}>
        {name ? `${name}: ` : ''}
        {progress.pointsDone} of {progress.pointsTotal} points checked
      </p>
      <div className={styles.bar} aria-hidden="true">
        <i style={{ width: `${share}%` }} />
      </div>
      <p className={styles.hint}>This usually takes two to four minutes. You can leave this page open, or close it: we are emailing you a link to your report.</p>
    </div>
  );
}

function Score({ value }: { value: number }) {
  return (
    <div className={styles.bigScore} aria-label={`Visibility score ${value} out of 100`}>
      <b>{value}</b>
      <span>/ 100</span>
    </div>
  );
}

function ReportBody({ report }: { report: Report }) {
  const [k, setK] = useState(0);
  const [point, setPoint] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const result = report.keywords[k];
  const rank = point === null ? null : result.ranks[point];

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copy this link', window.location.href);
    }
  }, []);

  const youRow = result.board.find((b) => b.you);

  return (
    <div className={styles.report}>
      <header className={styles.head}>
        <div>
          <p className={styles.kicker}>Local Map Assessment · {longDate(report.createdAt)}</p>
          <h1 className={styles.reportTitle}>{report.practice.name}</h1>
          {report.practice.address ? <p className={styles.address}>{report.practice.address}</p> : null}
          <p className={styles.address}>Checked within {report.radiusMiles} {report.radiusMiles === 1 ? 'mile' : 'miles'} · 25 points · {report.keywords.length} search terms</p>
        </div>
        <div className={styles.headRight}>
          <Score value={report.overall} />
          <button type="button" className={styles.copy} onClick={copy}>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
      </header>

      {report.partial ? (
        <p className={styles.notice}>
          {report.missingChecks} of {report.keywords.length * 25} checks did not finish, so those points show a “?” and are left out of the scores.
        </p>
      ) : null}

      <div className={lma.preview}>
        <div className={lma.previewBar}>
          <div className={lma.chips} role="group" aria-label="Search term">
            {report.keywords.map((kw, i) => (
              <button
                key={kw.keyword}
                type="button"
                className={`${lma.chip} ${i === k ? lma.chipOn : ''}`}
                aria-pressed={i === k}
                onClick={() => {
                  setK(i);
                  setPoint(null);
                }}
              >
                {kw.keyword}
              </button>
            ))}
          </div>
        </div>

        <div className={lma.previewTop}>
          <section className={lma.pane} aria-labelledby="rv-map">
            <h2 id="rv-map" className={lma.paneTitle}><span>A</span> Visibility map</h2>
            <ResultsMap report={report} keyword={k} selected={point} onSelect={setPoint} />
            <ul className={lma.legend} aria-hidden="true">
              <li><i className={lma.tone_good} />Top 3</li>
              <li><i className={lma.tone_mid} />4 to 10</li>
              <li><i className={lma.tone_low} />11 to 20</li>
              <li><i className={lma.tone_none} />Not found</li>
            </ul>
            <div className={lma.readout} aria-live="polite">
              {point === null ? (
                <p>Choose a circle to see who ranks in the top three at that point.</p>
              ) : (
                <>
                  <p>
                    <b>Point {point + 1}:</b> {result.missing[point] ? 'this check did not finish.' : rank === null ? 'you are not in the first 20 here.' : `you rank #${rank} here.`}
                  </p>
                  {result.top3[point].length ? (
                    <ol className={styles.top3}>
                      {result.top3[point].map((n, i) => (
                        <li key={`${n}-${i}`}>
                          <span className={`${styles.top3Dot} ${lma[`tone_${toneOf(i + 1)}`]}`}>{i + 1}</span>
                          {n}
                        </li>
                      ))}
                    </ol>
                  ) : null}
                </>
              )}
            </div>
          </section>

          <section className={lma.pane} aria-labelledby="rv-board">
            <h2 id="rv-board" className={lma.paneTitle}><span>B</span> Practices outranking you</h2>
            <p className={styles.paneNote}>For “{result.keyword}”. Your score for it is {youRow?.score ?? 0} out of 100.</p>
            <ol className={lma.board}>
              {result.board.map((row, i) => (
                <li key={row.key} className={`${lma.boardRow} ${row.you ? lma.boardYou : ''}`}>
                  <span className={lma.boardPos}>{i + 1}</span>
                  <div className={lma.boardName}>
                    <p>{row.you ? 'You' : row.name}</p>
                    <small>Top 3 in {row.top3Zones} of 25 zones</small>
                    <span className={lma.bar}><i style={{ width: `${row.score}%` }} /></span>
                  </div>
                  <span className={lma.boardScore}>{row.score}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <section className={lma.paneWide} aria-labelledby="rv-gap">
          <h2 id="rv-gap" className={lma.paneTitle}><span>C</span> Where the gaps are</h2>
          <div className={lma.tableScroll} tabIndex={0} role="region" aria-label="Gap table, scrolls sideways on small screens">
            <table className={lma.gap}>
              <thead>
                <tr>
                  <th scope="col">Measure</th>
                  <th scope="col">You</th>
                  <th scope="col">Top competitors avg</th>
                  <th scope="col">Gap</th>
                </tr>
              </thead>
              <tbody>
                {report.gaps.map((g) => (
                  <tr key={g.id}>
                    <th scope="row">
                      {g.label}
                      <small>{g.note}</small>
                    </th>
                    <td>{g.you}</td>
                    <td>{g.top}</td>
                    <td className={g.behind ? lma.gapVal : styles.gapOk}>{g.gap}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className={lma.previewBottom}>
          <section className={lma.pane} aria-labelledby="rv-why">
            <h2 id="rv-why" className={lma.paneTitle}><span>D</span> Why other practices are getting found first</h2>
            <ul className={lma.whyList}>
              {report.why.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </section>

          <section className={lma.pane} aria-labelledby="rv-plan">
            <h2 id="rv-plan" className={lma.paneTitle}><span>E</span> Your action plan</h2>
            <ol className={styles.fixes}>
              {report.fixes.map((f, i) => (
                <li key={f.id}>
                  <b>{i + 1}</b>
                  <div>
                    <p>{f.title}</p>
                    <small>{f.body}</small>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <section className={styles.cta} aria-labelledby="rv-cta">
        <div>
          <h2 id="rv-cta">Want help acting on this?</h2>
          <p>Book a free 30 minute call. We will go through your report together and tell you honestly what is worth doing first. No pressure either way.</p>
        </div>
        <div className={styles.ctaButtons}>
          <CtaLink href={routes.contactBook} className={styles.ctaPrimary}>
            Book a free call
          </CtaLink>
          <button type="button" className={styles.ctaGhost} onClick={copy}>
            {copied ? 'Link copied' : 'Copy link to this report'}
          </button>
        </div>
      </section>

      <p className={styles.fine}>
        We read only public Google information. Google results vary from person to person and over time, so treat this as a guide rather than a guarantee.{' '}
        <Link href={LMA_PATH}>Run another report</Link>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------ */

export default function ReportView() {
  const id = useSearchParams().get('id') ?? '';
  const [data, setData] = useState<StatusResponse | null>(null);
  const [problem, setProblem] = useState('');
  const [missing, setMissing] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const live = useRef(true);

  const poll = useCallback(async () => {
    if (!id) return;
    try {
      const next = await fetchStatus(id);
      if (!live.current) return;
      setData(next);
      setProblem('');
      if (next.status === 'scanning') timer.current = setTimeout(poll, POLL_MS);
    } catch (e) {
      if (!live.current) return;
      if (e instanceof ApiError && e.status === 404) {
        setMissing(true);
        return;
      }
      setProblem(e instanceof ApiError ? e.message : 'We lost the connection. Retrying…');
      timer.current = setTimeout(poll, POLL_MS * 2);
    }
  }, [id]);

  useEffect(() => {
    live.current = true;
    poll();
    return () => {
      live.current = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [poll]);

  const retry = async () => {
    setProblem('');
    try {
      await call('retry', { body: { id } });
      setData(null);
      poll();
    } catch (e) {
      setProblem(e instanceof ApiError ? e.message : 'Please try again in a moment.');
    }
  };

  if (!id || missing) {
    return (
      <section className={styles.flow}>
        <div className={`container ${styles.flowInner}`}>
          <div className={styles.card}>
            <h1 className={styles.title}>We could not find that report</h1>
            <p className={styles.lede}>The link may be incomplete. You can run a new report in about four minutes.</p>
            <Link href={LMA_PATH} className={styles.primary}>Run a new report</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.flow}>
      <div className={`container ${data?.status === 'done' ? styles.reportInner : styles.flowInner}`}>
        {!data ? (
          <div className={styles.card} role="status">
            <span className={styles.spinner} aria-hidden="true" />
            <h1 className={styles.title}>Loading your report…</h1>
          </div>
        ) : data.status === 'scanning' ? (
          <>
            <ProgressScreen progress={data.progress} />
            {problem ? <p className={styles.notice} role="status">{problem}</p> : null}
          </>
        ) : data.status === 'failed' ? (
          <div className={styles.card}>
            <h1 className={styles.title}>We could not finish this scan</h1>
            <p className={styles.lede}>{data.message}</p>
            {problem ? <p className={styles.error} role="alert">{problem}</p> : null}
            <div className={styles.actions}>
              {data.canRetry ? (
                <button type="button" className={styles.primary} onClick={retry}>
                  Try again
                </button>
              ) : null}
              <CtaLink href={routes.contactBook} className={styles.secondary}>
                Book a free call
              </CtaLink>
            </div>
          </div>
        ) : data.report ? (
          <ReportBody report={data.report} />
        ) : null}
      </div>
    </section>
  );
}
