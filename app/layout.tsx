import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';

const siteUrl = 'https://www.dealfight.lol';

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${siteUrl}/#organization`,
      name: 'Deal Fight',
      url: siteUrl,
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/brand/dealfight-mark-512.png`,
        width: 512,
        height: 512,
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: siteUrl,
      name: 'Deal Fight',
      description: 'Exclusive software deals on a transparent sponsored leaderboard.',
      publisher: { '@id': `${siteUrl}/#organization` },
      inLanguage: 'en-US',
    },
  ],
};

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: 'Deal Fight',
  title: {
    default: 'Deal Fight — Brands fight. You save.',
    template: '%s | Deal Fight',
  },
  description: 'Exclusive software deals on a transparent sponsored leaderboard. Brands compete for visibility; shoppers get the savings.',
  keywords: ['software deals', 'SaaS deals', 'startup deals', 'sponsored leaderboard', 'product discounts'],
  creator: 'Deal Fight',
  publisher: 'Deal Fight',
  alternates: { canonical: '/' },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
    shortcut: ['/favicon.ico'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: 'Deal Fight — Brands fight. You save.',
    description: 'Browse exclusive software offers on a transparent sponsored leaderboard.',
    url: '/',
    siteName: 'Deal Fight',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Deal Fight — Brands fight. You save.',
    description: 'Paid placement is clear. Shopper savings are clearer.',
  },
};

export const viewport: Viewport = {
  themeColor: '#10110f',
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
