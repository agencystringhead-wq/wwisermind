import Image from 'next/image';
import Link from 'next/link';
import CtaLink from '@/components/booking/CtaLink';
import { routes } from '@/lib/routes';
import { siteConfig } from '@/lib/site';
import { LMA_PATH } from '@/lib/local-map-assessment';
import styles from './lma.module.css';

const PhoneIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

/** The page's own slim sticky header, used in place of the site's: logo, the tool's name, the phone number and one booking button. */
export default function LmaHeader() {
  const { phoneDisplay, phoneTel } = siteConfig.contact;
  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <Link href={routes.home} className={styles.brand} aria-label={`${siteConfig.name} home`}>
          <Image src="/images/therapyindex/wwisermind-logo-white.webp" alt={siteConfig.name} width={1389} height={244} className={styles.logo} priority />
        </Link>
        <Link href={LMA_PATH} className={styles.toolName}>
          Local Map Assessment
        </Link>
        <a href={`tel:${phoneTel}`} className={styles.phone} aria-label={`Call ${phoneDisplay}`}>
          <PhoneIcon className={styles.phoneIcon} />
          <span className={styles.phoneText}>{phoneDisplay}</span>
        </a>
        <CtaLink href={routes.contactBook} className={styles.headerCta}>
          <span className={styles.longLabel}>Book a free call</span>
          <span className={styles.shortLabel}>Book a call</span>
        </CtaLink>
      </div>
    </header>
  );
}
