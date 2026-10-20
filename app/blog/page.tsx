import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import type { Metadata } from 'next';
import BlogListing from '@/components/blog/BlogListing';
import { getAllPosts, getLeadPost } from '@/lib/blog';
import { siteConfig, absUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Blog for therapists: websites, search and AI | wwisermind',
  description:
    'Practical articles for therapists on choosing a website platform, getting found, building trust with Google, and using AI with care.',
  alternates: {
    canonical: absUrl(routes.blog),
    types: { 'application/rss+xml': absUrl(routes.rss) },
  },
};

export default function Page() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Blog', href: routes.blog },
        ]}
      />
    <BlogListing
      eyebrow="Blog"
      heading="Practical articles for therapists."
      lead="Websites, search and AI, explained without the jargon."
      posts={getAllPosts()}
      leadPost={getLeadPost()}
      currentCategory={null}
    />
    </>
  );
}
