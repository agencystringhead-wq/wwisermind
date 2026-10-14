import Link from 'next/link';
import type { InsideColumn } from '@/lib/pricing/hyper-growth';
import local from './LocalSeo.module.css';
import styles from './HyperGrowth.module.css';

const money = (n: number) => `$${n.toLocaleString('en-US')}`;

/** What each plan is built from: its standalone parts with their own monthly prices, the sum
    of those priced parts, a line for what is not sold on its own, and the plan's price. Every
    figure is computed in lib/pricing/hyper-growth.ts from the other pricing data files. A
    column with no priced part shows no subtotal. Three columns from 1024px, stacked below. */
export default function HyperGrowthInside({
  copy,
  columns,
}: {
  copy: {
    title: string;
    sub: string;
    separateLabel: string;
    unpricedNote: string;
    planLabel: string;
  };
  columns: InsideColumn[];
}) {
  return (
    <section className={local.section}>
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{copy.title}</h2>
          <p className={local.lede}>{copy.sub}</p>
        </header>

        <ul className={styles.insideGrid}>
          {columns.map((column) => (
            <li className={styles.insideCol} key={column.id}>
              <h3 className={styles.insideName}>{column.name}</h3>

              {column.items.length > 0 ? (
                <ul className={styles.insideItems}>
                  {column.items.map((item) => (
                    <li className={styles.insideItem} key={item.label}>
                      <span>
                        <Link href={item.href} className={`${styles.insideLabel} ${styles.insideLink}`}>
                          {item.label}
                        </Link>
                        <span className={styles.insideTier}>{item.tier}</span>
                      </span>
                      <span className={styles.insidePrice}>
                        {money(item.price)}
                        <small>/mo</small>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}

              {column.items.length > 0 ? (
                <div className={styles.subtotal}>
                  <span className={styles.subtotalLabel}>{copy.separateLabel}</span>
                  <span className={styles.subtotalFigure}>
                    {money(column.subtotal)}
                    <small>/mo</small>
                  </span>
                </div>
              ) : null}
              <p className={styles.unpriced}>{copy.unpricedNote}</p>

              <div className={styles.planPrice}>
                <p className={styles.planPriceLabel}>{copy.planLabel}</p>
                <p className={styles.planPriceFigure}>
                  {money(column.planPrice)}
                  <small>/mo</small>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
