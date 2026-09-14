import { audienceStat, type Audience, type AudienceClaim } from '@/lib/audiences';
import { testimonials } from '@/lib/services';
import { serviceIcons } from '@/components/ui/icons';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import shared from './Audience.module.css';
import styles from './AudienceProof.module.css';

/** The founder frame's quote mark — a pair of squared commas, not a typographic glyph. */
function QuoteMark() {
  return (
    <svg className={styles.mark} viewBox="0 0 86 63" fill="currentColor" aria-hidden="true">
      <path d="M0 0h35v35L22 63H8L0 35z" />
      <path d="M51 0h35v35L73 63H59l-8-28z" />
    </svg>
  );
}

function Claim({
  claim,
  className,
  stage,
}: {
  claim: AudienceClaim;
  className: string;
  /** Its place in the row's arrival order. */
  stage: number;
}) {
  const Glyph = serviceIcons[claim.icon];

  return (
    <li className={className} data-reveal={stage}>
      <span className={styles.shine} aria-hidden="true" />
      <Glyph className={styles.icon} />
      <h3 className={styles.title}>{claim.title}</h3>
      <p className={styles.body}>{claim.body}</p>
    </li>
  );
}

/**
 * Frame 3: the proof row, on the grey ground — a heading and a line under it, then the
 * reference's row of mixed-size cards: one dark card with the page's one figure, a
 * column of two smaller cards, a taller card with an icon, and a quote. One number on
 * the row, so nothing on it competes with it: the other three cards are short claims
 * behind a thin line icon.
 *
 * The figure is read out of the case study the entry names, so it is the homepage's
 * number and changes with it; the quote is the hero banner's testimonial. The cards
 * arrive one after another, left to right.
 */
export default function AudienceProof({ audience }: { audience: Audience }) {
  const { heading, subheading, lead, claims, quote } = audience.proof;
  const leadStat = audienceStat(lead);
  const testimonial = quote ? testimonials[quote] : null;

  return (
    <section className={`${shared.section} ${shared.grey}`}>
      <div className="container">
        <Reveal>
          <div data-reveal="0">
            <ScrollReveal text={heading} className={`${shared.heading} ${styles.heading}`} />
          </div>
          <p className={`${shared.body} ${styles.lede}`} data-reveal="1">
            {subheading}
          </p>
        </Reveal>

        <Reveal as="ul" className={styles.cards}>
          <li className={`${styles.card} ${styles.cardDark}`} data-reveal="0">
            <p className={styles.figure}>{leadStat.value}</p>
            <div>
              <h3 className={styles.title}>{lead.title}</h3>
              <p className={styles.body}>{lead.body}</p>
              <p className={styles.source}>
                {leadStat.label} · {leadStat.practice}
              </p>
            </div>
          </li>

          <Claim claim={claims[0]} className={`${styles.card} ${styles.cardUpper}`} stage={1} />
          <Claim claim={claims[1]} className={`${styles.card} ${styles.cardLower}`} stage={1} />
          <Claim claim={claims[2]} className={`${styles.card} ${styles.cardTall}`} stage={2} />

          {testimonial ? (
            <li className={`${styles.card} ${styles.cardQuote}`} data-reveal="3">
              <span className={styles.shine} aria-hidden="true" />
              <QuoteMark />
              <blockquote className={styles.quote}>
                <p className={styles.quoteText}>{testimonial.quote}</p>
                <footer className={styles.author}>
                  <span className={styles.authorName}>{testimonial.name}</span>
                  <span className={styles.authorRole}>{testimonial.role}</span>
                </footer>
              </blockquote>
            </li>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}
