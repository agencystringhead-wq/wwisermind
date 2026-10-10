import { contactPage } from '@/lib/site';
import { ExternalLinkIcon } from '@/components/ui/icons';
import BackgroundVideo from '@/components/ui/BackgroundVideo';
import styles from './ContactHero.module.css';

/**
 * The contact page's opening frame, on the dark ground: the tab strip, then the centred
 * stack the mental-health reference runs — eyebrow, the page's one h1, the lead, and one
 * filled button, so the frame asks for exactly one thing.
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
type HeroCopy = {
  eyebrow: string;
  heading: string;
  lead: string;
  primary: { label: string; href: string };
};

/**
 * With no props it is the contact page's hero. Another page hands it its own `hero` copy and
 * — optionally — `tabs={null}` to drop the pill strip, and `overlap={false}` when nothing
 * rises over the hero's foot, which takes the 150px the mosaic needs back out of the padding.
 * The clip, the veil and the stack are unchanged, so the two heroes cannot drift.
 */
export default function ContactHero({
  hero = contactPage.hero,
  tabs = contactPage.tabs,
  overlap = true,
}: {
  hero?: HeroCopy;
  tabs?: typeof contactPage.tabs | null;
  overlap?: boolean;
} = {}) {
  const { background } = contactPage.hero;
  const [source] = background.sources;
  const sectionClass = [
    styles.section,
    overlap ? '' : styles.flush,
    tabs ? '' : styles.noTabs,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={sectionClass}>
      <BackgroundVideo
        src={source.src}
        type={source.type}
        poster={background.poster}
        className={styles.video}
      />
      <span className={styles.veil} aria-hidden="true" />

      <div className={`container ${styles.inner}`}>
        {tabs ? (
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
        ) : null}

        <p className={styles.eyebrow}>{hero.eyebrow}</p>
        <h1 className={styles.heading}>{hero.heading}</h1>
        <p className={styles.lead}>{hero.lead}</p>

        <div className={styles.actions}>
          <a href={hero.primary.href} className={styles.primary}>
            {hero.primary.label}
          </a>
        </div>
      </div>
    </section>
  );
}
