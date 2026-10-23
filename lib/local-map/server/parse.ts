import { rowKey } from '../report';
import type { Listing, SerpRow } from '../types';

/** A Maps result item to the compact row we store, in rank order, at most `limit` of them. */
export function toRows(items: any[], limit = 20): SerpRow[] {
  return items
    .filter((it) => it?.type === 'maps_search' && it.title)
    .sort((a, b) => (a.rank_group ?? 999) - (b.rank_group ?? 999))
    .slice(0, limit)
    .map((it) => [rowKey(it.cid, it.place_id, it.title), String(it.title), it.rating?.value ?? null, it.rating?.votes_count ?? null, it.total_photos ?? null, it.category ?? null] as SerpRow);
}

/** A Maps result item to a listing the visitor can pick. */
export function toListing(it: any): Listing {
  return {
    name: String(it.title),
    address: it.address ?? it.snippet ?? null,
    cid: it.cid ? String(it.cid) : null,
    placeId: it.place_id ?? null,
    lat: typeof it.latitude === 'number' ? it.latitude : null,
    lng: typeof it.longitude === 'number' ? it.longitude : null,
    rating: it.rating?.value ?? null,
    reviews: it.rating?.votes_count ?? null,
    photos: it.total_photos ?? null,
    category: it.category ?? null,
    additionalCategories: Array.isArray(it.additional_categories) ? it.additional_categories.slice(0, 4).map(String) : [],
    website: it.url ?? (it.domain ? `https://${it.domain}` : null),
  };
}

/** "2025-03-10 14:22:11 +00:00" (DataForSEO's format) to unix ms. */
export function parseStamp(value: unknown): number | null {
  if (typeof value !== 'string') return null;
  const iso = value.trim().replace(' ', 'T').replace(/\s+/g, '');
  const ms = Date.parse(iso);
  return Number.isFinite(ms) ? ms : null;
}

/** The newest date among a reviews or posts result. */
export function newestStamp(items: any[]): number | null {
  let best: number | null = null;
  for (const it of items) {
    const ms = parseStamp(it?.timestamp ?? it?.post_date ?? it?.date_posted ?? it?.date);
    if (ms !== null && (best === null || ms > best)) best = ms;
  }
  return best;
}
