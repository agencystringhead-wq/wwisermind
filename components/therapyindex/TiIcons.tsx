import type { SVGProps } from 'react';

/* Small square-pixel icons in the accent colour, in the spirit of Oberon's. They are drawn here from plain
   rectangles; none of the template's artwork is used. Decorative: every one is aria-hidden. */

type Props = SVGProps<SVGSVGElement>;

const base = { viewBox: '0 0 44 44', fill: 'none', 'aria-hidden': true as const, focusable: false as const };

export function MapPackIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="6" width="9" height="9" fill="currentColor" />
      <rect x="18" y="6" width="9" height="9" fill="currentColor" opacity=".55" />
      <rect x="30" y="6" width="9" height="9" fill="currentColor" opacity=".3" />
      <rect x="6" y="18" width="33" height="2" fill="currentColor" opacity=".25" />
      <rect x="6" y="24" width="20" height="2" fill="currentColor" opacity=".25" />
      <rect x="6" y="30" width="26" height="2" fill="currentColor" opacity=".25" />
    </svg>
  );
}

export function RankIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="26" width="8" height="12" fill="currentColor" opacity=".4" />
      <rect x="18" y="14" width="8" height="24" fill="currentColor" />
      <rect x="30" y="20" width="8" height="18" fill="currentColor" opacity=".65" />
      <rect x="18" y="6" width="8" height="4" fill="currentColor" />
    </svg>
  );
}

export function ChatIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="8" width="26" height="18" fill="currentColor" opacity=".25" />
      <rect x="12" y="14" width="14" height="2" fill="currentColor" />
      <rect x="12" y="19" width="9" height="2" fill="currentColor" />
      <rect x="22" y="22" width="16" height="12" fill="currentColor" />
      <rect x="22" y="34" width="5" height="5" fill="currentColor" />
    </svg>
  );
}

export function StarIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="19" y="6" width="6" height="6" fill="currentColor" />
      <rect x="8" y="16" width="28" height="6" fill="currentColor" />
      <rect x="14" y="24" width="16" height="6" fill="currentColor" opacity=".65" />
      <rect x="10" y="32" width="8" height="6" fill="currentColor" opacity=".4" />
      <rect x="26" y="32" width="8" height="6" fill="currentColor" opacity=".4" />
    </svg>
  );
}

export function GaugeIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="28" width="32" height="3" fill="currentColor" opacity=".25" />
      <rect x="6" y="28" width="22" height="3" fill="currentColor" />
      <rect x="10" y="14" width="6" height="6" fill="currentColor" opacity=".4" />
      <rect x="19" y="10" width="6" height="6" fill="currentColor" opacity=".7" />
      <rect x="28" y="14" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

export function CollectIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="14" width="32" height="20" fill="currentColor" opacity=".2" />
      <rect x="6" y="14" width="32" height="3" fill="currentColor" />
      <rect x="19" y="21" width="6" height="6" fill="currentColor" />
    </svg>
  );
}

export function MeasureIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="30" width="32" height="3" fill="currentColor" opacity=".25" />
      {[8, 14, 20, 26, 32].map((x, i) => (
        <rect key={x} x={x} y={30 - (i + 1) * 4} width="3" height={(i + 1) * 4} fill="currentColor" opacity={0.35 + i * 0.16} />
      ))}
    </svg>
  );
}

export function ScoreIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="6" width="32" height="32" fill="currentColor" opacity=".18" />
      <rect x="10" y="10" width="24" height="24" fill="currentColor" opacity=".3" />
      <rect x="15" y="15" width="14" height="14" fill="currentColor" />
    </svg>
  );
}

export function PublishIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="8" y="8" width="28" height="28" fill="currentColor" opacity=".2" />
      <rect x="14" y="22" width="5" height="5" fill="currentColor" />
      <rect x="21" y="18" width="5" height="9" fill="currentColor" opacity=".75" />
      <rect x="28" y="12" width="5" height="15" fill="currentColor" opacity=".5" />
    </svg>
  );
}

export function GroupIcon(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="6" y="6" width="14" height="14" fill="currentColor" />
      <rect x="24" y="6" width="14" height="14" fill="currentColor" opacity=".45" />
      <rect x="6" y="24" width="14" height="14" fill="currentColor" opacity=".45" />
      <rect x="24" y="24" width="14" height="14" fill="currentColor" opacity=".2" />
    </svg>
  );
}
