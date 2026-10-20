'use client';

import Link from 'next/link';
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react';
import {
  ACCENT_PRESETS,
  CONFIDENTIALITY_TEXT,
  EMERGENCY_REGIONS,
  SAMPLE_VALUES,
  buildSignatureHtml,
  buildSignatureText,
  contrastRatio,
  isEmptySignature,
  looksLikeUrl,
  normalizeHex,
  type EmergencyRegion,
  type ImageShape,
  type SignatureStyle,
  type SignatureValues,
} from '@/lib/email-signature';
import type { signatureCopy } from '@/lib/freebies';
import styles from './Freebies.module.css';

type Copy = typeof signatureCopy;

/** The keys of the form that hold plain text. */
type TextKey =
  | 'name'
  | 'credentials'
  | 'pronouns'
  | 'title'
  | 'practice'
  | 'phone'
  | 'website'
  | 'bookingUrl'
  | 'bookingLabel'
  | 'license'
  | 'imageUrl';

/** The value after `ms` of no change: used so the preview does not fetch an image for every
    letter typed into the address. */
function useDebounced<T>(value: T, ms: number): T {
  const [settled, setSettled] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setSettled(value), ms);
    return () => window.clearTimeout(timer);
  }, [value, ms]);
  return settled;
}

/** The clipboard API where the browser allows it, else the older select-and-copy, which works in a
    page that is not allowed the clipboard API (an embedded view, an older browser). */
async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    return ok;
  }
}

/** A small drawing of each style, for its card. The shapes are the layout, not the content. */
function Thumb({ style }: { style: SignatureStyle }) {
  const ink = '#9a9a9a';
  const line = '#cfcfcf';
  const accent = '#146ef5';
  return (
    <svg viewBox="0 0 64 40" width="64" height="40" aria-hidden="true" focusable="false">
      {style === 'classic' ? (
        <>
          <rect x="6" y="7" width="30" height="4" rx="2" fill={ink} />
          <rect x="6" y="15" width="40" height="3" rx="1.5" fill={line} />
          <rect x="6" y="21" width="34" height="3" rx="1.5" fill={line} />
          <rect x="6" y="28" width="24" height="3" rx="1.5" fill={accent} />
        </>
      ) : null}
      {style === 'photo' ? (
        <>
          <circle cx="15" cy="20" r="9" fill={line} />
          <rect x="30" y="8" width="2" height="24" fill={accent} />
          <rect x="37" y="9" width="22" height="4" rx="2" fill={ink} />
          <rect x="37" y="17" width="19" height="3" rx="1.5" fill={line} />
          <rect x="37" y="25" width="14" height="6" rx="2" fill={accent} />
        </>
      ) : null}
      {style === 'card' ? (
        <>
          <rect x="4" y="5" width="56" height="30" rx="3" fill="#e8f0fe" />
          <rect x="4" y="5" width="3" height="30" fill={accent} />
          <rect x="13" y="11" width="28" height="4" rx="2" fill={ink} />
          <rect x="13" y="19" width="36" height="3" rx="1.5" fill={line} />
          <rect x="13" y="26" width="20" height="5" rx="2" fill={accent} />
        </>
      ) : null}
      {style === 'minimal' ? (
        <>
          <rect x="8" y="10" width="26" height="4" rx="2" fill={ink} />
          <rect x="8" y="19" width="44" height="3" rx="1.5" fill={line} />
          <rect x="8" y="27" width="22" height="3" rx="1.5" fill={accent} />
        </>
      ) : null}
    </svg>
  );
}

/**
 * The email signature generator: a form on the left, a live preview and the copy buttons on the
 * right (the preview sticks below the header while the form scrolls), the code in a panel under
 * both, short setup steps per mail app, and a band offering to install it.
 *
 * It has no backend. Nothing typed here is stored or sent; the only request the page makes for it
 * is the browser loading the image address the visitor pastes, to draw the preview. The form
 * starts filled with a sample so the preview is never empty, and an empty field leaves the
 * signature entirely (see lib/email-signature.ts).
 */
export default function EmailSignature({ copy }: { copy: Copy }) {
  const uid = useId();
  const id = (key: string) => `${uid}-${key}`;

  const [values, setValues] = useState<SignatureValues>(SAMPLE_VALUES);
  const [accentText, setAccentText] = useState(SAMPLE_VALUES.accent);
  const [copied, setCopied] = useState<'signature' | 'code' | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState(copy.steps[0].id);
  const previewRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const set = <K extends keyof SignatureValues>(key: K, value: SignatureValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  /** The props one text field needs. */
  const bind = (key: TextKey) => ({
    id: id(key),
    value: values[key],
    onChange: (event: ChangeEvent<HTMLInputElement>) => set(key, event.target.value),
    autoComplete: 'off',
    spellCheck: false,
  });

  const usesImage = values.style === 'photo' || values.style === 'card';
  const empty = isEmptySignature(values);

  const html = useMemo(() => buildSignatureHtml(values), [values]);
  const text = useMemo(() => buildSignatureText(values), [values]);

  /* The preview waits for a settled, complete-looking image address before it asks for the image. */
  const settledImage = useDebounced(values.imageUrl, 500);
  const previewHtml = useMemo(
    () =>
      buildSignatureHtml({
        ...values,
        imageUrl: usesImage && looksLikeUrl(settledImage) ? settledImage : '',
      }),
    [values, usesImage, settledImage],
  );
  const showImageNote = usesImage && !looksLikeUrl(values.imageUrl);

  /* --- the accent colour: presets, or any typed hex; the last valid one stays until a new one parses */
  const pickPreset = (hex: string) => {
    set('accent', hex);
    setAccentText(hex);
  };
  const onAccentText = (raw: string) => {
    setAccentText(raw);
    const hex = normalizeHex(raw);
    if (hex) set('accent', hex);
  };
  const accentInvalid = accentText.trim() !== '' && normalizeHex(accentText) === null;
  const accentLight = contrastRatio(values.accent, '#ffffff') < 3;

  /* --- copying */
  const flash = (which: 'signature' | 'code') => {
    window.clearTimeout(timer.current);
    setFailed(false);
    setCopied(which);
    timer.current = window.setTimeout(() => setCopied(null), 2000);
  };

  /* Formatted HTML and plain text together where the clipboard API allows it. The write is made
     before any await, which is what Safari needs to treat it as part of the click. If the browser
     refuses, select the rendered preview and use the older copy command. */
  async function copySignature() {
    try {
      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([html], { type: 'text/html' }),
            'text/plain': new Blob([text], { type: 'text/plain' }),
          }),
        ]);
        flash('signature');
        return;
      }
    } catch {
      /* fall through to the selection method */
    }

    const node = previewRef.current;
    if (node) {
      const range = document.createRange();
      range.selectNodeContents(node);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      if (document.execCommand('copy')) {
        flash('signature');
        return;
      }
    }
    setFailed(true);
  }

  async function copyCode() {
    if (await copyText(html)) flash('code');
    else setFailed(true);
  }

  /* The preview is a picture of the signature, not a page: its links must not take anyone anywhere. */
  const keepPreviewStill = (event: MouseEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('a')) event.preventDefault();
  };

  /* --- the setup tabs: arrow keys, Home and End move between them */
  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = copy.steps.length - 1;
    let next = -1;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next < 0) return;
    event.preventDefault();
    setTab(copy.steps[next].id);
    tabRefs.current[next]?.focus();
  };

  const active = copy.steps.find((item) => item.id === tab) ?? copy.steps[0];
  const d = copy.details;

  return (
    <div className={styles.sig}>
      <div className={styles.gen}>
        <form className={styles.genForm} onSubmit={(event) => event.preventDefault()} aria-label={copy.formTitle}>
          <p className={styles.privacyLine}>{copy.privacy}</p>

          {/* 1. style */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{copy.style.legend}</legend>
            <div className={styles.styleGrid}>
              {copy.style.options.map((option) => (
                <label className={styles.styleOption} key={option.id}>
                  <input
                    type="radio"
                    name={id('style')}
                    value={option.id}
                    className={styles.srInput}
                    checked={values.style === option.id}
                    onChange={() => set('style', option.id as SignatureStyle)}
                  />
                  <span className={styles.styleCard}>
                    <Thumb style={option.id as SignatureStyle} />
                    <span className={styles.styleName}>{option.label}</span>
                    <span className={styles.styleNote}>{option.note}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 2. details */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{d.legend}</legend>
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id('name')}>{d.name}</label>
                <input className={styles.input} type="text" {...bind('name')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id('credentials')}>{d.credentials}</label>
                <input className={styles.input} type="text" placeholder={d.credentialsHint} {...bind('credentials')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id('pronouns')}>
                  {d.pronouns} <span className={styles.hint}>({copy.optional})</span>
                </label>
                <input className={styles.input} type="text" {...bind('pronouns')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id('title')}>{d.title}</label>
                <input className={styles.input} type="text" {...bind('title')} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label className={styles.label} htmlFor={id('practice')}>{d.practice}</label>
                <input className={styles.input} type="text" {...bind('practice')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id('phone')}>{d.phone}</label>
                <input className={styles.input} type="tel" {...bind('phone')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id('website')}>{d.website}</label>
                <input className={styles.input} type="text" inputMode="url" {...bind('website')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id('bookingUrl')}>{d.bookingUrl}</label>
                <input className={styles.input} type="text" inputMode="url" {...bind('bookingUrl')} />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id('bookingLabel')}>{d.bookingLabel}</label>
                <input className={styles.input} type="text" {...bind('bookingLabel')} />
              </div>
              <div className={`${styles.field} ${styles.span2}`}>
                <label className={styles.label} htmlFor={id('license')}>
                  {d.license} <span className={styles.hint}>({copy.optional})</span>
                </label>
                <input className={styles.input} type="text" placeholder={d.licenseHint} {...bind('license')} />
              </div>
            </div>
          </fieldset>

          {/* 3. photo or logo */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{copy.image.legend}</legend>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={id('imageUrl')}>
                {copy.image.url} <span className={styles.hint}>({copy.optional})</span>
              </label>
              <input
                className={styles.input}
                type="text"
                inputMode="url"
                disabled={!usesImage}
                aria-describedby={id('imageHelp')}
                {...bind('imageUrl')}
              />
              <p className={styles.helper} id={id('imageHelp')}>
                {usesImage ? copy.image.help : copy.image.unused}
              </p>
            </div>
            <div className={styles.segment} role="radiogroup" aria-label={copy.image.shape}>
              {(
                [
                  ['round', copy.image.round],
                  ['square', copy.image.square],
                ] as [ImageShape, string][]
              ).map(([shape, label]) => (
                <label className={styles.segmentOption} key={shape}>
                  <input
                    type="radio"
                    name={id('shape')}
                    className={styles.srInput}
                    disabled={!usesImage}
                    checked={values.imageShape === shape}
                    onChange={() => set('imageShape', shape)}
                  />
                  <span className={styles.segmentLabel}>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 4. accent colour */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{copy.colour.legend}</legend>
            <div className={styles.swatches}>
              {ACCENT_PRESETS.map((preset) => (
                <label className={styles.swatch} key={preset.hex}>
                  <input
                    type="radio"
                    name={id('accent')}
                    className={styles.srInput}
                    aria-label={`${preset.name} ${preset.hex}`}
                    checked={values.accent === preset.hex}
                    onChange={() => pickPreset(preset.hex)}
                  />
                  <span className={styles.swatchDot} style={{ backgroundColor: preset.hex }} />
                </label>
              ))}
            </div>
            <div className={`${styles.field} ${styles.hexField}`}>
              <label className={styles.label} htmlFor={id('hex')}>{copy.colour.custom}</label>
              <input
                className={styles.input}
                id={id('hex')}
                type="text"
                value={accentText}
                placeholder={copy.colour.customHint}
                onChange={(event) => onAccentText(event.target.value)}
                autoComplete="off"
                spellCheck={false}
                maxLength={7}
                aria-invalid={accentInvalid}
                aria-describedby={accentInvalid || accentLight ? id('hexNote') : undefined}
              />
              {accentInvalid || accentLight ? (
                <p className={styles.helper} id={id('hexNote')}>
                  {accentInvalid ? copy.colour.invalid : copy.colour.light}
                </p>
              ) : null}
            </div>
          </fieldset>

          {/* 5. notices */}
          <fieldset className={styles.fieldset}>
            <legend className={styles.legend}>{copy.notices.legend}</legend>
            <div className={styles.checks}>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={values.confidentiality}
                  onChange={(event) => set('confidentiality', event.target.checked)}
                />
                {copy.notices.confidentiality}
              </label>
              {values.confidentiality ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={id('confText')}>{copy.notices.confidentialityText}</label>
                  <textarea
                    className={styles.textarea}
                    id={id('confText')}
                    rows={3}
                    value={values.confidentialityText}
                    onChange={(event) => set('confidentialityText', event.target.value)}
                    placeholder={CONFIDENTIALITY_TEXT}
                  />
                </div>
              ) : null}

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={values.noHealthDetails}
                  onChange={(event) => set('noHealthDetails', event.target.checked)}
                />
                {copy.notices.health}
              </label>

              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={values.emergency}
                  onChange={(event) => set('emergency', event.target.checked)}
                />
                {copy.notices.emergency}
              </label>
              {values.emergency ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor={id('country')}>{copy.notices.country}</label>
                  <select
                    className={styles.input}
                    id={id('country')}
                    value={values.emergencyRegion}
                    onChange={(event) => set('emergencyRegion', event.target.value as EmergencyRegion)}
                  >
                    {EMERGENCY_REGIONS.map((region) => (
                      <option value={region.id} key={region.id}>
                        {region.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>
            <p className={styles.helper}>{copy.notices.help}</p>
          </fieldset>
        </form>

        <div className={styles.genAside}>
          <div className={styles.stick}>
            <h2 className={styles.sigTitle}>{copy.preview.title}</h2>
            <div className={styles.genPreview} onClick={keepPreviewStill}>
              {empty ? (
                <p className={styles.previewEmpty}>{copy.preview.empty}</p>
              ) : (
                <div ref={previewRef} dangerouslySetInnerHTML={{ __html: previewHtml }} />
              )}
            </div>
            {showImageNote && !empty ? <p className={styles.helper}>{copy.preview.needsImage}</p> : null}

            <div className={styles.sigActions}>
              <button type="button" className={styles.copyButton} onClick={copySignature} disabled={empty}>
                {copied === 'signature' ? copy.copied : copy.copySignature}
              </button>
              <button type="button" className={styles.copyButtonAlt} onClick={copyCode} disabled={empty}>
                {copied === 'code' ? copy.copied : copy.copyCode}
              </button>
            </div>
            <p className={styles.srOnly} role="status" aria-live="polite">
              {copied ? copy.copiedAnnouncement : ''}
            </p>
            {failed ? (
              <p className={styles.error} role="alert">
                {copy.copyFailed}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <details className={styles.codeDetails}>
        <summary className={styles.codeSummary}>{copy.viewCode}</summary>
        <pre className={styles.code} tabIndex={0}>
          <code>{html}</code>
        </pre>
      </details>

      <div className={styles.sigBlock}>
        <h2 className={styles.sigTitle}>{copy.stepsTitle}</h2>
        <div className={styles.tabs} role="tablist" aria-label={copy.stepsTitle}>
          {copy.steps.map((item, index) => (
            <button
              type="button"
              role="tab"
              id={`sig-tab-${item.id}`}
              aria-selected={tab === item.id}
              aria-controls={`sig-panel-${item.id}`}
              tabIndex={tab === item.id ? 0 : -1}
              className={styles.tab}
              onClick={() => setTab(item.id)}
              onKeyDown={(event) => onTabKey(event, index)}
              ref={(node) => {
                tabRefs.current[index] = node;
              }}
              key={item.id}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div role="tabpanel" id={`sig-panel-${active.id}`} aria-labelledby={`sig-tab-${active.id}`} tabIndex={0}>
          {active.groups ? (
            active.groups.map((group) => (
              <div key={group.label}>
                <h3 className={styles.stepsGroup}>{group.label}</h3>
                <ol className={styles.steps}>
                  {group.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
              </div>
            ))
          ) : (
            <ol className={styles.steps}>
              {active.steps?.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          )}
          {active.id === 'outlook' ? (
            <p className={styles.sigNote}>
              {copy.outlookNote}{' '}
              <Link href={copy.help.href} className={styles.inlineLink}>
                {copy.outlookHelpLabel}
              </Link>
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.help}>
        <div>
          <p className={styles.helpTitle}>{copy.help.title}</p>
          <p className={styles.helpBody}>{copy.help.body}</p>
        </div>
        <Link href={copy.help.href} className={styles.helpButton}>
          {copy.help.button}
        </Link>
      </div>
    </div>
  );
}
