import Image from 'next/image';
import Link from 'next/link';
import { homeIntro } from '@/lib/site';
import StatementReveal from './StatementReveal';
import styles from './HomeIntro.module.css';

function ArrowUp() {
  return (
    <svg className={styles.arrow} viewBox="0 0 24 22" fill="currentColor" aria-hidden="true">
      <path d="M12 1.4c.5 0 1 .3 1.2.8l8.6 16.4c.5.9-.5 1.9-1.4 1.5L12 16.6l-8.4 3.5c-.9.4-1.9-.6-1.4-1.5L10.8 2.2c.2-.5.7-.8 1.2-.8z" />
    </svg>
  );
}

const { headingLead, headingRest, eyebrow, viewAll, projects } = homeIntro;

/**
 * The first content section. The two case studies sat in a snap-scrolling track with paging
 * dots, repeated four times to give it something to slide through; with only two of them the
 * carousel was scaffolding around a pair of cards, so they are a plain grid now and the
 * component needs no state, no refs and no client bundle at all.
 */
export default function HomeIntro() {
  return (
    <section className={styles.section}>
      <div className={styles.block}>
        <div className="container">
          <div className={styles.headingRow}>
            {/* The two halves were a fixed grey/ink split; the reveal now carries that
                contrast itself, word by word, so they join back into one sentence. */}
            <StatementReveal text={`${headingLead}${headingRest}`} />
          </div>

          <div className={styles.metaRow}>
            <p className={styles.eyebrow}>
              <span className={styles.dot} aria-hidden="true" />
              {eyebrow}
            </p>
            <Link href={viewAll.href} className={styles.viewAll}>
              {viewAll.label}
            </Link>
          </div>

          <div className={styles.grid}>
            {projects.map((project) => (
              <article className={styles.card} key={project.name}>
                <figure className={styles.figure}>
                  <Image
                    src={project.image}
                    alt={`${project.name} project`}
                    fill
                    sizes="(max-width: 640px) 90vw, 640px"
                  />
                  {/* the sweep; decorative, and never in the way of a click */}
                  <span className={styles.shine} aria-hidden="true" />
                </figure>

                <div className={styles.stats}>
                  <Link href={project.href} className={styles.name}>
                    {project.name}
                  </Link>
                  {project.stats.map((stat) => (
                    <p className={styles.stat} key={stat.label}>
                      <ArrowUp />
                      <span className={styles.statValue}>{stat.value}</span>
                      <span className={styles.statLabel}>{stat.label}</span>
                    </p>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
