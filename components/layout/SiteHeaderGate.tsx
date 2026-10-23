'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { usesOwnChrome } from '@/lib/site';

/** Renders the site's own chrome (header and announcement bar, footer, floating contact bar) everywhere except the pages that carry the
    Therapy Index's header and footer, or their own (the Local Map Assessment), instead (see usesOwnChrome in lib/site.ts). */
export default function SiteHeaderGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  if (usesOwnChrome(pathname)) return null;
  return <>{children}</>;
}
