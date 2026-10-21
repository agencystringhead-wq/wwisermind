'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import CtaLink from '@/components/booking/CtaLink';
import { routes } from '@/lib/routes';
import styles from './header.module.css';

export type HeaderCity = { slug: string; name: string; href: string };

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** A thin ring: the Therapy Index mark. */
function RingMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <defs>
        <linearGradient id="ti-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#146ef5" />
          <stop offset="1" stopColor="#112962" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="8" fill="none" stroke="url(#ti-ring)" strokeWidth="3.2" />
    </svg>
  );
}

/**
 * The Therapy Index's own header, used in place of the main site header on its pages: a floating pill with the wordmark, the three
 * cities, a "Free consultation" button and an "Explore" button that opens a full-screen menu. Past the hero the pill shrinks a little
 * and turns more translucent. The menu traps focus, closes on Escape or ×, and hands focus back to the button.
 */
export default function TiHeader({ cities }: { cities: HeaderCity[] }) {
  const pathname = usePathname() ?? '';
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);

  // On a city report or a practice profile, that city is the current one.
  const current = cities.find((c) => pathname.startsWith(c.href));

  const closeMenu = useCallback(() => {
    setOpen(false);
    button.current?.focus();
  }, []);

  // "Past the hero": most of the way down the hub's hero, or a short scroll on every other page.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = document.getElementById('intro');
      const threshold = hero ? hero.offsetHeight * 0.6 : 48;
      setScrolled(window.scrollY > threshold);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // Lock page scroll and move focus into the menu while it is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    close.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== 'Tab' || !menu.current) return;
    const items = Array.from(menu.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null);
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const hub = routes.therapyIndex.hub;
  const understand = [
    { label: 'How it works', href: `${hub}#process` },
    { label: 'Methodology', href: routes.therapyIndex.methodology },
    { label: 'FAQ', href: `${hub}#faq` },
  ];

  return (
    <header className={styles.header}>
      <div className={`${styles.pill} ${scrolled ? styles.pillScrolled : ''}`}>
        <Link href={hub} prefetch={false} className={styles.brand} aria-label="Therapy Index home">
          <RingMark className={styles.ring} />
          <span className={styles.wordmark}>therapy index.</span>
        </Link>

        <span className={styles.divider} aria-hidden="true" />

        <nav className={styles.cities} aria-label="Cities">
          {cities.map((c) => (
            <Link
              key={c.slug}
              href={c.href}
              prefetch={false}
              className={`${styles.city} ${current?.slug === c.slug ? styles.cityCurrent : ''}`}
              aria-current={current?.slug === c.slug ? (pathname === c.href ? 'page' : 'true') : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        <span className={styles.divider} aria-hidden="true" />

        <div className={styles.actions}>
          <CtaLink href={routes.contactBook} className={styles.consult}>
            <span className={styles.consultLong}>Free consultation</span>
            <span className={styles.consultShort}>Book</span>
          </CtaLink>
          <button
            ref={button}
            type="button"
            className={styles.explore}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-controls="ti-menu"
            aria-label="Explore"
            onClick={() => setOpen(true)}
          >
            <span className={styles.exploreLabel}>Explore</span>
            <svg viewBox="0 0 16 16" className={styles.exploreIcon} aria-hidden="true">
              <circle cx="3.5" cy="3.5" r="1.6" />
              <circle cx="12.5" cy="3.5" r="1.6" />
              <circle cx="3.5" cy="12.5" r="1.6" />
              <circle cx="12.5" cy="12.5" r="1.6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="ti-menu"
        ref={menu}
        className={`${styles.menu} ${open ? styles.menuOpen : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Explore the Therapy Index"
        aria-hidden={!open}
        inert={!open}
        onKeyDown={onKeyDown}
      >
        <div className={styles.menuTop}>
          <span className={styles.brand}>
            <RingMark className={styles.ring} />
            <span className={styles.wordmark}>therapy index.</span>
          </span>
          <button ref={close} type="button" className={styles.close} onClick={closeMenu} aria-label="Close menu">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <nav className={styles.columns} aria-label="Therapy Index">
          <div className={styles.column}>
            <h2 className={styles.colTitle}>
              <span>01</span> / CITIES
            </h2>
            <ul>
              {cities.map((c) => (
                <li key={c.slug}>
                  <Link href={c.href} prefetch={false} className={styles.link} onClick={() => setOpen(false)}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.column}>
            <h2 className={styles.colTitle}>
              <span>02</span> / UNDERSTAND
            </h2>
            <ul>
              {understand.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} prefetch={false} className={styles.link} onClick={() => setOpen(false)}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className={styles.column}>
            <h2 className={styles.colTitle}>
              <span>03</span> / GET HELP
            </h2>
            <ul>
              <li>
                <CtaLink href={routes.contactBook} className={styles.link} onClick={() => setOpen(false)}>
                  Book a free review
                </CtaLink>
              </li>
              <li>
                <Link href={routes.pricing.localSeo} prefetch={false} className={styles.link} onClick={() => setOpen(false)}>
                  Local SEO
                </Link>
              </li>
              <li>
                <Link href={routes.home} prefetch={false} className={styles.link} onClick={() => setOpen(false)}>
                  wwisermind.com
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </header>
  );
}
