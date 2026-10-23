import { routes } from '@/lib/routes';
import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { caseStudies, type Service } from '@/lib/services';
import { TrendUpIcon } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceProjects.module.css';

/**
 * Frame 9: completed projects, as the case-study reference — a wide landscape with the
 * words over its top left, a mono eyebrow and a large heading, on a dark wash for the
 * contrast, and the project's figures along the foot.
 *
 * The panels are a stack on a stage that pins under the header while the page scrolls a
 * fixed distance beneath it (`--pin-distance`). The scroll through that distance is the
 * section's clock, in three phases that never overlap: the first panel settles into
 * place, holds — still and whole — while the reader keeps scrolling, and then the next
 * panel rises over it from below and settles in its place, the covered one easing back
 * as it is covered. The phases are CSS scroll-driven animations on the pin's own timeline
 * (ServiceProjects.module.css), so scrolling back up runs them in reverse and no script
 * runs: a panel only carries its place in the stack, `--i`, and the pin how many rise, `--m`.
 *
 * Under reduced motion, or in a browser without scroll timelines, the stage is not sticky
 * and the range has no length: two panels, one under the other, at rest.
 */
export default function ServiceProjects({
  block,
  ground,
}: {
  block: NonNullable<Service['projects']>;
  ground: Ground;
}) {
  const studies = block.caseStudySlugs.map((slug) => caseStudies[slug]);
  const count = studies.length;

  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className="container">
        <div className={section.head}>
          <p className={section.eyebrow}>Completed projects</p>
          <ScrollReveal text={block.heading} className={section.heading} />
          <p className={section.lede}>{block.subheading}</p>
        </div>

        <div className={styles.pin} style={{ '--m': Math.max(count - 1, 1) } as CSSProperties}>
          <div className={styles.stage}>
            {studies.map((study, index) => {
              const image = study.wide ?? {
                src: study.project.image,
                alt: `${study.name} website`,
              };

              return (
                <article
                  className={`${styles.panel} ${index === 0 ? styles.first : styles.next} ${index > 0 && index === count - 1 ? styles.last : ''}`}
                  style={{ '--i': index } as CSSProperties}
                  key={study.slug}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1340px) 100vw, 1300px"
                    className={styles.image}
                    style={{ objectPosition: image.position }}
                  />
                  <span className={styles.wash} aria-hidden="true" />

                  <div className={styles.copy}>
                    <p className={styles.eyebrow}>{study.name}</p>
                    <h3 className={styles.heading}>{study.headline}</h3>
                  </div>

                  <div className={styles.foot}>
                    <ul className={styles.stats}>
                      {study.project.stats.map((stat) => (
                        <li className={styles.stat} key={stat.label}>
                          <span className={styles.statValue}>
                            <TrendUpIcon className={styles.arrow} />
                            {stat.value}
                          </span>
                          <span className={styles.statLabel}>{stat.label}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href={`${routes.home}${study.project.href}`} className={styles.link}>
                      See the project
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
