import Link from 'next/link';
import { getMarketViews } from '@/lib/therapyindex/data';
import styles from './hero.module.css';

/** Three city tabs under the hero, on phones only: the header's city links are not in the pill at that width. */
export default function MobileCityTabs() {
  const cities = getMarketViews().map((v) => ({ slug: v.city.slug, name: v.city.name, href: v.path }));
  return (
    <nav className={styles.cityTabs} aria-label="Cities">
      {cities.map((c) => (
        <Link key={c.slug} href={c.href} prefetch={false} className={styles.cityTab}>
          {c.name}
        </Link>
      ))}
    </nav>
  );
}
