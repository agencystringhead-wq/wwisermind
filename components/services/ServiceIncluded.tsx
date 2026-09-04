import type { Service } from '@/lib/services';
import Accordion from '@/components/ui/Accordion';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from './Section.module.css';
import type { Ground } from './ServicePage';
import styles from './ServiceIncluded.module.css';

/**
 * Frame 6: what's included, as the numbered accordion. The heading holds the left column
 * and stays put while the list scrolls past it, the way the contact form's intro does;
 * the first item opens by default so the frame never arrives as a bare list of titles.
 */
export default function ServiceIncluded({ service, ground }: { service: Service; ground: Ground }) {
  return (
    <section className={`${section.section} ${section[ground]}`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className={section.eyebrow}>What’s included</p>
          <ScrollReveal
            text={`Everything the ${service.name} comes with, in the order we build it.`}
            className={styles.heading}
          />
        </div>

        <Accordion items={service.included} numbered defaultOpen={0} />
      </div>
    </section>
  );
}
