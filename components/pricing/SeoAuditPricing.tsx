import Link from 'next/link';
import { CheckIcon, SearchCheckIcon } from '@/components/ui/icons';
import { auditOffer, auditPrice, pricingCopy } from '@/lib/pricing/seo-audit';
import local from './LocalSeo.module.css';
import styles from './SeoAudit.module.css';

/** Frame 4: one wide card on the featured (Velocity) treatment, two columns on a desktop.
    The left column is the Local SEO card's header and price; the right is its row list. The
    turnaround line is left out while `turnaroundDays` is empty. */
export default function SeoAuditPricing() {
  const { turnaroundDays } = auditOffer;

  return (
    <section className={local.section} id="pricing">
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{pricingCopy.title}</h2>
          <p className={local.lede}>{pricingCopy.sub}</p>
        </header>

        <div className={styles.priceWrap}>
          <div className={`${local.pkg} ${local.pkgFeatured} ${styles.priceCard}`}>
            <span className={local.tab}>{auditOffer.tag}</span>

            <div className={styles.priceCols}>
              <div className={styles.priceLeft}>
                <div className={local.pkgHead}>
                  <h3 className={local.pkgName}>{auditOffer.name}</h3>
                  <span className={local.badge}>
                    <SearchCheckIcon />
                  </span>
                </div>
                <p className={`${local.pkgFor} ${styles.priceDesc}`}>{auditOffer.description}</p>

                <p className={`${local.pkgPriceBig} ${styles.auditPrice}`}>
                  ${auditPrice}
                  <small>{auditOffer.suffix}</small>
                </p>

                {turnaroundDays ? (
                  <p className={styles.turnaround}>
                    {auditOffer.turnaroundLabel(turnaroundDays)}
                  </p>
                ) : null}

                <Link href={auditOffer.cta.href} className={styles.orderButton}>
                  {auditOffer.cta.label}
                </Link>
                <p className={styles.orderNote}>{auditOffer.note}</p>
              </div>

              <div className={styles.priceRight}>
                <p className={local.pkgLead}>{auditOffer.sectionLabel}</p>
                <ul className={local.pkgRows}>
                  {auditOffer.rows.map((row) => (
                    <li className={local.pkgRow} key={row.label}>
                      <span className={local.rowLabel}>
                        <span className={local.rowCheck}>
                          <CheckIcon />
                        </span>
                        {row.label}
                      </span>
                      <span className={local.rowValue}>{row.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
