'use client';

import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import Image from 'next/image';
import type { Service } from '@/lib/services';
import { CheckIcon } from '@/components/ui/icons';
import ScrollReveal from '@/components/ui/ScrollReveal';
import useScrollProgress from '@/components/ui/useScrollProgress';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceWhatWeDo.module.css';

/**
 * Where the section is driven by scroll rather than by clicks: a viewport wide enough that
 * the picture and the card sit side by side under the sticky header, for people who have
 * not asked for less motion. The stylesheet gates the pin's geometry on the same query, so
 * the page is laid out for it before hydration and nothing moves when the driver starts.
 * Under it the section is the plain click-tab version: on a phone the stacked slide is
 * taller than the screen, and a pinned block taller than the screen is a trap.
 */
const SCRUB_QUERY = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';

/**
 * How much of each slide's third of the range the glide to the next slide occupies, at
 * the end of it: 0.3 means the track holds on a slide for the first seven tenths of its
 * third, while that tab fills, and glides across during the last three — landing on the
 * next slide exactly as its tab starts to fill.
 */
const GLIDE = 0.3;

/** The smoothing on the scroll value, in milliseconds; see `useScrollProgress`. */
const DAMPING = 110;

type Mode = 'click' | 'scrub';

const clamp = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);
const smooth = (x: number) => x * x * (3 - 2 * x);

/**
 * Frame 5: what we do, as beclix.webflow.io/about draws it — a centred eyebrow and
 * heading, a centred row of three content-width tabs with the label left and "01." right,
 * and under them a slide: the picture at half the width, the off-white card beside it with
 * a heading, a line, four check-marked points two by two, and the black pill.
 *
 * On a wide viewport the tabs and the slides pin under the header while the page scrolls
 * through a range under them: the heading scrolls away above, and the block holds while
 * its scroll progress walks the slides. Each slide owns a third of the range. Its tab's
 * yellow fills from left to right across that third, tabs already passed stay full, and
 * in the last three tenths of the third the track glides one slide to the left — the
 * picture leaving on the left as the next arrives from the right, the neighbours' edges
 * showing past the container on the way. Every value is derived from where the page is,
 * so scrolling back up runs it all in reverse, and the value is smoothed before it is
 * painted so a mouse wheel's steps arrive as a glide. Transform only, written straight to
 * the nodes by the shared scroll-progress hook, which also parks itself while the section
 * is off screen. Clicking a tab scrolls the page to that slide's place in the range, so
 * what the click shows and what the scroll shows can never disagree.
 *
 * Everywhere else — phones, tablets, anyone asking for less motion — it is a plain tab
 * set: a click glides the track to that slide, or cuts to it when motion is reduced, and
 * the tabs up to it fill.
 *
 * A real tab list: `role="tab"` with `aria-selected`, one tab in the tab order at a time,
 * the arrow keys, Home and End moving between them. Slides other than the current one
 * are inert and hidden from assistive technology.
 */
export default function ServiceWhatWeDo({
  block,
  ground,
}: {
  block: NonNullable<Service['whatWeDo']>;
  ground: Ground;
}) {
  const count = block.tabs.length;
  const [active, setActive] = useState(0);
  const [mode, setMode] = useState<Mode>('click');
  const baseId = useId();

  const pinRef = useRef<HTMLDivElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const fillRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const activeRef = useRef(0);
  const gapRef = useRef(24);

  /* Layout effect so the switch lands before the first paint after hydration. */
  useLayoutEffect(() => {
    const query = window.matchMedia(SCRUB_QUERY);
    const sync = () => setMode(query.matches ? 'scrub' : 'click');
    sync();
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);

  const { scrollTo } = useScrollProgress(pinRef, {
    enabled: mode === 'scrub',
    damping: DAMPING,
    measure: (pin) => {
      const stage = stageRef.current;
      const viewport = viewportRef.current;
      const top = stage ? parseFloat(getComputedStyle(stage).top) || 0 : 0;
      if (viewport) {
        gapRef.current =
          parseFloat(getComputedStyle(viewport).getPropertyValue('--slide-gap')) || 24;
      }
      return {
        start: pin.getBoundingClientRect().top + window.scrollY - top,
        length: Math.max(1, pin.offsetHeight - (stage?.offsetHeight ?? 0)),
      };
    },
    onProgress: (progress) => {
      const t = progress * count;
      const fills = fillRefs.current;
      for (let i = 0; i < count; i += 1) {
        const fill = fills[i];
        if (fill) fill.style.transform = `scaleX(${Math.round(clamp(t - i) * 1000) / 1000})`;
      }

      let position = 0;
      for (let i = 0; i < count - 1; i += 1) {
        position += smooth(clamp((t - i - (1 - GLIDE)) / GLIDE));
      }
      const track = trackRef.current;
      if (track) {
        const p = Math.round(position * 10000) / 10000;
        track.style.transform = `translateX(calc(${-p * 100}% - ${p * gapRef.current}px))`;
      }

      const nearest = Math.round(position);
      if (nearest !== activeRef.current) {
        activeRef.current = nearest;
        setActive(nearest);
      }
    },
  });

  /* Leaving scrub mode hands the nodes back to the stylesheet's click-tab version. */
  useLayoutEffect(() => {
    if (mode === 'scrub') return;
    trackRef.current?.style.removeProperty('transform');
    fillRefs.current.forEach((fill) => fill?.style.removeProperty('transform'));
  }, [mode]);

  /* In scrub mode a tab is chosen by scrolling the page to the resting part of that
     slide's third; the driver then shows it, gliding through the ones between on the way.
     Otherwise it is simply set. */
  const select = (index: number) => {
    if (mode === 'scrub') {
      scrollTo((index + (1 - GLIDE) / 2) / count);
      return;
    }
    activeRef.current = index;
    setActive(index);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = count - 1;
    let next: number | null = null;

    if (event.key === 'ArrowRight') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;

    if (next === null) return;
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
  };

  return (
    <section className={`${section.section} ${section[ground]} ${styles.section}`}>
      <div className="container">
        <div className={section.head}>
          <p className={section.eyebrow}>What we do</p>
          <ScrollReveal text={block.heading} className={section.heading} />
        </div>

        <div
          className={`${styles.pin} ${mode === 'scrub' ? styles.scrub : ''}`}
          style={{ '--slides': count } as CSSProperties}
          ref={pinRef}
        >
          <div className={styles.stage} ref={stageRef}>
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
                    onClick={() => select(index)}
                    onKeyDown={(event) => onKeyDown(event, index)}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                  >
                    <span
                      className={`${styles.fill} ${index <= active ? styles.fillDone : ''}`}
                      aria-hidden="true"
                      ref={(node) => {
                        fillRefs.current[index] = node;
                      }}
                    />
                    <span className={styles.tabLabel}>{tab.label}</span>
                    <span className={styles.tabNumber}>
                      {String(index + 1).padStart(2, '0')}.
                    </span>
                  </button>
                );
              })}
            </div>

            <div className={styles.viewport} ref={viewportRef}>
              <div
                className={styles.track}
                style={{ '--pos': active } as CSSProperties}
                ref={trackRef}
              >
                {block.tabs.map((tab, index) => {
                  const current = index === active;

                  return (
                    <div
                      role="tabpanel"
                      key={tab.label}
                      id={`${baseId}-panel-${index}`}
                      aria-labelledby={`${baseId}-tab-${index}`}
                      aria-hidden={current ? undefined : true}
                      inert={!current}
                      className={styles.slide}
                      tabIndex={current ? 0 : -1}
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
        </div>
      </div>
    </section>
  );
}
