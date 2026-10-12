import Link from 'next/link';
import { CheckIcon, serviceIcons } from '@/components/ui/icons';
import {
  featuredBenefits,
  featuredChecklist,
  featuredDepends,
  featuredInside,
  featuredPackageId,
  formatPrice,
  getPricingEntry,
} from '@/lib/pricing';
import { siteConfig } from '@/lib/site';
import styles from './Pricing.module.css';

/** Frame 3: the One Week Website, shown larger than the rest. The price comes from
    lib/pricing.ts, so it reads "Price on request" until a number is entered there. */
export default function PricingFeatured() {
  const entry = getPricingEntry(featuredPackageId);
  const price = formatPrice(entry);

  return (
    <section className={styles.featured} id="featured">
      <div className="container">
        <header className={styles.featuredHead}>
          <p className={styles.eyebrow}>Our most popular package</p>
          <h2 className={styles.heading}>The One Week Website</h2>
        </header>

        <div className={styles.featuredGrid}>
          <div>
            <p className={styles.subhead}>What’s inside</p>
            <ul className={styles.inside}>
              {featuredInside.map((item) => {
                const Icon = serviceIcons[item.icon];

                return (
                  <li key={item.title}>
                    <span className={styles.insideIcon}>
                      <Icon />
                    </span>
                    <p className={styles.insideTitle}>{item.title}</p>
                    <p className={styles.insideBody}>{item.body}</p>
                  </li>
                );
              })}
            </ul>
          </div>

          <aside className={styles.priceCard} aria-label="One Week Website price">
            <span className={styles.pill}>Most popular</span>
            <p className={styles.startingAt}>Starting at</p>
            <p className={styles.priceLine}>
              {price ? (
                <>
                  <span className={styles.priceBig}>{price}</span>
                  <span className={styles.priceUnit}>{entry.priceUnit}</span>
                </>
              ) : (
                <span className={styles.priceBig}>Price on request</span>
              )}
            </p>

            <p className={styles.dependsLabel}>Your price depends on</p>
            <ol className={styles.depends}>
              {featuredDepends.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>

            <ul className={styles.checklist}>
              {featuredChecklist.map((item) => (
                <li key={item}>
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            <Link href={siteConfig.bookingPage} className={styles.buttonFull}>
              Book Your Free Call
            </Link>
          </aside>
        </div>

        <ul className={styles.benefits}>
          {featuredBenefits.map((benefit) => (
            <li key={benefit.title} className={styles.benefit}>
              <p className={styles.benefitTitle}>{benefit.title}</p>
              <p className={styles.benefitBody}>{benefit.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
