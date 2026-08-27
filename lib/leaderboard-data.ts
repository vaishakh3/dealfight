export type Listing = {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  category: string;
  totalBid: number;
  dealLabel: string;
  dealDetails: string;
  dealPrice: string;
  regularPrice: string;
  savings: string;
  coupon: string;
  url: string;
};

export const categories = ['All', 'AI', 'Design', 'Dev tools', 'Marketing', 'Productivity', 'Ecommerce'] as const;

export const listings: Listing[] = [
  { id: 'notedrop', name: 'Notedrop', logo: '/logos/notedrop.png', tagline: 'Turn every meeting into clear decisions.', category: 'AI', totalBid: 15, dealLabel: '70% OFF', dealDetails: '$36 for the first year, then the standard annual price.', dealPrice: '$36 for year one', regularPrice: '$120/year', savings: 'You save $84', coupon: 'DEAL70', url: 'https://example.com/notedrop' },
  { id: 'framebase', name: 'Framebase', logo: '/logos/framebase.png', tagline: 'Production-ready UI blocks for product teams.', category: 'Design', totalBid: 10, dealLabel: '$49 LIFETIME', dealDetails: 'One user, commercial projects, and lifetime component updates.', dealPrice: '$49 one time', regularPrice: '$129', savings: 'You save $80', coupon: 'FRAME49', url: 'https://example.com/framebase' },
  { id: 'shiplog', name: 'Shiplog', logo: '/logos/shiplog.png', tagline: 'Observability without the enterprise bill.', category: 'Dev tools', totalBid: 5, dealLabel: '3 MONTHS FREE', dealDetails: 'Three free months on the starter observability plan.', dealPrice: '$0 for 3 months', regularPrice: '$29/month', savings: 'You save $87', coupon: 'SHIPFREE', url: 'https://example.com/shiplog' },
];
