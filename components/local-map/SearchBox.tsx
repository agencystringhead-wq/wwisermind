'use client';

import { useRouter } from 'next/navigation';
import { useId, useState, type FormEvent } from 'react';
import { LMA_START_PATH, SEARCH_FIELD_ID } from '@/lib/local-map-assessment';
import { SearchIcon } from '@/components/ui/icons';
import styles from './lma.module.css';

/**
 * The practice lookup. For now it hands the two answers to the start page; the real lookup is wired there later.
 * The hero's copy owns the field id every "run my report" button targets, so the closing copy gets its own.
 */
export default function SearchBox({ primary = false }: { primary?: boolean }) {
  const router = useRouter();
  const uid = useId();
  const [name, setName] = useState('');
  const [place, setPlace] = useState('');
  const nameId = primary ? SEARCH_FIELD_ID : `${uid}-name`;
  const placeId = `${uid}-place`;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (name.trim()) params.set('practice', name.trim());
    if (place.trim()) params.set('where', place.trim());
    const qs = params.toString();
    router.push(qs ? `${LMA_START_PATH}?${qs}` : LMA_START_PATH);
  };

  return (
    <form className={styles.search} onSubmit={submit} action={LMA_START_PATH} method="get">
      <div className={styles.field}>
        <label htmlFor={nameId}>Practice name</label>
        <input id={nameId} name="practice" type="text" autoComplete="organization" placeholder="Brightwater Therapy" value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div className={styles.field}>
        <label htmlFor={placeId}>City or ZIP</label>
        <input id={placeId} name="where" type="text" autoComplete="postal-code" placeholder="Austin or 78701" value={place} onChange={(e) => setPlace(e.target.value)} />
      </div>
      <button type="submit" className={styles.searchButton}>
        <SearchIcon className={styles.searchIcon} />
        Find my practice
      </button>
    </form>
  );
}
