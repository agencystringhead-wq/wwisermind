import type { Metadata } from 'next';
import BlogListing from '@/components/blog/BlogListing';
import { getAllPosts, getLeadPost } from '@/lib/blog';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog for therapists: websites, search and AI | wwisermind',
  description:
    'Plain-English articles for therapists on choosing a website platform, getting found, building trust with Google, and using AI with care.',
  alternates: {
    canonical: `${siteConfig.url}/blog`,
    types: { 'application/rss+xml': `${siteConfig.url}/rss.xml` },
  },
};

export default function Page() {
  return (
    <BlogListing
      eyebrow="Blog"
      heading="Plain-English articles for therapists."
      lead="Websites, search and AI, explained without the jargon."
      posts={getAllPosts()}
      leadPost={getLeadPost()}
      currentCategory={null}
    />
  );
}
