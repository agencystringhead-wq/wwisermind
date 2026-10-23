import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CrisisResourcesPage from '@/components/crisis/CrisisResourcesPage';
import { getStateBySlug, getStatesWithData } from '@/lib/crisis-resources';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';

/* One page per state that has data, at /free-tools/crisis-resources/<state>/ (the full lowercase
   name, like "illinois"). Add a state to lib/crisis-resources.json and its page appears.

   A static export refuses a dynamic route whose generateStaticParams() is empty. So while no state
   has data it returns one placeholder, "none", whose page is the site's not-found page: it is sent
   noindex and is not in the sitemap. The placeholder goes away on its own with the first state. */
export const dynamicParams = false;

export function generateStaticParams() {
  const states = getStatesWithData().map((state) => ({ state: state.slug }));
  return states.length > 0 ? states : [{ state: 'none' }];
}

type Params = { params: Promise<{ state: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const found = getStateBySlug((await params).state);
  if (!found) return {};

  const title = `Crisis Resources in ${found.name} | wwisermind`;
  const description = `Free, confidential helplines in ${found.name}, with the national crisis lines, each checked against its official source.`;
  const url = absUrl(routes.crisisState(found.slug));

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { type: 'website', siteName: 'wwisermind', title, description, url },
    twitter: { card: 'summary', title, description },
  };
}

export default async function Page({ params }: Params) {
  const found = getStateBySlug((await params).state);
  if (!found) notFound();
  return <CrisisResourcesPage state={found} />;
}
