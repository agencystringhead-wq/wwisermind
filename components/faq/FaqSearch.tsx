'use client';

import { useId } from 'react';
import { faqPage, readyItems } from '@/lib/faq';
import { SearchIcon } from '@/components/ui/icons';
import { useFaqSearch } from './FaqSearchContext';
import { matches } from './highlight';
import styles from './Faq.module.css';

/**
 * The hero's search: one input with a clear button, on the dark ground. It filters by text
 * in the question and the answer, and the count under it is a polite live region so the
 * result is announced without moving focus.
 */
export default function FaqSearch() {
  const { hero, body } = faqPage;
  const { value, query, setValue, clear } = useFaqSearch();
  const id = useId();

  const count = query ? readyItems.filter((item) => matches(item, query)).length : null;

  return (
    <form className={styles.search} role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor={id} className="sr-only">
        {hero.searchLabel}
      </label>
      <SearchIcon className={styles.searchIcon} />
      <input
        id={id}
        type="search"
        className={styles.searchInput}
        value={value}
        placeholder={hero.searchPlaceholder}
        autoComplete="off"
        spellCheck={false}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && value) {
            e.preventDefault();
            clear();
          }
        }}
      />
      {value ? (
        <button type="button" className={styles.searchClear} onClick={clear} aria-label={hero.clearLabel}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : null}

      <p className={styles.searchCount} role="status" aria-live="polite">
        {count !== null ? body.count(count, query) : ''}
      </p>
    </form>
  );
}
