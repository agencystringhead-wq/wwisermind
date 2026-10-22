'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { questionsFor } from '@/lib/scorecard/score';
import type { StepEvent, StepId } from '@/lib/scorecard/scan';
import type { Answers, ScanResult } from '@/lib/scorecard/types';
import { routes } from '@/lib/routes';
import styles from './Scorecard.module.css';
import { API, REPORT_BASE } from './api';

type Phase = 'intro' | 'scanning' | 'scanNote' | 'quiz' | 'gate' | 'sending';

const STEP_LABELS: Partial<Record<StepId, string>> = {
  homepage: 'Reading your homepage',
  pages: 'Looking at your about, fees and contact pages',
  files: 'Checking your sitemap and robots.txt',
};
const STEP_ORDER: StepId[] = ['homepage', 'pages', 'files'];

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '';
/* Cloudflare's published always-pass test key, used only on localhost. */
const TEST_SITE_KEY = '1x00000000000000000000AA';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string;
      reset: (id?: string) => void;
      remove: (id?: string) => void;
    };
  }
}

const INSIDE = [
  'An overall score out of 100',
  'Five category scores: speed and mobile, getting found, booking path, trust and clarity, and growth habits',
  'Your top five fixes, ranked, each with why it matters and what to do',
  'A list of everything we checked, so you can see how we got there',
];

export default function ScorecardApp() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [steps, setSteps] = useState<Partial<Record<StepId, 'start' | 'done'>>>({});
  const [scan, setScan] = useState<ScanResult | null>(null);
  const [scanId, setScanId] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState('');
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [formError, setFormError] = useState('');
  const [token, setToken] = useState('');
  const speedRef = useRef<Promise<unknown> | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  const questions = useMemo(() => questionsFor(scan), [scan]);
  const question = questions[index];

  /* Move focus to the new heading when the screen changes, so screen readers and keyboard users follow. */
  useEffect(() => {
    if (phase !== 'intro') headingRef.current?.focus();
  }, [phase, index]);

  async function startScan(event: FormEvent) {
    event.preventDefault();
    setUrlError('');
    if (!url.trim()) {
      setUrlError('Please enter your website address.');
      return;
    }
    setSteps({});
    setPhase('scanning');
    try {
      const res = await fetch(`${API}/scan`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      if (res.status === 400) {
        const data = (await res.json()) as { message?: string };
        setUrlError(data.message || 'That web address does not look right.');
        setPhase('intro');
        return;
      }
      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as { message?: string };
        finishScan(null, null, data.message || 'We couldn’t run the scan just now.');
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let done = false;
      while (!done) {
        const chunk = await reader.read();
        done = chunk.done;
        buffer += decoder.decode(chunk.value ?? new Uint8Array(), { stream: !done });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.trim()) continue;
          const msg = JSON.parse(line) as Partial<StepEvent> & { result?: ScanResult; scanId?: string | null; error?: string; message?: string };
          if (msg.step && msg.state) setSteps((s) => ({ ...s, [msg.step as StepId]: msg.state }));
          else if (msg.result) return finishScan(msg.result, msg.scanId ?? null, '');
          else if (msg.error) return finishScan(null, null, msg.message || 'We couldn’t finish the scan.');
        }
      }
      finishScan(null, null, 'We couldn’t finish the scan.');
    } catch {
      finishScan(null, null, 'We couldn’t reach the scanner just now.');
    }
  }

  function finishScan(result: ScanResult | null, id: string | null, message: string) {
    setScan(result);
    setScanId(id);
    /* The speed test takes longer than the rest of the scan, so it runs while the visitor answers the questions. */
    speedRef.current =
      result && !result.blocked && id && result.speed !== 'done'
        ? fetch(`${API}/speed`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ scanId: id }),
          }).catch(() => undefined)
        : null;
    setIndex(0);
    if (!result || result.blocked) {
      const reason = result?.blockedReason ? ` (${result.blockedReason})` : '';
      setScanMessage(
        message ||
          `We couldn’t read your site automatically${reason}. That happens when a site asks visitors to prove they’re human, or takes too long to answer. You can still get your score: we’ll ask a few extra questions instead.`,
      );
      setPhase('scanNote');
    } else {
      setScanMessage(
        result.partial
          ? `We read most of your site. A few checks ran out of time, so they’ll show as not checked. Now a few questions only you can answer.${result.speed !== 'done' ? ' The speed test keeps running in the background while you answer.' : ''}`
          : `We’ve finished looking at your site. Now a few questions only you can answer.${result.speed !== 'done' ? ' The speed test keeps running in the background while you answer.' : ''}`,
      );
      setPhase('scanNote');
    }
  }

  function choose(optionId: string) {
    if (!question) return;
    setAnswers((a) => ({ ...a, [question.id]: optionId }));
    if (index + 1 >= questions.length) setPhase('gate');
    else setIndex(index + 1);
  }

  function back() {
    if (phase === 'gate') {
      setPhase('quiz');
      setIndex(questions.length - 1);
    } else if (index > 0) setIndex(index - 1);
    else setPhase('scanNote');
  }

  /* --- Turnstile, loaded only on the email step --- */
  const siteKey = SITE_KEY || (typeof window !== 'undefined' && window.location.hostname === 'localhost' ? TEST_SITE_KEY : '');
  const mountWidget = useCallback(() => {
    if (!widgetRef.current || !window.turnstile || widgetId.current) return;
    widgetId.current = window.turnstile.render(widgetRef.current, {
      sitekey: siteKey,
      callback: (t: string) => setToken(t),
      'expired-callback': () => setToken(''),
      'error-callback': () => setToken(''),
    });
  }, [siteKey]);

  useEffect(() => {
    if (phase !== 'gate' || !siteKey) return;
    if (window.turnstile) {
      mountWidget();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = mountWidget;
    document.head.appendChild(s);
  }, [phase, siteKey, mountWidget]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError('');
    const form = new FormData(event.currentTarget);
    if (!token) {
      setFormError('Please finish the check below the form so we know you’re a person.');
      return;
    }
    setPhase('sending');
    try {
      /* If the speed test is still running, give it a moment so the report can include it. */
      if (speedRef.current) await Promise.race([speedRef.current, new Promise((r) => setTimeout(r, 20000))]);
      const res = await fetch(`${API}/submit`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          scanId,
          url: scan?.url ?? url,
          answers,
          company: String(form.get('company') ?? ''),
          turnstileToken: token,
          lead: {
            name: String(form.get('name') ?? ''),
            email: String(form.get('email') ?? ''),
            practice: String(form.get('practice') ?? ''),
            cityState: String(form.get('cityState') ?? ''),
          },
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { id?: string; message?: string };
      if (res.ok && data.id) {
        window.location.assign(`${REPORT_BASE}${data.id}/`);
        return;
      }
      setFormError(data.message || 'Something went wrong on our side. Please try again.');
    } catch {
      setFormError('We couldn’t reach the server. Please check your connection and try again.');
    }
    widgetId.current && window.turnstile?.reset(widgetId.current);
    setToken('');
    setPhase('gate');
  }

  /* ----------------------------------------------------------------------------------------- */

  if (phase === 'intro') {
    return (
      <>
        <section className={styles.section}>
          <div className="container">
            <div className={styles.narrow}>
              <p className={styles.eyebrow}>Free tool</p>
              <h1 className={styles.h1}>How well is your therapy website working for you?</h1>
              <p className={styles.lede}>
                We look at your website, then ask a few questions only you can answer. You get a score, a short list of fixes in order of
                impact, and a clear place to start. It takes about 3 minutes.
              </p>
              <form className={styles.urlRow} onSubmit={startScan} noValidate>
                <div className={styles.urlField}>
                  <label className={styles.label} htmlFor="sc-url">
                    Your website address
                  </label>
                  <input
                    id="sc-url"
                    className={styles.input}
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="yourpractice.com"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    aria-invalid={urlError ? true : undefined}
                    aria-describedby={urlError ? 'sc-url-error' : undefined}
                  />
                </div>
                <button type="submit" className={styles.btn}>
                  Start my scorecard
                </button>
              </form>
              {urlError ? (
                <p id="sc-url-error" className={styles.error} role="alert">
                  {urlError}
                </p>
              ) : null}
              <p className={styles.small} style={{ marginTop: 14 }}>
                We only read the public pages of your site. We don’t log in or change anything.
              </p>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.band}`}>
          <div className="container">
            <div className={styles.narrow}>
              <h2 className={styles.h2}>What you get</h2>
              <ul className={styles.checkList}>
                {INSIDE.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <p className={styles.small} style={{ marginTop: 20 }}>
                Our scan looks for common signs, so it can miss things. When we say we couldn’t find something, it’s worth a quick look
                yourself. Questions about how we score? See the notes at the bottom of your report. Looking for something else? Browse
                the <Link href={routes.freebies.hub} className={styles.textLink}>free tools and guides</Link>.
              </p>
            </div>
          </div>
        </section>
      </>
    );
  }

  const progress =
    phase === 'quiz' ? Math.round((index / (questions.length + 1)) * 100) : phase === 'gate' || phase === 'sending' ? Math.round((questions.length / (questions.length + 1)) * 100) : 0;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.narrow}>
          {phase === 'scanning' ? (
            <>
              <h1 className={styles.question} ref={headingRef} tabIndex={-1}>
                Looking at your website
              </h1>
              <p className={styles.small} style={{ margin: '0 0 24px' }}>
                This usually takes under 20 seconds.
              </p>
              <ol className={styles.steps} aria-live="polite">
                {STEP_ORDER.map((id) => {
                  const state = steps[id];
                  return (
                    <li key={id} className={`${styles.step} ${state === 'done' ? styles.stepDone : ''}`}>
                      <span
                        className={`${styles.dot} ${state === 'done' ? styles.dotDone : state === 'start' ? styles.dotWorking : ''}`}
                        aria-hidden="true"
                      >
                        {state === 'done' ? '✓' : ''}
                      </span>
                      {STEP_LABELS[id]}
                      <span className="sr-only">{state === 'done' ? ', done' : state === 'start' ? ', working' : ', waiting'}</span>
                    </li>
                  );
                })}
              </ol>
            </>
          ) : null}

          {phase === 'scanNote' ? (
            <>
              <h1 className={styles.question} ref={headingRef} tabIndex={-1}>
                {scan && !scan.blocked ? 'Scan finished' : 'We couldn’t read your site'}
              </h1>
              <p className={styles.notice}>{scanMessage}</p>
              <button type="button" className={styles.btn} onClick={() => setPhase('quiz')}>
                Continue to the questions
              </button>
            </>
          ) : null}

          {phase === 'quiz' && question ? (
            <>
              <div
                className={styles.progress}
                role="progressbar"
                aria-label="Quiz progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <span className={styles.progressBar} style={{ width: `${progress}%` }} />
              </div>
              <p className={styles.progressText}>
                Question {index + 1} of {questions.length}
              </p>
              <fieldset className={styles.options} style={{ margin: 0 }}>
                <legend style={{ padding: 0 }}>
                  <h1 className={styles.question} ref={headingRef} tabIndex={-1}>
                    {question.prompt}
                  </h1>
                  {question.help ? (
                    <span className={styles.small} style={{ display: 'block' }}>
                      {question.help}
                    </span>
                  ) : null}
                </legend>
                <div className={styles.options} role="radiogroup" aria-label={question.prompt}>
                  {question.options.map((o) => (
                    <button
                      key={o.id}
                      type="button"
                      role="radio"
                      aria-checked={answers[question.id] === o.id}
                      className={`${styles.option} ${answers[question.id] === o.id ? styles.optionOn : ''}`}
                      onClick={() => choose(o.id)}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </fieldset>
              <button type="button" className={styles.btnLight} onClick={back}>
                Back
              </button>
            </>
          ) : null}

          {phase === 'gate' || phase === 'sending' ? (
            <>
              <div
                className={styles.progress}
                role="progressbar"
                aria-label="Quiz progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <span className={styles.progressBar} style={{ width: `${progress}%` }} />
              </div>
              <p className={styles.progressText}>Last step</p>
              <h1 className={styles.question} ref={headingRef} tabIndex={-1}>
                Where should we send your results?
              </h1>
              <p className={styles.small}>You’ll see your score right after this, and we’ll email you a copy.</p>
              <form onSubmit={submit} noValidate={false}>
                <div className={styles.fields}>
                  <div>
                    <label className={styles.label} htmlFor="sc-name">
                      Your name
                    </label>
                    <input id="sc-name" name="name" className={styles.inputBox} type="text" autoComplete="name" required maxLength={100} />
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="sc-email">
                      Email
                    </label>
                    <input id="sc-email" name="email" className={styles.inputBox} type="email" autoComplete="email" required maxLength={200} />
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="sc-practice">
                      Practice name
                    </label>
                    <input id="sc-practice" name="practice" className={styles.inputBox} type="text" autoComplete="organization" required maxLength={150} />
                  </div>
                  <div>
                    <label className={styles.label} htmlFor="sc-city">
                      City and state
                    </label>
                    <input id="sc-city" name="cityState" className={styles.inputBox} type="text" autoComplete="address-level2" placeholder="Austin, TX" required maxLength={100} />
                  </div>
                  <div className={styles.honey} aria-hidden="true">
                    <label htmlFor="sc-company">Company</label>
                    <input id="sc-company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                  </div>
                  <div className={styles.fieldWide}>
                    {siteKey ? (
                      <div ref={widgetRef} />
                    ) : (
                      <p className={styles.error}>The human check isn’t set up on this site yet, so the form can’t be sent.</p>
                    )}
                  </div>
                </div>
                <p className={styles.consent}>
                  We’ll use your details to send your results and, if you like, to follow up about your site. We won’t share them. Please
                  don’t put client information in any field. See our{' '}
                  <Link href={routes.privacyPolicy} className={styles.textLink}>
                    privacy policy
                  </Link>
                  .
                </p>
                {formError ? (
                  <p className={styles.error} role="alert" style={{ marginBottom: 14 }}>
                    {formError}
                  </p>
                ) : null}
                <div className={styles.urlRow}>
                  <button type="submit" className={styles.btnAccent} disabled={phase === 'sending'}>
                    {phase === 'sending' ? 'Finishing the speed test and building your report…' : 'Show my results'}
                  </button>
                  <button type="button" className={styles.btnLight} onClick={back} disabled={phase === 'sending'}>
                    Back
                  </button>
                </div>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
