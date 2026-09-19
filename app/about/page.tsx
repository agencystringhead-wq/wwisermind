import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site';
import AboutPage from '@/components/about/AboutPage';

export const metadata: Metadata = {
  title: 'About wwisermind — The Studio Behind the Work',
  description:
    'wwisermind is a design and marketing studio built only for therapists and psychologists. Meet the team, learn why we work the way we do, and read the story behind the studio.',
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function Page() {
  return <AboutPage />;
}
