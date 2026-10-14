import Link from 'next/link';
import local from './LocalSeo.module.css';
import styles from './SeoAudit.module.css';

export type UpsellPlan = { name: string; line: string; href: string };

/** A lighter take on the Local SEO bundle band: text on the left and one mini card per plan
    on the right. Used by the SEO Audit page (two plans) and the One-Time SEO page (one). */
export default function PricingUpsell({
  copy,
  plans,
  tone = 'white',
}: {
  copy: { title: string; body: string };
  plans: UpsellPlan[];
  tone?: 'white' | 'grey';
}) {
  if (plans.length === 0) return null;

  return (
    <section className={tone === 'grey' ? local.sectionGrey : local.section}>
      <div className="container">
        <div className={styles.upsell}>
          <div>
            <h2 className={local.heading}>{copy.title}</h2>
            <p className={styles.upsellBody}>{copy.body}</p>
          </div>

          <ul className={styles.upsellCards}>
            {plans.map((plan) => (
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
