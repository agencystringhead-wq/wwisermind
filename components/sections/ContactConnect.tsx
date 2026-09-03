import { contactPage } from '@/lib/site';
import { ArrowRightIcon, ExternalLinkIcon, contactIcons } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './ContactConnect.module.css';

/**
 * The four ways in, as the contact reference lays them out: a hairline, a centred heading
 * and line, then white cards two to a row — icon at the top, title, a short line, and a
 * text link with an arrow at the foot, the feet on each row on one line.
 *
 * Each card is one anchor, so the whole surface is the target and a keyboard reaches each
 * with a single Tab. The card is the homepage shell — border, radius, lift, sweep.
 */
export default function ContactConnect() {
  const { heading, subheading, cards } = contactPage.connect;

  return (
    <section className={styles.section} id={contactPage.anchors.connect}>
      <div className="container">
        {/* White on white above, so a hairline marks where this frame begins. */}
        <span className={styles.rule} aria-hidden="true" />

        <ScrollReveal text={heading} className={styles.heading} />
        <p className={styles.subheading}>{subheading}</p>

        <ul className={styles.grid}>
          {cards.map((card) => {
            const Glyph = contactIcons[card.icon];
            /* A `#` placeholder is not a new tab yet — target and the note wait for the
               real address. The mark is shown either way, as the design has it. */
            const leaves = card.external && !card.href.startsWith('#');

            return (
              <li className={styles.item} key={card.title}>
                <a
                  href={card.href}
                  className={styles.card}
                  target={leaves ? '_blank' : undefined}
                  rel={leaves ? 'noreferrer' : undefined}
                >
                  <span className={styles.shine} aria-hidden="true" />

                  <span className={styles.tile}>
                    <Glyph />
                  </span>

                  <h3 className={styles.title}>{card.title}</h3>
                  <p className={styles.body}>{card.body}</p>

                  <span className={styles.link}>
                    {card.linkLabel}
                    {card.external ? (
                      <ExternalLinkIcon className={styles.linkIcon} />
                    ) : (
                      <ArrowRightIcon className={styles.linkIcon} />
                    )}
                    {leaves ? <span className="sr-only"> (opens in a new tab)</span> : null}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
