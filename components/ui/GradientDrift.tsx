'use client';

import { useEffect, useRef } from 'react';

/** How far the gradients lean at the very edge of the section, in px. Small on purpose: the
    lean is meant to register as depth, not as something following the cursor. */
const REACH = 14;

/** Share of the remaining distance covered per frame. At 0.045 the gradients need roughly a
    second to arrive, so they read as trailing the pointer rather than tracking it. */
const EASE = 0.045;

/** Below this the lean has effectively arrived and the loop stops until the pointer moves
    again — an idle section should not be asking for frames. */
const SETTLED = 0.05;

const clamp = (value: number) => (value < -1 ? -1 : value > 1 ? 1 : value);

/**
 * Ambient motion for the section's decorative gradients.
 *
 * The drift itself is a CSS animation on the images; this only does the two things CSS
 * cannot. It parks that animation whenever the section is off-screen, and on a fine pointer
 * it leans the gradients a little toward the cursor by writing two custom properties on the
 * section — which the wrappers pick up, so nothing here touches a layout property and the
 * work per frame is two string writes.
 *
 * It renders nothing. The empty span exists only to find the section it was placed in, so the
 * section itself stays a server component and only this piece ships JS.
 */
export default function GradientDrift({ pausedClass }: { pausedClass: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = ref.current?.closest('section');
    if (!section) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    /* A coarse pointer gets the drift and nothing else — there "toward the cursor" would mean
       toward wherever the last tap happened to land. */
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)');

    let teardown: (() => void) | null = null;

    const start = () => {
      if (reduced.matches) return;

      const target = { x: 0, y: 0 };
      const at = { x: 0, y: 0 };
      let frame = 0;
      let running = false;
      let onScreen = false;

      const write = () => {
        section.style.setProperty('--blob-x', `${at.x.toFixed(2)}px`);
        section.style.setProperty('--blob-y', `${at.y.toFixed(2)}px`);
      };

      const tick = () => {
        at.x += (target.x - at.x) * EASE;
        at.y += (target.y - at.y) * EASE;
        write();

        if (Math.abs(target.x - at.x) < SETTLED && Math.abs(target.y - at.y) < SETTLED) {
          running = false;
          return;
        }
        frame = requestAnimationFrame(tick);
      };

      const run = () => {
        if (running || !onScreen) return;
        running = true;
        frame = requestAnimationFrame(tick);
      };

      const stop = () => {
        if (frame) cancelAnimationFrame(frame);
        frame = 0;
        running = false;
      };

      /* The listener only records where the pointer is; every write happens on the frame
         after, so a burst of pointer events still costs one update. */
      const onMove = (event: Event) => {
        const { clientX, clientY } = event as PointerEvent;
        const rect = section.getBoundingClientRect();
        target.x = clamp(((clientX - rect.left) / rect.width) * 2 - 1) * REACH;
        target.y = clamp(((clientY - rect.top) / rect.height) * 2 - 1) * REACH;
        run();
      };

      const onLeave = () => {
        target.x = 0;
        target.y = 0;
        run();
      };

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            onScreen = entry.isIntersecting;
            section.classList.toggle(pausedClass, !onScreen);
            if (onScreen) {
              run();
            } else {
              stop();
            }
          }
        },
        { rootMargin: '10% 0px' },
      );
      observer.observe(section);

      if (fine.matches) {
        section.addEventListener('pointermove', onMove, { passive: true });
        section.addEventListener('pointerleave', onLeave, { passive: true });
      }

      teardown = () => {
        stop();
        observer.disconnect();
        section.removeEventListener('pointermove', onMove);
        section.removeEventListener('pointerleave', onLeave);
        section.classList.remove(pausedClass);
        section.style.removeProperty('--blob-x');
        section.style.removeProperty('--blob-y');
      };
    };

    const restart = () => {
      teardown?.();
      teardown = null;
      start();
    };

    start();
    reduced.addEventListener('change', restart);

    return () => {
      teardown?.();
      reduced.removeEventListener('change', restart);
    };
  }, [pausedClass]);

  return <span ref={ref} hidden aria-hidden="true" />;
}
