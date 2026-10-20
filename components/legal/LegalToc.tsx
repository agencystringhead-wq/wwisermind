'use client';

import { useEffect, useState } from 'react';
import styles from './LegalPage.module.css';

export type TocItem = { id: string; heading: string };

/**
 * The table of contents for a legal page. On desktop it is a sticky list beside the text with
 * the section being read marked; below that it folds into an "On this page" disclosure above
 * the text.
 *
 * The active section is the last one whose top has passed the line just under the header: an
 * IntersectionObserver watches each heading against a band cut off 140px from the top and 65%
 * from the bottom, so a section lights up as it nears the top and stays lit until the next one
 * arrives. Nothing animates. Without script the links still jump to the right section.
 */
export default function LegalToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const targets = items
      .map((item) => document.getElementById(item.id))
      .filter((node): node is HTMLElement => node !== null);
    if (!('IntersectionObserver' in window) || targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-140px 0px -65% 0px' },
    );
    targets.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items]);

  const links = (
    <ol className={styles.tocList}>
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className={styles.tocLink}
            aria-current={active === item.id ? 'location' : undefined}
          >
            {item.heading}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <>
      <details className={styles.tocMobile}>
        <summary className={styles.tocSummary}>On this page</summary>
        <nav aria-label="On this page">{links}</nav>
      </details>
      <nav className={styles.tocDesktop} aria-label="On this page">
        <p className={styles.tocTitle}>On this page</p>
        {links}
      </nav>
    </>
  );
}
