import { routes } from '@/lib/routes';
import { getMarketViews, hasProfile } from '@/lib/therapyindex/data';

/* Static export: written to /therapyindex/search-index.json at build time. The hub's search box loads it on first focus
   and matches in the browser, so no external service is involved. One compact row per practice that has a profile page. */
export const dynamic = 'force-static';

export type SearchRow = {
  /** practice name */
  n: string;
  /** city name */
  c: string;
  /** profile path */
  u: string;
  /** rank among the city's ranked practices, or 0 when the practice is not ranked */
  r: number;
};

export function GET() {
  const rows: SearchRow[] = getMarketViews().flatMap((view) =>
    view.practices
      .filter(hasProfile)
      .map((p) => ({ n: p.name, c: view.city.name, u: routes.therapyIndex.practice(view.state.slug, view.city.slug, p.slug), r: view.rankOf.get(p.slug) ?? 0 })),
  );
  return new Response(JSON.stringify(rows), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
