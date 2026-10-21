'use client';

import { useEffect, useId, useRef, useState } from 'react';
import styles from './HelpNowWidget.module.css';

type Props = {
  /** Two-letter code and name of every state and DC, in alphabetical order. */
  states: { code: string; name: string }[];
  /** Codes of the states that have county-level data, which are the ones that take a county. */
  countyStates?: string[];
};

const SCRIPT_URL = 'https://wwisermind.com/widget/help-now.js';
const DEFAULT_COLOR = '#146ef5';

/** The fallback a visitor sees if the widget cannot load: it always names 911 and 988. */
const FALLBACK =
  '<p><strong>If you are in immediate danger, call 911.</strong> For crisis support, call or text 988 (Suicide &amp; Crisis Lifeline), available 24/7.</p>';

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * The snippet generator for the help now widget: a state, an accent colour, a compact switch and
 * a heading. The preview runs the real /widget/help-now.js against this site's own copy of the
 * data, and the code box shows the snippet a practice pastes into its site. Nothing is saved or
 * sent anywhere: the choices stay in this page.
 */
export default function HelpNowGenerator({ states, countyStates = [] }: Props) {
  const [state, setState] = useState('');
  const [county, setCounty] = useState('');
  const [color, setColor] = useState(DEFAULT_COLOR);
  const [compact, setCompact] = useState(false);
  const [heading, setHeading] = useState('');
  const [copied, setCopied] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const ready = useRef<Promise<void> | null>(null);
  const id = useId();

  /* The county only counts for a state that has county data; switching state drops it from the code. */
  const countyValue = countyStates.includes(state) ? county.trim() : '';

  const attrs = [
    'class="wwiser-help-now"',
    ...(state ? [`data-state="${state}"`] : []),
    ...(countyValue ? [`data-county="${escapeAttr(countyValue)}"`] : []),
    `data-color="${color}"`,
    ...(compact ? ['data-compact="true"'] : []),
    ...(heading.trim() ? [`data-heading="${escapeAttr(heading.trim())}"`] : []),
  ];
  const snippet = `<div ${attrs.join(' ')}>\n  ${FALLBACK}\n</div>\n<script src="${SCRIPT_URL}" async></script>`;

  /* Load the real widget file once, then redraw the preview whenever a choice changes. */
  useEffect(() => {
    const host = preview.current;
    if (!host) return;

    if (!ready.current) {
      ready.current = new Promise((resolve) => {
        if (window.wwiserHelpNow) return resolve();
        const script = document.createElement('script');
        script.src = '/widget/help-now.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.appendChild(script);
      });
    }

    let cancelled = false;
    ready.current.then(() => {
      if (cancelled || !host) return;
      host.textContent = '';
      const div = document.createElement('div');
      div.className = 'wwiser-help-now';
      if (state) div.setAttribute('data-state', state);
      if (countyValue) div.setAttribute('data-county', countyValue);
      div.setAttribute('data-color', color);
      if (compact) div.setAttribute('data-compact', 'true');
      if (heading.trim()) div.setAttribute('data-heading', heading.trim());
      /* The preview reads this site's own copy of the data, so it works before the live file does. */
      div.setAttribute('data-src', '/data/crisis-resources.json');
      div.innerHTML = FALLBACK;
      host.appendChild(div);
      window.wwiserHelpNow?.init(div);
    });
    return () => {
      cancelled = true;
    };
  }, [state, countyValue, color, compact, heading]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet);
    } catch {
      const area = document.getElementById(`${id}-code`) as HTMLTextAreaElement | null;
      area?.select();
      document.execCommand('copy');
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  return (
    <div className={styles.generator}>
      <div className={styles.controls}>
        <h2 className={styles.panelTitle}>Your settings</h2>

        <div className={styles.field}>
          <label htmlFor={`${id}-state`}>State</label>
          <select id={`${id}-state`} value={state} onChange={(event) => setState(event.target.value)}>
            <option value="">National resources only</option>
            {states.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
          <p className={styles.hint}>
            States without local data show national resources only.
          </p>
        </div>

        {countyStates.includes(state) ? (
          <div className={styles.field}>
            <label htmlFor={`${id}-county`}>County</label>
            <input
              id={`${id}-county`}
              type="text"
              value={county}
              maxLength={60}
              placeholder="Harris"
              onChange={(event) => setCounty(event.target.value)}
              autoComplete="off"
            />
            <p className={styles.hint}>
              e.g. Harris, Dallas, Travis. Leave it empty to show the statewide lines and a link to
              each county&apos;s own crisis line.
            </p>
          </div>
        ) : null}

        <div className={styles.field}>
          <label htmlFor={`${id}-color`}>Accent colour</label>
          <input
            id={`${id}-color`}
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor={`${id}-heading`}>Heading</label>
          <input
            id={`${id}-heading`}
            type="text"
            value={heading}
            maxLength={80}
            placeholder="Need help now?"
            onChange={(event) => setHeading(event.target.value)}
          />
        </div>

        <label className={styles.check}>
          <input
            type="checkbox"
            checked={compact}
            onChange={(event) => setCompact(event.target.checked)}
          />
          <span>Compact: only 911, 988 and Crisis Text Line, plus your state</span>
        </label>
      </div>

      <div className={styles.previewPanel}>
        <h2 className={styles.panelTitle}>Preview</h2>
        <div className={styles.preview} ref={preview} />
      </div>

      <div className={styles.codePanel}>
        <h2 className={styles.panelTitle}>Your code</h2>
        <p className={styles.hint}>
          Paste this where you want the help to appear. The paragraph inside is what visitors see if
          the widget cannot load.
        </p>
        <textarea
          id={`${id}-code`}
          className={styles.code}
          readOnly
          rows={9}
          value={snippet}
          onFocus={(event) => event.currentTarget.select()}
          aria-label="Widget code to copy"
        />
        <div className={styles.copyRow}>
          <button type="button" className={styles.copyButton} onClick={copy}>
            Copy code
          </button>
          <span className={styles.copied} role="status" aria-live="polite">
            {copied ? 'Copied' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    wwiserHelpNow?: { init: (host: Element) => void; scan: () => void };
  }
}
