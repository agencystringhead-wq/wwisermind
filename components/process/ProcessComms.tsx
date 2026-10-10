import { processPage } from '@/lib/process';
import { contactPage } from '@/lib/site';
import FooterClocks from '@/components/layout/FooterClocks';
import { serviceIcons } from '@/components/ui/icons';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from '@/components/services/Section.module.css';
import ConfirmChip from './ConfirmChip';
import styles from './Process.module.css';

/**
 * Frame 6 — how we communicate, on a soft blue tint. Three gradient cards, then the four-city
 * time strip: the footer's own clock component, handed the same four cities the contact page
 * uses. Cadence promises are drafted conservatively and carry a Confirm chip.
 */
export default function ProcessComms() {
  const { eyebrow, heading, cards, clocksLead, reply } = processPage.comms;
  const { clocks } = contactPage.studio;

  return (
    <section className={`${section.section} ${styles.commsGround}`}>
      <div className="container">
        <Reveal as="header" className={section.head}>
          <p className={section.eyebrow} data-reveal="0">
            {eyebrow}
          </p>
          <ScrollReveal text={heading} className={section.heading} />
        </Reveal>

        <Reveal as="ul" className={styles.comms}>
          {cards.map((card, i) => {
            const Glyph = serviceIcons[card.icon];
            return (
              <li className={styles.commsCard} key={card.title} data-reveal={String(i)}>
                <span className={styles.commsIcon}>
                  <Glyph className={styles.commsGlyph} />
                </span>
                <h3 className={styles.commsTitle}>{card.title}</h3>
                <p className={styles.commsBody}>
                  {card.body}
                  <ConfirmChip question={'confirm' in card ? card.confirm : undefined} />
                </p>
              </li>
            );
          })}
        </Reveal>

        <div className={styles.timeBlock}>
          <div className={styles.timeCopy}>
            <p className={styles.timeLead}>{clocksLead}</p>
            <p className={styles.timeReply}>
              {reply.text}
              <ConfirmChip question={reply.confirm} />
            </p>
          </div>
          <div className={styles.clockStrip}>
            <FooterClocks clocks={clocks} />
          </div>
        </div>
      </div>
    </section>
  );
}
