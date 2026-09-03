/* The contact page's icons.
 *
 * There is no icon package in this project and adding one for a handful of glyphs would ship
 * a dependency to draw a few paths — so these are inline SVG, the same way the floating
 * contact bar's calendar and envelope and Founder's quote mark are drawn. Shapes follow
 * Lucide's geometry so they sit comfortably beside anything added later from that set.
 *
 * Every icon is the same 24x24 box, `fill: none`, and inherits `currentColor` — which is
 * what lets a tile recolour its glyph with one rule. The stroke is 1.5 with round caps and
 * joins on all of them, set once on the wrapper below rather than repeated per path, so the
 * weight cannot drift between them.
 */

type IconProps = { className?: string };

function Icon({ className, children }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

/* --- the connect cards ---------------------------------------------------- */

/** The same calendar the floating bar and the footer CTA carry, at this set's stroke. */
export function CalendarIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="16" rx="3" />
      <path d="M3 10h18M8 3v4M16 3v4" />
      <path d="M8 14.5h.01M12 14.5h.01M16 14.5h.01" strokeWidth={2.2} />
    </Icon>
  );
}

export function MessageIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 14.5a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      <path d="M8 8.5h8M8 12h5" />
    </Icon>
  );
}

/** The envelope the floating bar draws, at this set's stroke. */
export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="M4 8l7.1 4.8a1.6 1.6 0 0 0 1.8 0L20 8" />
    </Icon>
  );
}

export function TicketIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 9a2 2 0 0 0 0 6v3a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-3a2 2 0 0 0 0-6V6a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1z" />
      <path d="M13 5v2M13 11v2M13 17v2" />
    </Icon>
  );
}

/* --- links that leave the page ---------------------------------------------- */

/** The mark a tab or card carries when it opens somewhere else, as on the reference. */
export function ExternalLinkIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </Icon>
  );
}

/* The registry the page's config indexes into, so lib/site.ts can name an icon as a string
   and stay free of JSX. A name with no entry here is a type error, not a blank card. */
export const contactIcons = {
  calendar: CalendarIcon,
  message: MessageIcon,
  mail: MailIcon,
  ticket: TicketIcon,
};

export type ContactIconName = keyof typeof contactIcons;
