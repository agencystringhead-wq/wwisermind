'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { usesTiChrome } from '@/lib/site';

/** Renders the site's own chrome (header and announcement bar, footer, floating contact bar) everywhere except the pages that carry the
    Therapy Index's header and footer instead (see usesTiChrome in lib/site.ts). */
export default function SiteHeaderGate({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '';
  if (usesTiChrome(pathname)) return null;
  return <>{children}</>;
}
