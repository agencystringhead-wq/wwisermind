import type { ComponentProps, ReactNode } from 'react';
import CtaLink from '@/components/booking/CtaLink';
import { routes } from '@/lib/routes';
import { CONTACT_EMAIL, CONTACT_MAILTO } from '@/lib/therapyindex/config';
import styles from './ti.module.css';

/** The numbered chip that opens every section: "02 areas". */
export function SectionLabel({ n, children }: { n: string; children: ReactNode }) {
  return (
    <span className={styles.label}>
      <span className={styles.labelNum}>{n}</span>
      <span className={styles.labelText}>{children}</span>
    </span>
  );
}

/** A section's heading block: the chip, then the title and an optional lead line. */
export function SectionHead({
  n,
  label,
  title,
  lede,
  wide,
  stacked,
}: {
  n: string;
  label: string;
  title: ReactNode;
  lede?: ReactNode;
  wide?: boolean;
  /** Chip, title and lede in one column: for a heading that sits inside the left rail. */
  stacked?: boolean;
}) {
  return (
    <header className={`${styles.head} ${stacked ? styles.headStacked : ''}`}>
      <SectionLabel n={n}>{label}</SectionLabel>
      <div className={styles.headMain}>
        <h2 className={`${styles.title} ${wide ? styles.titleWide : ''}`}>{title}</h2>
        {lede ? <p className={styles.lede}>{lede}</p> : null}
      </div>
    </header>
  );
}

type Tone = 'dark' | 'light' | 'accent';
const toneClass: Record<Tone, string> = {
  dark: styles.btnDark,
  light: styles.btnLight,
  accent: styles.btnAccent,
};

/** The site's pill button. Goes through CtaLink, so a link to the booking target opens the Cal.com pop-up. */
export function TiButton({ tone = 'dark', className, ...props }: ComponentProps<typeof CtaLink> & { tone?: Tone }) {
  return <CtaLink {...props} className={`${styles.btn} ${toneClass[tone]} ${className ?? ''}`} />;
}

/** The free 30-minute visibility review, wherever a page asks for the next step. */
export function ReviewButton({ tone = 'accent', children = 'Book a free 30-minute visibility review' }: { tone?: Tone; children?: ReactNode }) {
  return (
    <TiButton href={routes.contactBook} tone={tone}>
      {children}
    </TiButton>
  );
}

/** The disclaimer every Therapy Index page ends with. */
export function Disclaimer() {
  return (
    <aside className={styles.disclaimer} aria-label="About this research">
      <p>
        <strong>Independent research.</strong> The Therapy Index is not affiliated with, or endorsed by, any practice listed. Every
        practice gets a do-follow link to its own website. To have a practice removed, email{' '}
        <a href={CONTACT_MAILTO}>{CONTACT_EMAIL}</a>.
      </p>
    </aside>
  );
}

/** JSON-LD for a page. `<` is escaped so a name can never close the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
