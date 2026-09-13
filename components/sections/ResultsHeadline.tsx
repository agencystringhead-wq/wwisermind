import ScrollReveal from '@/components/ui/ScrollReveal';
import { resultsPage } from '@/lib/site';
import styles from './ResultsHeadline.module.css';

/**
 * /results frame 1: the page's one h1, stacked across the reference's three lines and set
 * at the site's largest display scale — the footer CTA's heading, composed — with the
 * section headings' scroll reveal on it. The lines are the reference's own; the em dash
 * and the copyright mark are part of the words.
 *
 * The reveal is keyed to scroll position, and this block sits above the fold, so on arrival
 * it is already read in full: its top is well above the point where the last word lands.
 * Only a viewport short enough to put the headline below that point sees the words turn.
 */
export default function ResultsHeadline() {
  return (
    <section className={styles.section}>
      <div className="container">
        <ScrollReveal
          as="h1"
          text={resultsPage.headlineLines.join('\n')}
          className={styles.heading}
        />
      </div>
    </section>
  );
}
