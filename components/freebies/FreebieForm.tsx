'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import styles from './Freebies.module.css';

type Copy = {
  nameLabel: string;
  emailLabel: string;
  consent: string;
  submit: string;
  notifySubmit: string;
  sending: string;
  emailedCopy: string;
  notifyDone: string;
  linkNotReady: string;
  error: string;
  privacy: string;
  privacyLinkLabel: string;
};

type Status = 'idle' | 'sending' | 'done' | 'error';

/**
 * The email form for a gated freebie, and for a coming-soon one (where it only asks to be told).
 * First name, email and an optional, unchecked consent box; the freebie's name goes along as a
 * hidden field. It posts to `endpoint` as JSON. While there is no endpoint yet (lib/freebies.ts,
 * FORM_ENDPOINT) nothing is sent and the success state shows straight away. On success a gated
 * freebie shows its download or Canva button right here, and says an email copy is on its way.
 */
export default function FreebieForm({
  freebie,
  mode,
  assetUrl,
  assetLabel,
  endpoint,
  privacyHref,
  copy,
}: {
  freebie: string;
  mode: 'gated' | 'notify';
  assetUrl: string;
  assetLabel: string;
  endpoint: string;
  privacyHref: string | null;
  copy: Copy;
}) {
  const [status, setStatus] = useState<Status>('idle');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      firstName: String(form.get('firstName') ?? ''),
      email: String(form.get('email') ?? ''),
      marketingConsent: form.get('marketingConsent') === 'on',
      freebie: String(form.get('freebie') ?? freebie),
    };

    setStatus('sending');
    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error(String(response.status));
      }
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className={styles.done} role="status">
        {mode === 'notify' ? (
          <p className={styles.doneTitle}>{copy.notifyDone}</p>
        ) : (
          <>
            {assetUrl ? (
              <a href={assetUrl} className={styles.assetButton} data-asset>
                {assetLabel}
              </a>
            ) : (
              <p className={styles.doneTitle}>{copy.linkNotReady}</p>
            )}
            <p className={styles.doneNote}>{copy.emailedCopy}</p>
          </>
        )}
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <input type="hidden" name="freebie" value={freebie} />

      <p className={styles.field}>
        <label className={styles.label} htmlFor={`${freebie}-name`}>
          {copy.nameLabel}
        </label>
        <input
          className={styles.input}
          id={`${freebie}-name`}
          name="firstName"
          type="text"
          autoComplete="given-name"
          required
        />
      </p>

      <p className={styles.field}>
        <label className={styles.label} htmlFor={`${freebie}-email`}>
          {copy.emailLabel}
        </label>
        <input
          className={styles.input}
          id={`${freebie}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </p>

      <label className={styles.consent}>
        <input type="checkbox" name="marketingConsent" />
        <span>{copy.consent}</span>
      </label>

      <button type="submit" className={styles.submit} disabled={status === 'sending'}>
        {status === 'sending'
          ? copy.sending
          : mode === 'notify'
            ? copy.notifySubmit
            : copy.submit}
      </button>

      {status === 'error' ? (
        <p className={styles.error} role="alert">
          {copy.error}
        </p>
      ) : null}

      <p className={styles.privacy}>
        {copy.privacy}
        {privacyHref ? (
          <>
            {' '}
            <Link href={privacyHref}>{copy.privacyLinkLabel}</Link>
          </>
        ) : null}
      </p>
    </form>
  );
}
