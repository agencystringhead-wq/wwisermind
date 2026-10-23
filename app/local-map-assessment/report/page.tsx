import type { Metadata } from 'next';
import { Suspense } from 'react';
import ReportView from '@/components/local-map/flow/ReportView';

/* One static shell for every report: the id comes from ?id= and the report is loaded in the browser from /api/local-map/status.
   Private by design (the id is 128 bits of random), and never indexed. */
export const metadata: Metadata = {
  title: 'Your Local Map Assessment | wwisermind',
  robots: { index: false, follow: false },
};

export default function ReportPage() {
  return (
    <Suspense fallback={null}>
      <ReportView />
    </Suspense>
  );
}
