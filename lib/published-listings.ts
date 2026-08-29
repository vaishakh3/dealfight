import 'server-only';

import { connection } from 'next/server';
import { cache } from 'react';
import { getDatabase } from '@/lib/database';
import { listings as launchListings, type Listing } from '@/lib/leaderboard-data';

function formatDollars(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export async function getPublishedListings(): Promise<Listing[]> {
  await connection();

  try {
    const database = await getDatabase();
    const { data, error } = await database
      .from('submissions')
      .select('id, normalized_url, product_name, product_url, tagline, category, list_price_cents, fight_price_cents, discount_percent, coupon_code, target_bid_cents')
      .eq('status', 'paid')
      .eq('review_status', 'approved')
      .order('target_bid_cents', { ascending: false });

    if (error) throw error;

    const seenUrls = new Set<string>();
    const paidListings = (data ?? []).flatMap<Listing>((submission) => {
      if (seenUrls.has(submission.normalized_url)) return [];
      seenUrls.add(submission.normalized_url);

      const savingsCents = submission.list_price_cents - submission.fight_price_cents;
      return [{
        id: submission.id,
        name: submission.product_name,
        source: 'paid',
        tagline: submission.tagline,
        category: submission.category,
        totalBid: submission.target_bid_cents / 100,
        dealLabel: `${submission.discount_percent}% OFF`,
        dealDetails: `Use code ${submission.coupon_code} at checkout. Offer subject to the brand's terms.`,
        dealPrice: formatDollars(submission.fight_price_cents),
        regularPrice: formatDollars(submission.list_price_cents),
        savings: `You save ${formatDollars(savingsCents)}`,
        coupon: submission.coupon_code,
        url: submission.product_url,
      }];
    });

    return [...paidListings, ...launchListings].sort((a, b) => b.totalBid - a.totalBid);
  } catch (error) {
    console.error('Failed to load approved paid listings', error);
    return launchListings;
  }
}

export const getPublishedDeal = cache(async (id: string) => {
  const listings = await getPublishedListings();
  const index = listings.findIndex((listing) => listing.id === id);

  if (index === -1) return null;

  return {
    listing: listings[index],
    rank: index + 1,
    nextBid: listings[index].totalBid + 1,
    listingCount: listings.length,
  };
});
