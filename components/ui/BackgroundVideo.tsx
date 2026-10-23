'use client';

import { useLayoutEffect, useRef } from 'react';
import { preload as preloadResource } from 'react-dom';

/** Starts a little before the block reaches the viewport, so the first frames are already
    decoded by the time it is actually looked at. */
const MARGIN = '10% 0px';

/** How far ahead of the viewport the file starts downloading: about a screen, so the clip is
    buffered by the time it is played but nothing below that is fetched with the page. */
const FETCH_MARGIN = '100% 0px';

/** At and above this width the clip plays; below it the poster is all a visitor gets and the
    video file is never requested. Matches the site's 768px tablet breakpoint. */
const DESKTOP = '(min-width: 768px)';

/**
 * A decorative looping background video that only loads and decodes while it is wanted.
 *
 * The markup carries the poster and no `<source>`, so nothing is downloaded with the page and
 * the poster is what paints (and what a no-JavaScript visitor, a phone under 768px, and a
 * reduced-motion visitor keep). On a wider screen the effect adds the sources once the clip is
 * about a screen from the viewport — or, for a clip at the top of the page (`preload="auto"`),
 * once the page has finished loading — then plays it while it is on screen and pauses it
 * when it is scrolled past.
 *
 * A layout effect so the viewport width is known before the first paint.
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
  /** "auto" for a clip near the top of the page: its sources are added as soon as the page has
      loaded. Below the fold the default holds off until the clip is about a screen away. */
  preload?: 'none' | 'metadata' | 'auto';
}) {
  const ref = useRef<HTMLVideoElement>(null);

  /* A poster on a <video> is found late; a clip at the top of the page is the first paint, so
     its still is fetched as an image from the start of the HTML. */
  if (preload === 'auto') preloadResource(poster, { as: 'image', fetchPriority: 'high' });

  useLayoutEffect(() => {
    const video = ref.current;
    if (!video) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia(DESKTOP);
    let observer: IntersectionObserver | null = null;
    let fetcher: IntersectionObserver | null = null;
    let onLoad: (() => void) | null = null;
    let visible = false;
    let attached = false;

    const stop = () => {
      observer?.disconnect();
      observer = null;
      fetcher?.disconnect();
      fetcher = null;
      if (onLoad) window.removeEventListener('load', onLoad);
      onLoad = null;
    };

    const attach = () => {
      if (attached) return;
      attached = true;
      /* A development double-mount runs this twice; the sources go in once. */
      if (video.querySelector('source')) return;
      for (const source of sources) {
        const node = document.createElement('source');
        node.src = source.src;
        node.type = source.type;
        video.appendChild(node);
      }
      video.preload = 'auto';
      video.load();
      /* The observer only reports changes, so a clip already in view starts here. */
      if (visible) void video.play().catch(() => {});
    };

    const apply = () => {
      stop();
      if (reduced.matches || !wide.matches || typeof IntersectionObserver === 'undefined') {
        /* Poster only. A source added earlier (the window was widened, then narrowed) is
           stopped; the poster is what stays on screen. */
        video.pause();
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            visible = entry.isIntersecting;
            if (!attached) continue;
            /* Rejects when the browser declines to autoplay, which is not ours to fix —
               the poster is already the right thing to be showing. */
            if (visible) void video.play().catch(() => {});
            else video.pause();
          }
        },
        { rootMargin: MARGIN },
      );
      observer.observe(video);

      if (attached) return;
      if (preload === 'auto') {
        /* Off the critical path: the poster paints first, the file follows the page. */
        if (document.readyState === 'complete') attach();
        else {
          onLoad = attach;
          window.addEventListener('load', onLoad, { once: true });
        }
      } else {
        fetcher = new IntersectionObserver(
          (entries) => {
            if (!entries.some((entry) => entry.isIntersecting)) return;
            fetcher?.disconnect();
            fetcher = null;
            attach();
          },
          { rootMargin: FETCH_MARGIN },
        );
        fetcher.observe(video);
      }
    };

    apply();
    reduced.addEventListener('change', apply);
    wide.addEventListener('change', apply);

    return () => {
      stop();
      reduced.removeEventListener('change', apply);
      wide.removeEventListener('change', apply);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <video
      ref={ref}
      className={className}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-label={label}
      aria-hidden={label ? undefined : true}
      tabIndex={-1}
    />
  );
}
