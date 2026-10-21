'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useId, useRef, useState, type KeyboardEvent } from 'react';
import ti from './ti.module.css';
import styles from './hub.module.css';

export type CityCase = {
  slug: string;
  name: string;
  href: string;
  /** The line under the city name in the rail. */
  intro: string;
  problem: string;
  found: string;
  figure: string;
  figureNote: string;
  meta: string;
  /** The generated panel image for the city. */
  image: string;
};

/**
 * The tabbed case-study component (Oberon section 05): one tab per city, and under the panel the three rows
 * "problem >", "what we found >" and "result >". Every sentence in it is built from the city's snapshot by
 * the page that renders this.
 *
 * All panels are in the markup and the inactive ones are `hidden`, so the content is there without
 * JavaScript. Arrow keys, Home and End move between tabs.
 */
export default function CityTabs({ cities }: { cities: CityCase[] }) {
  const [active, setActive] = useState(0);
  const baseId = useId();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = cities.length - 1;
    let next: number | null = null;
    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === null) return;
    event.preventDefault();
    setActive(next);
    tabs.current[next]?.focus();
  };

  return (
    <div>
      <div className={styles.tabs} role="tablist" aria-label="Cities">
        {cities.map((city, index) => (
          <button
            key={city.slug}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={active === index}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={active === index ? 0 : -1}
            className={`${styles.tab} ${active === index ? styles.tabActive : ''}`}
            onClick={() => setActive(index)}
            onKeyDown={(event) => onKeyDown(event, index)}
            ref={(node) => {
              tabs.current[index] = node;
            }}
          >
            {city.name}
          </button>
        ))}
      </div>

      {cities.map((city, index) => (
        <div
          key={city.slug}
          role="tabpanel"
          id={`${baseId}-panel-${index}`}
          aria-labelledby={`${baseId}-tab-${index}`}
          hidden={active !== index}
        >
          <div className={ti.split}>
            <div className={`${ti.rail} ${styles.caseRail}`}>
              <h3>{city.name}</h3>
              <p>{city.intro}</p>
            </div>
            <div className={ti.main}>
              <div className={styles.casePanel}>
                <Image src={city.image} alt="" fill sizes="(max-width: 900px) 100vw, 920px" className={styles.casePanelImage} />
                <div className={styles.casePanelInner} aria-hidden="true">
                  <span className={styles.casePanelCity}>{city.name}</span>
                  <span>{city.meta}</span>
                </div>
              </div>
            </div>
          </div>

          <div className={ti.split}>
            <div />
            <div className={styles.caseRows}>
              <div className={styles.caseRow}>
                <span className={styles.caseRowLabel}>problem &gt;</span>
                <p className={styles.caseRowText}>{city.problem}</p>
              </div>
              <div className={styles.caseRow}>
                <span className={styles.caseRowLabel}>what we found &gt;</span>
                <p className={styles.caseRowText}>{city.found}</p>
              </div>
              <div className={`${styles.caseRow} ${styles.caseRowResult}`}>
                <span className={styles.caseRowLabel}>result &gt;</span>
                <span className={styles.caseFigure}>{city.figure}</span>
                <p className={styles.caseRowText}>{city.figureNote}</p>
              </div>
              <div className={`${styles.caseRow} ${styles.caseCta}`}>
                <Link href={city.href} className={`${ti.btn} ${ti.btnAccent}`}>
                  See the {city.name} report
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
