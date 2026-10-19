'use client';

import { useLayoutEffect, useRef } from 'react';

/** Starts a little before the block reaches the viewport, so the first frames are already
    decoded by the time it is actually looked at. */
const MARGIN = '10% 0px';

/** How far ahead of the viewport the file starts downloading: about a screen, so the clip is
    buffered by the time it is played but nothing below that is fetched with the page. */
const FETCH_MARGIN = '100% 0px';

/**
 * A decorative looping background video that only decodes while it is on screen.
 *
 * A clip near the top of the page (`preload="auto"`) carries `autoplay` so it still plays where
 * this effect never runs. Every other clip leaves it off: `autoplay` makes a browser fetch the
 * file whatever `preload` says, and ten clips downloading with the page is the cost this avoids.
 * Those are fetched when they come within a screen of the viewport and played once they are in
 * it.
 *
 * The effect's first job is to take autoplay back: under reduced motion it pauses immediately —
 * the poster is what stays on screen — and otherwise it hands playback to an observer, so a
 * video scrolled past is a paused video rather than one decoding into an empty room.
 *
 * A layout effect rather than an effect: `autoplay` does not begin until the media has
 * buffered, which is well after hydration, so pausing here reliably beats it to the first
 * frame and reduced motion never sees movement.
 */
export default function BackgroundVideo({
  src,
  type,
  sources = src && type ? [{ src, type }] : [],
  poster,
  className,
  label,
  preload = 'none',
}: {
  /** One clip, or `sources` for the list a section's data carries. */
  src?: string;
  type?: string;
  sources?: { src: string; type: string }[];
  poster: string;
  className?: string;
  /** Set where the clip says something; left off it is decoration and hidden from assistive tech. */
  label?: string;
  /** "auto" for a clip near the top of the page; below the fold the default holds off the
      download until the clip is about a screen away. */
  preload?: 'none' | 'metadata' | 'auto';
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useLayoutEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let observer: IntersectionObserver | null = null;
    let fetcher: IntersectionObserver | null = null;

    const apply = () => {
      observer?.disconnect();
      observer = null;
      fetcher?.disconnect();
      fetcher = null;

      if (reduced.matches) {
        video.pause();
        /* Back to the first frame as well: on a slow hydration autoplay can get a few frames
           in before this runs, and a clip stopped mid-loop is a different still from the
           poster. At zero it is the poster again. */
        video.currentTime = 0;
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

      /* `preload` starts at "none" so ten clips are not all fetched with the page; this
         raises it once the clip is a screen away, and the poster covers the gap. */
      if (video.preload !== 'auto') {
        fetcher = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            video.preload = 'auto';
            fetcher?.disconnect();
            fetcher = null;
          },
          { rootMargin: FETCH_MARGIN },
        );
        fetcher.observe(video);
      }
    };

    apply();
    reduced.addEventListener('change', apply);

    return () => {
      observer?.disconnect();
      fetcher?.disconnect();
      reduced.removeEventListener('change', apply);
    };
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      autoPlay={preload === 'auto'}
      muted
      loop
      playsInline
      preload={preload}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      tabIndex={-1}
    >
      {sources.map((source) => (
        <source key={source.src} src={source.src} type={source.type} />
      ))}
    </video>
  );
}
