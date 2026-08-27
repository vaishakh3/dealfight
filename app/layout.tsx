import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Deal Fight — Brands fight. You save.',
  description: 'Exclusive software deals on a transparent sponsored leaderboard. Brands compete for visibility; shoppers get the savings.',
  openGraph: {
    title: 'Deal Fight — Brands fight. You save.',
    description: 'Browse exclusive software offers on a transparent sponsored leaderboard.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Deal Fight — Brands fight. You save.',
    description: 'Paid placement is clear. Shopper savings are clearer.',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
