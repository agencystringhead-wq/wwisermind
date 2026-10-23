import Link from 'next/link';
import { routes } from '@/lib/routes';
import { siteConfig } from '@/lib/site';
import styles from './lma.module.css';

/** The page's own slim dark footer, used in place of the site's. */
export default function LmaFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerInner}`}>
        <p>© {new Date().getFullYear()} {siteConfig.name}</p>
        <p className={styles.footerMid}>A free tool by {siteConfig.name}</p>
        <ul className={styles.footerLinks}>
          <li><Link href={routes.privacyPolicy}>Privacy</Link></li>
          <li><Link href={routes.termsAndConditions}>Terms</Link></li>
          <li><Link href={routes.home}>wwisermind.com</Link></li>
        </ul>
      </div>
    </footer>
  );
}
