import { routes } from '@/lib/routes';
import Link from 'next/link';
import styles from './AboutBelief.module.css';

/**
 * Section 5 — Belief + stat cards (soft blue tint ground).
 *
 * Reference: a centred statement, then a bento of gradient cards — one large feature card,
 * smaller ones beside it — and a "Ready to…" bar with an arrow underneath. No scroll
 * effect on this section: the statement is plain type and the cards are static.
 *
 * Figures come from real case studies (Timely, Evolve):
 *   · 31% conversion rate growth   (Timely)
 *   · 48% more leads                (Timely)
 *   · 81% patient appointments up   (Evolve)
 *   · 134% website visitor growth   (Evolve)
 *
 * ⚠️ PLACEHOLDER — the "100%" card has no verifiable figure behind it. It states a fact
 * about how the studio works (mental health practitioners only), not a measured result.
 * Replace it with a real metric, or confirm the claim, before publishing.
 */

type Stat = {
  value: string;
  label: string;
  note?: string;
  tone: 'feature' | 'navy' | 'sky' | 'sun' | 'wide';
};

const stats: Stat[] = [
  { value: '134%', label: 'Growth in website visitors', note: 'Evolve Therapy case study', tone: 'feature' },
  { value: '31%', label: 'Higher conversion rate', note: 'Timely Therapy', tone: 'navy' },
  { value: '48%', label: 'More qualified leads', note: 'Timely Therapy', tone: 'sky' },
  { value: '81%', label: 'More patient appointments', note: 'Evolve Therapy', tone: 'sun' },
  { value: '100%', label: 'Built for mental health practitioners only — no other verticals', tone: 'wide' }, // ⚠️ PLACEHOLDER
];

export default function AboutBelief() {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.statementWrap}>
          <p className={styles.eyebrow}>What we believe</p>
          <h2 className={styles.statement}>
            Every therapist who does great work deserves to be found.
          </h2>
          <p className={styles.statementSub}>
            The care is already there. We build the reach.
          </p>
        </div>

        <ul className={styles.bento}>
          {stats.map((s) => (
            <li key={s.value} className={`${styles.card} ${styles[s.tone]}`}>
              <span className={styles.cardValue}>{s.value}</span>
              <span className={styles.cardLabel}>{s.label}</span>
              {s.note && <span className={styles.cardNote}>{s.note}</span>}
            </li>
          ))}
        </ul>

        <Link href={routes.contact} className={styles.ctaBar}>
          <span>Ready to elevate your practice?</span>
          <span className={styles.ctaArrow} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </span>
        </Link>
      </div>
    </section>
  );
}
