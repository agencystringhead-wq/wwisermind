'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './hero.module.css';

const POSTER = '/images/therapyindex/hero-poster.webp';
const VIDEO = '/video/therapyindex/hero';

type NetworkInformation = { saveData?: boolean };

/**
 * The hero's looping visual. Nothing is requested until the page has painted and loaded: the server sends an empty, correctly sized box,
 * and this adds the <video> afterwards, so the headline stays the first and largest thing the page paints. The <video> carries no poster
 * attribute on purpose: a poster is a largest-contentful-paint candidate, and it would overtake the headline. It is hidden until its first
 * frame has loaded anyway, so a poster would never be seen; the poster file is used only where the video is not.
 *
 * It picks the 800px or the 1600px file by screen width and WebM or MP4 by support, plays only while it is on screen and the tab is visible,
 * and under reduced motion or Save-Data shows the poster frame and never fetches the video.
 */
export default function HeroVideo() {
  const box = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<'none' | 'video' | 'poster'>('none');
  const [ready, setReady] = useState(false);
  const video = useRef<HTMLVideoElement>(null);

  // 1. After the page has loaded and painted, decide what to show.
  useEffect(() => {
    let timer = 0;
    const start = () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const saveData = (navigator as Navigator & { connection?: NetworkInformation }).connection?.saveData === true;
      requestAnimationFrame(() => {
        timer = window.setTimeout(() => setMode(reduce || saveData ? 'poster' : 'video'), 0);
      });
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      window.clearTimeout(timer);
    };
  }, []);

  // 2. Point the video at the right file, and play it only while it can be seen.
  useEffect(() => {
    const node = video.current;
    if (mode !== 'video' || !node) return;
    const small = window.matchMedia('(max-width: 767px)').matches;
    const webm = node.canPlayType('video/webm; codecs="vp9"') !== '';
    node.src = `${VIDEO}-${small ? 'mobile' : 'desktop'}.${webm ? 'webm' : 'mp4'}`;
    node.load();

    let visible = true;
    const sync = () => {
      if (visible && !document.hidden) void node.play().catch(() => {});
      else node.pause();
    };
    const observer = new IntersectionObserver((entries) => {
      visible = entries[entries.length - 1].isIntersecting;
      sync();
    });
    if (box.current) observer.observe(box.current);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, [mode]);

  return (
    <div ref={box} className={`${styles.visual} ${ready ? styles.visualReady : ''}`} aria-hidden="true">
      {mode === 'video' ? (
        <video
          ref={video}
          className={styles.media}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          disablePictureInPicture
          onLoadedData={() => setReady(true)}
        />
      ) : null}
      {mode === 'poster' ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img className={styles.media} src={POSTER} alt="" width={1600} height={900} decoding="async" onLoad={() => setReady(true)} />
      ) : null}
    </div>
  );
}
