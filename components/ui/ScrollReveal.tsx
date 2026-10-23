import { Fragment, type CSSProperties } from 'react';
import styles from './ScrollReveal.module.css';

/* Where the reveal runs, as fractions of the viewport height measured to the top of the
   block: it starts as the sentence enters the lower third and is finished by the time it
   sits around the middle. Defaults suit a two-line section headline; callers with a longer
   or smaller-set block pass their own, because the same window spent on four times the words
   is four times the pace. */
const START = 0.75;
const END = 0.35;
/** Roughly how many words are mid-transition at once. Above one, the edge between read and
    unread stops looking like a cursor stepping along and becomes a soft front. */
const WORDS_IN_FLIGHT = 3;

/**
 * A section heading revealed by scroll position rather than by time — in CSS, no script.
 *
 * Every word is its own span, and the stylesheet runs a colour animation on it against a
 * scroll timeline (`view()`, see ScrollReveal.module.css) that follows the block's own position
 * in the viewport. Each word carries `--s` and `--w`, its share of the block's travel: where in
 * the sequence it starts and how wide a window it turns in. It is a scrubber — scrolling back up
 * runs it backwards, because the timeline is the scroll position, not elapsed time.
 *
 * Browsers without scroll timelines (Firefox), and anyone who has asked for reduced motion, get
 * the sentence in full ink straight away: the stylesheet only greys the words inside the
 * supporting, motion-allowed case, so text is never hidden.
 *
 * The sentence is also set on the container as an `aria-label`, so a screen reader gets one
 * clean sentence rather than three dozen fragments, and the text stays selectable.
 *
 * `className` is the calling section's own heading class. Everything about how the type looks
 * — size, weight, tracking, how wide it is allowed to run — stays there; this component owns
 * only the reveal, so two sections can share the effect without sharing a scale.
 *
 * A newline in `text` is a designed line break — the results headline stacks three — and
 * renders as a `<br>`, so the break holds at every width instead of depending on a measure
 * that happens to wrap in the right place. The words still run on as one sequence for the
 * reveal, and the aria-label joins them with spaces.
 *
 * `as` is the element to render. It defaults to the h2 the section headlines want, and body
 * copy passes 'p' so that borrowing the effect does not invent a heading in the outline. A
 * page whose opening line *is* its title passes 'h1' — the contact hero does.
 */
export default function ScrollReveal({
  text,
  className,
  as: Tag = 'h2',
  start: startAt = START,
  end: endAt = END,
}: {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'blockquote';
  /** Both as fractions of viewport height, measured to the top of the block: `start` is
      where the first word begins to turn and `end` is where the last one lands. */
  start?: number;
  end?: number;
}) {
  const lines = text
    .split('\n')
    .map((line) => line.trim().split(/\s+/).filter(Boolean))
    .filter((line) => line.length > 0);
  const words = lines.flat();

  /* One word's share of the whole, widened so neighbours overlap. */
  const width = Math.min(0.5, WORDS_IN_FLIGHT / Math.max(words.length, 1));
  const spread = 1 - width;
  const wordStart = (i: number) => (words.length === 1 ? 0 : (i / (words.length - 1)) * spread);

  /* One running index across the lines: the reveal reads the words as a single sequence,
     whichever line each one sits on. */
  let index = -1;

  return (
    <Tag
      className={className ? `${styles.reveal} ${className}` : styles.reveal}
      aria-label={words.join(' ')}
      style={
        {
          /* The scroll window, for the stylesheet: how far down the viewport it opens (as the
             space left below the block's top) and how far the block's top travels. */
          '--sr-inset': `${Math.round((1 - startAt) * 1000) / 10}%`,
          '--sr-len': `${Math.round((startAt - endAt) * 1000) / 10}vh`,
        } as CSSProperties
      }
    >
      {lines.map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 ? <br /> : null}
          {line.map((word) => {
            index += 1;
            const at = index;

            return (
              <span
                className={styles.word}
                key={`${word}-${at}`}
                style={{ '--s': wordStart(at).toFixed(4), '--w': width.toFixed(4) } as CSSProperties}
              >
                {word}{' '}
              </span>
            );
          })}
        </Fragment>
      ))}
    </Tag>
  );
}
