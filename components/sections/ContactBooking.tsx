import { contactPage } from '@/lib/site';
import { CalendarIcon } from '@/components/ui/icons';
import styles from './ContactBooking.module.css';

/**
 * The calendar slot, on white between the connect cards and the form, opening on the
 * shared hairline since the cards above it are white too.
 *
 * The frame is sized by aspect-ratio, so whatever ends up inside it — the placeholder now, a
 * Cal.com iframe later — occupies exactly the same box and the page below it never moves.
 * `#book-a-call` is the anchor every "Book a free call" on the site points at.
 */
export default function ContactBooking() {
  const { label, placeholder } = contactPage.booking;

  return (
    <section className={styles.section} id={contactPage.anchors.booking}>
      <div className="container">
        {/* White on white above, so a hairline marks where this frame begins. */}
        <span className={styles.rule} aria-hidden="true" />

        <p className={styles.label}>{label}</p>

        <div className={styles.frame}>
          {/* ---------------------------------------------------------------
              EMBED INSERTION POINT — replace the placeholder <div> below with
              the real calendar and nothing else on this page has to change:

                <iframe
                  src="https://cal.com/<handle>/30min"
                  title="Book a 30-minute call"
                  className={styles.embed}
                  loading="lazy"
                />

              `.embed` already fills the frame; the frame already holds the ratio.
              --------------------------------------------------------------- */}
          <div className={styles.placeholder}>
            <CalendarIcon className={styles.icon} />
            <p className={styles.placeholderTitle}>{placeholder.title}</p>
            <p className={styles.placeholderNote}>{placeholder.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
