import PriceFightClient from './price-fight-client';
import { getPublishedListings } from '@/lib/published-listings';

export default async function Home() {
  const listings = await getPublishedListings();
  return <PriceFightClient initialListings={listings} />;
}
