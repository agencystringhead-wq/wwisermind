import Accordion from '@/components/ui/Accordion';
import { pricingFaqs } from '@/lib/pricing';
import styles from './Pricing.module.css';

/** Frame 5: the site's numbered accordion, unchanged, fed from lib/pricing.ts. */
export default function PricingFaq() {
  return (
    <section className={styles.faq}>
      <div className={`container ${styles.faqGrid}`}>
        <div className={styles.faqIntro}>
          <p className={styles.eyebrow}>Questions</p>
          <h2 className={styles.heading}>Pricing, answered plainly</h2>
          <p className={styles.lede}>The things people ask before they book a call.</p>
        </div>

        <Accordion items={pricingFaqs} numbered defaultOpen={0} />
      </div>
    </section>
  );
}
