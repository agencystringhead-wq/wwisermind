'use client';

import { useId, useState, type ReactNode } from 'react';
import styles from './hub.module.css';

export type FaqRow = { question: string; answer: ReactNode };

/** The hub's FAQ: Oberon's two-column grid of question cells, each opening in place. One open at a time. */
export default function TiFaq({ items }: { items: FaqRow[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className={styles.faqGrid}>
      {items.map((item, index) => {
        const isOpen = open === index;
        return (
          <div key={item.question} className={`${styles.faqItem} ${isOpen ? styles.faqOpen : ''}`}>
            <h3>
              <button
                type="button"
                className={styles.faqQ}
                aria-expanded={isOpen}
                aria-controls={`${baseId}-a-${index}`}
                onClick={() => setOpen(isOpen ? null : index)}
              >
                {item.question}
                <span className={styles.faqPlus} aria-hidden="true" />
              </button>
            </h3>
            {isOpen ? (
              <div className={styles.faqA} id={`${baseId}-a-${index}`} role="region">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
