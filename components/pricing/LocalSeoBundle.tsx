import Link from 'next/link';
import { CheckIcon } from '@/components/ui/icons';
import { bundle, bundleCopy, bundleWhy, formatLocalPrice } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 6: one dark feature card on the left, the "why bundle" list on the right. */
export default function LocalSeoBundle() {
  const price = formatLocalPrice(bundle.price);

  return (
    <section className={styles.sectionGrey}>
      <div className="container">
        <header className={styles.head}>
          <h2 className={styles.heading}>{bundleCopy.title}</h2>
          <p className={styles.lede}>{bundleCopy.sub}</p>
        </header>

        <div className={styles.bundleGrid}>
          <div className={styles.bundleCard}>
            <h3 className={styles.bundleName}>{bundle.name}</h3>
            {price ? (
              <p className={styles.bundlePrice}>
                Starting at {price}
                <small>{bundle.priceUnit}</small>
              </p>
            ) : (
              <p className={styles.bundlePrice}>Price on request</p>
            )}
            <p className={styles.bundleLead}>{bundle.lead}</p>
            <ul className={styles.bundleList}>
              {bundle.includes.map((item) => (
                <li key={item}>
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>
            <Link href={bundle.button.href} className={styles.buttonBlue}>
              {bundle.button.label}
            </Link>
          </div>

          <div>
            <h3 className={styles.whyTitle}>{bundleCopy.whyTitle}</h3>
            <ul className={styles.whyList}>
              {bundleWhy.map((item) => (
                <li key={item.title}>
                  <p className={styles.whyItemTitle}>{item.title}</p>
                  <p className={styles.whyItemBody}>{item.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
