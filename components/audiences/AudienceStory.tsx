import type { Audience } from '@/lib/audiences';
import Reveal from '@/components/ui/Reveal';
import ScrollReveal from '@/components/ui/ScrollReveal';
import shared from './Audience.module.css';
import styles from './AudienceStory.module.css';

/**
 * Frame 2: the story, as the reference's "from humble beginnings" block — the heading at
 * the container's left edge on its designed lines, and the paragraph under it, set in
 * from the left and on a narrow measure so the two read as a statement and its
 * explanation rather than as a heading and its body. This is where the page says what
 * this kind of practice actually struggles with.
 */
export default function AudienceStory({ audience }: { audience: Audience }) {
  const { heading, paragraph } = audience.story;

  return (
    <section className={`${shared.section} ${shared.light} ${styles.section}`}>
      <Reveal className="container">
        <div data-reveal="0">
          <ScrollReveal text={heading} className={`${shared.title} ${styles.heading}`} />
        </div>
        <p className={`${shared.body} ${styles.paragraph}`} data-reveal="1">
          {paragraph}
        </p>
      </Reveal>
    </section>
  );
}
