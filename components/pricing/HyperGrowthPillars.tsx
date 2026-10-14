import Link from 'next/link';
import { serviceIcons } from '@/components/ui/icons';
import type { PillarCard } from '@/lib/pricing/hyper-growth';
import local from './LocalSeo.module.css';
import styles from './HyperGrowth.module.css';

/** The four things in the bundle: an icon tile, a title, a line of copy and, when the card has
    one, a link to that service's own page. Four across from 1280px, two by two from 640px and
    stacked below. */
export default function HyperGrowthPillars({
  copy,
  cards,
  tone = 'grey',
}: {
  copy: { eyebrow: string; title: string; sub: string };
  cards: PillarCard[];
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

        <ul className={styles.pillarGrid}>
          {cards.map((card) => {
            const Icon = serviceIcons[card.icon];

            return (
              <li className={styles.pillar} key={card.title}>
                <span className={styles.pillarIcon}>
                  <Icon />
                </span>
                <h3 className={styles.pillarTitle}>{card.title}</h3>
                <p className={styles.pillarBody}>{card.body}</p>
                {card.link ? (
                  <Link href={card.link.href} className={styles.pillarLink}>
                    {card.link.label} <span aria-hidden="true">→</span>
                  </Link>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
