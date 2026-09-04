'use client';

import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { CheckIcon } from './icons';
import styles from './Accordion.module.css';

export type AccordionItem = { title: string; body: string };

/**
 * One list of disclosures, one open at a time.
 *
 * The same rows the homepage FAQ draws — a hairline between each, the title on a button
 * that carries `aria-expanded` and points at its panel — made reusable so the service
 * pages' lists are the one component with settings: `numbered` puts 01, 02, 03 in front of
 * each title, `defaultOpen` names the row that starts open, and `indicator` picks the mark
 * at the row's end — the nav's plus, turned a quarter into a cross when open, or the
 * check in a ring the core-values reference draws, which fills when the row is open. With
 * the check, closed titles sit in the muted ink so the open one reads as current.
 *
 * The open panel is rendered, the closed ones are not — as on the homepage — which keeps
 * a closed answer out of the tab order and a screen reader's way without a second
 * attribute to maintain.
 *
 * Arrow keys walk the row headers, Home and End jump to the ends; Enter and Space are the
 * button's own. `aria-controls` links each header to its panel, and the panel is a region
 * labelled by its header, so the pair read as one thing.
 */
export default function Accordion({
  items,
  numbered = false,
  defaultOpen = null,
  indicator = 'plus',
  className,
}: {
  items: AccordionItem[];
  numbered?: boolean;
  defaultOpen?: number | null;
  indicator?: 'plus' | 'check';
  className?: string;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(defaultOpen);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    let next: number | null = null;

    if (event.key === 'ArrowDown') next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowUp') next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;

    if (next === null) return;
    event.preventDefault();
    buttons.current[next]?.focus();
  };

  const listClass = [styles.list, indicator === 'check' ? styles.listCheck : '', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={listClass}>
      {items.map((item, index) => {
        const open = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div className={styles.item} key={item.title}>
            <h3 className={styles.heading}>
              <button
                type="button"
                id={buttonId}
                className={`${styles.trigger} ${numbered ? styles.triggerNumbered : ''}`}
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? null : index)}
                onKeyDown={(event) => onKeyDown(event, index)}
                ref={(node) => {
                  buttons.current[index] = node;
                }}
              >
                {numbered ? (
                  <span className={styles.number}>{String(index + 1).padStart(2, '0')}</span>
                ) : null}
                <span className={styles.title}>{item.title}</span>
                {indicator === 'check' ? (
                  <span className={styles.check} aria-hidden="true">
                    <CheckIcon />
                  </span>
                ) : (
                  <span className={styles.plus} aria-hidden="true">
                    +
                  </span>
                )}
              </button>
            </h3>

            {open ? (
              <div
                className={`${styles.panel} ${numbered ? styles.panelNumbered : ''}`}
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
              >
                <p className={styles.body}>{item.body}</p>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
