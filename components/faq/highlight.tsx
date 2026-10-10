import type { ReactNode } from 'react';
import type { FaqItem } from '@/lib/faq';
import styles from './Faq.module.css';

/** Case-insensitive: does the term appear in the question or the answer? */
export function matches(item: FaqItem, query: string): boolean {
  const q = query.toLowerCase();
  return item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q);
}

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The text with every occurrence of the term wrapped in a yellow <mark>. The words are not
 * altered, only split around, so the visible text is exactly the stored text.
 */
export function highlight(text: string, query: string): ReactNode {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${escape(query)})`, 'gi'));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark className={styles.mark} key={i}>
        {part}
      </mark>
    ) : (
      part
    ),
  );
}
