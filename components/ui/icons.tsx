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

/* --- the service pages ------------------------------------------------------ */

/** The check beside a claim, and the plus's opposite number in a pricing card. */
export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

/** The pillar and why-choose-us cards name one of these by string in lib/services.ts. */
export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3 4.5 6v5c0 4.6 3.2 8.4 7.5 10 4.3-1.6 7.5-5.4 7.5-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </Icon>
  );
}

export function BoltIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13 2 4 14h7l-1 8 9-12h-7z" />
    </Icon>
  );
}

export function PenIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
    </Icon>
  );
}

export function ClipboardIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" />
      <path d="M9 11h6M9 15h4" />
    </Icon>
  );
}

export function TargetIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </Icon>
  );
}

export function ChatIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M8 10h.01M12 10h.01M16 10h.01" strokeWidth={2.2} />
      <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.2A8 8 0 1 1 21 12z" />
    </Icon>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Icon>
  );
}

export function GlobeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </Icon>
  );
}

/** The star the hero banner's testimonial card draws, filled, at this set's box. */
export function StarIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 1.6l3.1 6.3 6.9 1-5 4.87 1.18 6.87L12 17.4l-6.18 3.24L7 13.77l-5-4.87 6.9-1L12 1.6z" />
    </svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19 12H5" />
      <path d="m11 18-6-6 6-6" />
    </Icon>
  );
}

/* The registry the service data indexes into. A name with no entry here is a type error. */
export const serviceIcons = {
  search: SearchIcon,
  calendar: CalendarIcon,
  shield: ShieldIcon,
  bolt: BoltIcon,
  pen: PenIcon,
  clipboard: ClipboardIcon,
  target: TargetIcon,
  chat: ChatIcon,
  clock: ClockIcon,
  globe: GlobeIcon,
  mail: MailIcon,
};

export type ServiceIconName = keyof typeof serviceIcons;

/** The filled up-arrow the homepage stats strip draws beside each figure — one path, drawn
    here so the case-study stat on a service page is the same mark and not a copy of it. */
export function TrendUpIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 22" fill="currentColor" aria-hidden="true">
      <path d="M12 1.4c.5 0 1 .3 1.2.8l8.6 16.4c.5.9-.5 1.9-1.4 1.5L12 16.6l-8.4 3.5c-.9.4-1.9-.6-1.4-1.5L10.8 2.2c.2-.5.7-.8 1.2-.8z" />
    </svg>
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
