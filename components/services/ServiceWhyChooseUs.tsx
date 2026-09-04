import Image from 'next/image';
import { whySlots, type Service, type WhySlot } from '@/lib/services';
import { serviceIcons } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceWhyChooseUs.module.css';

function Slot({ slot }: { slot: WhySlot }) {
  if (slot.kind === 'stat') {
    return (
      <li className={`${styles.card} ${styles.cardDark}`}>
        <p className={styles.stat}>{slot.value}</p>
        <h3 className={styles.title}>{slot.title}</h3>
        <p className={styles.body}>{slot.body}</p>
      </li>
    );
  }

  const Glyph = serviceIcons[slot.icon];

  return (
    <li className={styles.card}>
      <span className={styles.shine} aria-hidden="true" />
      <Glyph className={styles.icon} />
      <h3 className={styles.title}>{slot.title}</h3>
      <p className={styles.body}>{slot.body}</p>
    </li>
  );
}

/**
 * Frame 7: why choose us, as the choose-us reference — a centred eyebrow and heading,
 * then the tall photograph on the left and four cards two by two on the right. Three are
 * light, an icon over a title and a line; one is dark, the figure in the yellow over its
 * title and line, in whichever of the four slots the entry names. An entry with no honest
 * figure lists four light cards instead, and the grid is four light cards.
 *
 * The figure is read out of the case study it names, so it is the same number the
 * homepage shows and changes with it.
 */
export default function ServiceWhyChooseUs({
  block,
  ground,
}: {
  block: NonNullable<Service['whyChooseUs']>;
  ground: Ground;
}) {
  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className="container">
        <div className={section.head}>
          <p className={section.eyebrow}>Why choose us</p>
          <ScrollReveal text={block.heading} className={section.heading} />
        </div>

        <div className={styles.grid}>
          <figure className={styles.figure}>
            <Image
              src={block.image.src}
              alt={block.image.alt}
              fill
              sizes="(max-width: 1023px) 100vw, 640px"
              style={{ objectPosition: block.image.position }}
            />
            <span className={styles.shine} aria-hidden="true" />
          </figure>

          <ul className={styles.cards}>
            {whySlots(block).map((slot) => (
              <Slot slot={slot} key={slot.title} />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
