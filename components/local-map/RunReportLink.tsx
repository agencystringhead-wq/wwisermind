'use client';

import type { AnchorHTMLAttributes, MouseEvent } from 'react';
import { SEARCH_FIELD_ID } from '@/lib/local-map-assessment';

/**
 * Every "run my report" button on the page. It is a real link to the hero's search field first, so it still works without
 * JavaScript; with it, the page scrolls to the field and puts the cursor in it.
 */
export default function RunReportLink({ children, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const field = document.getElementById(SEARCH_FIELD_ID);
    if (!field) return;
    event.preventDefault();
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    field.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    field.focus({ preventScroll: true });
  };
  return (
    <a {...rest} href={`#${SEARCH_FIELD_ID}`} onClick={go}>
      {children}
    </a>
  );
}
