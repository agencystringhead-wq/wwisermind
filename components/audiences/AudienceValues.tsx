import type { Audience } from '@/lib/audiences';
import Reveal from '@/components/ui/Reveal';
import shared from './Audience.module.css';
import styles from './AudienceValues.module.css';

/**
 * Frame 7: the values, as the reference — the mono "our values" eyebrow in the left
 * column and three entries stacked in the right, each a heading with a paragraph under
 * it, a hairline between one and the next. Each entry is its own reveal group, so the
 * third arrives when the page reaches it rather than while it is still below the fold.
 */
export default function AudienceValues({ audience }: { audience: Audience }) {
  return (
    <section className={`${shared.section} ${shared.light}`}>
      <div className={`container ${styles.grid}`}>
        <Reveal>
          <p className={shared.eyebrow} data-reveal="0">
            Our values
          </p>
        </Reveal>

        <ul className={styles.list}>
          {audience.values.map((value) => (
            <Reveal as="li" className={styles.entry} key={value.title}>
              <h3 className={`${shared.heading} ${styles.title}`} data-reveal="0">
                {value.title}
              </h3>
              <p className={`${shared.body} ${styles.body}`} data-reveal="1">
                {value.body}
              </p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
