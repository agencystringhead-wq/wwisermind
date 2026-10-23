import type { Metadata } from 'next';
import { Suspense } from 'react';
import StartFlow from '@/components/local-map/flow/StartFlow';

/* The tool's first three steps. Never indexed: it is a working page, and the landing page is the one to find. */
export const metadata: Metadata = {
  title: 'Run your Local Map Assessment | wwisermind',
  robots: { index: false, follow: false },
};

export default function StartPage() {
  return (
    <Suspense fallback={null}>
      <StartFlow />
    </Suspense>
  );
}
