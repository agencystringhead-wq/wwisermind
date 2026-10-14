import { routes } from '@/lib/routes';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogPostPage from '@/components/blog/BlogPostPage';
import { getAllPosts, getPost } from '@/lib/blog';
import { siteConfig, absUrl } from '@/lib/site';

/* One page per post file, all built at export time. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const url = absUrl(routes.blogPost(post.slug));
  const image = `${siteConfig.url}${post.image}`;

  return {
    title: post.seoTitle,
    description: post.description,
    authors: [{ name: post.author }],
    keywords: post.tags,
    alternates: {
      canonical: url,
      types: { 'application/rss+xml': absUrl(routes.rss) },
    },
    openGraph: {
      type: 'article',
      url,
      title: post.seoTitle,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: [{ url: image, alt: post.imageAlt }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seoTitle,
      description: post.description,
      images: [image],
    },
  };
}

export default async function Page({ params }: Params) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return <BlogPostPage post={post} />;
}
