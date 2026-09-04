import type { Service } from '@/lib/services';
import { serviceIcons } from '@/components/ui/icons';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceIntro.module.css';

/**
 * Frames 3 and 4 as one block, matching the design-idea reference: the paragraph in a
 * narrow centred measure, its text set left; the capabilities two to a row in that same
 * measure, each behind the nav's plus; then one hairline across the container, and under
 * it the three pillars — a thin line icon in the site's blue, the title with its colon,
 * a short paragraph — left-set in three columns. One ground throughout, no cards.
 *
 * The pillars are optional; a service without them ends at the capabilities and draws
 * no rule.
 */
export default function ServiceIntro({ service, ground }: { service: Service; ground: Ground }) {
  const { paragraph, capabilities } = service.intro;
  const { pillars } = service;

  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className="container">
        <div className={styles.column}>
          <p className={styles.paragraph}>{paragraph}</p>

          <ul className={styles.capabilities}>
            {capabilities.map((item) => (
              <li className={styles.capability} key={item}>
                <span className={styles.plus} aria-hidden="true">
                  +
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {pillars ? (
          <>
            <span className={styles.rule} aria-hidden="true" />

            <ul className={styles.pillars}>
              {pillars.map((pillar) => {
                const Glyph = serviceIcons[pillar.icon];

                return (
                  <li className={styles.pillar} key={pillar.title}>
                    <Glyph className={styles.icon} />
                    <h3 className={styles.title}>{pillar.title}:</h3>
                    <p className={styles.body}>{pillar.body}</p>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </div>
    </section>
  );
}
