'use client';

import { useId, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import CtaLink from '@/components/booking/CtaLink';
import { routes } from '@/lib/routes';
import styles from './search.module.css';

type Row = { n: string; f?: string; c: string; u: string; r: number };

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

/** "Find your practice": type a practice name, pick it from the list. Matches in the browser over search-index.json. */
export default function PracticeSearch() {
  const router = useRouter();
  const id = useId();
  const rows = useRef<(Row & { k: string })[] | null>(null);
  const loading = useRef<Promise<void> | null>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Row[]>([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);

  /** One shared fetch: a keystroke that arrives while the index is still loading waits for the same request. */
  const load = (): Promise<void> => {
    if (rows.current) return Promise.resolve();
    loading.current ??= fetch('/therapyindex/search-index.json')
      .then((res) => res.json())
      .then((data: Row[]) => {
        rows.current = data.map((r) => ({ ...r, k: norm(r.f ?? r.n) }));
      })
      .catch(() => {
        loading.current = null;
      });
    return loading.current;
  };

  const search = (q: string) => {
    const terms = norm(q).split(' ').filter(Boolean);
    if (!terms.length || !rows.current) return setResults([]);
    const hits = rows.current
      .filter((r) => terms.every((t) => r.k.includes(t)))
      .sort((a, b) => Number(norm(b.n).startsWith(terms[0])) - Number(norm(a.n).startsWith(terms[0])) || (a.r || 999) - (b.r || 999));
    setResults(hits.slice(0, 6));
  };

  const onChange = async (value: string) => {
    setQuery(value);
    setOpen(true);
    setActive(-1);
    await load();
    search(value);
  };

  const go = (row: Row) => router.push(row.u);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, -1));
    } else if (e.key === 'Enter') {
      const pick = results[active] ?? (results.length === 1 ? results[0] : undefined);
      if (pick) {
        e.preventDefault();
        go(pick);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const typed = norm(query).length > 0;
  const listId = `${id}-list`;

  return (
    <div className={styles.search} onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}>
      <label htmlFor={`${id}-input`} className={styles.label}>
        Find your practice
      </label>
      <input
        id={`${id}-input`}
        className={styles.input}
        type="search"
        role="combobox"
        aria-expanded={open && typed}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${id}-opt-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder="Type a practice or therapist name"
        value={query}
        onFocus={() => {
          setOpen(true);
          void load();
        }}
        onChange={(e) => void onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      {open && typed ? (
        <div className={styles.panel}>
          {results.length ? (
            <ul id={listId} role="listbox" aria-label="Matching practices" className={styles.list}>
              {results.map((r, i) => (
                <li key={r.u} id={`${id}-opt-${i}`} role="option" aria-selected={i === active}>
                  <a href={r.u} className={`${styles.option} ${i === active ? styles.optionActive : ''}`} onClick={(e) => { e.preventDefault(); go(r); }}>
                    <span className={styles.name}>{r.n}</span>
                    <span className={styles.meta}>
                      {r.c} · {r.r ? `Rank ${r.r}` : 'Not ranked'}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p id={listId} role="status" className={styles.empty}>
              {rows.current ? (
                <>
                  Not listed? Your practice may be outside our current cities.{' '}
                  <CtaLink href={routes.contactBook} className={styles.emptyLink}>
                    Book a free review
                  </CtaLink>{' '}
                  and we&apos;ll check.
                </>
              ) : (
                'Searching…'
              )}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
