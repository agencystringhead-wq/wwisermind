import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import FreebiePage from '@/components/freebies/FreebiePage';
import { freebieMetadata } from '@/lib/freebie-metadata';
import { freebiePath, freebies, getFreebie } from '@/lib/freebies';
import { routes } from '@/lib/routes';

/* One page per download or template, at /freebies/<slug>/. The two tools have their own folders
   under /tools/. Anything else is a 404: the site is a static export. */
export const dynamicParams = false;

const onThisFolder = freebies.filter((freebie) => freebiePath(freebie).startsWith(routes.freebies.hub));

export function generateStaticParams() {
  return onThisFolder.map((freebie) => ({ slug: freebie.slug }));
}

type Params = { params: Promise<{ slug: string }> };

async function load(params: Params['params']) {
  const { slug } = await params;
  const freebie = getFreebie(slug);
  return freebie && onThisFolder.includes(freebie) ? freebie : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const freebie = await load(params);
  return freebie ? freebieMetadata(freebie) : {};
}

export default async function Page({ params }: Params) {
  const freebie = await load(params);
  if (!freebie) notFound();
  return <FreebiePage freebie={freebie} />;
}
