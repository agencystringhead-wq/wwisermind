import type { Metadata } from 'next';
import SitemapPage from '@/components/sitemap/SitemapPage';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';

const title = 'Sitemap | wwisermind';
const description =
  'Every page on the wwisermind website in one place: services, pricing, free tools, resources and company pages.';

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: absUrl(routes.sitemap) },
  openGraph: { title, description, url: absUrl(routes.sitemap), type: 'website' },
};

export default function Page() {
  return <SitemapPage />;
}
