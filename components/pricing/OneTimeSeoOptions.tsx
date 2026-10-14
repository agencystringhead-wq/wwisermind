import Link from 'next/link';
import { optionsCopy, seoOptions } from '@/lib/pricing/one-time-seo';
import local from './LocalSeo.module.css';
import styles from './OneTimeSeo.module.css';

/** Frame 6: the three SEO options as compact cards. The page's own card is in the middle on
    the featured (dark, yellow tab) treatment and is not a link; on a phone it comes first. */
export default function OneTimeSeoOptions() {
  return (
    <section className={local.sectionGrey}>
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{optionsCopy.title}</h2>
          <p className={local.lede}>{optionsCopy.sub}</p>
        </header>

        <ul className={styles.optionGrid}>
          {seoOptions.map((option) => (
            <li
              key={option.name}
              className={`${local.pkg} ${styles.option} ${
                option.current ? `${local.pkgFeatured} ${styles.optionCurrent}` : ''
              }`}
            >
              {option.current ? <span className={local.tab}>{optionsCopy.currentTag}</span> : null}

              <h3 className={styles.optionName}>{option.name}</h3>
              <p className={styles.optionPrice}>
                {option.price}
                {option.unit ? <small>{option.unit}</small> : null}
              </p>
              <p className={styles.optionFit}>{option.fit}</p>

              {option.href ? (
                <Link href={option.href} className={styles.optionLink}>
                  {optionsCopy.linkLabel} <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
