import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PracticePage from '@/components/therapyindex/PracticePage';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';
import { BRAND, INDEXABLE } from '@/lib/therapyindex/config';
import { getMarketView, hasProfile, isProfileIndexable, practiceProfiles, scoreText } from '@/lib/therapyindex/data';
import { ogImages, ogUrl } from '@/lib/therapyindex/og';

/* A profile for every practice with a website or a score above zero. Directories never get one. */
export const dynamicParams = false;

export function generateStaticParams() {
  return practiceProfiles();
}

type Params = { params: Promise<{ state: string; city: string; practice: string }> };

async function load({ params }: Params) {
  const { state, city, practice } = await params;
  const view = getMarketView(state, city);
  const found = view?.practices.find((p) => p.slug === practice);
  return view && found && hasProfile(found) ? { view, practice: found } : null;
}

export async function generateMetadata(props: Params): Promise<Metadata> {
  const data = await load(props);
  if (!data) return {};
  const { view, practice: p } = data;
  const title = `${p.name}: Google, Maps and AI Visibility in ${view.city.name} | ${BRAND} Therapy Index`;
  const rank = view.rankOf.get(p.slug);
  const description = `${p.name} in ${view.city.name}: ${p.visibilityScore < 5 ? 'low visibility' : `visibility score ${scoreText(p.visibilityScore)} of 100`}${rank ? `, ranked #${rank} of ${view.eligible.length}` : ''}. Maps and Google search positions, AI mentions and site speed from the ${view.month} snapshot.`;
  const url = absUrl(routes.therapyIndex.practice(view.state.slug, view.city.slug, p.slug));
  return {
    title,
    description,
    alternates: { canonical: url },
    /* With INDEXABLE off the layout already sends noindex, nofollow. With it on, a profile below the score bar that no AI
       named is noindex but still followed, so its links keep working. */
    ...(INDEXABLE && !isProfileIndexable(p) ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: 'website', siteName: BRAND, title, description, url, images: ogImages('profile', title) },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl('profile')] },
  };
}

export default async function Page(props: Params) {
  const data = await load(props);
  if (!data) notFound();
  return <PracticePage view={data.view} practice={data.practice} />;
}
