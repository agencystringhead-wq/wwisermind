import { contactPage } from '@/lib/site';
import CalInline from '@/components/booking/CalInline';
import styles from './ContactBooking.module.css';

/**
 * The calendar, on white between the connect cards and the form, opening on the shared
 * hairline since the cards above it are white too.
 *
 * `#book` is the anchor /contact#book jumps to. The inline calendar lives here and nowhere
 * else; every other "Book a free call" opens the popup.
 */
export default function ContactBooking() {
  const { label } = contactPage.booking;

  return (
    <section className={styles.section} id={contactPage.anchors.booking}>
      {/* The old anchor, kept so a saved /contact#book-a-call link still lands here. */}
      <span id="book-a-call" />
      <div className="container">
        {/* White on white above, so a hairline marks where this frame begins. */}
        <span className={styles.rule} aria-hidden="true" />

        <p className={styles.label}>{label}</p>

        <div className={styles.frame}>
          <CalInline />
        </div>
      </div>
    </section>
  );
}
