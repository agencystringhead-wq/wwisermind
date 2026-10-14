import { BreadcrumbJsonLd } from '@/components/ui/Breadcrumbs';
import { routes } from '@/lib/routes';
import type { Metadata } from 'next';
import ResultsHeadline from '@/components/sections/ResultsHeadline';
import ResultsProjects from '@/components/sections/ResultsProjects';
import { resultsPage, siteConfig, absUrl } from '@/lib/site';

export const metadata: Metadata = {
  title: resultsPage.meta.title,
  description: resultsPage.meta.description,
  alternates: { canonical: absUrl(routes.results) },
};

/* Header, footer, the floating contact bar and the two yellow bars come from the root
   layout, and the footer's own "ready to move faster?" block is the closing CTA on this
   page as on every other — so the page is its two frames: the headline on white, the
   projects on grey. The projects frame renders nothing until a project has its landscape
   picture, and then the headline sits straight over the footer's CTA. */
export default function ResultsPage() {
  return (
    <>
      <BreadcrumbJsonLd
        trail={[
          { label: 'Home', href: routes.home },
          { label: 'Results', href: routes.results },
        ]}
      />
      <ResultsHeadline />
      <ResultsProjects />
    </>
  );
}
