import LmaFooter from './LmaFooter';
import LmaHeader from './LmaHeader';
import styles from './lma.module.css';

/** The Local Map Assessment's own header and footer around its pages. The site's header, footer and floating contact bar stand down
    on these paths (see usesOwnChrome in lib/site.ts). */
export default function LmaChrome({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.root}>
      <LmaHeader />
      <div id="lma-top">{children}</div>
      <LmaFooter />
    </div>
  );
}
