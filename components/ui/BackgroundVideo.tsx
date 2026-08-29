'use client';

import { useLayoutEffect, useRef } from 'react';

/** Starts a little before the block reaches the viewport, so the first frames are already
    decoded by the time it is actually looked at. */
const MARGIN = '10% 0px';

/**
 * A decorative looping background video that only decodes while it is on screen.
 *
 * The element carries `autoplay` so it still plays where this effect never runs, and the
 * effect's first job is to take that back: under reduced motion it pauses immediately — the
 * poster is what stays on screen — and otherwise it hands playback to an observer, so a video
 * scrolled past is a paused video rather than one decoding into an empty room.
 *
 * A layout effect rather than an effect: `autoplay` does not begin until the media has
 * buffered, which is well after hydration, so pausing here reliably beats it to the first
 * frame and reduced motion never sees movement.
 */
export default function BackgroundVideo({
  src,
  type,
  poster,
  className,
}: {
  src: string;
  type: string;
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer: IntersectionObserver | null = null;

    const apply = () => {
      observer?.disconnect();
      observer = null;

      if (reduced.matches) {
        video.pause();
        return;
      }

      if (typeof IntersectionObserver === 'undefined') {
        /* No observer to lean on, so leave the element's own autoplay to it rather than
           pausing a video nothing would ever start again. */
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              /* Rejects when the browser declines to autoplay, which is not ours to fix —
                 the poster is already the right thing to be showing. */
              void video.play().catch(() => {});
            } else {
              video.pause();
            }
          }
        },
        { rootMargin: MARGIN },
      );
      observer.observe(video);
    };

    apply();
    reduced.addEventListener('change', apply);

    return () => {
      observer?.disconnect();
      reduced.removeEventListener('change', apply);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={src} type={type} />
    </video>
  );
}
