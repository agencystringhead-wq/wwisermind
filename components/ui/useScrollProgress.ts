'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';

/** A scroll range in page pixels: `start` is the `scrollY` at which progress is 0, and
    `length` how far the page scrolls before it reaches 1. */
export type ScrollRange = { start: number; length: number };

export type ScrollProgressOptions = {
  /** Off, the hook listens to nothing and paints nothing; the caller's stylesheet decides
      what the element looks like. */
  enabled?: boolean;
  /** Measures the range. Called on mount, whenever the element resizes, on window resize
      and once the webfonts have landed — never from the scroll handler, so it may read
      layout freely. */
  measure: (element: HTMLElement) => ScrollRange;
  /** Smoothing, as a time constant in milliseconds: the painted value closes about
      two thirds of its distance to the real one every `damping` ms, so a mouse wheel's
      steps arrive as a glide. 0 paints the raw value. */
  damping?: number;
  /** Receives the (smoothed) progress, 0 to 1, once per frame while it is changing. */
  onProgress: (progress: number) => void;
};

const clamp = (value: number) => (value < 0 ? 0 : value > 1 ? 1 : value);

/**
 * The progress of an element's scroll range, as a number from 0 to 1 handed to a callback
 * once per animation frame — the shared driver for anything on the site that moves with
 * the page rather than with time.
 *
 * The scroll handler reads `scrollY` and nothing else: the range is measured up front and
 * re-measured only when something resizes, so a scroll never forces layout. Progress is
 * derived from where the page *is*, never accumulated, so scrolling back runs it back. An
 * IntersectionObserver keeps the handler detached while the element is off screen, with
 * one un-smoothed paint on the way out so a jump straight past it still lands at 0 or 1.
 *
 * Returns `scrollTo(progress)`, which scrolls the page to the position where the range
 * reads that progress — the way a control that jumps to a state keeps the scroll agreeing
 * with it.
 */
export default function useScrollProgress(
  ref: RefObject<HTMLElement | null>,
  options: ScrollProgressOptions,
) {
  const latest = useRef(options);
  latest.current = options;
  const rangeRef = useRef<ScrollRange>({ start: 0, length: 1 });
  const enabled = options.enabled !== false;

  useEffect(() => {
    const element = ref.current;
    if (!enabled || !element) return;

    let target = 0;
    let value = -1;
    let frame = 0;
    let lastTime = 0;
    let listening = false;

    const retarget = () => {
      const { start, length } = rangeRef.current;
      target = clamp((window.scrollY - start) / Math.max(1, length));
    };

    const measure = () => {
      rangeRef.current = latest.current.measure(element);
      retarget();
    };

    const paint = (next: number) => {
      if (next === value) return;
      value = next;
      latest.current.onProgress(next);
    };

    const tick = (now: number) => {
      frame = 0;
      const damping = latest.current.damping ?? 0;
      const dt = lastTime ? Math.min(64, now - lastTime) : 16;
      lastTime = now;

      if (damping <= 0 || value < 0) {
        paint(target);
        lastTime = 0;
        return;
      }

      const k = 1 - Math.exp(-dt / damping);
      let next = value + (target - value) * k;
      if (Math.abs(target - next) < 0.0005) next = target;
      paint(next);

      if (next !== target) frame = requestAnimationFrame(tick);
      else lastTime = 0;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };

    const onScroll = () => {
      retarget();
      schedule();
    };

    /* Straight to the real value, no smoothing: used when the element leaves the screen. */
    const settle = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      retarget();
      paint(target);
    };

    const listen = () => {
      if (listening) return;
      listening = true;
      window.addEventListener('scroll', onScroll, { passive: true });
    };
    const unlisten = () => {
      if (!listening) return;
      listening = false;
      window.removeEventListener('scroll', onScroll);
    };

    const visibility = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        listen();
        onScroll();
      } else {
        unlisten();
        settle();
      }
    });

    const onResize = () => {
      measure();
      schedule();
    };
    const sizes = new ResizeObserver(onResize);

    measure();
    paint(target);
    visibility.observe(element);
    sizes.observe(element);
    window.addEventListener('resize', onResize, { passive: true });
    document.fonts?.ready.then(onResize).catch(() => {});

    return () => {
      unlisten();
      if (frame) cancelAnimationFrame(frame);
      visibility.disconnect();
      sizes.disconnect();
      window.removeEventListener('resize', onResize);
    };
  }, [ref, enabled]);

  return useMemo(
    () => ({
      scrollTo: (progress: number, behavior: ScrollBehavior = 'smooth') => {
        const { start, length } = rangeRef.current;
        window.scrollTo({ top: start + clamp(progress) * length, behavior });
      },
    }),
    [],
  );
}
