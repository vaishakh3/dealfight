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
  title: 'Price Fight — Pay more. Rank higher.',
  description: 'The public deal leaderboard where your bid decides your rank and every listing gives visitors something back.',
  openGraph: {
    title: 'Price Fight — Pay more. Rank higher.',
    description: 'Bid for a public rank, stay visible on the full board, and give visitors an exclusive deal.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Price Fight — Pay more. Rank higher.',
    description: 'Every bidder stays visible. Every visitor gets a deal.',
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
