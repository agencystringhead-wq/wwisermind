import { contactPage } from '@/lib/site';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './ContactForm.module.css';

function Required() {
  return (
    <span className={styles.required} aria-hidden="true">
      *
    </span>
  );
}

function Chevron() {
  return (
    <svg
      className={styles.chevron}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * The written route in — a plain form on a white card, as the reference's is. No steps, no
 * pill selectors: labelled fields, two selects, a message, one button.
 *
 * DESIGN ONLY. There is deliberately no <form> element, no action, no handler and no
 * validation — nothing here can submit anything, and the button is `type="button"`. When
 * this is wired up it will POST to Jotform; until then the markup is inert on purpose.
 * Required fields are marked for assistive technology with `aria-required` rather than the
 * `required` attribute, which would invite browser validation UI on a form that has none.
 */
export default function ContactForm() {
  const { heading, subheading, requiredNote, fields, selects, message, submit } =
    contactPage.form;

  return (
    <section className={styles.section} id={contactPage.anchors.form}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <ScrollReveal text={heading} className={styles.heading} />
          <p className={styles.subheading}>{subheading}</p>
        </div>

        {/* Not a <form>: see the note above. TODO: wire to Jotform. */}
        <div className={styles.card}>
          <p className={styles.note}>
            <Required /> {requiredNote}
          </p>

          <div className={styles.fields}>
            {fields.map((field) => (
              <p className={styles.field} key={field.id}>
                <label className={styles.label} htmlFor={field.id}>
                  {field.label}
                  {field.required ? <Required /> : null}
                  {'hint' in field ? <span className={styles.hint}>({field.hint})</span> : null}
                </label>
                <input
                  className={styles.input}
                  type={field.type}
                  id={field.id}
                  name={field.id}
                  autoComplete={field.autoComplete}
                  aria-required={field.required || undefined}
                />
              </p>
            ))}

            {selects.map((select) => (
              <p className={styles.field} key={select.id}>
                <label className={styles.label} htmlFor={select.id}>
                  {select.label}
                  {select.required ? <Required /> : null}
                </label>
                <span className={styles.selectWrap}>
                  <select
                    className={`${styles.input} ${styles.select}`}
                    id={select.id}
                    name={select.id}
                    defaultValue=""
                    aria-required={select.required || undefined}
                  >
                    <option value="" disabled>
                      {select.placeholder}
                    </option>
                    {select.options.map((option) => (
                      <option value={option} key={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </span>
              </p>
            ))}

            <p className={`${styles.field} ${styles.fieldWide}`}>
              <label className={styles.label} htmlFor={message.id}>
                {message.label}
                {message.required ? <Required /> : null}
              </label>
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                id={message.id}
                name={message.id}
                rows={6}
                aria-required={message.required || undefined}
              />
            </p>
          </div>

          {/* Inert until the Jotform endpoint is wired in — hence type="button". */}
          <button className={styles.submit} type="button">
            {submit}
          </button>
        </div>
      </div>
    </section>
  );
}
