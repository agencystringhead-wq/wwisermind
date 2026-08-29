import Image from 'next/image';
import Link from 'next/link';
import { contactBar } from '@/lib/site';
import styles from './ContactBar.module.css';

/* Hand-drawn like the arrows and the calendar already in the footer — the project carries no
   icon package and this adds none. One 24-box for all four so the strokes match. */
function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M7.5 14h2v2h-2zM11 14h2v2h-2zM14.5 14h2v2h-2z" fill="currentColor" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.6 3h3l1.5 4.2-2.1 1.5a12.5 12.5 0 0 0 6.3 6.3l1.5-2.1L21 14.4v3a2.4 2.4 0 0 1-2.6 2.4A16.8 16.8 0 0 1 4.2 5.6 2.4 2.4 0 0 1 6.6 3z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="3" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M4 8l7.1 4.8a1.6 1.6 0 0 0 1.8 0L20 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.6a8.3 8.3 0 0 0-7.1 12.6L4 20.4l4.3-1.1A8.3 8.3 0 1 0 12 3.6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 8.4c.2-.5.4-.5.6-.5h.5c.2 0 .4 0 .6.4l.7 1.6c.1.2 0 .4-.1.5l-.4.5c-.1.2-.2.3 0 .6a6 6 0 0 0 2.6 2.2c.3.1.4 0 .6-.1l.5-.6c.2-.2.3-.1.5 0l1.5.8c.2.1.3.2.3.4a1.7 1.7 0 0 1-1.2 1.5c-.4.1-1 .2-3-.7a9.4 9.4 0 0 1-3.6-3.4c-.6-1-.7-1.7-.7-2.1a2 2 0 0 1 .6-1.1z"
        fill="currentColor"
      />
    </svg>
  );
}

const ICONS = {
  calendar: CalendarIcon,
  phone: PhoneIcon,
  envelope: EnvelopeIcon,
  whatsapp: WhatsAppIcon,
};

/**
 * A pill of contact actions pinned to the foot of the viewport on every page.
 *
 * It stays put over everything, the footer and the closing band included. The one thing it
 * stands down for is the mobile drawer, and that needs no coordination between the two
 * components: the header marks the document while the drawer is open and a selector in the
 * stylesheet reads that mark. So there is no state here, and nothing to run on the client.
 */
export default function ContactBar() {
  return (
    <div
      className={styles.bar}
      /* Not a nav: it is a small set of shortcuts, and calling it one would add a landmark a
         screen reader then has to step past on every page. */
      aria-label="Contact shortcuts"
      role="group"
    >
      <span className={styles.avatar}>
        <Image
          src={contactBar.avatar.src}
          alt={contactBar.avatar.alt}
          width={80}
          height={80}
          sizes="44px"
        />
      </span>

      {contactBar.items.map((item) => {
        const Icon = ICONS[item.icon];
        const accent = 'accent' in item && item.accent;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.item} ${accent ? styles.accent : ''}`}
            aria-label={item.aria}
          >
            <Icon />
            {/* aria-hidden because the label duplicates the aria-label above it — a reader
                would otherwise announce the same thing twice. */}
            <span className={styles.tip} aria-hidden="true">
              {item.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
