'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';
import { REFER_ENDPOINT, referForm } from '@/lib/refer';
import styles from './Refer.module.css';

type Status = 'idle' | 'sending' | 'done' | 'error';

function Required() {
  return (
    <span className={styles.required} aria-hidden="true">
      *
    </span>
  );
}

/**
 * The referral form. Plain labelled fields on a white card, as the contact form's are.
 *
 * It posts the answers as JSON to REFER_ENDPOINT (lib/refer.ts). While there is no endpoint yet
 * nothing is sent and the success message shows straight away, exactly as the freebie form
 * does. The required fields use the browser's own validation, and their labels carry a star.
 */
export default function ReferForm({ id }: { id: string }) {
  const [status, setStatus] = useState<Status>('idle');
  const { fields } = referForm;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const payload = Object.fromEntries(
      [...data.entries()].map(([key, value]) => [key, String(value)]),
    );

    setStatus('sending');
    try {
      if (REFER_ENDPOINT) {
        const response = await fetch(REFER_ENDPOINT, {
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

  return (
    <section className={styles.formSection} id={id}>
      <div className={`container ${styles.formGrid}`}>
        <h2 className={styles.formHeading}>{referForm.heading}</h2>

        <div className={styles.card}>
          {status === 'done' ? (
            <p className={styles.success} role="status">
              {referForm.success}
            </p>
          ) : (
            <form onSubmit={onSubmit}>
              <p className={styles.note}>
                <Required /> {referForm.requiredNote}
              </p>

              <div className={styles.fields}>
                <p className={styles.field}>
                  <label className={styles.label} htmlFor="refer-your-name">
                    {fields.yourName}
                    <Required />
                  </label>
                  <input
                    className={styles.input}
                    id="refer-your-name"
                    name="yourName"
                    type="text"
                    autoComplete="name"
                    required
                  />
                </p>

                <p className={styles.field}>
                  <label className={styles.label} htmlFor="refer-your-email">
                    {fields.yourEmail}
                    <Required />
                  </label>
                  <input
                    className={styles.input}
                    id="refer-your-email"
                    name="yourEmail"
                    type="email"
                    autoComplete="email"
                    required
                  />
                </p>

                <fieldset className={`${styles.field} ${styles.wide} ${styles.fieldset}`}>
                  <legend className={styles.label}>
                    {fields.isClient}
                    <Required />
                  </legend>
                  <span className={styles.radios}>
                    {referForm.isClientOptions.map((option, index) => (
                      <label className={styles.radio} key={option}>
                        <input type="radio" name="isClient" value={option} required={index === 0} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </span>
                </fieldset>

                <p className={styles.field}>
                  <label className={styles.label} htmlFor="refer-their-name">
                    {fields.theirName}
                    <Required />
                  </label>
                  <input
                    className={styles.input}
                    id="refer-their-name"
                    name="theirName"
                    type="text"
                    required
                  />
                </p>

                <p className={styles.field}>
                  <label className={styles.label} htmlFor="refer-their-practice">
                    {fields.theirPractice}
                    <Required />
                  </label>
                  <input
                    className={styles.input}
                    id="refer-their-practice"
                    name="theirPractice"
                    type="text"
                    required
                  />
                </p>

                <p className={styles.field}>
                  <label className={styles.label} htmlFor="refer-their-contact">
                    {fields.theirContact}
                    <Required />
                  </label>
                  <input
                    className={styles.input}
                    id="refer-their-contact"
                    name="theirContact"
                    type="text"
                    required
                  />
                </p>

                <p className={styles.field}>
                  <label className={styles.label} htmlFor="refer-practice-type">
                    {fields.practiceType}
                  </label>
                  <select
                    className={`${styles.input} ${styles.select}`}
                    id="refer-practice-type"
                    name="practiceType"
                    defaultValue={referForm.practiceTypeOptions[2]}
                  >
                    {referForm.practiceTypeOptions.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </p>

                <p className={`${styles.field} ${styles.wide}`}>
                  <label className={styles.label} htmlFor="refer-notes">
                    {fields.notes}
                    <span className={styles.hint}>({fields.notesHint})</span>
                  </label>
                  <textarea
                    className={`${styles.input} ${styles.textarea}`}
                    id="refer-notes"
                    name="notes"
                    rows={5}
                  />
                </p>

                <label className={`${styles.consent} ${styles.wide}`}>
                  <input type="checkbox" name="toldThem" required />
                  <span>
                    {fields.confirm}
                    <Required />
                  </span>
                </label>
              </div>

              <button type="submit" className={styles.submit} disabled={status === 'sending'}>
                {status === 'sending' ? referForm.sending : referForm.submit}
              </button>

              {status === 'error' ? (
                <p className={styles.error} role="alert">
                  {referForm.error}
                </p>
              ) : null}
            </form>
          )}

          <p className={styles.smallPrint}>
            {referForm.smallPrint.before}
            <Link href={referForm.smallPrint.link.href}>{referForm.smallPrint.link.label}</Link>
            {referForm.smallPrint.after}
          </p>
        </div>
      </div>
    </section>
  );
}
