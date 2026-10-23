import TiChrome from '@/components/therapyindex/TiChrome';

/* This tool carries the Therapy Index's header and footer (see usesTiChrome in lib/site.ts). */
export default function Layout({ children }: { children: React.ReactNode }) {
  return <TiChrome>{children}</TiChrome>;
}
