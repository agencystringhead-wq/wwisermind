import Image from 'next/image';
import Link from 'next/link';
import type { ResultCard } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 2, shared: up to three case study cards. The whole section is absent unless `show`
    is true, which each page's data sets only when it has at least two real cards. */
export default function LocalSeoResults({
  copy,
  cards,
  show,
}: {
  copy: { title: string; sub: string; linkLabel: string };
  cards: ResultCard[];
  show: boolean;
}) {
  if (!show) return null;

  return (
    <section className={styles.sectionGrey}>
      <div className="container">
        <header className={styles.head}>
          <h2 className={styles.heading}>{copy.title}</h2>
          <p className={styles.lede}>{copy.sub}</p>
        </header>

        <ul className={styles.resultGrid}>
          {cards.slice(0, 3).map((card) => (
            <li className={styles.resultCard} key={card.practice}>
              <Image
                src={card.logo.src}
                alt={card.logo.alt}
                width={card.logo.width}
                height={card.logo.height}
                className={styles.resultLogo}
                loading="lazy"
              />
              <p className={styles.resultHeadline}>{card.headline}</p>
              <blockquote className={styles.resultQuote}>{card.quote}</blockquote>
              <p className={styles.resultPerson}>
                {card.person}, {card.practice}
              </p>
              <Link href={card.href} className={styles.cardLink}>
                {copy.linkLabel} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
