import Image from 'next/image';
import Link from 'next/link';
import { caseStudies, resultsProjects } from '@/lib/services';
import styles from './ResultsProjects.module.css';

/**
 * /results frame 2: one full-width landscape card per project, the project's name and the
 * work delivered under its left edge, and a deep gap between one block and the next so each
 * reads as its own piece rather than as a row in a list. The reference sets its projects
 * three to a row; this page gives every project the whole container instead.
 *
 * The projects are the case studies in lib/services.ts, in the order `resultsProjects`
 * gives — nothing about a project is written here. A project without its landscape
 * picture is left out entirely rather than shown with a stand-in: the case study keeps
 * its place in the list and appears the moment `wide` is filled in. A project with a `url`
 * is one link, card and caption together; without one it is a plain block, not a link
 * to nowhere.
 *
 * Under all of it, the footer's own CTA closes the page, as it does every other.
 */
export default function ResultsProjects() {
  const projects = resultsProjects
    .map((slug) => caseStudies[slug])
    .flatMap((study) => (study.wide ? [{ study, image: study.wide }] : []));

  if (projects.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Recent projects">
      <div className="container">
        <ul className={styles.list}>
          {projects.map(({ study, image }) => {
            const block = (
              <>
                <span className={styles.frame}>
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(max-width: 1340px) calc(100vw - 40px), 1300px"
                    className={styles.image}
                    style={{ objectPosition: image.position }}
                  />
                  <span className={styles.shine} aria-hidden="true" />
                </span>

                <span className={styles.caption}>
                  <span className={styles.name}>{study.name}</span>
                  {study.delivered.length > 0 ? (
                    <span className={styles.work}>{study.delivered.join(', ')}</span>
                  ) : null}
                </span>
              </>
            );

            return (
              <li className={styles.project} key={study.slug}>
                {study.url ? (
                  <Link href={study.url} className={styles.block}>
                    {block}
                  </Link>
                ) : (
                  <article className={styles.block}>{block}</article>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
