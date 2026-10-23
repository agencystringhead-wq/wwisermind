'use client';

import { routes } from '@/lib/routes';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import CtaLink from '@/components/booking/CtaLink';
import { mainNav, megaPanels, siteConfig, type MegaColumn, type MegaLink, type MegaPanel } from '@/lib/site';
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

/** A menu link's badge. Blue by default; `badgeTone` picks orange or green, and `badgeAbove` sets it on its own line over the title. */
function LinkBadge({ link }: { link: MegaLink }) {
  if (!link.badge) return null;
  const tone = link.badgeTone === 'orange' ? styles.badgeOrange : link.badgeTone === 'green' ? styles.badgeGreen : '';
  return <span className={`${styles.badge} ${tone} ${link.badgeAbove ? styles.badgeAbove : ''}`}>{link.badge}</span>;
}

/* --- one column of links, or one self-titled block ------------------------- */
function Column({ column, onNavigate }: { column: MegaColumn; onNavigate: () => void }) {
  return (
    <div>
      {column.lead ? (
        <p className={styles.colLabel}>
          <b>{column.lead}</b>{column.title ? ` / ${column.title}` : null}
        </p>
      ) : null}

      {column.links.map((link) => (
        <Link
          key={link.label}
          href={link.href}
          className={`${styles.mlink} ${link.body ? styles.mblock : ''} ${link.featured ? styles.mlinkFeatured : ''}`}
          onClick={onNavigate}
        >
          <span className={`${styles.mlinkTitle} ${link.badgeAbove ? styles.mlinkTitleStacked : ''}`}>
            {link.badgeAbove ? <LinkBadge link={link} /> : null}
            <span className={styles.mlinkLabel}>
              {link.label}
              {link.badgeAbove ? null : <LinkBadge link={link} />}
            </span>
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
          panel.columns.length >= 4
            ? styles.megaGrid4
            : panel.columns.length === 3
              ? styles.megaGrid3
              : styles.megaGrid2
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
                style={feature.image.position ? { objectPosition: feature.image.position } : undefined}
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
            <CtaLink href={strip.link.href} className={styles.stripLink} onClick={onNavigate}>
              {strip.link.label} <span aria-hidden="true">→</span>
            </CtaLink>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* --- one accordion inside the existing mobile panel ------------------------ */
function MobileSection({
  label,
  badge,
  panel,
  open,
  onToggle,
  onNavigate,
}: {
  label: string;
  badge?: string;
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
        <span className={styles.accLabel}>
          {label}
          {badge ? <span className={styles.accNew}>{badge}</span> : null}
        </span>
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
                  <b>{column.lead}</b>{column.title ? ` / ${column.title}` : null}
                </p>
              ) : null}

              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`${styles.accLink} ${link.featured ? styles.mlinkFeatured : ''}`}
                  onClick={onNavigate}
                >
                  <span className={`${styles.mlinkTitle} ${link.badgeAbove ? styles.mlinkTitleStacked : ''}`}>
                    {link.badgeAbove ? <LinkBadge link={link} /> : null}
                    <span className={styles.mlinkLabel}>
                      {link.label}
                      {link.badgeAbove ? null : <LinkBadge link={link} />}
                    </span>
                  </span>
                  {link.desc ? <span className={styles.mlinkDesc}>{link.desc}</span> : null}
                </Link>
              ))}
            </div>
          ))}

          {panel.mobileLink ? (
            <Link href={panel.mobileLink.href} className={styles.accLink} onClick={onNavigate}>
              <span className={styles.mlinkTitle}>{panel.mobileLink.label}</span>
            </Link>
          ) : null}
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
  const panelRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    /* A mark on the document rather than a shared state: anything that has to stand down
       while the drawer is open — the floating contact bar does — reads it from CSS, so
       neither component needs to know the other exists. */
    document.body.dataset.drawerOpen = 'true';

    /* Where the panel starts on screen, so its max-height can stop at the bottom edge. The
       body is locked, so this only changes if the viewport does. */
    const measure = () => {
      const panel = panelRef.current;
      if (panel) panel.style.setProperty('--panel-top', `${panel.getBoundingClientRect().top}px`);
    };
    measure();
    window.addEventListener('resize', measure);

    return () => {
      window.removeEventListener('resize', measure);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
      delete document.body.dataset.drawerOpen;
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
          <Link href={routes.home} className={styles.brand} aria-label={`${siteConfig.name} home`}>
            <Image
              src="/images/wwisermind-official-logo.webp"
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
                        <span className={styles.navLabel}>
                          {item.label}
                          {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
                        </span>
                        <Plus className={styles.navPlus} />
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={styles.navLink}
                        onMouseEnter={scheduleClose}
                      >
                        <span className={styles.navLabel}>
                          {item.label}
                          {item.badge ? <span className={styles.navBadge}>{item.badge}</span> : null}
                        </span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className={styles.actions} onMouseEnter={scheduleClose}>
            <CtaLink href={siteConfig.bookingUrl} className={styles.cta}>
              Book Your Free Call
            </CtaLink>
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
          <div className={styles.panel} id="mobile-menu" ref={panelRef}>
            <div className={`container ${styles.panelInner}`}>
              {mainNav.map((item) => {
                const panel = megaPanels[item.label];

                return panel ? (
                  <MobileSection
                    key={item.label}
                    label={item.label}
                    badge={item.badge}
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
                <CtaLink
                  href={siteConfig.bookingUrl}
                  className={styles.cta}
                  onClick={() => setOpen(false)}
                >
                  Book Your Free Call
                </CtaLink>
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
