'use client';

import { useId, useState, type ReactNode } from 'react';
import styles from './hub.module.css';

export type FaqRow = { question: string; answer: ReactNode };

/** The hub's FAQ: one list of questions, each opening in place with a smooth height transition. One open at a time. */
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
            <div className={styles.faqAWrap} id={`${baseId}-a-${index}`} role="region" aria-label={item.question} inert={!isOpen}>
              <div className={styles.faqA}>{item.answer}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
