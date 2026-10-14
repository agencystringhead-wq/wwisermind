import type { MetadataRoute } from 'next';
import { AUDIENCE_SLUGS } from '@/lib/audience-slugs';
import { getAllPosts, getCategories } from '@/lib/blog';
import { STATIC_PAGES, SERVICE_PATHS, routes } from '@/lib/routes';
import { freebiePath, freebies, isLive } from '@/lib/freebies';
import { services } from '@/lib/services';
import { absUrl } from '@/lib/site';

/* Static export: this is written to /sitemap.xml at build time. */
export const dynamic = 'force-static';

/** The day of this build, as a date. The pages are static, so a page's last change is the build
    that last shipped it; blog posts carry their own updated date instead. */
const builtOn = new Date().toISOString().slice(0, 10);

/**
 * Every public page at its one canonical address, trailing slash included, and nothing that
 * redirects: the old /pricing/<name> and /services/<slug> URLs are in public/_redirects, not here.
 * A service page still flagged `draft`, and a freebie still coming soon, are left out, because
 * they are sent `noindex` and a sitemap must not list a page that asks not to be indexed.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const page = (path: string, lastModified: string = builtOn) => ({
    url: absUrl(path),
    lastModified,
  });

  return [
    ...STATIC_PAGES.map((path) => page(path)),
    ...services
      .filter((service) => !service.draft)
      .map((service) => page(SERVICE_PATHS[service.slug])),
    ...freebies.filter(isLive).map((freebie) => page(freebiePath(freebie))),
    ...AUDIENCE_SLUGS.map((slug) => page(routes.audience(slug))),
    ...getCategories().map((category) => page(routes.blogCategory(category.slug))),
    ...getAllPosts().map((post) => page(routes.blogPost(post.slug), post.updatedAt)),
  ];
}
