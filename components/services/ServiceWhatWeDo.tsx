'use client';

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import Image from 'next/image';
import type { Service } from '@/lib/services';
import { CheckIcon } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceWhatWeDo.module.css';

/**
 * Frame 5: what we do, as beclix.webflow.io/about draws it — a centred eyebrow and
 * heading, a centred row of three content-width tabs with the label left and "01." right,
 * the current one filled by a yellow that wipes in from the left, and under them the panel:
 * the picture at half the width, the off-white card beside it with a heading, a line, four
 * check-marked points two by two, and the black pill.
 *
 * The panels sit side by side on a track that slides one panel-width per tab, so a switch
 * reads as the reference's horizontal move rather than a cut. The track is as tall as the
 * tallest panel from the first paint, so nothing under it moves. Panels not in view are
 * hidden with `visibility` once the slide lands, which keeps them out of the tab order and
 * the accessibility tree; transform only, so the slide composites.
 *
 * A real tab list: `role="tab"` with `aria-selected`, one tab in the tab order at a time,
 * the arrow keys, Home and End moving between them.
 */
export default function ServiceWhatWeDo({
  block,
  ground,
}: {
  block: NonNullable<Service['whatWeDo']>;
  ground: Ground;
}) {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = block.tabs.length - 1;
    let next: number | null = null;

    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;

    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className="container">
        <div className={section.head}>
          <p className={section.eyebrow}>What we do</p>
          <ScrollReveal text={block.heading} className={section.heading} />
        </div>

        <div className={styles.tabs} role="tablist" aria-label={block.heading}>
          {block.tabs.map((tab, index) => {
            const selected = index === active;

            return (
              <button
                type="button"
                role="tab"
                key={tab.label}
                id={`${baseId}-tab-${index}`}
                className={`${styles.tab} ${selected ? styles.tabSelected : ''}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${index}`}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
              >
                <span className={styles.fill} aria-hidden="true" />
                <span className={styles.tabLabel}>{tab.label}</span>
                <span className={styles.tabNumber}>{String(index + 1).padStart(2, '0')}.</span>
              </button>
            );
          })}
        </div>

        <div className={styles.viewport}>
          <div
            className={styles.track}
            style={{ '--active': active } as CSSProperties}
          >
            {block.tabs.map((tab, index) => {
              const selected = index === active;

              return (
                <div
                  role="tabpanel"
                  key={tab.label}
                  id={`${baseId}-panel-${index}`}
                  aria-labelledby={`${baseId}-tab-${index}`}
                  className={`${styles.panel} ${selected ? styles.panelSelected : ''}`}
                  tabIndex={selected ? 0 : -1}
                >
                  <figure className={styles.figure}>
                    <Image
                      src={tab.image.src}
                      alt={tab.image.alt}
                      fill
                      sizes="(max-width: 1023px) 100vw, 640px"
                      style={{ objectPosition: tab.image.position }}
                    />
                    <span className={styles.shine} aria-hidden="true" />
                  </figure>

                  <div className={styles.card}>
                    <h3 className={styles.heading}>{tab.heading}</h3>
                    <p className={styles.paragraph}>{tab.paragraph}</p>

                    <ul className={styles.points}>
                      {tab.claims.map((claim) => (
                        <li className={styles.point} key={claim}>
                          <span className={styles.check}>
                            <CheckIcon />
                          </span>
                          {claim}
                        </li>
                      ))}
                    </ul>

                    {tab.cta ? (
                      <a href={tab.cta.href} className={styles.button}>
                        {tab.cta.label}
                      </a>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
