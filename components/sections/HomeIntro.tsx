import Image from 'next/image';
import Link from 'next/link';
import { homeIntro } from '@/lib/site';
import ScrollReveal from '@/components/ui/ScrollReveal';
import { TrendUpIcon } from '@/components/ui/icons';
import styles from './HomeIntro.module.css';

/** The mark now lives in ui/icons so the service pages' case-study stat can draw the same
    one; this keeps the call site as it was. */
function ArrowUp() {
  return <TrendUpIcon className={styles.arrow} />;
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
            <ScrollReveal text={`${headingLead}${headingRest}`} className={styles.heading} />
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
