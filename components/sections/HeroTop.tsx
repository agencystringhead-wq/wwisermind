import Link from 'next/link';
import { heroTop } from '@/lib/site';
import styles from './HeroTop.module.css';

export default function HeroTop() {
  const { headingLineOne, headingLineTwo, intro, guide } = heroTop;

  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.headingBlock}>
          <span className={styles.glow} aria-hidden="true" />
          <h1 className={styles.title}>
            {headingLineOne}
            <br className={styles.lineBreak} /> {headingLineTwo}
          </h1>
        </div>

        <hr className={styles.divider} />

        <div className={styles.row}>
          <div className={styles.colIntro}>
            <p className={styles.introLabel}>{intro.label}</p>
            <p className={styles.audience}>
              <Link href={intro.audience[0].href} className={styles.audienceLink}>
                {intro.audience[0].label}
              </Link>
              <span className={styles.separator} aria-hidden="true">
                |
              </span>
              <Link href={intro.audience[1].href} className={styles.audienceLink}>
                {intro.audience[1].label}
              </Link>
            </p>
          </div>

          <div className={styles.colGuide}>
            <span className={styles.badge}>{guide.badge}</span>
            <h2 className={styles.guideTitle}>
              {guide.title}{' '}
              <span className={styles.guideEdition}>{guide.titleEdition}</span>
            </h2>
          </div>

          <div className={styles.colDetail}>
            <p className={styles.detailText}>{guide.description}</p>
            <Link href={guide.href} className={styles.detailLink}>
              {guide.linkLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
