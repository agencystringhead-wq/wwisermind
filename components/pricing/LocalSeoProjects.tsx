import Image from 'next/image';
import Link from 'next/link';
import { projectsCopy, relevantProjects } from '@/lib/pricing/local-seo';
import styles from './LocalSeo.module.css';

/** Frame 7: the homepage's launches as a tile grid. The launches carry no page of their own
    yet (their hrefs are placeholders), so a tile is a plain block, not a link to nowhere.
    Hidden when there are none. */
export default function LocalSeoProjects() {
  if (relevantProjects.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className="container">
        <header className={styles.headRow}>
          <div>
            <h2 className={styles.heading}>{projectsCopy.title}</h2>
            <p className={styles.lede}>{projectsCopy.sub}</p>
          </div>
          <Link href={projectsCopy.link.href} className={styles.textLink}>
            {projectsCopy.link.label} <span aria-hidden="true">→</span>
          </Link>
        </header>

        <ul className={styles.projectGrid}>
          {relevantProjects.map((project) => (
            <li className={styles.project} key={project.name}>
              <Image
                src={project.image}
                alt={`${project.name} website`}
                width={900}
                height={900}
                className={styles.projectImage}
                loading="lazy"
                sizes="(max-width: 767px) 100vw, 640px"
              />
              <div className={styles.projectBody}>
                <p className={styles.projectName}>{project.name}</p>
                <ul className={styles.projectStats}>
                  {project.stats.map((stat) => (
                    <li key={stat.label}>
                      <b>{stat.value}</b> {stat.label}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
