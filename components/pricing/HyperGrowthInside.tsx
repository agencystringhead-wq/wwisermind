import Link from 'next/link';
import type { InsideColumn } from '@/lib/pricing/hyper-growth';
import local from './LocalSeo.module.css';
import styles from './HyperGrowth.module.css';

/** What each plan is built from: its standalone products by name, each linked to its own page,
    then the work done for you, and under them the plan's price. No subtotal or total is shown.
    Three columns from 1024px, stacked below. */
export default function HyperGrowthInside({
  copy,
  columns,
  tone = 'white',
}: {
  copy: { title: string; sub: string };
  columns: InsideColumn[];
  tone?: 'white' | 'grey';
}) {
  return (
    <section className={tone === 'grey' ? local.sectionGrey : local.section}>
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{copy.title}</h2>
          <p className={local.lede}>{copy.sub}</p>
        </header>

        <ul className={styles.insideGrid}>
          {columns.map((column) => (
            <li className={styles.insideCol} key={column.id}>
              <h3 className={styles.insideName}>{column.name}</h3>

              <ul className={styles.insideItems}>
                {column.items.map((item) => (
                  <li className={styles.insideItem} key={item.label}>
                    <span className={styles.insideLabel}>{item.label}</span>
                    <span className={styles.insideDetail}>
                      {item.href ? (
                        <Link href={item.href} className={styles.insideLink}>
                          {item.detail}
                        </Link>
                      ) : (
                        item.detail
                      )}
                    </span>
                  </li>
                ))}
              </ul>

              <p className={styles.planPrice}>{column.priceLine}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
