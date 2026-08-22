'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { mainNav, megaPanels, siteConfig, type MegaColumn, type MegaPanel } from '@/lib/site';
import styles from './Header.module.css';

/** Long enough for the cursor to travel from a nav item down into the panel under it. */
const CLOSE_DELAY = 150;

/** The width at which this header already swapped the nav for the burger. */
const DESKTOP = '(min-width: 1024px)';

/** The open/close indicator. A plus that rotates a quarter turn into a cross, so the one
    glyph carries both states — and `aria-hidden`, because `aria-expanded` on the button
    already says the same thing to a screen reader. */
function Plus({ className }: { className: string }) {
  return (
    <span className={className} aria-hidden="true">
      +
    </span>
  );
}

/* --- one column of links, or one self-titled block ------------------------- */
function Column({ column, onNavigate }: { column: MegaColumn; onNavigate: () => void }) {
  return (
    <div>
      {column.lead ? (
        <p className={styles.colLabel}>
          <b>{column.lead}</b> / {column.title}
        </p>
      ) : null}

      {column.links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className={`${styles.mlink} ${link.body ? styles.mblock : ''}`}
          onClick={onNavigate}
        >
          <span className={styles.mlinkTitle}>
            {link.label}
            {link.badge ? <span className={styles.badge}>{link.badge}</span> : null}
            {/* with no description the arrow has nowhere else to sit */}
            {link.desc ? null : (
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            )}
          </span>

          {link.desc ? (
            <span className={styles.mlinkDesc}>
              {link.desc}{' '}
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            </span>
          ) : null}

          {link.body ? <span className={styles.mblockBody}>{link.body}</span> : null}
        </Link>
      ))}
    </div>
  );
}

/* --- a whole panel: columns, featured card, closing strip ------------------ */
function Mega({
  panel,
  open,
  onNavigate,
}: {
  panel: MegaPanel;
  open: boolean;
  onNavigate: () => void;
}) {
  const { feature, strip } = panel;

  return (
    <div
      className={`${styles.mega} ${open ? styles.megaOpen : ''}`}
      id={`mega-${panel.id}`}
      role="region"
      aria-label={panel.id}
    >
      <div
        className={`container ${styles.megaGrid} ${
          panel.columns.length === 3 ? styles.megaGrid3 : styles.megaGrid2
        }`}
      >
        {panel.columns.map((column, index) => (
          <Column key={column.title ?? index} column={column} onNavigate={onNavigate} />
        ))}

        <div className={`${styles.feature} ${feature.image ? styles.featureWithImage : ''}`}>
          <p className={styles.featureEyebrow}>{feature.eyebrow}</p>
          {feature.lead ? <p className={styles.featureLead}>{feature.lead}</p> : null}
          {feature.body ? <p className={styles.featureBody}>{feature.body}</p> : null}
          {feature.link ? (
            <Link href={feature.link.href} className={styles.featureLink} onClick={onNavigate}>
              {feature.link.label} <span aria-hidden="true">→</span>
            </Link>
          ) : null}

          {/* The wrapper holds the aspect ratio, so the space is reserved before the file
              arrives and opening the panel never shifts the text above it. */}
          {feature.image ? (
            <span className={styles.featureMedia}>
              <Image
                src={feature.image.src}
                alt={feature.image.alt}
                width={feature.image.width}
                height={feature.image.height}
                className={styles.featureImage}
                loading="lazy"
              />
            </span>
          ) : null}
        </div>
      </div>

      <div className={styles.strip}>
        <div className={`container ${styles.stripInner}`}>
          <span>{strip.text}</span>
          {strip.link ? (
            <Link href={strip.link.href} className={styles.stripLink} onClick={onNavigate}>
              {strip.link.label} <span aria-hidden="true">→</span>
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* --- one accordion inside the existing mobile panel ------------------------ */
function MobileSection({
  label,
  panel,
  open,
  onToggle,
  onNavigate,
}: {
  label: string;
  panel: MegaPanel;
  open: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  /* The open height is measured, not guessed: a fixed cap either clips the longest section
     or leaves every shorter one easing open against dead space. */
  useEffect(() => {
    const inner = innerRef.current;
    if (!inner) return;

    const measure = () => setHeight(inner.scrollHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(inner);

    return () => observer.disconnect();
  }, []);

  return (
    <div>
      <button
        type="button"
        className={`${styles.panelLink} ${styles.accTrigger}`}
        aria-expanded={open}
        aria-controls={`mobile-${panel.id}`}
        onClick={onToggle}
      >
        {label}
        <Plus className={styles.accPlus} />
      </button>

      <div
        className={styles.accPanel}
        id={`mobile-${panel.id}`}
        style={{ maxHeight: open ? height : 0 }}
      >
        <div className={styles.accInner} ref={innerRef}>
          {panel.columns.map((column, index) => (
            <div key={column.title ?? index}>
              {column.lead ? (
                <p className={styles.accGroup}>
                  <b>{column.lead}</b> / {column.title}
                </p>
              ) : null}

              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={styles.accLink}
                  onClick={onNavigate}
                >
                  <span className={styles.mlinkTitle}>
                    {link.label}
                    {link.badge ? <span className={styles.badge}>{link.badge}</span> : null}
                  </span>
                  {link.desc ? <span className={styles.mlinkDesc}>{link.desc}</span> : null}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [accOpen, setAccOpen] = useState<string[]>([]);

  const headerRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [open]);

  /* --- mega panels ------------------------------------------------------- */
  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = undefined;
  }, []);

  const closeAll = useCallback(() => {
    cancelClose();
    setOpenId(null);
  }, [cancelClose]);

  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenId(null), CLOSE_DELAY);
  }, [cancelClose]);

  const openPanel = useCallback(
    (id: string) => {
      cancelClose();
      if (window.matchMedia(DESKTOP).matches) setOpenId(id);
    },
    [cancelClose],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || !openId) return;

      const trigger = headerRef.current?.querySelector<HTMLButtonElement>(
        `[data-panel='${openId}']`,
      );
      closeAll();
      trigger?.focus();
    };

    /* a click or a tab-stop outside the header is a decision to leave the panel */
    const onOutside = (event: Event) => {
      if (openId && !headerRef.current?.contains(event.target as Node)) closeAll();
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onOutside);
    document.addEventListener('focusin', onOutside);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('click', onOutside);
      document.removeEventListener('focusin', onOutside);
    };
  }, [openId, closeAll]);

  /* crossing into the burger layout with a panel up would strand it open */
  useEffect(() => {
    const query = window.matchMedia(DESKTOP);
    const onChange = () => setOpenId(null);

    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  useEffect(() => () => cancelClose(), [cancelClose]);

  const toggleAcc = (id: string) =>
    setAccOpen((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );

  return (
    <>
      <header
        className={styles.header}
        ref={headerRef}
        onMouseLeave={scheduleClose}
        onMouseEnter={cancelClose}
      >
        <div className={`container ${styles.inner}`}>
          <Link href="/" className={styles.brand} aria-label={`${siteConfig.name} home`}>
            <Image
              src="/images/logo.webp"
              alt={siteConfig.name}
              width={60}
              height={56}
              className={styles.logo}
              priority
            />
          </Link>

          <nav className={styles.nav} aria-label="Main">
            <ul className={styles.navList}>
              {mainNav.map((item) => {
                const panel = megaPanels[item.label];

                return (
                  <li key={item.label}>
                    {panel ? (
                      <button
                        type="button"
                        className={`${styles.navLink} ${styles.navTrigger}`}
                        data-panel={panel.id}
                        aria-expanded={openId === panel.id}
                        aria-controls={`mega-${panel.id}`}
                        onMouseEnter={() => openPanel(panel.id)}
                        onClick={() =>
                          openId === panel.id ? closeAll() : openPanel(panel.id)
                        }
                      >
                        {item.label}
                        <Plus className={styles.navPlus} />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={styles.navLink}
                        onMouseEnter={scheduleClose}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.actions} onMouseEnter={scheduleClose}>
            <Link href={siteConfig.contactUrl} className={styles.contact}>
              Contact Us
            </Link>
            <Link href={siteConfig.bookingUrl} className={styles.cta}>
              Book Your Free Call
            </Link>
          </div>

          <button
            type="button"
            className={`${styles.burger} ${open ? styles.burgerOpen : ''}`}
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className={styles.burgerBox} aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>

        {Object.values(megaPanels).map((panel) => (
          <Mega
            key={panel.id}
            panel={panel}
            open={openId === panel.id}
            onNavigate={closeAll}
          />
        ))}

        {open && (
          <div className={styles.panel} id="mobile-menu">
            <div className={`container ${styles.panelInner}`}>
              {mainNav.map((item) => {
                const panel = megaPanels[item.label];

                return panel ? (
                  <MobileSection
                    key={item.label}
                    label={item.label}
                    panel={panel}
                    open={accOpen.includes(panel.id)}
                    onToggle={() => toggleAcc(panel.id)}
                    onNavigate={() => setOpen(false)}
                  />
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={styles.panelLink}
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}

              <div className={styles.panelActions}>
                <Link
                  href={siteConfig.bookingUrl}
                  className={styles.cta}
                  onClick={() => setOpen(false)}
                >
                  Book Your Free Call
                </Link>
                <Link
                  href={siteConfig.contactUrl}
                  className={styles.panelContact}
                  onClick={() => setOpen(false)}
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Outside the header, because the header's own z-index would trap an overlay inside
          its stacking context and paint it over the bar rather than under it. */}
      <div
        className={`${styles.overlay} ${openId ? styles.overlayOpen : ''}`}
        onClick={closeAll}
        aria-hidden="true"
      />
    </>
  );
}
