'use client';

import { createElement, useEffect, useRef, type ReactNode } from 'react';

/**
 * A block whose descendants carry a continuous idle motion, run only while the block is
 * on screen. The component writes nothing but one attribute: `data-playing` while an
 * IntersectionObserver sees the block, removed when it leaves — and the calling
 * stylesheet keys its keyframes on that attribute, so an animation that nobody can see
 * never runs, and under reduced motion the stylesheet simply has no keyframes to key.
 */
export default function Float({
  as = 'div',
  className,
  children,
}: {
  as?: 'div' | 'ul' | 'li';
  className?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) node.setAttribute('data-playing', '');
      else node.removeAttribute('data-playing');
    });

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return createElement(as, { ref, className }, children);
}
