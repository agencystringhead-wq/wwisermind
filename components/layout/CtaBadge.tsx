'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Props = {
  lines: string[];
  href: string;
  className: string;
};

/* Semi-implicit Euler spring, integrated per frame: stiffness pulls the badge toward the
   cursor, damping bleeds off the velocity it builds. Swept rather than guessed — 0.15/0.75
   overshoots the cursor by 26% and rings for forty frames, which reads as wobble. This pair
   is effectively critically damped: it peaks at 100.1% of the distance and settles inside 1%
   in 20 frames, about a third of a second of trail at 60fps. */
const STIFFNESS = 0.1;
const DAMPING = 0.6;

/**
 * The cursor-following badge in the footer CTA. It binds to the section it is rendered in, so
 * the section stays a server component and only this piece ships JS.
 *
 * With the old buttons gone this is the section's only control, so it is a real link rather
 * than decoration. The spring writes `transform` straight to the node each frame instead of
 * going through state — a re-render per pointer move would be 60 renders a second for one
 * element. Idle, it falls back to the CSS resting place near the foot of the section, which
 * is what a keyboard user sees when they tab to it.
 */
export default function CtaBadge({ lines, href, className }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const badge = ref.current;
    const section = badge?.closest('section');
    if (!badge || !section) return;

    // Desktop behaviour only. A coarse pointer gets the static pill instead — there "cursor
    // position" would just be wherever the last tap landed.
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const eased = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const target = { x: 0, y: 0 };
    const at = { x: 0, y: 0 };
    const velocity = { x: 0, y: 0 };
    let frame = 0;
    let tracking = false;

    const draw = () => {
      badge.style.transform = `translate3d(${at.x}px, ${at.y}px, 0) translate(-50%, -50%)`;
    };

    const tick = () => {
      velocity.x = (velocity.x + (target.x - at.x) * STIFFNESS) * DAMPING;
      velocity.y = (velocity.y + (target.y - at.y) * STIFFNESS) * DAMPING;
      at.x += velocity.x;
      at.y += velocity.y;
      draw();
      frame = requestAnimationFrame(tick);
    };

    const move = (event: PointerEvent) => {
      const box = section.getBoundingClientRect();
      target.x = event.clientX - box.left;
      target.y = event.clientY - box.top;

      if (tracking) return;
      tracking = true;

      // Start where the cursor already is: springing in from the section's origin would send
      // the badge flying across the panel on entry.
      at.x = target.x;
      at.y = target.y;
      velocity.x = 0;
      velocity.y = 0;

      // The resting position lives in CSS as a percentage; zero it so the transform above is
      // measured from the section's own corner.
      badge.style.left = '0px';
      badge.style.top = '0px';
      draw();
      setVisible(true);
      if (eased) frame = requestAnimationFrame(tick);
    };

    // Without the spring the badge simply sits on the cursor, which is what someone asking
    // for reduced motion wants: it still appears and still follows, it just does not trail.
    const jump = () => {
      if (eased || !tracking) return;
      at.x = target.x;
      at.y = target.y;
      draw();
    };

    const follow = (event: PointerEvent) => {
      move(event);
      jump();
    };

    const leave = () => {
      tracking = false;
      cancelAnimationFrame(frame);
      setVisible(false);
      badge.style.removeProperty('transform');
      badge.style.removeProperty('left');
      badge.style.removeProperty('top');
    };

    section.addEventListener('pointermove', follow);
    section.addEventListener('pointerleave', leave);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener('pointermove', follow);
      section.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <Link
      ref={ref}
      href={href}
      className={className}
      data-visible={visible ? 'true' : 'false'}
    >
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </Link>
  );
}
