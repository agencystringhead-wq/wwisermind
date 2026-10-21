import type { Metadata } from 'next';
import TiHeader from '@/components/therapyindex/TiHeader';
import styles from '@/components/therapyindex/ti.module.css';
import { INDEXABLE } from '@/lib/therapyindex/config';
import { getMarketViews } from '@/lib/therapyindex/data';

/* One switch for every Therapy Index page: while INDEXABLE is false each page is sent noindex, nofollow.
   Page-level metadata never sets `robots`, so this is the only place that decides it. */
export const metadata: Metadata = INDEXABLE ? {} : { robots: { index: false, follow: false } };

export default function TherapyIndexLayout({ children }: { children: React.ReactNode }) {
  const cities = getMarketViews().map((v) => ({ slug: v.city.slug, name: v.city.name, href: v.path }));
  return (
    <div className={styles.root}>
      <TiHeader cities={cities} />
      <div className={styles.below}>{children}</div>
    </div>
  );
}
