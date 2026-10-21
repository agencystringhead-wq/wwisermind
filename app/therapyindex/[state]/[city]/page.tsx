import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import MarketPage from '@/components/therapyindex/MarketPage';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';
import { BRAND } from '@/lib/therapyindex/config';
import { getMarketView, getMarketViews } from '@/lib/therapyindex/data';

/* One report per snapshot, at /therapyindex/<state>/<city>/ (texas/austin). Add a market to
   lib/therapyindex/markets.ts, fetch it, and its report appears. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getMarketViews().map((m) => ({ state: m.state.slug, city: m.city.slug }));
}

type Params = { params: Promise<{ state: string; city: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { state, city } = await params;
  const view = getMarketView(state, city);
  if (!view) return {};
  const title = `${view.city.name} Therapist Rankings: Who Patients Find on Google and AI (${view.month}) | ${BRAND}`;
  const description = `${view.snapshot.summary.totalPractices} therapy practices in ${view.city.name}, ${view.state.name} ranked across Google Maps, Google search and AI answers. Directories hold ${Math.round(view.directoryShare)}% of the first page. Snapshot of ${view.date}.`;
  const url = absUrl(view.path);
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: BRAND, title, description, url },
    twitter: { card: 'summary', title, description },
  };
}

export default async function Page({ params }: Params) {
  const { state, city } = await params;
  const view = getMarketView(state, city);
  if (!view) notFound();
  return <MarketPage view={view} />;
}
