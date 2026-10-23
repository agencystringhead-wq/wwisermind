import type { Metadata } from 'next';
import GfeApp from '@/components/gfe/GfeApp';
import styles from '@/components/gfe/gfe.module.css';
import Accordion from '@/components/ui/Accordion';
import {
  GFE_DESCRIPTION,
  GFE_TITLE_TAG,
  GFE_URL,
  PRIVACY_LINE,
  explainer,
  faqJsonLd,
  faqs,
  toolJsonLd,
} from '@/lib/gfe/content';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: GFE_TITLE_TAG,
  description: GFE_DESCRIPTION,
  alternates: { canonical: GFE_URL },
  openGraph: { type: 'website', siteName: siteConfig.name, title: GFE_TITLE_TAG, description: GFE_DESCRIPTION, url: GFE_URL },
  twitter: { card: 'summary_large_image', site: siteConfig.twitterHandle, title: GFE_TITLE_TAG, description: GFE_DESCRIPTION },
};

const LockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

export default function GoodFaithEstimatePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(toolJsonLd) }} />

      <section className={styles.section} aria-labelledby="gfe-h1">
        <div className="container">
          <div className={styles.narrow}>
            <p className={styles.eyebrow}>Free tool for therapists</p>
            <h1 id="gfe-h1" className={styles.h1}>Good Faith Estimate generator</h1>
            <p className={styles.lede}>
              Fill in a short form and download a clean Good Faith Estimate for a self-pay client. It follows the layout of the standard CMS form
              required by the No Surprises Act.
            </p>
            <p className={styles.privacy}>
              <LockIcon />
              {PRIVACY_LINE}
            </p>
            <div style={{ marginTop: 28 }}>
              <GfeApp />
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.band}`} aria-labelledby="gfe-what">
        <div className="container">
          <div className={`${styles.narrow} ${styles.body}`}>
            <h2 id="gfe-what" className={styles.h2}>{explainer.heading}</h2>
            {explainer.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="gfe-faq">
        <div className={`container ${styles.faqWrap}`}>
          <h2 id="gfe-faq" className={styles.h2}>Frequently asked questions</h2>
          <Accordion items={[...faqs]} numbered />
        </div>
      </section>
    </>
  );
}
