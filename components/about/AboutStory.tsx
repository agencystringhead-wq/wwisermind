import Reveal from '@/components/ui/Reveal';
import styles from './AboutStory.module.css';

/**
 * Frame 4 — our story.
 *
 * Light ground. Mono eyebrow "STORY", a heading, a short intro, then a vertical
 * timeline. Each milestone has a year label, a title, and a short paragraph.
 * Hairlines divide entries; each entry arrives with a staged scroll reveal.
 *
 * ⚠️ PLACEHOLDERS — real milestones needed from the client.
 * See the placeholder comment on each entry, and the request at the bottom of
 * the file. Replace the three PLACEHOLDER_* constants with real data.
 */

/* ---------------------------------------------------------------------------
   PLACEHOLDER: replace these with real milestones.

   Format needed for each entry:
     { year: "20XX", title: "Short title", body: "One or two sentences." }

   What to supply:
   1. When the studio was founded (year + one-liner on why it started)
   2. First client or first site launched (approximate date, key detail)
   3. Any meaningful growth moment (new service, new hire, a notable result)
   4. Any other milestone worth a timeline entry (optional)

   Once you have the real data, replace MILESTONES below.
--------------------------------------------------------------------------- */
const MILESTONES: { year: string; title: string; body: string }[] = [
  {
    year: '[YEAR]',
    title: '[Founding milestone — to be supplied]',
    body: '[What happened and why it mattered. One or two sentences. Placeholder — awaiting real date and detail from founder.]',
  },
  {
    year: '[YEAR]',
    title: '[Second milestone — to be supplied]',
    body: '[What happened and why it mattered. One or two sentences. Placeholder — awaiting real date and detail from founder.]',
  },
  {
    year: '[YEAR]',
    title: '[Third milestone — to be supplied]',
    body: '[What happened and why it mattered. One or two sentences. Placeholder — awaiting real date and detail from founder.]',
  },
  {
    year: '[YEAR]',
    title: '[Fourth milestone — optional, to be supplied]',
    body: '[What happened and why it mattered. One or two sentences. Placeholder — awaiting real date and detail from founder, or remove this entry entirely.]',
  },
];

export default function AboutStory() {
  return (
    <section className={styles.section}>
      <div className="container">
        <header className={styles.head}>
          <p className={styles.eyebrow}>Story</p>
          <h2 className={styles.heading}>How we got here.</h2>
          <p className={styles.intro}>
            wwisermind did not start as a marketing agency. It started as a question:
            why is it so hard for someone in real need to find the right therapist? The
            answer led to everything below.
          </p>
        </header>

        <ol className={styles.timeline} aria-label="Studio milestones">
          {MILESTONES.map((entry, index) => (
            <Reveal key={index} as="li" className={styles.entry}>
              <span className={styles.year} data-reveal="0">{entry.year}</span>
              <div className={styles.entryBody} data-reveal="1">
                <h3 className={styles.entryTitle}>{entry.title}</h3>
                <p className={styles.entryText}>{entry.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
