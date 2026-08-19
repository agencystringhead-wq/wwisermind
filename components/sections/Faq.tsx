'use client';

import { useId, useState } from 'react';
import Link from 'next/link';
import { faq } from '@/lib/site';
import styles from './Faq.module.css';

export default function Faq() {
  const { background, heading, subheading, items, support, link } = faq;
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.grid}>
          <div className={styles.intro}>
            <h2 className={styles.heading}>{heading}</h2>
            <p className={styles.subheading}>{subheading}</p>
          </div>

          <div className={styles.column}>
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
                      <span className={styles.number}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className={styles.questionText}>{item.question}</span>
                      <span
                        className={`${styles.dot} ${open ? styles.dotOpen : ''}`}
                        aria-hidden="true"
                      />
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

          <aside className={styles.sidebar}>
            <p className={styles.sidebarText}>{support.text}</p>

            <a href={support.href} className={styles.emailLink}>
              {support.linkLabel}
            </a>

            <video
              className={styles.photo}
              poster={background.poster}
              aria-label={background.alt}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            >
              {background.sources.map((source) => (
                <source key={source.src} src={source.src} type={source.type} />
              ))}
            </video>
          </aside>
        </div>
      </div>
    </section>
  );
}
