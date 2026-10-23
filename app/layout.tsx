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
   the clock never asks for another. It is also the type of the small mono labels above the fold
   (eyebrows, the home hero's guide line), so it is preloaded: arriving late it re-flowed them. */
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
    <html lang="en" className={jetbrainsMono.variable}>
      <head>
        {/* Inter's one face. A <style> here rather than in the stylesheets so that scripts/critical/apply.mjs
            can replace exactly this declaration with a data-URI copy on the pages it inlines CSS into;
            two declarations of the same face would make the browser swap from one to the other, and the
            swap shows the stand-in font for a frame. Keep the text identical to FACE in apply.mjs. */}
        <style
          id="inter-face"
          dangerouslySetInnerHTML={{
            __html:
              '@font-face{font-family:Inter;src:url(/fonts/inter-latin-v1.woff2) format("woff2");font-weight:100 900;font-style:normal;font-display:swap}',
          }}
        />
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
