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
  title: 'Price Fight — Brands fight. You win.',
  description: 'The anti-ad leaderboard where brands rank by the deal they give customers. No paid boosts. The best verified offer wins.',
  openGraph: {
    title: 'Price Fight — Brands fight. You win.',
    description: 'The anti-ad leaderboard where brands compete by giving customers the best verified deal.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Price Fight — Brands fight. You win.',
    description: 'Paying us cannot move a brand up. Only a better deal can.',
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
