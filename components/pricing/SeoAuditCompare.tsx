import { compareColumns, compareCopy, compareRows } from '@/lib/pricing/seo-audit';
import local from './LocalSeo.module.css';
import styles from './SeoAudit.module.css';

/** Frame 6: a three-column table. Below 768px each row turns into a stacked card: the cells
    keep their place in the markup and print their column name from `data-label`, so nothing
    scrolls sideways and a screen reader still gets a real table. */
export default function SeoAuditCompare() {
  const [criteria, free, audit] = compareColumns;

  return (
    <section className={local.sectionGrey}>
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{compareCopy.title}</h2>
          <p className={local.lede}>{compareCopy.sub}</p>
        </header>

        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">{criteria}</th>
              <th scope="col">{free}</th>
              <th scope="col" className={styles.auditCol}>
                {audit}
              </th>
            </tr>
          </thead>
          <tbody>
            {compareRows.map((row) => (
              <tr key={row.criteria}>
                <th scope="row">{row.criteria}</th>
                <td data-label={free}>{row.free}</td>
                <td data-label={audit} className={styles.auditCol}>
                  {row.audit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
