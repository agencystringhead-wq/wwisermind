import Link from 'next/link';
import { freebies } from '@/lib/site';
import ScrollReveal from '@/components/ui/ScrollReveal';
import styles from './Freebies.module.css';
import BackgroundVideo from '@/components/ui/BackgroundVideo';

export default function Freebies() {
  const { badge, headingLead, headingRest, background, items } = freebies;

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <div>
            <p className={styles.badge}>{badge}</p>

            {/* The two halves were a fixed black/grey split; the reveal carries that
                contrast itself now, word by word. Thirteen words is headline length, so it
                keeps the component's default window rather than the wider one the process
                passage needs for its forty-six. */}
            <ScrollReveal text={`${headingLead}${headingRest}`} className={styles.heading} />

            <div className={styles.list}>
              {items.map((item) => (
                <article className={styles.item} key={item.title}>
                  <h3 className={styles.itemTitle}>
                    {item.href ? (
                      <Link href={item.href} className={styles.itemLink}>
                        {item.title}
                      </Link>
                    ) : (
                      item.title
                    )}
                  </h3>
                  <p className={styles.itemBody}>{item.body}</p>
                </article>
              ))}
            </div>
          </div>

          <BackgroundVideo
            className={styles.photo}
            poster={background.poster}
            label={background.alt}
            sources={background.sources}
          />
        </div>
      </div>
    </section>
  );
}
