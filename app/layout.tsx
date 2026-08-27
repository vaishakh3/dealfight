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
  title: 'Deal Fight — Bid for rank. Win with deals.',
  description: 'The pay-to-rank marketplace where brands buy visibility and compete for customers with exclusive discounts.',
  openGraph: {
    title: 'Deal Fight — Bid for rank. Win with deals.',
    description: 'Brands bid for rank, then fight for customers with exclusive deals. Every paid listing stays visible.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Deal Fight — Bid for rank. Win with deals.',
    description: 'Money buys the rank. The deal wins the click.',
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
