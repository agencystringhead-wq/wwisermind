import Link from 'next/link';
import { CheckIcon } from '@/components/ui/icons';
import {
  everyPackage,
  formatLocalPrice,
  localSeoPackages,
  packagesCopy,
  visibilityBand,
  type LocalSeoPackage,
} from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

function PriceBlock({ pkg }: { pkg: LocalSeoPackage }) {
  if (pkg.customPrice) {
    return (
      <div className={styles.pkgPrice}>
        <p className={styles.pkgPriceBig}>{pkg.customPrice.headline}</p>
        <p className={styles.pkgPriceNote}>{pkg.customPrice.sub}</p>
      </div>
    );
  }

  const price = formatLocalPrice(pkg.price);

  return (
    <div className={styles.pkgPrice}>
      {price ? (
        <>
          <p className={styles.pkgPriceNote}>Starting at</p>
          <p className={styles.pkgPriceBig}>
            {price}
            <small>{pkg.priceUnit}</small>
          </p>
        </>
      ) : (
        <p className={styles.pkgPriceBig}>Price on request</p>
      )}
    </div>
  );
}

/** Frame 4: three packages side by side (stacked on a phone), the middle one highlighted,
    then what every package includes and the visibility-check band. */
export default function LocalSeoPackages() {
  return (
    <section className={styles.sectionGrey} id="packages">
      <div className="container">
        <header className={styles.head}>
          <h2 className={styles.heading}>{packagesCopy.title}</h2>
          <p className={styles.lede}>{packagesCopy.sub}</p>
        </header>

        <ul className={styles.pkgGrid}>
          {localSeoPackages.map((pkg) => (
            <li
              key={pkg.id}
              className={`${styles.pkg} ${pkg.highlighted ? styles.pkgHighlight : ''}`}
            >
              {pkg.highlighted ? (
                <span className={styles.pill}>{packagesCopy.popularTag}</span>
              ) : null}
              <h3 className={styles.pkgName}>{pkg.name}</h3>
              <p className={styles.pkgFor}>{pkg.forWho}</p>

              <PriceBlock pkg={pkg} />

              {pkg.lead ? <p className={styles.pkgLead}>{pkg.lead}</p> : null}

              {pkg.rows ? (
                <dl className={styles.pkgRows}>
                  {pkg.rows.map((row) => (
                    <div className={styles.pkgRow} key={row.label}>
                      <dt>{row.label}</dt>
                      <dd>{row.value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}

              {pkg.factors ? (
                <ul className={styles.factors}>
                  {pkg.factors.map((factor) => (
                    <li key={factor}>{factor}</li>
                  ))}
                </ul>
              ) : null}

              {pkg.cta ? (
                <Link href={pkg.cta.href} className={styles.buttonFull}>
                  {pkg.cta.label}
                </Link>
              ) : null}
            </li>
          ))}
        </ul>

        <div className={styles.every}>
          <h3 className={styles.everyTitle}>{packagesCopy.everyTitle}</h3>
          <ul className={styles.everyList}>
            {everyPackage.map((item) => (
              <li key={item}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.band}>
          <div>
            <h3 className={styles.bandTitle}>{visibilityBand.title}</h3>
            <p className={styles.bandBody}>{visibilityBand.body}</p>
          </div>
          <Link href={visibilityBand.button.href} className={styles.buttonBlue}>
            {visibilityBand.button.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
