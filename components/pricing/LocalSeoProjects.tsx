import Image from 'next/image';
import Link from 'next/link';
import styles from './LocalSeo.module.css';

export type ProjectTile = {
  name: string;
  image: string;
  stats: readonly { value: string; label: string }[];
};

/** Frame 7, shared: the homepage's launches as a tile grid. The launches carry no page of
    their own yet (their hrefs are placeholders), so a tile is a plain block, not a link to
    nowhere. Hidden when there are none. */
export default function LocalSeoProjects({
  id,
  copy,
  projects,
  tone = 'white',
}: {
  id?: string;
  copy: { title: string; sub: string; link: { label: string; href: string } };
  projects: readonly ProjectTile[];
  tone?: 'white' | 'grey';
}) {
  if (projects.length === 0) return null;

  return (
    <section className={tone === 'grey' ? styles.sectionGrey : styles.section} id={id}>
      <div className="container">
        <header className={styles.headRow}>
          <div>
            <h2 className={styles.heading}>{copy.title}</h2>
            <p className={styles.lede}>{copy.sub}</p>
          </div>
          <Link href={copy.link.href} className={styles.textLink}>
            {copy.link.label} <span aria-hidden="true">→</span>
          </Link>
        </header>

        <ul className={styles.projectGrid}>
          {projects.map((project) => (
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
