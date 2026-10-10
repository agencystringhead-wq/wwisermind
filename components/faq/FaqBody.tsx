'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { faqPage, readyItems, visibleCategories, type FaqCategoryId, type FaqItem } from '@/lib/faq';
import Reveal from '@/components/ui/Reveal';
import faq from '@/components/sections/Faq.module.css';
import { useFaqSearch } from './FaqSearchContext';
import { highlight, matches } from './highlight';
import styles from './Faq.module.css';

/** Answers are plain text; a blank line is a paragraph break. */
const paragraphs = (answer: string) => answer.split(/\n{2,}/);

/** Where an open question lives in the URL, without a history entry and without a jump. */
function setHash(id: string | null) {
  const base = window.location.pathname + window.location.search;
  window.history.replaceState(null, '', id ? `#${id}` : base);
}

/**
 * The body: a sticky topic list on the left, the accordion groups on the right.
 *
 * Each group is one topic with its own list, and only one question is open per group. The
 * rows are the homepage FAQ's own — its classes, imported — so the look and the dot that
 * grows on open are identical. Every row has a stable id; opening one writes it to the hash,
 * and arriving on a URL with a hash opens and scrolls to that row.
 *
 * With a search term, each group keeps only the questions that match, and the first match in
 * each is opened for the reader unless they have opened another. The active topic in the
 * list follows the scroll through an IntersectionObserver.
 */
export default function FaqBody() {
  const { body } = faqPage;
  const { query } = useFaqSearch();

  /* The reader's own choices: an id is open, null is closed on purpose, and no entry means
     untouched, which lets the search open a first match by default. */
  const [chosen, setChosen] = useState<Partial<Record<FaqCategoryId, string | null>>>({});
  const [active, setActive] = useState<FaqCategoryId | null>(visibleCategories[0]?.id ?? null);
  const anchors = useRef<Partial<Record<FaqCategoryId, HTMLElement | null>>>({});

  const groups = useMemo(
    () =>
      visibleCategories.map((category) => {
        const all = readyItems.filter((item) => item.category === category.id);
        const shown = query ? all.filter((item) => matches(item, query)) : all;
        return { category, total: all.length, shown };
      }),
    [query],
  );

  const found = groups.reduce((sum, g) => sum + g.shown.length, 0);

  /* A new search starts clean: whatever was open before no longer describes the list. */
  useEffect(() => {
    setChosen({});
  }, [query]);

  /* Arrive on, or move to, a #question: open it and bring it into view. */
  useEffect(() => {
    const apply = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      const item = readyItems.find((candidate) => candidate.id === id);
      if (!item) return;
      setChosen((prev) => ({ ...prev, [item.category]: item.id }));
      window.setTimeout(() => {
        document.getElementById(item.id)?.scrollIntoView({ block: 'start' });
      }, 120);
    };
    apply();
    window.addEventListener('hashchange', apply);
    return () => window.removeEventListener('hashchange', apply);
  }, []);

  /* The topic list follows the scroll: the first group whose block is in the band below the
     header counts as the current one. */
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const live = new Set<FaqCategoryId>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = (entry.target as HTMLElement).dataset.category as FaqCategoryId;
          if (entry.isIntersecting) live.add(id);
          else live.delete(id);
        }
        const first = visibleCategories.find((c) => live.has(c.id));
        if (first) setActive(first.id);
      },
      { rootMargin: '-160px 0px -55% 0px' },
    );
    for (const node of Object.values(anchors.current)) if (node) observer.observe(node);
    return () => observer.disconnect();
  }, [groups.length]);

  const openIdFor = (categoryId: FaqCategoryId, shown: FaqItem[]) => {
    const picked = chosen[categoryId];
    if (picked !== undefined) return picked;
    return query && shown.length > 0 ? shown[0].id : null;
  };

  const toggle = (item: FaqItem, isOpen: boolean) => {
    setChosen((prev) => ({ ...prev, [item.category]: isOpen ? null : item.id }));
    setHash(isOpen ? null : item.id);
  };

  return (
    <section className={styles.body}>
      <div className={`container ${styles.layout}`}>
        <nav className={styles.topics} aria-label={body.navLabel}>
          <p className={styles.topicsLabel}>{body.navLabel}</p>
          <ul className={styles.topicList}>
            {groups.map(({ category, shown }) => {
              const empty = shown.length === 0;
              const current = active === category.id && !empty;
              return (
                <li key={category.id}>
                  {empty ? (
                    <span className={`${styles.topic} ${styles.topicEmpty}`}>
                      <span className={styles.topicText}>{category.label}</span>
                      <span className={styles.topicCount}>{shown.length}</span>
                    </span>
                  ) : (
                    <a
                      href={`#topic-${category.id}`}
                      className={`${styles.topic} ${current ? styles.topicOn : ''}`}
                      aria-current={current ? 'true' : undefined}
                    >
                      <span className={styles.topicText}>{category.label}</span>
                      <span className={styles.topicCount}>{shown.length}</span>
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className={styles.results}>
          {query && found === 0 ? (
            <div className={styles.empty}>
              <p className={styles.emptyLine}>{body.empty.line(query)}</p>
              <Link href={body.empty.linkHref} className={styles.emptyLink}>
                {body.empty.linkLabel}
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          ) : null}

          {groups
            .filter((g) => g.shown.length > 0)
            .map(({ category, shown }, index) => {
              const openId = openIdFor(category.id, shown);
              const headingId = `topic-${category.id}-heading`;

              return (
                <div
                  className={styles.groupAnchor}
                  id={`topic-${category.id}`}
                  data-category={category.id}
                  ref={(node) => {
                    anchors.current[category.id] = node;
                  }}
                  key={category.id}
                >
                  <Reveal as="section" className={styles.group}>
                    <p className={styles.groupLabel} data-reveal="0">
                      {body.groupLabel(visibleCategories.findIndex((c) => c.id === category.id) + 1)}
                    </p>
                    <h2 className={styles.groupHeading} id={headingId} data-reveal="1">
                      {category.label}
                    </h2>

                    <div className={`${faq.list} ${styles.list}`} data-reveal="2">
                      {shown.map((item, i) => {
                        const open = openId === item.id;
                        return (
                          <div className={`${faq.item} ${styles.item}`} id={item.id} key={item.id}>
                            <h3 className={styles.question}>
                              <button
                                type="button"
                                id={`${item.id}-question`}
                                className={faq.question}
                                aria-expanded={open}
                                aria-controls={`${item.id}-answer`}
                                onClick={() => toggle(item, open)}
                              >
                                <span className={faq.number}>{String(i + 1).padStart(2, '0')}</span>
                                <span className={faq.questionText}>{highlight(item.question, query)}</span>
                                <span
                                  className={`${faq.dot} ${open ? faq.dotOpen : ''}`}
                                  aria-hidden="true"
                                />
                              </button>
                            </h3>

                            {open ? (
                              <div
                                className={`${faq.answer} ${styles.answer}`}
                                id={`${item.id}-answer`}
                                role="region"
                                aria-labelledby={`${item.id}-question`}
                              >
                                {paragraphs(item.answer).map((text, p) => (
                                  <p key={p}>{highlight(text, query)}</p>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </Reveal>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
}
