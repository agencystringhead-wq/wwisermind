import type { Metadata } from 'next';
import ProcessPage from '@/components/process/ProcessPage';
import { processPage } from '@/lib/process';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: processPage.meta.title,
  description: processPage.meta.description,
  alternates: { canonical: `${siteConfig.url}/process` },
};

export default function Page() {
  return <ProcessPage />;
}
