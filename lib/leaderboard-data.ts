export type BoardMode = 'all' | 'week' | 'today';

export type Listing = {
  id: string;
  name: string;
  mark: string;
  tagline: string;
  category: string;
  totalBid: number;
  weekBid: number;
  todayBid: number;
  dealLabel: string;
  dealDetails: string;
  coupon: string;
  clicks: number;
  claims: number;
  url: string;
  age: string;
};

export const categories = ['All', 'AI', 'Design', 'Dev tools', 'Marketing', 'Productivity', 'Ecommerce'] as const;

export const listings: Listing[] = [
  { id: 'notedrop', name: 'Notedrop', mark: 'ND', tagline: 'Meetings into decisions.', category: 'AI', totalBid: 1250, weekBid: 820, todayBid: 310, dealLabel: '70% OFF', dealDetails: '$36 for the first year, then the standard annual price.', coupon: 'FIGHT70', clicks: 4821, claims: 184, url: 'https://example.com/notedrop', age: '2h ago' },
  { id: 'framebase', name: 'Framebase', mark: 'FB', tagline: 'UI blocks for product teams.', category: 'Design', totalBid: 980, weekBid: 640, todayBid: 190, dealLabel: '$49 LIFETIME', dealDetails: 'One user, commercial projects, and lifetime component updates.', coupon: 'FRAME49', clicks: 3106, claims: 221, url: 'https://example.com/framebase', age: '4h ago' },
  { id: 'shiplog', name: 'Shiplog', mark: 'SL', tagline: 'Logs without the enterprise bill.', category: 'Dev tools', totalBid: 720, weekBid: 560, todayBid: 360, dealLabel: '3 MONTHS FREE', dealDetails: 'Three free months on the starter observability plan.', coupon: 'SHIPFREE', clicks: 2448, claims: 81, url: 'https://example.com/shiplog', age: '17m ago' },
  { id: 'typecase', name: 'Typecase', mark: 'TC', tagline: 'Brand systems in an afternoon.', category: 'Design', totalBid: 510, weekBid: 210, todayBid: 95, dealLabel: '50% OFF', dealDetails: 'Half price on the complete brand-system template library.', coupon: 'TYPE50', clicks: 1903, claims: 138, url: 'https://example.com/typecase', age: '6h ago' },
  { id: 'cronboard', name: 'Cronboard', mark: 'CB', tagline: 'Know when background jobs break.', category: 'Dev tools', totalBid: 380, weekBid: 280, todayBid: 140, dealLabel: '40% OFF', dealDetails: 'Forty percent off the first year of up to 100 monitors.', coupon: 'CRON40', clicks: 1287, claims: 62, url: 'https://example.com/cronboard', age: '1h ago' },
  { id: 'queryfox', name: 'QueryFox', mark: 'QF', tagline: 'Ask your warehouse in plain English.', category: 'AI', totalBid: 310, weekBid: 300, todayBid: 210, dealLabel: '60% OFF', dealDetails: 'Sixty percent off the team plan for the first six months.', coupon: 'FOX60', clicks: 1104, claims: 77, url: 'https://example.com/queryfox', age: '29m ago' },
  { id: 'mailpilot', name: 'MailPilot', mark: 'MP', tagline: 'Campaigns that practically send themselves.', category: 'Marketing', totalBid: 280, weekBid: 105, todayBid: 60, dealLabel: '2 MONTHS FREE', dealDetails: 'Two free months on any annual email automation plan.', coupon: 'PILOT2', clicks: 943, claims: 54, url: 'https://example.com/mailpilot', age: '9h ago' },
  { id: 'deploydock', name: 'DeployDock', mark: 'DD', tagline: 'Preview every pull request instantly.', category: 'Dev tools', totalBid: 250, weekBid: 220, todayBid: 180, dealLabel: '$29 / YEAR', dealDetails: 'The complete indie plan for $29 during the first year.', coupon: 'DOCK29', clicks: 806, claims: 49, url: 'https://example.com/deploydock', age: '44m ago' },
  { id: 'pixelpush', name: 'PixelPush', mark: 'PP', tagline: 'Feedback directly on the design.', category: 'Design', totalBid: 210, weekBid: 180, todayBid: 42, dealLabel: '55% OFF', dealDetails: 'Fifty-five percent off the first year for teams of five.', coupon: 'PIXEL55', clicks: 741, claims: 39, url: 'https://example.com/pixelpush', age: '11h ago' },
  { id: 'taskmint', name: 'TaskMint', mark: 'TM', tagline: 'Tiny tasks, calm days.', category: 'Productivity', totalBid: 175, weekBid: 170, todayBid: 155, dealLabel: 'LIFETIME $39', dealDetails: 'One lifetime personal account for a one-time $39 payment.', coupon: 'MINT39', clicks: 688, claims: 93, url: 'https://example.com/taskmint', age: '8m ago' },
  { id: 'cartmuse', name: 'CartMuse', mark: 'CM', tagline: 'A smarter storefront search bar.', category: 'Ecommerce', totalBid: 140, weekBid: 95, todayBid: 35, dealLabel: '30% OFF', dealDetails: 'Thirty percent off the first year for stores under 10k SKUs.', coupon: 'CART30', clicks: 512, claims: 31, url: 'https://example.com/cartmuse', age: '13h ago' },
  { id: 'flowkit', name: 'Flowkit', mark: 'FK', tagline: 'One calm workspace for your team.', category: 'Productivity', totalBid: 105, weekBid: 75, todayBid: 25, dealLabel: '45% OFF', dealDetails: 'Forty-five percent off the first annual team workspace.', coupon: 'FLOW45', clicks: 429, claims: 26, url: 'https://example.com/flowkit', age: '1d ago' },
];

export function bidForMode(listing: Listing, mode: BoardMode) {
  if (mode === 'today') return listing.todayBid;
  if (mode === 'week') return listing.weekBid;
  return listing.totalBid;
}
