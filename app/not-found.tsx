import Link from 'next/link';
import type { Metadata } from 'next';
import ToolCallout from '@/components/tools/ToolCallout';
import { routes } from '@/lib/routes';
import { liveTools } from '@/lib/tools';
import styles from './not-found.module.css';

export const metadata: Metadata = {
  title: 'Page not found | wwisermind',
  robots: { index: false, follow: true },
};

/* The static export writes this to 404.html. The free tools sit under the message so a wrong
   address still ends somewhere useful. */
export default function NotFound() {
  return (
    <>
      <section className={`container ${styles.message}`}>
        <p className={styles.code}>404</p>
        <h1 className={styles.heading}>We couldn&apos;t find that page.</h1>
        <p className={styles.lead}>
          It may have moved. While you&apos;re here, these tools are free for every practice.
        </p>
        <Link href={routes.home} className={styles.home}>
          Back to the homepage
        </Link>
      </section>
      <div className={styles.tools}>
        <ToolCallout variant="grid" toolIds={liveTools.map((tool) => tool.id)} placement="404-grid" />
      </div>
    </>
  );
}
