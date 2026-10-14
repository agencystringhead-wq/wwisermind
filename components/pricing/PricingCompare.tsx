import local from './LocalSeo.module.css';
import styles from './SeoAudit.module.css';

export type CompareRow = { criteria: string; cells: string[] };

/** A comparison table, used by the SEO Audit page (free tool or audit) and the website page
    (pay in full or monthly). The first column names the row; the last is the option the page
    recommends, tinted. Below 768px each row turns into a stacked card: the cells keep their
    place in the markup and print their column name from `data-label`, so nothing scrolls
    sideways and a screen reader still gets a real table. A blank first heading is read as
    "Criteria". */
export default function PricingCompare({
  copy,
  columns,
  rows,
  tone = 'grey',
  highlight,
  highlightFirst = false,
}: {
  copy: { title: string; sub?: string };
  /** The heading of the criteria column, then one heading per option. */
  columns: string[];
  rows: CompareRow[];
  tone?: 'white' | 'grey';
  /** Which option is tinted, counting the options only. The last one when absent. */
  highlight?: number;
  /** Below 768px, list the tinted option first in each card. */
  highlightFirst?: boolean;
}) {
  const [criteria, ...options] = columns;
  const last = highlight ?? options.length - 1;

  return (
    <section className={tone === 'white' ? local.section : local.sectionGrey}>
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{copy.title}</h2>
          {copy.sub ? <p className={local.lede}>{copy.sub}</p> : null}
        </header>

        <table className={`${styles.table} ${highlightFirst ? styles.tableFirst : ''}`}>
          <thead>
            <tr>
              <th scope="col">
                {criteria || <span className={styles.srOnly}>Criteria</span>}
              </th>
              {options.map((option, index) => (
                <th scope="col" className={index === last ? styles.auditCol : undefined} key={option}>
                  {option}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.criteria}>
                <th scope="row">{row.criteria}</th>
                {row.cells.map((cell, index) => (
                  <td
                    data-label={options[index]}
                    className={index === last ? styles.auditCol : undefined}
                    key={options[index]}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
