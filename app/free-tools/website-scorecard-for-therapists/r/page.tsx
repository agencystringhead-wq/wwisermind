import type { Metadata } from 'next';
import ScorecardResults from '@/components/scorecard/ScorecardResults';

/* One static shell serves every report: public/_redirects rewrites /r/<id>/ to this page and the
   component reads the id from the address. The page itself is private and never indexed. */
export const metadata: Metadata = {
  title: 'Your website scorecard | wwisermind',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <ScorecardResults />;
}
