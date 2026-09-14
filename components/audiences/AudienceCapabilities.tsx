import type { Audience } from '@/lib/audiences';
import { aiMarkLabels, aiMarks } from '@/components/ui/icons';
import Float from '@/components/ui/Float';
import Reveal from '@/components/ui/Reveal';
import shared from './Audience.module.css';
import styles from './AudienceCapabilities.module.css';

/**
 * Frame 4: the capabilities band, on the dark grey, as the reference's — a block of two
 * or three short lines in the mono face at the top left, the page's name in a small
 * outlined tile at the right, and under them four items in a row: one of the AI
 * platform marks as a thin line icon, a hairline, one short line on what the site's
 * structure lets that platform do with the practice.
 *
 * The motion is the reference site's: each item slides in from the right, one after
 * another, as the band reaches the viewport; once there, the marks keep a slow, slight
 * drift — a few pixels and a couple of degrees — that runs only while the band is on
 * screen and not at all under reduced motion.
 */
export default function AudienceCapabilities({ audience }: { audience: Audience }) {
  const { label, items } = audience.capabilities;

  return (
    <section className={`${shared.section} ${shared.dark}`}>
      <Reveal className="container">
        <div className={styles.head}>
          <p className={styles.label} data-reveal="0">
            {label}
          </p>
          <p className={styles.tag} data-reveal="0">
            {audience.name}
          </p>
        </div>

        <Float as="ul" className={styles.items}>
          {items.map((item, index) => {
            const Mark = aiMarks[item.mark];

            return (
              <li className={styles.item} key={item.mark} data-reveal={index + 1}>
                <span className={styles.mark} role="img" aria-label={aiMarkLabels[item.mark]}>
                  <Mark className={styles.icon} />
                </span>
                <span className={styles.rule} aria-hidden="true" />
                <p className={styles.text}>{item.text}</p>
              </li>
            );
          })}
        </Float>
      </Reveal>
    </section>
  );
}
