import type { Metadata } from 'next';
import { freebiePath, type Freebie } from '@/lib/freebies';
import { absUrl, siteConfig } from '@/lib/site';

/** The metadata every freebie page shares: "{Title} | Free for Therapists | wwisermind", the short
    description, a canonical and Open Graph address, and noindex while the freebie is coming soon.
    A freebie with its own `seo` (the email signature generator) uses those words instead, for the
    title, the description, Open Graph and the Twitter card alike. */
export function freebieMetadata(freebie: Freebie): Metadata {
  const title = freebie.seo?.title ?? `${freebie.title} | Free for Therapists | wwisermind`;
  const description = freebie.seo?.description ?? freebie.shortDescription;
  const url = absUrl(freebiePath(freebie));

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: freebie.status === 'comingSoon' ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title,
      description,
      url,
    },
    /* The page's own twitter object replaces the layout's, so the card and handle are repeated. */
    twitter: {
      card: 'summary_large_image',
      site: siteConfig.twitterHandle,
      title,
      description,
    },
  };
}
