'use client';

import { useEffect, type AnchorHTMLAttributes } from 'react';
import { routes } from '@/lib/routes';
import { siteConfig } from '@/lib/site';
import { calConfigAttr, calReady, initCal } from './cal';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  /** Where it goes if the popup script never runs. */
  href?: string;
};

/**
 * Opens the Cal.com booking popup. It is a real link to /contact#book first: with no
 * JavaScript, or before Cal has loaded, it simply navigates to the calendar on the contact
 * page. The styling is whatever `className` brings, so every existing button keeps its look.
 */
export default function BookCallButton({ href = routes.contactBook, children, onClick, ...rest }: Props) {
  useEffect(() => {
    void initCal();
  }, []);

  const { namespace, calLink, origin } = siteConfig.booking;

  return (
    <a
      {...rest}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        /* Cal opens the popup from its own document listener but leaves the link's default
           alone, so hold the navigation back once the embed is ready. Before that, the click
           falls through to the href. */
        if (calReady()) event.preventDefault();
      }}
      data-cal-namespace={namespace}
      data-cal-link={calLink}
      data-cal-origin={origin}
      data-cal-config={calConfigAttr}
    >
      {children}
    </a>
  );
}
