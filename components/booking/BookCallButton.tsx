'use client';

import { type AnchorHTMLAttributes } from 'react';
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
 *
 * Cal's embed script is not loaded with the page. The first hover, focus or touch on any
 * booking button starts it, so by the time the click lands it is usually ready; a click that
 * beats it waits for the embed (up to LOAD_WAIT) and then opens the popup, and only falls
 * through to the contact page if Cal never reports in.
 */

/** How long a click that arrives before Cal is ready waits for it before navigating. */
const LOAD_WAIT = 3000;
export default function BookCallButton({
  href = routes.contactBook,
  children,
  onClick,
  onPointerEnter,
  onFocus,
  onTouchStart,
  ...rest
}: Props) {
  const { namespace, calLink, origin } = siteConfig.booking;

  return (
    <a
      {...rest}
      href={href}
      onPointerEnter={(event) => {
        onPointerEnter?.(event);
        void initCal();
      }}
      onFocus={(event) => {
        onFocus?.(event);
        void initCal();
      }}
      onTouchStart={(event) => {
        onTouchStart?.(event);
        void initCal();
      }}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        /* Cal opens the popup from its own document listener but leaves the link's default
           alone, so hold the navigation back once the embed is ready. */
        if (calReady()) {
          event.preventDefault();
          return;
        }
        /* Not ready: a modified click keeps its ordinary link meaning. Otherwise hold the
           navigation, wait for the embed, and replay the click so Cal's listener sees it. */
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
        const link = event.currentTarget;
        event.preventDefault();
        const timeout = new Promise<void>((resolve) => window.setTimeout(resolve, LOAD_WAIT));
        void Promise.race([initCal().then(() => undefined), timeout])
          .catch(() => undefined)
          .then(() => {
            if (calReady()) link.click();
            else window.location.assign(link.href);
          });
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
