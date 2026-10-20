import { showcaseProjects, type ShowcaseProject } from '@/lib/results';
import styles from './ResultsShowcase.module.css';

/** One banner: the lifestyle photograph, linked as a whole to the live site, and its caption. */
function Banner({ project, first }: { project: ShowcaseProject; first: boolean }) {
  const { name, description, url, devices, note, image } = project;

  return (
    <li className={styles.project}>
      <a
        href={url}
        target="_blank"
        rel="noopener"
        className={styles.imageLink}
        aria-label={`Visit ${name} website`}
      >
        <span className={styles.frame}>
          {/* Phones get the 1000px file, everything wider the 2000px one. The first banner
              starts about 555px down on a 1440x900 screen, so it is partly above the fold and
              loads at high priority; the second is well below it and loads lazily. */}
          <picture>
            <source media="(max-width: 767px)" srcSet={image.mobile} />
            <img
              src={image.desktop}
              width={image.width}
              height={image.height}
              alt={`${name} website shown on laptop, tablet and phone, designed by wwisermind`}
              loading={first ? 'eager' : 'lazy'}
              fetchPriority={first ? 'high' : 'auto'}
              decoding="async"
              className={styles.image}
            />
          </picture>
        </span>
      </a>

      <div className={styles.caption}>
        <div className={styles.text}>
          <h2 className={styles.name}>{name}</h2>
          <p className={styles.description}>{description}</p>
          <ul className={styles.tags} aria-label={note}>
            {devices.map((device) => (
              <li className={styles.tag} key={device}>
                {device}
              </li>
            ))}
          </ul>
        </div>

        <a href={url} target="_blank" rel="noopener" className={styles.visit}>
          Visit site <span className={styles.arrow} aria-hidden="true">→</span>
        </a>
      </div>
    </li>
  );
}

/**
 * /results/ client showcase: one full-width banner per project, stacked under the page's
 * headline, in the order lib/results.ts gives. The photograph is the link; under it sit the
 * project's name, a line about the practice, the devices it was built for and a "Visit site"
 * link to the same address. Nothing animates on entrance: the only motion is the hover, and
 * that is switched off under prefers-reduced-motion.
 */
export default function ResultsShowcase() {
  if (showcaseProjects.length === 0) return null;

  return (
    <section className={styles.section} aria-label="Recent projects">
      <div className="container">
        <ul className={styles.list}>
          {showcaseProjects.map((project, index) => (
            <Banner project={project} first={index === 0} key={project.slug} />
          ))}
        </ul>
      </div>
    </section>
  );
}
