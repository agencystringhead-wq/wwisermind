import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AudiencePage from '@/components/audiences/AudiencePage';
import { AUDIENCE_SLUGS, getAudience } from '@/lib/audiences';
import { siteConfig } from '@/lib/site';

/* One page per slug, both rendered at build time — the site is a static export, so a
   slug outside the list is a 404 rather than a page built on request. */
export const dynamicParams = false;

export function generateStaticParams() {
  return AUDIENCE_SLUGS.map((slug) => ({ slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const audience = getAudience(slug);
  if (!audience) return {};

  return {
    title: audience.seo.title,
    description: audience.seo.description,
    alternates: { canonical: `${siteConfig.url}/who-we-help/${audience.slug}` },
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const audience = getAudience(slug);
  if (!audience) notFound();

  const url = `${siteConfig.url}/who-we-help/${audience.slug}`;

  /* Schema.org WebPage, naming the audience it is written for and the studio behind it,
     as the service pages do. */
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${url}#webpage`,
    name: audience.seo.title,
    description: audience.seo.description,
    url,
    audience: {
      '@type': 'Audience',
      audienceType: `${audience.name} — therapists and psychologists`,
    },
    publisher: {
      '@type': 'Organization',
      name: 'wwisermind',
      url: siteConfig.url,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <AudiencePage audience={audience} />
    </>
  );
}
