import { getHubStats, getMarketViews } from '@/lib/therapyindex/data';
import TiFooter from './TiFooter';
import TiHeader from './TiHeader';
import styles from './ti.module.css';

/**
 * The Therapy Index's own header and footer around a page. Used by the Therapy Index layout and by the tool pages that carry its
 * branding; the site's header, footer and floating contact bar stand down on those paths (see usesTiChrome in lib/site.ts).
 */
export default function TiChrome({ children }: { children: React.ReactNode }) {
  const cities = getMarketViews().map((v) => ({ slug: v.city.slug, name: v.city.name, href: v.path }));
  return (
    <div className={styles.root}>
      <TiHeader cities={cities} />
      <div className={styles.below}>{children}</div>
      <TiFooter cities={cities} date={getHubStats().date} />
    </div>
  );
}
