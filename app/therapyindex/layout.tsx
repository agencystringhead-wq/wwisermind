import type { Metadata } from 'next';
import styles from '@/components/therapyindex/ti.module.css';
import { INDEXABLE } from '@/lib/therapyindex/config';

/* One switch for every Therapy Index page: while INDEXABLE is false each page is sent noindex, nofollow.
   Page-level metadata never sets `robots`, so this is the only place that decides it. */
export const metadata: Metadata = INDEXABLE ? {} : { robots: { index: false, follow: false } };

export default function TherapyIndexLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.root}>{children}</div>;
}
