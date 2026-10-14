import Image from 'next/image';
import Link from 'next/link';
import { resultCards, resultsCopy, showResults } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 2: up to three case study cards. The whole section is absent unless
    `showResults` is true, which needs at least two real cards in lib/pricing/local-seo.ts. */
export default function LocalSeoResults() {
  if (!showResults) return null;

  return (
    <section className={styles.sectionGrey}>
      <div className="container">
        <header className={styles.head}>
          <h2 className={styles.heading}>{resultsCopy.title}</h2>
          <p className={styles.lede}>{resultsCopy.sub}</p>
        </header>

        <ul className={styles.resultGrid}>
          {resultCards.slice(0, 3).map((card) => (
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
                {resultsCopy.linkLabel} <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
