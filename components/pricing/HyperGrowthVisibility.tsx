import { CheckIcon, serviceIcons } from '@/components/ui/icons';
import type { VisibilityCard } from '@/lib/pricing/hyper-growth';
import local from './LocalSeo.module.css';
import styles from './HyperGrowth.module.css';

/** How the practice gets found: three cards, each with an icon tile, a title, a paragraph and
    three check bullets, and on the AI card a row of plain text pills for the platforms (words
    only, no brand logos). Three across from 1024px, stacked below. */
export default function HyperGrowthVisibility({
  copy,
  cards,
  tone = 'white',
}: {
  copy: { eyebrow: string; title: string; sub: string };
  cards: VisibilityCard[];
  tone?: 'white' | 'grey';
}) {
  return (
    <section className={tone === 'grey' ? local.sectionGrey : local.section}>
      <div className="container">
        <header className={local.head}>
          <p className={local.eyebrow}>{copy.eyebrow}</p>
          <h2 className={local.heading}>{copy.title}</h2>
          <p className={local.lede}>{copy.sub}</p>
        </header>

        <ul className={styles.visGrid}>
          {cards.map((card) => {
            const Icon = serviceIcons[card.icon];

            return (
              <li className={styles.vis} key={card.title}>
                <span className={styles.pillarIcon}>
                  <Icon />
                </span>
                <h3 className={styles.visTitle}>{card.title}</h3>
                <p className={styles.visBody}>{card.body}</p>
                <ul className={styles.visBullets}>
                  {card.bullets.map((bullet) => (
                    <li key={bullet}>
                      <CheckIcon />
                      {bullet}
                    </li>
                  ))}
                </ul>
                {card.pills && card.pills.length > 0 ? (
                  <ul className={styles.visPills}>
                    {card.pills.map((pill) => (
                      <li key={pill}>{pill}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
