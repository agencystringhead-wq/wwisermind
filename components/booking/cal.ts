import { routes } from '@/lib/routes';
import { siteConfig } from '@/lib/site';

const { booking } = siteConfig;

/** The config Cal reads for both the popup and the inline calendar. */
export const calConfig = {
  layout: booking.layout,
  useSlotsViewOnSmallScreen: booking.useSlotsViewOnSmallScreen,
  forwardQueryParams: booking.forwardQueryParams,
} as const;

/** `data-cal-config` for the popup buttons, as the JSON string Cal parses. */
export const calConfigAttr = JSON.stringify(calConfig);

/** Both spellings a booking button's href takes in the data: the in-page anchor and the
    contact page's. Anything else is an ordinary link. */
export function isBookingHref(href: string) {
  return href === '#book-a-call' || href === '#book' || href === routes.contactBook;
}

/** Brand colours for Cal's `ui()`, read off the site's own CSS variables at run time so
    no second palette lives here. The embed is cross-origin, so it needs the values, not
    the variable names. */
function readBrandVars() {
  const css = getComputedStyle(document.documentElement);
  const get = (name: string) => css.getPropertyValue(name).trim();
  const vars = {
    'cal-brand': get('--color-brand'),
    'cal-text': get('--color-ink'),
    'cal-bg': get('--color-white'),
  };
  return { light: vars, dark: vars };
}

/* One `ui()` call per namespace for the life of the page. The promise is module-level, so a
   client-side route change that mounts another button or the calendar reuses it. */
let calApi: Promise<Awaited<ReturnType<typeof import('@calcom/embed-react').getCalApi>>> | null = null;

export function initCal() {
  if (!calApi) {
    calApi = import('@calcom/embed-react').then(async ({ getCalApi }) => {
      const cal = await getCalApi({ namespace: booking.namespace });
      cal('ui', {
        theme: 'light',
        cssVarsPerTheme: readBrandVars(),
        hideEventTypeDetails: booking.hideEventTypeDetails,
        layout: booking.layout,
      } as never);
      return cal;
    });
  }
  return calApi;
}

/** True once Cal's embed script has loaded and our namespace exists, i.e. a click will open
    the popup rather than need the href. */
export function calReady() {
  const cal = (window as unknown as { Cal?: { loaded?: boolean; ns?: Record<string, unknown> } }).Cal;
  return Boolean(cal?.loaded && cal.ns?.[booking.namespace]);
}

/** A small pill at the foot of the screen while the embed is fetched after a Book click, so the
    first click is acknowledged rather than silent. Built in the DOM, not React: the click
    handler has no component to render it from, and the pill outlives the button's re-renders.
    Returns the function that removes it. */
export function showCalLoading() {
  const pill = document.createElement('div');
  pill.setAttribute('role', 'status');
  pill.setAttribute('aria-live', 'polite');
  pill.textContent = 'Opening the booking calendar…';
  Object.assign(pill.style, {
    position: 'fixed',
    left: '50%',
    bottom: '24px',
    transform: 'translateX(-50%)',
    zIndex: '2147483000',
    padding: '10px 18px',
    borderRadius: '999px',
    background: 'var(--color-ink, #111)',
    color: 'var(--color-white, #fff)',
    font: '500 14px/1.2 var(--font-sans, system-ui, sans-serif)',
    boxShadow: '0 6px 24px rgba(0,0,0,.2)',
    pointerEvents: 'none',
  });
  document.body.appendChild(pill);
  return () => pill.remove();
}
