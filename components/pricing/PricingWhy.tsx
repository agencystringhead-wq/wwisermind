import Image from 'next/image';
import local from './LocalSeo.module.css';
import styles from './OngoingSeo.module.css';

export type FounderNote = {
  quote: string;
  name: string;
  role: string;
  photo: { src: string; alt: string; width: number; height: number } | null;
};

/** Six numbered cards, three across from 1024px, two from 640px and one below, and an
    optional founder note under them, shown only when one is passed. Used by the Ongoing SEO
    and website pages, each with its own copy. */
export default function PricingWhy({
  copy,
  cards,
  founder,
  tone = 'grey',
}: {
  copy: { eyebrow?: string; title: string };
  cards: { title: string; body: string }[];
  founder?: FounderNote | null;
  tone?: 'white' | 'grey';
}) {
  return (
    <section className={tone === 'white' ? local.section : local.sectionGrey}>
      <div className="container">
        <header className={local.head}>
          {copy.eyebrow ? <p className={local.eyebrow}>{copy.eyebrow}</p> : null}
          <h2 className={local.heading}>{copy.title}</h2>
        </header>

        <ol className={styles.whyGrid}>
          {cards.map((card, index) => (
            <li className={styles.whyCard} key={card.title}>
              <span className={styles.whyNumber} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className={styles.whyTitle}>{card.title}</h3>
              <p className={styles.whyBody}>{card.body}</p>
            </li>
          ))}
        </ol>

        {founder && founder.quote ? (
          <figure className={styles.founder}>
            {founder.photo ? (
              <Image
                src={founder.photo.src}
                alt={founder.photo.alt}
                width={founder.photo.width}
                height={founder.photo.height}
                className={styles.founderPhoto}
                loading="lazy"
              />
            ) : null}
            <blockquote className={styles.founderQuote}>{founder.quote}</blockquote>
            <figcaption className={styles.founderName}>
              {founder.name}
              {founder.role ? `, ${founder.role}` : ''}
            </figcaption>
          </figure>
        ) : null}
      </div>
    </section>
  );
}
