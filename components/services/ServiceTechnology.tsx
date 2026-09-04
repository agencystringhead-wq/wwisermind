import Image from 'next/image';
import { technologies, type Service } from '@/lib/services';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceTechnology.module.css';

/**
 * Frame 8: the technology, as the partnership reference — a centred eyebrow and heading,
 * then a grid of light bordered tiles with one mark centred in each. A tile whose entry
 * has no logo file yet prints the name instead, so the frame never waits on an asset;
 * every tile carries the tool's role for a screen reader and as its tooltip.
 */
export default function ServiceTechnology({
  block,
  ground,
}: {
  block: NonNullable<Service['technology']>;
  ground: Ground;
}) {
  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className="container">
        <div className={section.head}>
          <p className={section.eyebrow}>Technology</p>
          <ScrollReveal text={block.heading} className={section.heading} />
        </div>

        <ul className={styles.grid}>
          {block.items.map((id) => {
            const tech = technologies[id];

            return (
              <li className={styles.tile} key={id} title={tech.role}>
                {tech.logo ? (
                  <Image
                    src={tech.logo.src}
                    alt={tech.name}
                    width={tech.logo.width}
                    height={tech.logo.height}
                    className={styles.logo}
                  />
                ) : (
                  <span className={styles.name}>{tech.name}</span>
                )}
                <span className="sr-only">: {tech.role}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
