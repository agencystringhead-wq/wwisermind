'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type ReactNode } from 'react';
import CountUp from '@/components/ui/CountUp';
import { ArrowRightIcon } from '@/components/ui/icons';
import { US_PINS, US_VIEWBOX } from '@/lib/therapyindex/us-map';
import Ring from './Ring';
import styles from './markets.module.css';

/** Houston and Austin are close on the map, so their labels sit to opposite sides of the pins. */
const LABEL_SIDE: Record<string, 'left' | 'right'> = { houston: 'right', austin: 'left' };

export type MarketCardData = {
  slug: string;
  city: string;
  state: string;
  area: string;
  practices: number;
  leader: string;
  directoryShare: number;
  date: string;
  href: string;
};

/**
 * "Markets we've mapped": a clean US map with a pulsing pin on each city (sized by practice count) and one card per city beside it.
 * Hovering or focusing a pin lights its card and the other way round; a pin or a card opens the city report. On a touch screen the
 * first tap on a pin lights its card and the second opens the report. `children` is the static map artwork (a server component).
 */
export default function MarketsSection({ cities, children }: { cities: MarketCardData[]; children: ReactNode }) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);
  const most = Math.max(...cities.map((c) => c.practices), 1);

  const openPin = (slug: string, href: string) => {
    // Touch: the first tap only highlights the card, so the report is one deliberate tap away.
    if (window.matchMedia('(hover: none)').matches && active !== slug) {
      setActive(slug);
      return;
    }
    router.push(href);
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.mapSlot} data-reveal="1">
        <div className={styles.mapCard}>
          <svg className={styles.map} viewBox={US_VIEWBOX} role="group" aria-label="Map of the cities in the Therapy Index">
            {children}
            {cities.map((c) => {
              const [x, y] = US_PINS[c.slug] ?? [0, 0];
              const r = 7 + 9 * (c.practices / most);
              const isActive = active === c.slug;
              return (
                // A focusable group with a link role, not an SVG <a>: Cloudflare's email-decode script reads `href.indexOf` on every anchor
                // and throws on an SVG one.
                <g
                  key={c.slug}
                  role="link"
                  tabIndex={0}
                  aria-label={`${c.city}, ${c.practices} practices. Open the ${c.city} report`}
                  className={`${styles.pin} ${isActive ? styles.pinActive : ''}`}
                  onMouseEnter={() => setActive(c.slug)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(c.slug)}
                  onBlur={() => setActive(null)}
                  onClick={() => openPin(c.slug, c.href)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') router.push(c.href);
                  }}
                >
                  <circle className={styles.pinHit} cx={x} cy={y} r={Math.max(r, 26)} />
                  <circle className={styles.pinPulse} cx={x} cy={y} r={r} />
                  <circle className={styles.pinPulse2} cx={x} cy={y} r={r} />
                  <circle className={styles.pinGlow} cx={x} cy={y} r={r * 2.4} />
                  <circle className={styles.pinDot} cx={x} cy={y} r={r} />
                  {LABEL_SIDE[c.slug] ? (
                    <text className={styles.pinLabel} x={x + (LABEL_SIDE[c.slug] === 'right' ? r + 12 : -(r + 12))} y={y + 8} textAnchor={LABEL_SIDE[c.slug] === 'right' ? 'start' : 'end'}>
                      {c.city}
                    </text>
                  ) : (
                    <text className={styles.pinLabel} x={x} y={y - r - 12} textAnchor="middle">
                      {c.city}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      <div className={styles.cards}>
        {cities.map((c, i) => (
          <div key={c.slug} className={styles.cardSlot} data-reveal={i + 2}>
            <article
              className={`${styles.card} ${active === c.slug ? styles.cardActive : ''}`}
              onMouseEnter={() => setActive(c.slug)}
              onMouseLeave={() => setActive(null)}
            >
              <header className={styles.cardHead}>
                <div>
                  <h3 className={styles.city}>
                    {c.city}, {c.state}
                  </h3>
                  <p className={styles.area}>{c.area}</p>
                </div>
                <div className={styles.share}>
                  <Ring value={c.directoryShare} tone="coral" label={`Directories hold ${Math.round(c.directoryShare)}% of Google results`} />
                  <span className={styles.shareText}>
                    <b className={styles.shareNum}>{Math.round(c.directoryShare)}%</b>
                    <small>directories</small>
                  </span>
                </div>
              </header>
              <p className={styles.count}>
                <CountUp to={c.practices} commas className={styles.countNum} />
                <span> practices measured</span>
              </p>
              <dl className={styles.facts}>
                <div>
                  <dt>Index leader</dt>
                  <dd>{c.leader}</dd>
                </div>
                <div>
                  <dt>Data date</dt>
                  <dd>{c.date}</dd>
                </div>
              </dl>
              <Link href={c.href} prefetch={false} className={styles.link}>
                View the {c.city} report
                <ArrowRightIcon className={styles.arrow} />
              </Link>
            </article>
          </div>
        ))}
      </div>
    </div>
  );
}
