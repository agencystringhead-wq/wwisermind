import CtaLink from '@/components/booking/CtaLink';
import { faqPage } from '@/lib/faq';
import Reveal from '@/components/ui/Reveal';
import section from '@/components/services/Section.module.css';
import styles from './Faq.module.css';

/**
 * Frame 3 — still have a question. A soft blue-to-yellow card on the blue-grey tint, a short
 * line and two buttons. The frame above the footer's dark CTA is light, so the two never
 * read as one slab.
 */
export default function FaqAsk() {
  const { ask } = faqPage;

  return (
    <section className={`${section.section} ${styles.askGround}`}>
      <div className="container">
        <Reveal as="div" className={styles.askCard}>
          <p className={section.eyebrow} data-reveal="0">
            {ask.eyebrow}
          </p>
          <h2 className={styles.askHeading} data-reveal="1">
            {ask.heading}
          </h2>
          <p className={styles.askBody} data-reveal="2">
            {ask.body}
          </p>
          <div className={styles.askActions} data-reveal="3">
            <CtaLink href={ask.primary.href} className={styles.askPrimary}>
              {ask.primary.label}
            </CtaLink>
            <CtaLink href={ask.secondary.href} className={styles.askSecondary}>
              {ask.secondary.label}
            </CtaLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
