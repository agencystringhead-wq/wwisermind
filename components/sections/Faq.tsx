'use client';

import { useId, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { faq } from '@/lib/site';
import styles from './Faq.module.css';

export default function Faq() {
  const { image, headingLead, headingRest, items, link } = faq;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <Image
            src={image.src}
            alt={image.alt}
            width={656}
            height={899}
            className={styles.photo}
          />

          <div className={styles.column}>
            <h2 className={styles.heading}>
              {headingLead}
              <span className={styles.headingMuted}>{headingRest}</span>
            </h2>

            <div className={styles.list}>
              {items.map((item, index) => {
                const open = openIndex === index;
                const panelId = `${baseId}-panel-${index}`;
                const buttonId = `${baseId}-question-${index}`;

                return (
                  <div className={styles.item} key={item.question}>
                    <button
                      type="button"
                      id={buttonId}
                      className={styles.question}
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(open ? null : index)}
                    >
                      {item.question}
                    </button>

                    {open && (
                      <p className={styles.answer} id={panelId} role="region" aria-labelledby={buttonId}>
                        {item.answer}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <Link href={link.href} className={styles.link}>
              {link.label}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
