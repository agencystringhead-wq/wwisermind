import Accordion from '@/components/ui/Accordion';
import type { FaqItem } from '@/lib/pricing/local-seo';
import styles from './Pricing.module.css';

/** Frame 10, shared: the site's numbered accordion, on the /pricing FAQ layout. */
export default function LocalSeoFaq({
  copy,
  items,
}: {
  copy: { eyebrow: string; title: string; sub: string };
  items: FaqItem[];
}) {
  return (
    <section className={styles.faq}>
      <div className={`container ${styles.faqGrid}`}>
        <div className={styles.faqIntro}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 className={styles.heading}>{copy.title}</h2>
          <p className={styles.lede}>{copy.sub}</p>
        </div>

        <Accordion items={items} numbered defaultOpen={0} />
      </div>
    </section>
  );
}
