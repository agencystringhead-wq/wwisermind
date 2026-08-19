'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { mainNav, siteConfig } from '@/lib/site';
import styles from './Header.module.css';

export default function Header() {
  const [open, setOpen] = useState(false);

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

  return (
    <header className={styles.header}>
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
            {mainNav.map((item) => (
              <li key={item.label}>
                <Link href={item.href} className={styles.navLink}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
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

      {open && (
        <div className={styles.panel} id="mobile-menu">
          <div className={`container ${styles.panelInner}`}>
            {mainNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={styles.panelLink}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}

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
  );
}
