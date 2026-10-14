import { serviceIcons } from '@/components/ui/icons';
import type { FitCard } from '@/lib/pricing/local-seo';
import local from './LocalSeo.module.css';
import styles from './SeoAudit.module.css';

/** A grid of check cards: what the SEO Audit covers and what Ongoing SEO includes. The card is
    the Local SEO check card (icon tile, title, line of copy); the grid is three across from
    1024px, two from 640px and one below. */
export default function PricingChecks({
  id,
  copy,
  cards,
  tone = 'grey',
}: {
  id?: string;
  copy: { eyebrow?: string; title: string; sub: string };
  cards: FitCard[];
  tone?: 'white' | 'grey';
}) {
  return (
    <section className={tone === 'grey' ? local.sectionGrey : local.section} id={id}>
      <div className="container">
        <header className={local.head}>
          {copy.eyebrow ? <p className={local.eyebrow}>{copy.eyebrow}</p> : null}
          <h2 className={local.heading}>{copy.title}</h2>
          <p className={local.lede}>{copy.sub}</p>
        </header>

        <ul className={styles.checkGrid}>
          {cards.map((card) => {
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
