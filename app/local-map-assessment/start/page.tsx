import type { Metadata } from 'next';
import Link from 'next/link';
import { LMA_PATH } from '@/lib/local-map-assessment';
import styles from '@/components/local-map/lma.module.css';

/* A placeholder until the lookup is wired: the landing page's search box lands here. Kept out of search results. */
export const metadata: Metadata = {
  title: 'Local Map Assessment | wwisermind',
  robots: { index: false, follow: false },
};

export default function StartPage() {
  return (
    <section className={styles.startStub}>
      <div className="container">
        <h1>Your assessment is almost ready to open</h1>
        <p>We are putting the finishing touches on the practice lookup. Check back very soon, or book a free call and we will walk through your Google Maps results with you.</p>
        <Link href={LMA_PATH} className={styles.btnPrimary}>Back to the Local Map Assessment</Link>
      </div>
    </section>
  );
}
