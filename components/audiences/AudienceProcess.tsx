'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import type { Audience } from '@/lib/audiences';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import shared from './Audience.module.css';
import styles from './AudienceProcess.module.css';

const MOTION_QUERY = '(prefers-reduced-motion: no-preference)';

/** The graphic in the left column. A 512px square with transparency, drawn at 75% of
    its card as the reference draws its own. */
const GRAPHIC = { src: '/images/process-isometric.webp', width: 512, height: 512 };

/**
 * Frame 8: the process, as the reference site's "our process" block — the mono eyebrow
 * and the heading top left; under them the graphic in an outlined card on the left and
 * the four steps on the right, each a rounded row with its "// 01" number and title;
 * the open row filled a shade lighter with its paragraph under the title, the others
 * collapsed to the title; the mono note and the button along the foot.
 *
 * The interaction is the reference's: resting the pointer on a row opens it and closes
 * the one that was open, the rows below sliding down or up as the open one grows or
 * shrinks, and the one-word tag at its right fades in; a click or a keypress does the
 * same, for touch and keyboard. The last row
 * opened stays open when the pointer leaves — nothing reverts and nothing advances on
 * its own; the reference does neither.
 *
 * The open and close is a `grid-template-rows` transition on the panel — a layout
 * animation, deliberately: the rows beneath have to move in the flow, and a transform
 * cannot push a sibling. It is the one place on these pages that animates a box rather
 * than a transform, as it is on the reference. The entrance is the shared reveal:
 * heading, then the graphic, then the rows one after another, then the foot. Under
 * reduced motion every row is drawn open, the stylesheet forces the panels open before
 * hydration, and nothing transitions.
 */
export default function AudienceProcess({ audience }: { audience: Audience }) {
  const { heading, rows, note, cta } = audience.process;
  const [active, setActive] = useState(0);
  const [motion, setMotion] = useState(false);
  const baseId = useId();

  useEffect(() => {
    const query = window.matchMedia(MOTION_QUERY);
    const sync = () => setMotion(query.matches);
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  return (
    <section className={`${shared.section} ${shared.dark}`}>
      <div className="container">
        <Reveal as="header">
          <p className={shared.eyebrowOnDark} data-reveal="0">
            Our process
          </p>
          <div className={styles.headline} data-reveal="0">
            <ScrollReveal
              text={heading}
              className={`${shared.title} ${shared.onDark} ${styles.heading}`}
            />
          </div>
        </Reveal>

        <div className={styles.grid}>
          <Reveal as="figure" className={styles.graphic}>
            <div className={styles.graphicInner} data-reveal="0">
              <Image
                src={GRAPHIC.src}
                alt=""
                width={GRAPHIC.width}
                height={GRAPHIC.height}
                sizes="(max-width: 640px) 60vw, 280px"
                className={styles.graphicImage}
              />
            </div>
          </Reveal>

          <Reveal as="ul" className={styles.rows}>
            {rows.map((row, index) => {
              /* Under reduced motion every row is open, so the markup says so. */
              const open = motion ? active === index : true;
              const panelId = `${baseId}-panel-${index}`;
              const buttonId = `${baseId}-button-${index}`;

              return (
                <li
                  className={`${styles.row} ${open ? styles.rowOpen : ''}`}
                  key={row.title}
                  data-reveal={index + 1}
                  onMouseEnter={() => setActive(index)}
                >
                  <h3 className={styles.rowHeading}>
                    <button
                      type="button"
                      id={buttonId}
                      className={styles.trigger}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setActive(index)}
                      onFocus={() => setActive(index)}
                    >
                      <span className={styles.number}>{`// ${String(index + 1).padStart(2, '0')}`}</span>
                      <span className={styles.title}>{row.title}</span>
                      {/* The reference's one-word pill, shown on the open row only. */}
                      <span className={styles.tag}>{row.tag}</span>
                    </button>
                  </h3>

                  <div
                    className={styles.panel}
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    aria-hidden={!open}
                  >
                    <div className={styles.panelInner}>
                      <p className={styles.body}>{row.body}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </Reveal>
        </div>

        <Reveal className={styles.foot}>
          <p className={styles.note} data-reveal="0">
            {note}
          </p>
          <a href={cta.href} className={styles.button} data-reveal="0">
            {cta.label}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
