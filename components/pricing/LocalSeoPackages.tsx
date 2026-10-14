import Link from 'next/link';
import {
  CheckIcon,
  GrowthChartIcon,
  MapPinIcon,
  PersonIcon,
  PlusCircleIcon,
  RocketIcon,
  UsersIcon,
} from '@/components/ui/icons';
import type { LineSegment, LocalSeoPackage, PackageIcon } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

const packageIcons: Record<PackageIcon, typeof RocketIcon> = {
  growth: GrowthChartIcon,
  rocket: RocketIcon,
  map: MapPinIcon,
  person: PersonIcon,
  users: UsersIcon,
};

const dollars = (price: number) => `$${price.toLocaleString('en-US')}`;

/** The price block is a label and a figure, or a figure and a note, at a fixed height, so the
    section label and rows start at the same place on every card. A plan with only a figure and
    a suffix has no label line and a shorter block. */
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
    <div className={`${styles.pkgPrice} ${pkg.priceLabel ? '' : styles.pkgPriceFlat}`}>
      {pkg.priceLabel ? <p className={styles.pkgPriceNote}>{pkg.priceLabel}</p> : null}
      <p className={styles.pkgPriceBig}>
        {pkg.price !== undefined ? dollars(pkg.price) : null}
        <small>{pkg.suffix}</small>
      </p>
    </div>
  );
}

/** The package grid, shared by the Local SEO and Ongoing SEO pages: three cards side by side
    (the featured one first on a phone), then what every package includes and, when the page
    has them, a visibility band, a terms line and a line of links to other options. */
export default function LocalSeoPackages({
  id = 'packages',
  copy,
  packages,
  every,
  band,
  terms,
  more,
}: {
  id?: string;
  copy: { eyebrow?: string; title: string; sub: string };
  packages: LocalSeoPackage[];
  every: { title: string; items: string[] };
  band?: { title: string; body: string; button: { label: string; href: string } };
  /** Printed under the "every plan" row; left out while empty. */
  terms?: string;
  more?: LineSegment[];
}) {
  return (
    <section className={styles.sectionGrey} id={id}>
      <div className="container">
        <header className={styles.head}>
          {copy.eyebrow ? <p className={styles.eyebrow}>{copy.eyebrow}</p> : null}
          <h2 className={styles.heading}>{copy.title}</h2>
          <p className={styles.lede}>{copy.sub}</p>
        </header>

        <ul className={styles.pkgGrid}>
          {packages.map((pkg) => {
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
                  <Link
                    href={pkg.cta.href}
                    className={pkg.featured ? styles.buttonBlueFull : styles.buttonFull}
                  >
                    {pkg.cta.label}
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>

        <div className={styles.every}>
          <h3 className={styles.everyTitle}>{every.title}</h3>
          <ul
            className={styles.everyList}
            style={{ '--every-cols': Math.min(every.items.length, 4) } as React.CSSProperties}
          >
            {every.items.map((item) => (
              <li key={item}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {terms ? <p className={styles.terms}>{terms}</p> : null}

        {more && more.length > 0 ? (
          <p className={styles.moreOptions}>
            {more.map((part, index) =>
              'href' in part ? (
                <Link href={part.href} key={index}>
                  {part.label}
                </Link>
              ) : (
                <span key={index}>{part.text}</span>
              ),
            )}
          </p>
        ) : null}

        {band ? (
          <div className={styles.band}>
            <div>
              <h3 className={styles.bandTitle}>{band.title}</h3>
              <p className={styles.bandBody}>{band.body}</p>
            </div>
            <Link href={band.button.href} className={styles.buttonBlue}>
              {band.button.label}
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
