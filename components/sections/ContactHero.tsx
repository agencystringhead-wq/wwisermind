import { contactPage } from '@/lib/site';
import { ExternalLinkIcon } from '@/components/ui/icons';
import BackgroundVideo from '@/components/ui/BackgroundVideo';
import styles from './ContactHero.module.css';

/**
 * The contact page's opening frame, on the dark ground: the tab strip, then the centred
 * stack the mental-health reference runs — eyebrow, the page's one h1, the lead, a filled
 * and an outlined button, and the trust line under them.
 *
 * The strip is a nav of links rather than a tab list: two of them scroll this page and two
 * leave it, and none of them switch a panel, so tab semantics would promise something the
 * strip does not do. `aria-current` marks the one that is this page. It scrolls sideways on
 * a phone rather than wrapping, so all four stay on one line and reachable.
 *
 * The headline is a plain h1, not the scroll reveal the section headings carry: it is in
 * view before anyone has scrolled, and a reveal keyed to scroll position would leave its
 * last words grey on arrival.
 *
 * Behind everything, the looping clip — the homepage's own BackgroundVideo, which only
 * decodes while the hero is on screen and stays on its poster under reduced motion — then a
 * veil of the hero's colour over it so the type keeps its contrast whatever frame is up,
 * then the content above both. The section still paints the flat navy underneath, so
 * before the poster arrives there is the colour, never a hole.
 */
export default function ContactHero() {
  const { tabs, hero } = contactPage;
  const [source] = hero.background.sources;

  return (
    <section className={styles.section}>
      <BackgroundVideo
        src={source.src}
        type={source.type}
        poster={hero.background.poster}
        className={styles.video}
      />
      <span className={styles.veil} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        <nav className={styles.tabs} aria-label="Contact options">
          <ul className={styles.tabList}>
            {tabs.map((tab) => {
              /* A `#` placeholder is not a new tab yet — target and the note wait for the
                 real address. The mark is shown either way, as the design has it. */
              const leaves = tab.external && !tab.href.startsWith('#');

              return (
                <li key={tab.label}>
                  <a
                    href={tab.href}
                    className={`${styles.tab} ${tab.current ? styles.tabCurrent : ''}`}
                    aria-current={tab.current ? 'page' : undefined}
                    target={leaves ? '_blank' : undefined}
                    rel={leaves ? 'noreferrer' : undefined}
                  >
                    {tab.label}
                    {tab.external ? <ExternalLinkIcon className={styles.tabIcon} /> : null}
                    {leaves ? <span className="sr-only"> (opens in a new tab)</span> : null}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        <p className={styles.eyebrow}>{hero.eyebrow}</p>
        <h1 className={styles.heading}>{hero.heading}</h1>
        <p className={styles.lead}>{hero.lead}</p>

        <div className={styles.actions}>
          <a href={hero.primary.href} className={styles.primary}>
            {hero.primary.label}
          </a>
          <a href={hero.secondary.href} className={styles.secondary}>
            {hero.secondary.label}
          </a>
        </div>

        <p className={styles.trust}>{hero.trust}</p>
      </div>
    </section>
  );
}
