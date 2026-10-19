import CtaLink from '@/components/booking/CtaLink';
import {
  CalendarIcon,
  CheckIcon,
  CreditCardIcon,
  FlagIcon,
  SpeedometerIcon,
  GrowthChartIcon,
  PenIcon,
  MapPinIcon,
  PersonIcon,
  PlusCircleIcon,
  RocketIcon,
  ShieldIcon,
  ShieldPlusIcon,
  HandshakeIcon,
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
  card: CreditCardIcon,
  calendar: CalendarIcon,
  shield: ShieldIcon,
  shieldPlus: ShieldPlusIcon,
  handshake: HandshakeIcon,
  speedometer: SpeedometerIcon,
  flag: FlagIcon,
  pen: PenIcon,
};

const dollars = (price: number) => `$${price.toLocaleString('en-US')}`;

/** The price block is a label and a figure, or a figure and a note, at a fixed height, so the
    section label and rows start at the same place on every card. A plan with only a figure and
    a suffix has no label line and a shorter block; when any card in the grid has a line under
    its price, every flat block reserves room for it. */
function PriceBlock({ pkg, reserveNote }: { pkg: LocalSeoPackage; reserveNote: boolean }) {
  if (pkg.annual) {
    const { annual } = pkg;
    return (
      <div className={`${styles.pkgPrice} ${styles.pkgPriceAnnual}`}>
        <p className="sr-only">{annual.spoken}</p>
        <p className={styles.pkgPriceList} aria-hidden="true">
          <s>
            {dollars(annual.listMonthly)}
            {pkg.suffix}
          </s>
        </p>
        <p className={styles.pkgPriceBig} aria-hidden="true">
          {dollars(annual.effectiveMonthly)}
          <small>{pkg.suffix}</small>
        </p>
        <p className={styles.pkgPriceBilled} aria-hidden="true">
          {annual.billed}
        </p>
        <p className={styles.pkgSave} aria-hidden="true">
          {annual.save}
        </p>
      </div>
    );
  }

  if (pkg.customPrice) {
    return (
      <div className={`${styles.pkgPrice} ${styles.pkgPriceQuoted}`}>
        <p className={styles.pkgPriceBig}>{pkg.customPrice.headline}</p>
        <p className={styles.pkgPriceNote}>{pkg.customPrice.sub}</p>
      </div>
    );
  }

  const flat = pkg.priceLabel ? '' : reserveNote ? styles.pkgPriceFlatNoted : styles.pkgPriceFlat;

  return (
    <div className={`${styles.pkgPrice} ${flat}`}>
      {pkg.priceLabel ? <p className={styles.pkgPriceNote}>{pkg.priceLabel}</p> : null}
      <p className={styles.pkgPriceBig}>
        {pkg.price !== undefined ? dollars(pkg.price) : null}
        <small>{pkg.suffix}</small>
      </p>
      {pkg.priceNote ? <p className={styles.pkgPriceFoot}>{pkg.priceNote}</p> : null}
    </div>
  );
}

/** The package grid, shared by the Local SEO, Ongoing SEO and website pages: cards side by
    side (the featured one first on a phone), then what every package includes and, when the
    page has them, a terms line, a line of links to other options and a visibility band.
    `columns` is 3 for the usual grid, or 2 for a pair that should not stretch too wide. */
export default function LocalSeoPackages({
  id = 'packages',
  copy,
  packages,
  every,
  band,
  terms,
  more,
  columns = 3,
  notice,
}: {
  id?: string;
  copy: { eyebrow?: string; title: string; sub: string };
  packages: LocalSeoPackage[];
  every: { title: string; items: string[] };
  band?: { title: string; body: string; button: { label: string; href: string } };
  /** Printed under the "every plan" row, one small line each; left out while empty. */
  terms?: string | string[];
  more?: LineSegment[];
  columns?: 2 | 3;
  /** A slim pill under the heading, such as "Available on yearly plans only". */
  notice?: string;
}) {
  const reserveNote = packages.some((pkg) => pkg.priceNote);
  const everyCols = every.items.length >= 5 ? 3 : Math.min(every.items.length, 4);
  const termLines = (Array.isArray(terms) ? terms : terms ? [terms] : []).filter(Boolean);

  return (
    <section className={styles.sectionGrey} id={id}>
      <div className="container">
        <header className={styles.head}>
          {copy.eyebrow ? <p className={styles.eyebrow}>{copy.eyebrow}</p> : null}
          <h2 className={styles.heading}>{copy.title}</h2>
          <p className={styles.lede}>{copy.sub}</p>
          {notice ? (
            <p className={styles.notice}>
              <CalendarIcon />
              {notice}
            </p>
          ) : null}
        </header>

        <ul
          className={`${styles.pkgGrid} ${columns === 2 ? styles.pkgGridTwo : ''} ${
            packages.some((pkg) => pkg.annual) ? styles.pkgGridAnnual : ''
          }`}
        >
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

                <PriceBlock pkg={pkg} reserveNote={reserveNote} />

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
                      {row.value ? (
                        row.valueHref ? (
                          <CtaLink href={row.valueHref} className={styles.rowLink}>
                            {row.value}
                          </CtaLink>
                        ) : (
                          <span className={styles.rowValue}>{row.value}</span>
                        )
                      ) : null}
                    </li>
                  ))}
                </ul>

                {pkg.cta ? (
                  <CtaLink
                    href={pkg.cta.href}
                    className={pkg.featured ? styles.buttonBlueFull : styles.buttonFull}
                  >
                    {pkg.cta.label}
                  </CtaLink>
                ) : null}
                {pkg.ctaNote ? <p className={styles.pkgCtaNote}>{pkg.ctaNote}</p> : null}
              </li>
            );
          })}
        </ul>

        <div className={styles.every}>
          <h3 className={styles.everyTitle}>{every.title}</h3>
          <ul
            className={styles.everyList}
            style={{ '--every-cols': everyCols } as React.CSSProperties}
          >
            {every.items.map((item) => (
              <li key={item}>
                <CheckIcon />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {termLines.map((line) => (
          <p className={styles.terms} key={line}>
            {line}
          </p>
        ))}

        {more && more.length > 0 ? (
          <p className={styles.moreOptions}>
            {more.map((part, index) =>
              'href' in part ? (
                <CtaLink href={part.href} key={index}>
                  {part.label}
                </CtaLink>
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
            <CtaLink href={band.button.href} className={styles.buttonBlue}>
              {band.button.label}
            </CtaLink>
          </div>
        ) : null}
      </div>
    </section>
  );
}
