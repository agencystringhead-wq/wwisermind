import Accordion from '@/components/ui/Accordion';
import { localSeoFaqCopy, localSeoFaqs } from '@/lib/pricing/local-seo';
import styles from './Pricing.module.css';

/** Frame 10: the site's numbered accordion, on the /pricing FAQ layout, fed from
    lib/pricing/local-seo.ts. */
export default function LocalSeoFaq() {
  return (
    <section className={styles.faq}>
      <div className={`container ${styles.faqGrid}`}>
        <div className={styles.faqIntro}>
          <p className={styles.eyebrow}>{localSeoFaqCopy.eyebrow}</p>
          <h2 className={styles.heading}>{localSeoFaqCopy.title}</h2>
          <p className={styles.lede}>{localSeoFaqCopy.sub}</p>
        </div>

        <Accordion items={localSeoFaqs} numbered defaultOpen={0} />
      </div>
    </section>
  );
}
