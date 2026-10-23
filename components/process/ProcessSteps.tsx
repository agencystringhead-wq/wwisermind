import { processPage } from '@/lib/process';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from '@/components/services/Section.module.css';
import ConfirmChip from './ConfirmChip';
import styles from './Process.module.css';

/**
 * Frame 3 — the three steps, the body of the page.
 *
 * Three full-width blocks down a thin blue rail that fills as the page scrolls. The fill is a
 * CSS scroll-driven animation on the list (see Process.module.css), so no script runs for it;
 * the only property that moves is the fill's `scaleY`. Each block arrives through the shared Reveal in a set order — the
 * numeral, then the title, the paragraph, the two cards, and last the walk-away line.
 *
 * Under reduced motion, or in a browser without scroll timelines, the stylesheet draws the rail
 * full and every block in place.
 */
export default function ProcessSteps() {
  const { eyebrow, heading, items } = processPage.steps;

  return (
    <section className={styles.steps}>
      <div className="container">
        <Reveal as="header" className={section.head}>
          <p className={section.eyebrow} data-reveal="0">
            {eyebrow}
          </p>
          <ScrollReveal text={heading} className={section.heading} />
        </Reveal>

        <div className={styles.list}>
          <span className={styles.rail} aria-hidden="true">
            <span className={styles.railFill} />
          </span>

          {items.map((step) => (
            <Reveal as="article" className={styles.block} key={step.numeral}>
              <span className={styles.node} data-reveal="0" aria-hidden="true" />

              <div className={styles.tile} data-reveal="0" aria-hidden="true">
                <span className={styles.numeral}>{step.numeral}</span>
              </div>

              <div className={styles.stepBody}>
                <h3 className={styles.stepTitle} data-reveal="1">
                  {step.title}
                </h3>
                <p className={styles.stepText} data-reveal="2">
                  {step.body}
                </p>

                <div className={styles.parts} data-reveal="3">
                  {[step.yourPart, step.ourPart].map((part, i) => (
                    <div
                      className={`${styles.part} ${i === 0 ? styles.partYou : styles.partUs}`}
                      key={part.label}
                    >
                      <p className={styles.partLabel}>{part.label}</p>
                      <p className={styles.partText}>
                        {part.body}
                        <ConfirmChip question={(part as { confirm?: string }).confirm} />
                      </p>
                    </div>
                  ))}
                </div>

                <p className={styles.walk} data-reveal="4">
                  <span className={styles.walkLead}>{step.walkAway.lead}</span>{' '}
                  {step.walkAway.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
