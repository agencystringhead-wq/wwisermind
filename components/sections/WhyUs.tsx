import Image from 'next/image';
import { whyUs } from '@/lib/site';
import BackgroundVideo from '@/components/ui/BackgroundVideo';
import styles from './WhyUs.module.css';

export default function WhyUs() {
  const { label, background, rows } = whyUs;

  return (
    <section className={styles.section}>
      <div className={styles.block} style={{ backgroundColor: background.color }}>
        <BackgroundVideo
          src={background.sources[0].src}
          type={background.sources[0].type}
          poster={background.poster}
          className={styles.backdrop}
        />
        <span className={styles.scrim} aria-hidden="true" />

        <div className={`container ${styles.inner}`}>
          <p className={styles.label}>{label}</p>

          <div className={styles.rows}>
            {rows.map((row) => (
              <article className={styles.row} key={row.number}>
                <div className={styles.heading}>
                  <span className={styles.number}>{row.number}</span>
                  <h3 className={styles.title}>{row.title}</h3>
                </div>

                <figure className={styles.figure}>
                  <Image
                    src={row.image}
                    alt={row.imageAlt}
                    fill
                    sizes="(max-width: 1023px) 420px, 316px"
                  />
                </figure>

                <p className={styles.body}>{row.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
