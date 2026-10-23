'use client';

import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { useTurnstile } from '@/components/local-map/flow/useTurnstile';
import { PRIVACY_DETAIL, PRIVACY_LINE } from '@/lib/gfe/content';
import {
  FREQUENCIES,
  MAX_MONTHS,
  MAX_ROWS,
  SERVICES,
  formatMoney,
  priceRows,
  sessionsFor,
  validate,
  type Errors,
  type Estimate,
  type FrequencyId,
  type ServiceRow,
} from '@/lib/gfe/estimate';
import styles from './gfe.module.css';

const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
/* Empty in production (same origin). Set NEXT_PUBLIC_GFE_API=http://localhost:8789 to test against scripts/gfe/dev-server.mts. */
const API = process.env.NEXT_PUBLIC_GFE_API || '';
let rowSeq = 0;
const newRow = (id?: string): ServiceRow => ({ id: id ?? `r${++rowSeq}`, code: '', fee: '', sessions: '' });

const EMPTY = (): Estimate => ({
  practiceName: '',
  providerName: '',
  credentials: '',
  npi: '',
  tin: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  phone: '',
  email: '',
  clientName: '',
  clientDob: '',
  clientAddress: '',
  clientPhone: '',
  clientEmail: '',
  firstSession: '',
  issued: '', // filled in with today's date after the page loads, so the server and browser agree
  diagnosis: '',
  rows: [newRow('r0')],
});

/* Everything in the form stays in this component's memory. The only thing sent anywhere is the lead (see sendLead). */
export default function GfeApp() {
  const [est, setEst] = useState<Estimate>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [freq, setFreq] = useState<FrequencyId>('weekly');
  const [months, setMonths] = useState(6);
  const [first, setFirst] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [leadError, setLeadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const unlocked = useRef(false); // true once the lead was accepted: later downloads in this visit skip the check
  const uid = useId();
  const turnstile = useTurnstile(true);
  useEffect(() => setEst((e) => (e.issued ? e : { ...e, issued: today() })), []);

  const priced = useMemo(() => priceRows(est.rows), [est.rows]);
  const helperSessions = sessionsFor(freq, months);
  const id = (k: string) => `${uid}-${k}`;

  const set = <K extends keyof Estimate>(k: K, v: Estimate[K]) => {
    setEst((e) => ({ ...e, [k]: v }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };
  const setRow = (rid: string, patch: Partial<ServiceRow>) => {
    setEst((e) => ({ ...e, rows: e.rows.map((r) => (r.id === rid ? { ...r, ...patch } : r)) }));
    if (errors.rows) setErrors((x) => ({ ...x, rows: undefined }));
  };

  /** Sends ONLY the therapist's own details. The estimate, and everything about the client, stays here. */
  async function sendLead(): Promise<boolean> {
    if (unlocked.current) return true;
    const form = document.getElementById(id('form')) as HTMLFormElement | null;
    const company = (form?.elements.namedItem('company') as HTMLInputElement | null)?.value ?? '';
    try {
      const res = await fetch(`${API}/api/gfe/lead`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: first.trim(),
          email: leadEmail.trim(),
          practice: est.practiceName.trim(),
          city: est.city.trim(),
          turnstileToken: turnstile.token,
          company,
        }),
      });
      if (res.ok) {
        unlocked.current = true;
        return true;
      }
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      setLeadError(data.message || 'Something went wrong on our side. Please try again.');
    } catch {
      setLeadError('We couldn’t reach the server. Please check your connection and try again.');
    }
    return false;
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault();
    setLeadError('');
    setDone(false);
    const errs = validate(est);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const firstKey = Object.keys(errs)[0];
      requestAnimationFrame(() => {
        const el = document.getElementById(id(firstKey)) ?? document.getElementById(id('rows'));
        el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        (el as HTMLElement | null)?.focus?.({ preventScroll: true });
      });
      return;
    }
    if (!first.trim() || !/^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/.test(leadEmail.trim())) {
      setLeadError('Please add your first name and email so we can send you the link back to this tool.');
      return;
    }
    if (!unlocked.current && !turnstile.token) {
      setLeadError('Please complete the security check.');
      return;
    }
    setBusy(true);
    const ok = await sendLead();
    if (!ok) {
      turnstile.reset();
      setBusy(false);
      return;
    }
    try {
      const { buildGfePdf } = await import('@/lib/gfe/pdf');
      const { bytes, fileName } = await buildGfePdf(est);
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      setDone(true);
    } catch {
      setLeadError('We couldn’t build the PDF in your browser. Please try again, or try a different browser.');
    }
    setBusy(false);
  }

  const field = (k: keyof Estimate, label: string, opts: { type?: string; ph?: string; auto?: string; hint?: string; req?: boolean; mode?: 'numeric' | 'tel' | 'email' } = {}) => (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id(k)}>
        {label}
        {opts.req === false ? <span className={styles.opt}> (optional)</span> : null}
      </label>
      <input
        id={id(k)}
        className={styles.input}
        type={opts.type ?? 'text'}
        inputMode={opts.mode}
        autoComplete={opts.auto ?? 'off'}
        placeholder={opts.ph}
        value={est[k] as string}
        onChange={(e) => set(k, e.target.value as never)}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={errors[k] ? id(`${k}-err`) : opts.hint ? id(`${k}-hint`) : undefined}
      />
      {opts.hint && !errors[k] ? <p id={id(`${k}-hint`)} className={styles.hint}>{opts.hint}</p> : null}
      {errors[k] ? <p id={id(`${k}-err`)} className={styles.error} role="alert">{errors[k]}</p> : null}
    </div>
  );

  return (
    <form id={id('form')} className={styles.form} onSubmit={onSubmit} noValidate>
      {/* --- 1. Practice -------------------------------------------------------------------------- */}
      <fieldset className={styles.card}>
        <legend className={styles.legend}><span className={styles.num}>1</span>Practice details</legend>
        <div className={styles.grid2}>
          {field('practiceName', 'Practice name', { auto: 'organization' })}
          {field('providerName', 'Provider name', { auto: 'name' })}
          {field('credentials', 'Credentials', { ph: 'LMFT, LCSW, PhD', req: false })}
          {field('npi', 'NPI', { mode: 'numeric', ph: '10 digits' })}
          {field('tin', 'Tax ID (TIN)', { ph: '12-3456789', hint: 'Your EIN, or your SSN if you bill under it.' })}
          {field('phone', 'Phone', { type: 'tel', mode: 'tel', auto: 'tel' })}
        </div>
        {field('street', 'Street address', { auto: 'street-address' })}
        <div className={styles.grid3}>
          {field('city', 'City', { auto: 'address-level2' })}
          {field('state', 'State', { auto: 'address-level1', ph: 'CA' })}
          {field('zip', 'ZIP code', { mode: 'numeric', auto: 'postal-code' })}
        </div>
        {field('email', 'Email', { type: 'email', mode: 'email', auto: 'email' })}
      </fieldset>

      {/* --- 2. Client ---------------------------------------------------------------------------- */}
      <fieldset className={styles.card}>
        <legend className={styles.legend}><span className={styles.num}>2</span>Client details</legend>
        <p className={styles.privacyInline}>{PRIVACY_LINE}</p>
        <div className={styles.grid2}>
          {field('clientName', 'Client name')}
          {field('clientDob', 'Date of birth', { type: 'date' })}
          {field('clientAddress', 'Address', { req: false, auto: 'off' })}
          {field('clientPhone', 'Phone', { req: false, type: 'tel', mode: 'tel' })}
          {field('clientEmail', 'Email', { req: false, type: 'email', mode: 'email' })}
          {field('firstSession', 'Date of first session', { type: 'date' })}
          {field('issued', 'Date this estimate is issued', { type: 'date' })}
        </div>
      </fieldset>

      {/* --- 3. Services -------------------------------------------------------------------------- */}
      <fieldset className={styles.card} id={id('rows')} tabIndex={-1}>
        <legend className={styles.legend}><span className={styles.num}>3</span>Services</legend>

        <div className={styles.helper}>
          <p className={styles.helperTitle}>Not sure how many sessions? Work it out</p>
          <div className={styles.helperRow}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={id('freq')}>How often</label>
              <select id={id('freq')} className={styles.input} value={freq} onChange={(e) => setFreq(e.target.value as FrequencyId)}>
                {FREQUENCIES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor={id('months')}>For how long</label>
              <select id={id('months')} className={styles.input} value={months} onChange={(e) => setMonths(Number(e.target.value))}>
                {Array.from({ length: MAX_MONTHS }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m} {m === 1 ? 'month' : 'months'}</option>)}
              </select>
            </div>
            <p className={styles.helperResult} aria-live="polite"><b>{helperSessions}</b> sessions</p>
          </div>
        </div>

        <ul className={styles.rows}>
          {est.rows.map((r, i) => (
            <li key={r.id} className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id(`svc-${r.id}`)}>Service {est.rows.length > 1 ? i + 1 : ''}</label>
                <select id={id(`svc-${r.id}`)} className={styles.input} value={r.code} onChange={(e) => setRow(r.id, { code: e.target.value })}>
                  <option value="">Choose a service</option>
                  {SERVICES.map((s) => <option key={s.code} value={s.code}>{s.code} {s.name}</option>)}
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id(`fee-${r.id}`)}>Fee per session</label>
                <div className={styles.money}>
                  <span aria-hidden="true">$</span>
                  <input id={id(`fee-${r.id}`)} className={styles.input} inputMode="decimal" placeholder="150.00" value={r.fee} onChange={(e) => setRow(r.id, { fee: e.target.value })} />
                </div>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor={id(`n-${r.id}`)}>Sessions</label>
                <input id={id(`n-${r.id}`)} className={styles.input} inputMode="numeric" placeholder="1" value={r.sessions} onChange={(e) => setRow(r.id, { sessions: e.target.value.replace(/\D/g, '').slice(0, 3) })} />
                <button type="button" className={styles.linkBtn} onClick={() => setRow(r.id, { sessions: String(helperSessions) })}>Use {helperSessions}</button>
              </div>
              <div className={styles.lineTotal}>
                <span className={styles.label}>Line total</span>
                <b>{(() => { const l = priceRows([r]).lines[0]; return l ? formatMoney(l.totalCents) : '$0.00'; })()}</b>
              </div>
              {est.rows.length > 1 ? (
                <button type="button" className={styles.remove} onClick={() => setEst((e) => ({ ...e, rows: e.rows.filter((x) => x.id !== r.id) }))} aria-label={`Remove service ${i + 1}`}>Remove</button>
              ) : null}
            </li>
          ))}
        </ul>
        {errors.rows ? <p className={styles.error} role="alert">{errors.rows}</p> : null}
        {est.rows.length < MAX_ROWS ? (
          <button type="button" className={styles.secondary} onClick={() => setEst((e) => ({ ...e, rows: [...e.rows, newRow()] }))}>+ Add another service</button>
        ) : null}

        <div className={styles.field} style={{ marginTop: 22 }}>
          <label className={styles.label} htmlFor={id('diagnosis')}>Diagnosis code <span className={styles.opt}>(optional)</span></label>
          <input id={id('diagnosis')} className={styles.input} placeholder="F41.1" value={est.diagnosis} onChange={(e) => set('diagnosis', e.target.value)} autoComplete="off" />
          <p className={styles.hint}>Add it only if it is needed to work out the estimate. It stays in your browser.</p>
        </div>

        <div className={styles.total} aria-live="polite">
          <span>Total estimated cost</span>
          <b>{formatMoney(priced.totalCents)}</b>
        </div>
      </fieldset>

      {/* --- Download ----------------------------------------------------------------------------- */}
      <fieldset className={`${styles.card} ${styles.gate}`}>
        <legend className={styles.legend}><span className={styles.num}>4</span>Download your estimate</legend>
        <p className={styles.gateLead}>Tell us where to send the link back to this tool. We only receive your first name, email, practice name and city.</p>
        <div className={styles.grid2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={id('first')}>Your first name</label>
            <input id={id('first')} className={styles.input} autoComplete="given-name" value={first} onChange={(e) => setFirst(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor={id('lead-email')}>Your email</label>
            <input id={id('lead-email')} className={styles.input} type="email" inputMode="email" autoComplete="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
          </div>
        </div>
        <label className={styles.trap} aria-hidden="true">
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
        <div ref={turnstile.ref} className={styles.turnstile} />
        {!turnstile.available ? <p className={styles.error}>The security check is not set up on this site yet.</p> : null}
        {leadError ? <p className={styles.error} role="alert">{leadError}</p> : null}
        <button type="submit" className={styles.primary} disabled={busy}>{busy ? 'Building your PDF…' : 'Download my estimate (PDF)'}</button>
        {done ? <p className={styles.success} role="status">Your PDF is downloading. Keep a copy for your records and give one to your client.</p> : null}
        <p className={styles.hint} style={{ marginTop: 14 }}>{PRIVACY_DETAIL}</p>
      </fieldset>
    </form>
  );
}
