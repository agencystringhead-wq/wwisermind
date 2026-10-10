import Image from 'next/image';
import Link from 'next/link';
import { caseStudies, resultsProjects } from '@/lib/services';
import { reviewsPage } from '@/lib/reviews';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from '@/components/services/Section.module.css';
import hover from '@/components/ui/MediaHover.module.css';
import styles from './Reviews.module.css';

/**
 * Frame 5 — two compact cards to /results, one per case study, carrying only the stats the
 * homepage already reports. The names, pictures and figures are read from the case studies
 * in lib/services.ts, not written here.
 */
export default function ReviewsNumbers({ ground }: { ground: string }) {
  const { numbers } = reviewsPage;
  const studies = resultsProjects.map((slug) => caseStudies[slug]);

  return (
    <section className={`${section.section} ${ground}`}>
      <div className="container">
        <Reveal as="header" className={section.head}>
          <p className={section.eyebrow} data-reveal="0">
            {numbers.eyebrow}
          </p>
          <ScrollReveal text={numbers.heading} className={section.heading} />
          <p className={section.lede} data-reveal="2">
            {numbers.lede}
          </p>
        </Reveal>

        <Reveal as="ul" className={styles.numbers}>
          {studies.map((study, i) => (
            <li key={study.slug} data-reveal={String(i)}>
              <Link href="/results" className={styles.numberCard}>
                <span className={`${styles.numberImage} ${hover.frame}`}>
                  <Image
                    src={study.project.image}
                    alt={`The ${study.name} website`}
                    fill
                    sizes="(max-width: 1023px) 180px, 220px"
                  />
                  <span className={hover.shine} aria-hidden="true" />
                </span>

                <span className={styles.numberBody}>
                  <span className={styles.numberName}>{study.name}</span>
                  <span className={styles.stats}>
                    {study.project.stats.map((stat) => (
                      <span className={styles.stat} key={stat.label}>
                        <span className={styles.statValue}>{stat.value}</span>
                        <span className={styles.statLabel}>{stat.label}</span>
                      </span>
                    ))}
                  </span>
                  <span className={styles.numberLink}>
                    {numbers.cardCta}
                    <span aria-hidden="true"> →</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
