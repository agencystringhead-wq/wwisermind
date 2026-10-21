'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { isTherapyIndexPage } from '@/lib/site';

/** Renders the main site header (and the announcement bar above it) everywhere except the Therapy Index, which has its own. */
export default function SiteHeaderGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  if (isTherapyIndexPage(pathname)) return null;
  return <>{children}</>;
}
