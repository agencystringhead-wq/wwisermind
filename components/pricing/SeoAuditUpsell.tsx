import Link from 'next/link';
import { upsellCopy, upsellPlans } from '@/lib/pricing/seo-audit';
import local from './LocalSeo.module.css';
import styles from './SeoAudit.module.css';

/** Frame 7: a lighter take on the Local SEO bundle band, text on the left and one mini card
    per Local SEO plan on the right. The plans come from lib/pricing/local-seo.ts. */
export default function SeoAuditUpsell() {
  if (upsellPlans.length === 0) return null;

  return (
    <section className={local.section}>
      <div className="container">
        <div className={styles.upsell}>
          <div>
            <h2 className={local.heading}>{upsellCopy.title}</h2>
            <p className={styles.upsellBody}>{upsellCopy.body}</p>
          </div>

          <ul className={styles.upsellCards}>
            {upsellPlans.map((plan) => (
              <li key={plan.name}>
                <Link href={plan.href} className={styles.upsellCard}>
                  <span className={styles.upsellName}>{plan.name}</span>
                  <span className={styles.upsellLine}>{plan.line}</span>
                  <span className={styles.upsellArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
