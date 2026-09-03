import { contactPage } from '@/lib/site';
import FooterClocks from '@/components/layout/FooterClocks';
import ScrollReveal from '@/components/ui/ScrollReveal';
import WorldMap from '@/components/ui/WorldMap';
import styles from './ContactStudio.module.css';

/**
 * Where the work happens, and why the distance is an advantage — on white to close the
 * page, two columns: the words and the four cities on the left, the world map on the
 * right, with India picked out from the three countries the clients are in.
 *
 * The time strip is the footer's own clock component, handed this page's four cities, and
 * the map's tooltips read the time through the same formatter.
 */
export default function ContactStudio() {
  const { heading, body, clocks, map } = contactPage.studio;

  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <ScrollReveal text={heading} className={styles.heading} />
          <p className={styles.body}>{body}</p>

          <div className={styles.clockStrip}>
            <FooterClocks clocks={clocks} />
          </div>
        </div>

        <div className={styles.mapFrame}>
          <WorldMap places={map.places} legend={map.legend} label={map.label} />
        </div>
      </div>
    </section>
  );
}
