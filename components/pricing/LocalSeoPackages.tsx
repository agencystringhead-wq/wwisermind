import Link from 'next/link';
import {
  CheckIcon,
  GrowthChartIcon,
  MapPinIcon,
  PlusCircleIcon,
  RocketIcon,
} from '@/components/ui/icons';
import {
  everyPackage,
  localSeoPackages,
  packagesCopy,
  visibilityBand,
  type LocalSeoPackage,
  type PackageIcon,
} from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

const packageIcons: Record<PackageIcon, typeof RocketIcon> = {
  growth: GrowthChartIcon,
  rocket: RocketIcon,
  map: MapPinIcon,
};

/** The price block is always two lines (a label and a figure, or a figure and a note) at a
    fixed height, so the section label and rows start at the same place on every card. */
function PriceBlock({ pkg }: { pkg: LocalSeoPackage }) {
  if (pkg.customPrice) {
    return (
      <div className={`${styles.pkgPrice} ${styles.pkgPriceQuoted}`}>
        <p className={styles.pkgPriceBig}>{pkg.customPrice.headline}</p>
        <p className={styles.pkgPriceNote}>{pkg.customPrice.sub}</p>
      </div>
    );
  }

  return (
    <div className={styles.pkgPrice}>
      <p className={styles.pkgPriceNote}>{pkg.priceLabel}</p>
      <p className={styles.pkgPriceBig}>
        {pkg.price !== undefined ? `$${pkg.price}` : null}
        <small>{pkg.suffix}</small>
      </p>
    </div>
  );
}

/** Frame 4: three packages side by side (the featured one first on a phone), then what
    every package includes and the visibility-check band. */
export default function LocalSeoPackages() {
  return (
    <section className={styles.sectionGrey} id="packages">
      <div className="container">
        <header className={styles.head}>
          <h2 className={styles.heading}>{packagesCopy.title}</h2>
          <p className={styles.lede}>{packagesCopy.sub}</p>
        </header>

        <ul className={styles.pkgGrid}>
          {localSeoPackages.map((pkg) => {
            const Badge = packageIcons[pkg.icon];

            return (
              <li
                key={pkg.id}
                className={`${styles.pkg} ${pkg.featured ? styles.pkgFeatured : ''}`}
              >
                {pkg.tag ? <span className={styles.tab}>{pkg.tag}</span> : null}

                <div className={styles.pkgHead}>
                  <h3 className={styles.pkgName}>{pkg.name}</h3>
                  <span className={styles.badge}>
                    <Badge />
                  </span>
                </div>
                <p className={styles.pkgFor}>{pkg.description}</p>

                <PriceBlock pkg={pkg} />

                <p className={styles.pkgLead}>
                  {pkg.sectionPlus ? <PlusCircleIcon /> : null}
                  {pkg.sectionLabel}
                </p>

                <ul className={styles.pkgRows}>
                  {pkg.rows.map((row) => (
                    <li className={styles.pkgRow} key={row.label}>
                      <span className={styles.rowLabel}>
                        <span className={styles.rowCheck}>
                          <CheckIcon />
                        </span>
                        {row.label}
                      </span>
                      {row.value ? <span className={styles.rowValue}>{row.value}</span> : null}
                    </li>
                  ))}
                </ul>

                {pkg.cta ? (
                  <Link href={pkg.cta.href} className={styles.buttonFull}>
                    {pkg.cta.label}
                  </Link>
                ) : null}
              </li>
            );
          })}
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
