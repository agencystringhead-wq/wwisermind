import Image from 'next/image';
import Link from 'next/link';
import { footerCta } from '@/lib/site';
import styles from './Footer.module.css';

function WhatsAppIcon() {
  return (
    <svg className={styles.whatsapp} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#01c43a" />
      <path
        fill="#ffffff"
        d="M16.1 7.2c-4.8 0-8.7 3.9-8.7 8.7 0 1.5.4 3 1.2 4.3L7.2 24.8l4.8-1.3c1.3.7 2.7 1 4.1 1 4.8 0 8.7-3.9 8.7-8.7s-3.9-8.6-8.7-8.6zm5 12.3c-.2.6-1.2 1.1-1.7 1.2-.4.1-1 .1-1.6-.1-.4-.1-.9-.3-1.5-.6-2.6-1.1-4.3-3.8-4.5-4-.1-.2-1-1.4-1-2.6 0-1.2.6-1.8.9-2.1.2-.2.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.8 1.9c.1.1.1.3 0 .5l-.3.4-.3.4c-.1.1-.2.3 0 .5.1.2.6 1 1.3 1.6.9.8 1.6 1 1.9 1.1.2.1.4.1.5-.1l.7-.8c.2-.2.3-.2.5-.1l1.8.9c.2.1.4.2.4.3.1.2.1.6-.1 1.1z"
      />
    </svg>
  );
}

export default function Footer() {
  const { background, heading, bodyLead, bodyRest, actions } = footerCta;

  return (
    <footer>
      <section className={styles.cta}>
        <Image src={background} alt="" fill sizes="100vw" className={styles.ctaBackdrop} />

        <div className={`container ${styles.ctaInner}`}>
          <h2 className={styles.heading}>{heading}</h2>

          <p className={styles.body}>
            {bodyLead}
            <br />
            {bodyRest}
          </p>

          <div className={styles.actions}>
            {actions.map((action) => (
              <Link href={action.href} className={styles.button} key={action.label}>
                {action.label}
                {action.whatsapp ? <WhatsAppIcon /> : null}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </footer>
  );
}
