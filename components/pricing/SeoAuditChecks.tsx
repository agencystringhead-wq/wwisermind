import { serviceIcons } from '@/components/ui/icons';
import { checkCards, checksCopy } from '@/lib/pricing/seo-audit';
import local from './LocalSeo.module.css';
import styles from './SeoAudit.module.css';

/** Frame 3: what the audit covers, nine cards. The card is the Local SEO check card (icon
    tile, title, line of copy); only the grid is new, three across where that one is two. */
export default function SeoAuditChecks() {
  return (
    <section className={local.sectionGrey} id="whats-checked">
      <div className="container">
        <header className={local.head}>
          <h2 className={local.heading}>{checksCopy.title}</h2>
          <p className={local.lede}>{checksCopy.sub}</p>
        </header>

        <ul className={styles.checkGrid}>
          {checkCards.map((card) => {
            const Icon = serviceIcons[card.icon];

            return (
              <li className={local.fitCard} key={card.title}>
                <span className={local.fitIcon}>
                  <Icon />
                </span>
                <div>
                  <h3 className={local.fitTitle}>{card.title}</h3>
                  <p className={local.fitBody}>{card.body}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
