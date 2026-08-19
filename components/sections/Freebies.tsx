import Image from 'next/image';
import { freebies } from '@/lib/site';
import styles from './Freebies.module.css';

export default function Freebies() {
  const { badge, headingLead, headingRest, image, items } = freebies;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <p className={styles.badge}>{badge}</p>

            <h2 className={styles.heading}>
              {headingLead}
              <span className={styles.headingMuted}>{headingRest}</span>
            </h2>

            <div className={styles.list}>
              {items.map((item) => (
                <article className={styles.item} key={item.title}>
                  <h3 className={styles.itemTitle}>
                    {item.title}
                    {item.note ? <span className={styles.itemNote}>{item.note}</span> : null}
                  </h3>
                  <p className={styles.itemBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <Image
            src={image.src}
            alt={image.alt}
            width={656}
            height={899}
            className={styles.photo}
          />
        </div>
      </div>
    </section>
  );
}
