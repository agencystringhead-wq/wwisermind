import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BlogListing from '@/components/blog/BlogListing';
import { getCategories, postsInCategory } from '@/lib/blog';
import { siteConfig, absUrl } from '@/lib/site';

/* One page per category that has a post, all built at export time. A slug with no posts is a
   404, and a category with no posts left simply stops being generated. */
export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((category) => ({ category: category.slug }));
}

type Params = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category: slug } = await params;
  const category = getCategories().find((c) => c.slug === slug);
  if (!category) return {};

  return {
    title: `${category.name}: articles for therapists | wwisermind`,
    description: `Articles in ${category.name}, written for therapists and psychologists in private practice.`,
    alternates: { canonical: absUrl(routes.blogCategory(category.slug)) },
  };
}

export default async function Page({ params }: Params) {
  const { category: slug } = await params;
  const category = getCategories().find((c) => c.slug === slug);
  if (!category) notFound();

  const posts = postsInCategory(slug);

  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Blog', href: routes.blog },
          { label: category.name, href: routes.blogCategory(slug) },
        ]}
      />
    <BlogListing
      eyebrow="Blog category"
      heading={category.name}
      lead={`${posts.length} ${posts.length === 1 ? 'article' : 'articles'} for therapists.`}
      posts={posts}
      currentCategory={slug}
    />
    </>
  );
}
