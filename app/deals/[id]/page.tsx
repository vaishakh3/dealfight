import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { DealActions } from './deal-actions';
import { getPublishedDeal } from '@/lib/published-listings';

const siteUrl = 'https://www.dealfight.lol';

type DealPageProps = {
  params: Promise<{ id: string }>;
};

function formatBid(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export async function generateMetadata({ params }: DealPageProps): Promise<Metadata> {
  const { id } = await params;
  const deal = await getPublishedDeal(id);

  if (!deal) return { title: 'Deal not found' };

  const { listing, rank } = deal;
  const title = `${listing.dealLabel} from ${listing.name}`;
  const description = `${listing.name} is sponsored #${rank} on Deal Fight. ${listing.dealPrice}, regularly ${listing.regularPrice}. ${listing.savings}.`;

  return {
    title,
    description,
    alternates: { canonical: `/deals/${listing.id}` },
    robots: listing.source === 'paid' ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: `/deals/${listing.id}`,
      siteName: 'Deal Fight',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function DealPage({ params }: DealPageProps) {
  const { id } = await params;
  const deal = await getPublishedDeal(id);

  if (!deal) notFound();

  const { listing, rank, nextBid, listingCount } = deal;
  const shareUrl = `${siteUrl}/deals/${listing.id}`;

  return (
    <main className="deal-page-shell">
      <header className="deal-page-header">
        <Link className="wordmark" href="/" aria-label="Deal Fight home">
          <Image className="site-logo-mark" src="/brand/dealfight-mark-512.png" alt="" width={38} height={38} sizes="38px" priority />
          <b>DEAL<span>FIGHT</span><sup>.LOL</sup></b>
        </Link>
        <Link href="/#deals">← ALL DEALS</Link>
      </header>

      <div className="deal-page-ticker" aria-label="Deal position">
        <span>SPONSORED #{rank}</span>
        <span>{listing.dealLabel}</span>
        <span>{listing.savings.toUpperCase()}</span>
        <span>{listingCount} DEALS FIGHTING</span>
      </div>

      <section className="deal-page-hero">
        <div className="deal-page-story">
          <span className="eyebrow">TODAY&apos;S SPONSORED DEAL BOARD</span>
          <div className="deal-page-rank"><b>#{rank}</b><span>Sponsored position<br />from a {formatBid(listing.totalBid)} visibility bid</span></div>
          <div className="deal-page-brand">
            <span className={`brand-mark large ${listing.logo ? 'has-logo' : ''}`} aria-hidden="true">
              {listing.logo ? <Image src={listing.logo} alt="" width={64} height={64} sizes="64px" /> : listing.name.slice(0, 2).toUpperCase()}
            </span>
            <div><span>{listing.category}</span><h1>{listing.name}</h1><p>{listing.tagline}</p></div>
          </div>
          <div className="deal-page-disclosure">
            <b>Why sponsored #{rank}?</b>
            <p>{listing.name} paid {formatBid(listing.totalBid)} for visibility. That controls this rank. It does not change the shopper price.</p>
          </div>
        </div>

        <article className="deal-page-offer">
          <span>THE OFFER YOU GET</span>
          <strong>{listing.dealLabel}</strong>
          <h2>{listing.dealPrice}</h2>
          <p>Regularly <s>{listing.regularPrice}</s></p>
          <b>{listing.savings}</b>
          <small>{listing.dealDetails}</small>
          <DealActions coupon={listing.coupon} dealLabel={listing.dealLabel} dealUrl={listing.url} listingId={listing.id} name={listing.name} rank={rank} shareUrl={shareUrl} />
        </article>
      </section>

      <section className="deal-challenge-banner">
        <div><span>FOR FOUNDERS &amp; BRANDS</span><h2>Can your offer beat this?</h2><p>Bring shoppers a real discount, then bid {formatBid(nextBid)} to move directly above {listing.name}.</p></div>
        <Link href={`/?list=1&target=${nextBid}#for-brands`}>BEAT THIS POSITION · {formatBid(nextBid)} <span>↗</span></Link>
      </section>

      <footer className="deal-page-footer">
        <p>Paid rank. Clear offer. You decide if the deal is worth it.</p>
        <Link href="/#how-ranking-works">HOW DEAL FIGHT WORKS →</Link>
      </footer>
    </main>
  );
}
