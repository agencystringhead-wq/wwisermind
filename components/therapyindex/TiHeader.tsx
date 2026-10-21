'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import CtaLink from '@/components/booking/CtaLink';
import { routes } from '@/lib/routes';
import styles from './header.module.css';

export type HeaderCity = { slug: string; name: string; href: string };

/** The Therapy Index's own header, used in place of the main site header on every /therapyindex page. */
export default function TiHeader({ cities }: { cities: HeaderCity[] }) {
  const router = useRouter();
  const pathname = usePathname() ?? '';
  // /therapyindex/<state>/<city>/...: the city segment is the third one.
  const current = cities.find((c) => pathname.startsWith(c.href))?.slug ?? '';

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <div className={styles.brand}>
          <Link href={routes.therapyIndex.hub} prefetch={false} className={styles.wordmark}>
            Therapy Index
          </Link>
          <Link href={routes.home} prefetch={false} className={styles.by}>
            by wwisermind
          </Link>
        </div>

        <nav className={styles.cities} aria-label="Cities">
          {cities.map((c) => (
            <Link key={c.slug} href={c.href} prefetch={false} className={styles.city} aria-current={c.slug === current ? 'page' : undefined}>
              {c.name}
            </Link>
          ))}
        </nav>

        <div className={styles.right}>
          <label className={styles.select}>
            <span className={styles.srOnly}>City</span>
            <select value={current} onChange={(e) => e.target.value && router.push(cities.find((c) => c.slug === e.target.value)!.href)}>
              <option value="">Cities</option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <CtaLink href={routes.contactBook} className={styles.cta}>
            <span className={styles.ctaLong}>Book a free review</span>
            <span className={styles.ctaShort}>Free review</span>
          </CtaLink>
        </div>
      </div>
    </header>
  );
}
