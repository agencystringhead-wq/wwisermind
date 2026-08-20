'use client';

import { useEffect, useState } from 'react';
import styles from './Footer.module.css';

type Clock = {
  city: string;
  region: string;
  timeZone: string;
};

/* Intl formatters are the expensive part of this component — building one costs far more
   than the format call itself — so the four are constructed once at module scope and reused
   for every tick rather than rebuilt each second. `h23` keeps midnight as 00 rather than the
   24 some locales return under a plain `hour12: false`. */
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatterFor(timeZone: string) {
  let formatter = formatters.get(timeZone);

  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone,
      hourCycle: 'h23',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    formatters.set(timeZone, formatter);
  }

  return formatter;
}

/** Same shape as a real reading, so the layout does not jump when the first tick lands. */
const PLACEHOLDER = '--:--:--';

/**
 * The footer's world clock. Times are client-side and live: the server renders the dashed
 * placeholder — a static export has no idea what "now" is — and the first effect tick swaps
 * in real values, which keeps hydration deterministic.
 *
 * One timer drives all four zones, and it re-aims at the next whole second on every tick so
 * the display flips with the clock rather than drifting a little further past it each minute.
 * It is torn down while the tab is hidden, so a backgrounded page does no work at all.
 */
export default function FooterClocks({ clocks }: { clocks: Clock[] }) {
  const [times, setTimes] = useState<string[] | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const render = () => {
      const now = new Date();
      setTimes(clocks.map((clock) => formatterFor(clock.timeZone).format(now)));
      return now;
    };

    const schedule = (now: Date) => {
      /* aim at the next second boundary rather than a flat 1000ms from wherever we are */
      timer = setTimeout(() => schedule(render()), 1000 - (now.getTime() % 1000));
    };

    /* Paint once whatever the tab is doing — a page opened in a background tab must still
       show real times the moment it is looked at, not the dashed placeholder. Only the
       repeating timer is gated on visibility. */
    const start = () => {
      const now = render();
      if (document.visibilityState === 'visible') schedule(now);
    };

    const stop = () => {
      if (timer !== undefined) clearTimeout(timer);
      timer = undefined;
    };

    const onVisibility = () => {
      stop();
      start();
    };

    start();
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [clocks]);

  return (
    <div className={styles.clocks}>
      {clocks.map((clock, index) => (
        <div className={styles.clock} key={clock.timeZone}>
          {/* a span, not <time>: the placeholder is not a valid time value, and a bare
              wall-clock reading carries no date or offset for <time> to mean anything by */}
          <span className={styles.clockTime}>{times ? times[index] : PLACEHOLDER}</span>
          <span className={styles.clockCity}>{clock.city}</span>
          <span className={styles.clockRegion}>{clock.region}</span>
        </div>
      ))}
    </div>
  );
}
