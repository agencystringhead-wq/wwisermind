import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import BottomBar from '@/components/layout/BottomBar';
import ContactBar from '@/components/layout/ContactBar';
import CrisisGate from '@/components/layout/CrisisGate';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import SiteHeaderGate from '@/components/layout/SiteHeaderGate';
import TopBar from '@/components/layout/TopBar';
import { siteConfig } from '@/lib/site';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-inter',
});

/* The footer's world clock is set in mono, matching the reference at pengon.dev, which uses
   JetBrains Mono. Self-hosted at build time by next/font exactly as Inter is, so it costs one
   more file in _next/static/media and still makes no third-party request. One weight only —
   the clock never asks for another. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  /* Relative URLs in any page's metadata resolve against the production domain. */
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} — Growth Partner`,
  description:
    'wwisermind helps ambitious brands grow with strategy, design and performance marketing.',
  twitter: { card: 'summary_large_image', site: siteConfig.twitterHandle },
};

/* Site-wide Organization, so every page tells search engines where the profiles are. */
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteConfig.name,
  url: siteConfig.url,
  sameAs: siteConfig.social.map((item) => item.href),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <SiteHeaderGate>
          <CrisisGate>
            <TopBar />
          </CrisisGate>
          <Header />
        </SiteHeaderGate>
        <main>{children}</main>
        <SiteHeaderGate>
          <Footer />
          <CrisisGate>
            <BottomBar />
            <ContactBar />
          </CrisisGate>
        </SiteHeaderGate>
      </body>
    </html>
  );
}
