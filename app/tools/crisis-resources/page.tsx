import type { Metadata } from 'next';
import CrisisResourcesPage from '@/components/crisis/CrisisResourcesPage';
import { routes } from '@/lib/routes';
import { absUrl } from '@/lib/site';

const title = 'Crisis Resources by State | wwisermind';
const description =
  'Free, confidential US helplines for crisis, suicide, veterans, LGBTQ+, abuse, substance use and new parents, organized by need and checked against official sources.';
const url = absUrl(routes.tools.crisisResources);

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  openGraph: { type: 'website', siteName: 'wwisermind', title, description, url },
  twitter: { card: 'summary', title, description },
};

export default function Page() {
  return <CrisisResourcesPage />;
}
