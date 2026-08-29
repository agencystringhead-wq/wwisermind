'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';

const DURATION = 1200;

/** How much of the card has to be on screen before the count starts. Low enough that the
    number is never already read by the time it runs, high enough that it does not fire on
    the one-pixel sliver that crosses the fold first. */
const THRESHOLD = 0.4;

/** Cubic ease-out: most of the distance is covered early and the last few numbers crawl in,
    which is what makes it read as landing on a figure rather than stopping at one. */
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/**
 * A number that counts up to its value the first time it is scrolled into view.
 *
 * The final value is what renders on the server and what stays there if nothing here runs,
 * so the figure is correct without JavaScript, before hydration, and in any browser whose
 * observers never fire — the zero is written only once an observer has actually reported
 * back. Frames write `textContent` directly rather than going through state: the component
 * renders once, and the 70-odd frames after that are a single DOM write each.
 *
 * It runs once. The observer disconnects on the first intersection, so scrolling back up and
 * down again does not replay it.
 */
export default function CountUp({
  to,
  duration = DURATION,
  className,
}: {
  to: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    /* Motion off: the server already rendered the final value, so there is nothing to do —
       no zero is ever written and no observer is attached. */
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (typeof IntersectionObserver === 'undefined') return;

    let frame = 0;
    let startedAt = 0;
    let primed = false;

    const step = (now: number) => {
      if (!startedAt) startedAt = now;
      const t = Math.min(1, (now - startedAt) / duration);
      node.textContent = String(Math.round(easeOut(t) * to));
      if (t < 1) frame = requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          /* The first callback of any kind — intersecting or not — is what proves the
             observer is alive, and that is the moment to drop to zero rather than the effect
             body. For anything below the fold it lands long before the card is looked at, and
             where observers never run at all the figure is simply left at its rendered value
             instead of being stranded at nought. */
          if (!primed) {
            primed = true;
            node.textContent = '0';
          }
          if (!entry.isIntersecting) continue;
          observer.disconnect();
          frame = requestAnimationFrame(step);
        }
      },
      { threshold: THRESHOLD },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
      node.textContent = String(to);
    };
  }, [to, duration]);

  return (
    <span
      className={className}
      ref={ref}
      /* The widest string the count passes through is the final value, so that is what the
         box has to hold: reserve fewer digits and whatever follows the number walks left and
         right as it counts, reserve more and a short number ends up sitting in a gap. The
         width itself belongs to the caller's stylesheet — this only says how many. */
      style={{ '--digits': String(Math.trunc(Math.abs(to))).length } as CSSProperties}
    >
      {to}
    </span>
  );
}
