import { getAllPosts } from '@/lib/blog';
import { siteConfig } from '@/lib/site';

/* Static export: this is written to /rss.xml at build time. */
export const dynamic = 'force-static';

const escape = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

/** An RFC 822 date for a post's ISO date, at a fixed hour so the day never shifts. */
const rfc822 = (iso: string) => new Date(`${iso}T09:00:00Z`).toUTCString();

/** The blog's feed: every post, newest first, with the excerpt as the description. */
export function GET() {
  const posts = getAllPosts();
  const feedUrl = `${siteConfig.url}/rss.xml`;

  const items = posts
    .map((post) => {
      const link = `${siteConfig.url}/blog/${post.slug}`;
      return `    <item>
      <title>${escape(post.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${rfc822(post.publishedAt)}</pubDate>
      <category>${escape(post.category)}</category>
      <description>${escape(post.excerpt)}</description>
    </item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>wwisermind blog</title>
    <link>${siteConfig.url}/blog</link>
    <description>Plain-English articles for therapists on websites, search and AI.</description>
    <language>en</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
