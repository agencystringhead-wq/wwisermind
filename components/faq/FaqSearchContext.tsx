'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

const DEBOUNCE_MS = 200;

type FaqSearch = {
  /** What is in the box right now. */
  value: string;
  /** The settled, trimmed term the page filters and highlights by. */
  query: string;
  setValue: (value: string) => void;
  clear: () => void;
};

const Context = createContext<FaqSearch | null>(null);

/**
 * Holds the search term for the page. The input lives in the hero and the results in the
 * body, so the two share this rather than prop-drilling through the server-rendered hero.
 * `value` follows every keystroke; `query` trails it by a short debounce so the list does
 * not re-filter on each one. Clearing is immediate.
 */
export function FaqSearchProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setQuery(value.trim()), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [value]);

  const clear = useCallback(() => {
    setValue('');
    setQuery('');
  }, []);

  const api = useMemo(() => ({ value, query, setValue, clear }), [value, query, clear]);

  return <Context.Provider value={api}>{children}</Context.Provider>;
}

export function useFaqSearch(): FaqSearch {
  const api = useContext(Context);
  if (!api) throw new Error('useFaqSearch must be used inside FaqSearchProvider');
  return api;
}
