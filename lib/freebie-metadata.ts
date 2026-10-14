import type { Metadata } from 'next';
import { freebiePath, type Freebie } from '@/lib/freebies';
import { absUrl, siteConfig } from '@/lib/site';

/** The metadata every freebie page shares: "{Title} | Free for Therapists | wwisermind", the short
    description, a canonical and Open Graph address, and noindex while the freebie is coming soon. */
export function freebieMetadata(freebie: Freebie): Metadata {
  const title = `${freebie.title} | Free for Therapists | wwisermind`;
  const url = absUrl(freebiePath(freebie));

  return {
    title,
    description: freebie.shortDescription,
    alternates: { canonical: url },
    robots: freebie.status === 'comingSoon' ? { index: false, follow: true } : undefined,
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      title,
      description: freebie.shortDescription,
      url,
    },
  };
}
