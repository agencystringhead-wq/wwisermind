'use client';

import type { MouseEvent } from 'react';

/** "See all prices ↓": smooth-scrolls to a section (#packages by default), and jumps instead when the visitor has
    asked for reduced motion. The href stays a real anchor, so it works without script. */
export default function SeeAllPrices({
  className,
  label = 'See all prices',
  target: targetId = 'packages',
}: {
  className: string;
  /** The link's words; the arrow is added here. */
  label?: string;
  /** The id of the section to scroll to. */
  target?: string;
}) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById(targetId);
    if (!target) return;

    event.preventDefault();
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', `#${targetId}`);
  };

  return (
    <a href={`#${targetId}`} className={className} onClick={onClick}>
      {label} <span aria-hidden="true">↓</span>
    </a>
  );
}
