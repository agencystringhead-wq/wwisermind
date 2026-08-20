import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
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
  title: `${siteConfig.name} — Growth Partner`,
  description:
    'Wisermind helps ambitious brands grow with strategy, design and performance marketing.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <TopBar />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
