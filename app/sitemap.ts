import type { MetadataRoute } from 'next';
import { sitemapEntries } from '@/lib/sitemap';
import { absUrl } from '@/lib/site';

/* Static export: this is written to /sitemap.xml at build time. */
export const dynamic = 'force-static';

/** The day of this build, as a date. The pages are static, so a page's last change is the build
    that last shipped it; blog posts carry their own updated date instead. */
const builtOn = new Date().toISOString().slice(0, 10);

/**
 * Every public page at its one canonical address, trailing slash included, and nothing that
 * redirects: the old /pricing/<name> and /services/<slug> URLs are in public/_redirects, not here.
 * The list itself lives in lib/sitemap.ts, shared with the human page at /sitemap/. A service page
 * still flagged `draft`, and a freebie or tool still coming soon, are left out there, because they
 * are sent `noindex` and a sitemap must not list a page that asks not to be indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return sitemapEntries().map(({ path, lastModified }) => ({
    url: absUrl(path),
    lastModified: lastModified ?? builtOn,
  }));
}
