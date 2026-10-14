import Image from 'next/image';
import { founderNote, showFounderNote, whyCards, whyCopy } from '@/lib/pricing/ongoing-seo';
import local from './LocalSeo.module.css';
import styles from './OngoingSeo.module.css';

/** Frame 7: six numbered cards, three across from 1024px, two from 640px and one below, and
    an optional founder note under them, shown only when `showFounderNote` is set. */
export default function OngoingSeoWhy() {
  return (
    <section className={local.sectionGrey}>
      <div className="container">
        <header className={local.head}>
          <p className={local.eyebrow}>{whyCopy.eyebrow}</p>
          <h2 className={local.heading}>{whyCopy.title}</h2>
        </header>

        <ol className={styles.whyGrid}>
          {whyCards.map((card, index) => (
            <li className={styles.whyCard} key={card.title}>
              <span className={styles.whyNumber} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.whyTitle}>{card.title}</h3>
              <p className={styles.whyBody}>{card.body}</p>
            </li>
          ))}
        </ol>

        {showFounderNote && founderNote.quote ? (
          <figure className={styles.founder}>
            {founderNote.photo ? (
              <Image
                src={founderNote.photo.src}
                alt={founderNote.photo.alt}
                width={founderNote.photo.width}
                height={founderNote.photo.height}
                className={styles.founderPhoto}
                loading="lazy"
              />
            ) : null}
            <blockquote className={styles.founderQuote}>{founderNote.quote}</blockquote>
            <figcaption className={styles.founderName}>
              {founderNote.name}
              {founderNote.role ? `, ${founderNote.role}` : ''}
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
