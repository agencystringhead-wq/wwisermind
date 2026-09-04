import Image from 'next/image';
import Link from 'next/link';
import { relatedServices, serviceHref, type Service } from '@/lib/services';
import { ArrowRightIcon } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceRelated.module.css';

/**
 * Frame 12b: three sibling services as wide rows between hairlines — the list pattern the
 * page already uses for its capabilities and its accordions — rather than a third set of
 * cards. Each row is one link: the picture at the left, the category, the name and the
 * outcome line beside it, and the round arrow at the far right. The whole row is the
 * MediaHover frame, so pointing anywhere on it zooms the picture, runs the sweep across
 * it, and fills the arrow.
 *
 * A sibling with no picture yet draws the practice panels' gradient with its initial.
 */
export default function ServiceRelated({ service, ground }: { service: Service; ground: Ground }) {
  const related = relatedServices(service);
  if (related.length === 0) return null;

  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className="container">
        <p className={section.eyebrow}>Related services</p>
        <ScrollReveal
          text={`Often paired with the ${service.name}.`}
          className={styles.heading}
        />

        <ul className={styles.rows}>
          {related.map((item) => (
            <li key={item.slug}>
              <Link href={serviceHref(item.slug)} className={styles.row}>
                <span className={`${styles.tile} ${item.tileImage ? '' : styles.tileGradient}`}>
                  {item.tileImage ? (
                    <Image
                      src={item.tileImage.src}
                      alt=""
                      fill
                      sizes="(max-width: 1023px) 100vw, 280px"
                      style={{ objectPosition: item.tileImage.position }}
                    />
                  ) : (
                    <span className={styles.tileMark} aria-hidden="true">
                      {item.name.charAt(0)}
                    </span>
                  )}
                  <span className={styles.shine} aria-hidden="true" />
                </span>

                <span className={styles.copy}>
                  <span className={styles.category}>{item.category}</span>
                  <span className={styles.name}>{item.name}</span>
                  <span className={styles.body}>{item.heroOutcome}</span>
                </span>

                <span className={styles.arrow} aria-hidden="true">
                  <ArrowRightIcon />
                </span>
                <span className="sr-only">See the service</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
