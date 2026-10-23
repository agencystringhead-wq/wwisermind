'use client';

import { type AnchorHTMLAttributes } from 'react';
import { routes } from '@/lib/routes';
import { siteConfig } from '@/lib/site';
import { calConfig, calConfigAttr, calReady, initCal, showCalLoading } from './cal';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  /** Where it goes if the popup script never runs. */
  href?: string;
};

/**
 * Opens the Cal.com booking popup. It is a real link to /contact#book first: with no
 * JavaScript, or before Cal has loaded, it simply navigates to the calendar on the contact
 * page. The styling is whatever `className` brings, so every existing button keeps its look.
 *
 * Cal's embed script is not loaded with the page, and not on hover either: the first click on
 * any booking button starts it. That click is held, a small "Opening…" pill shows while the
 * embed arrives (up to LOAD_WAIT), and the popup then opens. Only if Cal never reports in does
 * the click fall through to the contact page.
 */

/** How long a click that arrives before Cal is ready waits for it before navigating. */
const LOAD_WAIT = 6000;
export default function BookCallButton({
  href = routes.contactBook,
  children,
  onClick,
  ...rest
}: Props) {
  const { namespace, calLink, origin } = siteConfig.booking;

  return (
    <a
      {...rest}
      href={href}
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
        const hideLoading = showCalLoading();
        void Promise.race([initCal().then(() => undefined), timeout])
          .catch(() => undefined)
          .then(() => {
            hideLoading();
            if (calReady()) {
              /* Cal's document click listener may not be bound the instant the script reports
                 in, so a replayed click can land on nothing; ask for the popup directly. */
              void initCal().then((cal) =>
                cal('modal', { calLink, calOrigin: origin, config: calConfig } as never),
              );
            } else window.location.assign(link.href);
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
