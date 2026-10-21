'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import CtaLink from '@/components/booking/CtaLink';
import { CATEGORIES } from '@/lib/scorecard/rules';
import type { Report, ReportCheck } from '@/lib/scorecard/types';
import { routes } from '@/lib/routes';
import styles from './Scorecard.module.css';
import { API } from './api';

const MAP_TOOL_URL = process.env.NEXT_PUBLIC_LOCAL_MAP_TOOL_URL || '';

type State = { kind: 'loading' } | { kind: 'missing' } | { kind: 'error' } | { kind: 'ready'; report: Report };

const PLATFORM_NAME: Record<string, string> = { wordpress: 'WordPress', wix: 'Wix', squarespace: 'Squarespace', other: 'another platform' };

function Ring({ score }: { score: number | null }) {
  const r = 78;
  const c = 2 * Math.PI * r;
  const pct = score ?? 0;
  return (
    <div className={styles.ring} role="img" aria-label={score === null ? 'No score' : `Overall score ${score} out of 100`}>
      <svg viewBox="0 0 180 180" aria-hidden="true">
        <circle cx="90" cy="90" r={r} fill="none" stroke="var(--ti-line)" strokeWidth="12" />
        <circle
          cx="90"
          cy="90"
          r={r}
          fill="none"
          stroke="var(--ti-accent)"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(c * pct) / 100} ${c}`}
        />
      </svg>
      <div className={styles.ringNum}>
        <strong>{score ?? '–'}</strong>
        <span>out of 100</span>
      </div>
    </div>
  );
}

function Row({ check }: { check: ReportCheck }) {
  const mark = check.status === 'found' ? '✓' : check.status === 'notFound' ? '!' : '?';
  const cls = check.status === 'found' ? styles.markFound : check.status === 'notFound' ? styles.markNot : styles.markUnknown;
  const word = check.status === 'found' ? 'Looks good' : check.status === 'notFound' ? 'Worth a look' : 'Not checked';
  return (
    <li className={styles.checkRow}>
      <span className={`${styles.mark} ${cls}`} aria-hidden="true">
        {mark}
      </span>
      <div>
        <div>
          <span className={styles.rowLabel}>{check.label}</span> <span className="sr-only">{word}. </span>
        </div>
        <div className={styles.rowMeta}>
          {check.text}
          {check.source === 'you' ? ' (from your answers)' : ''}
        </div>
      </div>
    </li>
  );
}

export default function ScorecardResults() {
  const [state, setState] = useState<State>({ kind: 'loading' });

  useEffect(() => {
    const id = window.location.pathname.split('/').filter(Boolean).pop() ?? '';
    if (!/^[A-Za-z0-9_-]{22}$/.test(id)) {
      setState({ kind: 'missing' });
      return;
    }
    let cancelled = false;
    fetch(`${API}/result/${id}`)
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 404) setState({ kind: 'missing' });
        else if (!res.ok) setState({ kind: 'error' });
        else setState({ kind: 'ready', report: (await res.json()) as Report });
      })
      .catch(() => !cancelled && setState({ kind: 'error' }));
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.kind !== 'ready') {
    const msg =
      state.kind === 'loading'
        ? 'Loading your report…'
        : state.kind === 'missing'
          ? 'We couldn’t find that report. Check that the link is complete, or run the scorecard again.'
          : 'We couldn’t load your report just now. Please refresh the page in a moment.';
    return (
      <section className={styles.section}>
        <div className="container">
          <div className={styles.narrow}>
            <h1 className={styles.h2} aria-live="polite">
              {msg}
            </h1>
            {state.kind === 'missing' ? (
              <Link href={routes.tools.websiteScorecard} className={styles.btn}>
                Start a new scorecard
              </Link>
            ) : null}
          </div>
        </div>
      </section>
    );
  }

  const r = state.report;
  const host = r.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '');

  return (
    <>
      <section className={styles.section}>
        <div className="container">
          <div className={styles.narrow}>
            <p className={styles.eyebrow}>
              website scorecard · {r.practiceName} · {host}
            </p>
            <div className={styles.scoreHead}>
              <Ring score={r.overall} />
              <div>
                <h1 className={styles.h1} style={{ marginBottom: 10 }}>
                  {r.overall === null ? 'Your results' : `You scored ${r.overall} out of 100`}
                </h1>
                {r.tier ? (
                  <>
                    <span className={styles.tier}>{r.tier.name}</span>
                    <p className={styles.lede} style={{ marginBottom: 0 }}>
                      {r.tier.description}
                    </p>
                  </>
                ) : null}
              </div>
            </div>
            {r.scanNote ? (
              <p className={styles.notice} style={{ marginTop: 24, marginBottom: 0 }}>
                {r.scanNote}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.band}`}>
        <div className="container">
          <h2 className={styles.h2}>Your five categories</h2>
          <div className={styles.cats}>
            {r.categories.map((c) => (
              <div key={c.id} className={styles.card}>
                <h3 className={styles.h3}>{c.label}</h3>
                <div className={styles.catScore}>
                  {c.score === null ? <small>Not checked</small> : <>{c.score}<small> / 100</small></>}
                </div>
                <div className={styles.bar} aria-hidden="true">
                  <span className={styles.barFill} style={{ width: `${c.score ?? 0}%` }} />
                </div>
                <p>{c.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.narrow}>
            <h2 className={styles.h2}>{r.fixes.length ? 'Where to start' : 'Nothing urgent to fix'}</h2>
            {r.fixes.length ? (
              <>
                <p className={styles.lede}>These are the gaps that would move your score the most, in order.</p>
                <ol className={styles.fixes}>
                  {r.fixes.map((f, i) => (
                    <li key={f.id} className={`${styles.card} ${styles.fix}`}>
                      <span className={styles.fixNum} aria-hidden="true">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className={styles.h3}>{f.label}</h3>
                        <p className={styles.why}>{f.why}</p>
                        <p>
                          <strong>What to do:</strong> {f.what}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </>
            ) : (
              <p className={styles.lede}>Everything we could check came back in good shape.</p>
            )}

            {r.privacyFlag === 'flag' ? (
              <p className={styles.notice} style={{ marginTop: 24 }}>
                <strong>One more thing to look at.</strong> Your contact form has an open text box, and we couldn’t find a note telling
                people not to share sensitive details in it. Many practices add a short line, such as “Please don’t include private
                health details here.” This is a gentle flag, not a score item.
              </p>
            ) : null}

            {(r.platform && r.platform !== 'other') || r.psychologyTodayUrl ? (
              <p className={styles.small} style={{ marginTop: 20 }}>
                {r.platform && r.platform !== 'other' ? `Your site looks like it’s built on ${PLATFORM_NAME[r.platform]}. ` : ''}
                {r.psychologyTodayUrl ? 'We also found a link to your Psychology Today profile.' : ''}
              </p>
            ) : null}

            {r.hasOffice && MAP_TOOL_URL ? (
              <p className={styles.notice} style={{ marginTop: 24 }}>
                Since you have a physical office, see how you show up on the map for your area with our{' '}
                <a href={MAP_TOOL_URL} className={styles.textLink}>
                  local map tool
                </a>
                .
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.band}`}>
        <div className="container">
          <div className={styles.narrow}>
            <h2 className={styles.h2}>What we checked</h2>
            <p className={styles.lede}>
              When we say we couldn’t find something, that means our scan didn’t see it. It can still be on your site somewhere we didn’t look.
            </p>
            {CATEGORIES.map((cat) => {
              const rows = r.checks.filter((c) => c.category === cat.id);
              if (!rows.length) return null;
              return (
                <div key={cat.id} className={styles.checkGroup}>
                  <h3 className={styles.h3} style={{ marginBottom: 10 }}>
                    {cat.label}
                  </h3>
                  <ul className={styles.checkTable}>
                    {rows.map((c) => (
                      <Row key={c.id} check={c} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className="container">
          <div className={styles.cta}>
            <div>
              <h2>Want to talk it through?</h2>
              <p>Book a free 30 minute call. We’ll go through your results together and sort out what to do first. No pressure.</p>
            </div>
            <CtaLink href={routes.contactBook} className={styles.ctaBtn}>
              Book a free call
            </CtaLink>
          </div>
          <div className={styles.narrow} style={{ marginTop: 28 }}>
            <p className={styles.small}>
              This page is private. Anyone with the link can see it, so share it only with people you trust. Scores come from automatic checks
              and your own answers. They’re a starting point, not a verdict, and they don’t measure the quality of your care. We’re also emailing you a
              summary. If it doesn’t arrive, check your spam folder.{' '}
              <Link href={routes.tools.websiteScorecard} className={styles.textLink}>
                Run it again
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
