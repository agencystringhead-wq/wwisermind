import type { Metadata } from 'next';
import { JetBrains_Mono } from 'next/font/google';
import BottomBar from '@/components/layout/BottomBar';
import ContactBar from '@/components/layout/ContactBar';
import CrisisGate from '@/components/layout/CrisisGate';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import SiteHeaderGate from '@/components/layout/SiteHeaderGate';
import TopBar from '@/components/layout/TopBar';
import { siteConfig } from '@/lib/site';
import './globals.css';

/* The footer's world clock is set in mono, matching the reference at pengon.dev, which uses
   JetBrains Mono. Self-hosted at build time by next/font exactly as Inter is, so it costs one
   more file in _next/static/media and still makes no third-party request. One weight only —
   the clock never asks for another. */
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400'],
  display: 'swap',
  /* Footer clock only, below the fold: fetched when it is first drawn, not preloaded. */
  preload: false,
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
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        {/* The one Inter file (variable, every weight), fetched with the HTML rather than after the
            CSS has been parsed. */}
        <link
          rel="preload"
          href="/fonts/inter-latin-v1.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
      </head>
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
