import Link from 'next/link';
import { CheckIcon, FlagIcon, SearchCheckIcon } from '@/components/ui/icons';
import local from './LocalSeo.module.css';
import styles from './SeoAudit.module.css';

const offerIcons = { searchCheck: SearchCheckIcon, flag: FlagIcon };

export type PricingOfferData = {
  name: string;
  icon: keyof typeof offerIcons;
  description: string;
  /** The yellow tab across the top edge. */
  tag: string;
  /** A small line above the figure, such as "3 payments of". */
  priceLabel?: string;
  /** The figure as printed, such as "$299". */
  price: string;
  /** In the small suffix style beside the figure, such as "one-time". */
  suffix?: string;
  /** A line under the figure, such as the total. */
  priceNote?: string;
  /** Printed under the note; the line is left out while this is empty. */
  turnaround?: string;
  cta: { label: string; href: string };
  /** The small line under the button. */
  note: string;
  sectionLabel: string;
  rows: { label: string; value: string }[];
};

/** The /pricing sub-pages' wide offer: one card on the featured (Velocity) treatment, two
    columns on a desktop. The left column is the Local SEO card's header and price; the right is
    its row list. Used by the SEO Audit and One-Time SEO pages, each feeding its own data. */
export default function PricingOffer({
  copy,
  offer,
}: {
  copy: { title: string; sub: string };
  offer: PricingOfferData;
}) {
  const Badge = offerIcons[offer.icon];

  return (
    <section className={local.section} id="pricing">
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{copy.title}</h2>
          <p className={local.lede}>{copy.sub}</p>
        </header>

        <div className={styles.priceWrap}>
          <div className={`${local.pkg} ${local.pkgFeatured} ${styles.priceCard}`}>
            <span className={local.tab}>{offer.tag}</span>

            <div className={styles.priceCols}>
              <div className={styles.priceLeft}>
                <div className={local.pkgHead}>
                  <h3 className={local.pkgName}>{offer.name}</h3>
                  <span className={local.badge}>
                    <Badge />
                  </span>
                </div>
                <p className={`${local.pkgFor} ${styles.priceDesc}`}>{offer.description}</p>

                <div className={styles.priceBlock}>
                  {offer.priceLabel ? (
                    <p className={local.pkgPriceNote}>{offer.priceLabel}</p>
                  ) : null}
                  <p className={`${local.pkgPriceBig} ${styles.auditPrice}`}>
                    {offer.price}
                    {offer.suffix ? <small>{offer.suffix}</small> : null}
                  </p>
                  {offer.priceNote ? <p className={styles.priceNote}>{offer.priceNote}</p> : null}
                </div>

                {offer.turnaround ? <p className={styles.turnaround}>{offer.turnaround}</p> : null}

                <Link href={offer.cta.href} className={styles.orderButton}>
                  {offer.cta.label}
                </Link>
                <p className={styles.orderNote}>{offer.note}</p>
              </div>

              <div className={styles.priceRight}>
                <p className={local.pkgLead}>{offer.sectionLabel}</p>
                <ul className={local.pkgRows}>
                  {offer.rows.map((row) => (
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
