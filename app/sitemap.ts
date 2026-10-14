import type { MetadataRoute } from 'next';
import { AUDIENCE_SLUGS } from '@/lib/audience-slugs';
import { getAllPosts, getCategories } from '@/lib/blog';
import { services } from '@/lib/services';
import { siteConfig } from '@/lib/site';

/* Static export: this is written to /sitemap.xml at build time. */
export const dynamic = 'force-static';

/** The top-level pages. Every one is a live route. Anchors such as the booking calendar
    (an in-page section of /contact, not a route of its own) are not pages and are not listed. */
const PAGES = ['/', '/about', '/process', '/results', '/reviews', '/faq', '/pricing', '/pricing/local-seo', '/pricing/seo-audit', '/pricing/one-time-seo', '/contact', '/blog'];

/**
 * Every public page. A service page still flagged `draft` is left out, because it is sent
 * `noindex` and a sitemap must not list a page that asks not to be indexed. Blog posts carry
 * their own updated date as `lastModified`; the other pages carry none rather than a made-up
 * one.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const url = (path: string) => `${siteConfig.url}${path === '/' ? '' : path}`;

  return [
    ...PAGES.map((path) => ({ url: url(path) })),
    ...services
      .filter((service) => !service.draft)
      .map((service) => ({ url: url(`/services/${service.slug}`) })),
    ...AUDIENCE_SLUGS.map((slug) => ({ url: url(`/who-we-help/${slug}`) })),
    ...getCategories().map((category) => ({ url: url(`/blog/category/${category.slug}`) })),
    ...getAllPosts().map((post) => ({
      url: url(`/blog/${post.slug}`),
      lastModified: post.updatedAt,
    })),
  ];
}
