'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { isCrisisResourcesPage } from '@/lib/site';

/** Renders its children everywhere except the crisis resources pages (see isCrisisResourcesPage in
    lib/site.ts). The root layout wraps the announcement bar, the closing colour band and the floating
    contact bar in it. */
export default function CrisisGate({ children }: { children: ReactNode }) {
  if (isCrisisResourcesPage(usePathname() ?? '')) return null;
  return <>{children}</>;
}
