'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { footerCtaHiddenPaths, isCrisisResourcesPage, isTherapyIndexPage } from '@/lib/site';

const trim = (path: string) => path.replace(/\/+$/, '');

/** Renders the footer's closing call to action unless the page opted out: either `hide`, or
    its path is in `footerCtaHiddenPaths` (pages that end on a call to action of their own) or is a
    crisis resources page, where a sales prompt does not belong. */
export default function FooterCtaGate({
  hide = false,
  children,
}: {
  hide?: boolean;
  children: ReactNode;
}) {
  const pathname = trim(usePathname() ?? '');
  if (hide || isCrisisResourcesPage(pathname) || isTherapyIndexPage(pathname)) return null;
  if (footerCtaHiddenPaths.some((path) => trim(path) === pathname)) return null;
  return <>{children}</>;
}
