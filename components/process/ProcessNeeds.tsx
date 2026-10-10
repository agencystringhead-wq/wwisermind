import { processPage } from '@/lib/process';
import { serviceIcons } from '@/components/ui/icons';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import section from '@/components/services/Section.module.css';
import ConfirmChip from './ConfirmChip';
import styles from './Process.module.css';

/**
 * Frame 5 — what we need from you, on white. Four icon cards and a reassuring lede: the
 * list is short on purpose. Every item is One Week Website data except the launch-day yes,
 * which carries a Confirm chip while the page is a draft.
 */
export default function ProcessNeeds() {
  const { eyebrow, heading, lede, items } = processPage.needs;

  return (
    <section className={`${section.section} ${section.light}`}>
      <div className="container">
        <Reveal as="header" className={section.head}>
          <p className={section.eyebrow} data-reveal="0">
            {eyebrow}
          </p>
          <ScrollReveal text={heading} className={section.heading} />
          <p className={section.lede} data-reveal="2">
            {lede}
          </p>
        </Reveal>

        <Reveal as="ul" className={styles.needs}>
          {items.map((item, i) => {
            const Glyph = serviceIcons[item.icon];
            return (
              <li className={styles.need} key={item.title} data-reveal={String(i)}>
                <span className={styles.needIcon}>
                  <Glyph className={styles.needGlyph} />
                </span>
                <h3 className={styles.needTitle}>{item.title}</h3>
                <p className={styles.needBody}>
                  {item.body}
                  <ConfirmChip question={'confirm' in item ? item.confirm : undefined} />
                </p>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
