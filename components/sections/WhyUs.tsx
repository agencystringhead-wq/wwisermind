import Image from 'next/image';
import { whyUs } from '@/lib/site';
import styles from './WhyUs.module.css';

export default function WhyUs() {
  const { label, background, rows } = whyUs;

  return (
    <section className={styles.section}>
      <div className={styles.block}>
        <Image
          src={background}
          alt=""
          fill
          sizes="100vw"
          className={styles.backdrop}
        />

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
