export type Offer = {
  id: string;
  name: string;
  mark: string;
  tagline: string;
  originalPrice: number;
  dealPrice: number;
  term: string;
  discount: number;
  coupon: string;
  claims: number;
  url: string;
  accent: 'lime' | 'orange' | 'blue' | 'pink';
  proof: string;
  finePrint: string;
};

export type Fight = {
  slug: string;
  round: string;
  category: string;
  title: string;
  closesAt: string;
  entrants: number;
  watching: number;
  status: 'live' | 'next';
  offers: Offer[];
};

export const fights: Fight[] = [
  {
    slug: 'ai-productivity',
    round: '001',
    category: 'AI productivity',
    title: 'The work-smarter fight',
    closesAt: '2026-08-29T18:30:00.000Z',
    entrants: 8,
    watching: 128,
    status: 'live',
    offers: [
      {
        id: 'notedrop-pro',
        name: 'Notedrop',
        mark: 'ND',
        tagline: 'AI notes that turn meetings into decisions.',
        originalPrice: 120,
        dealPrice: 36,
        term: 'first year',
        discount: 70,
        coupon: 'FIGHT70',
        claims: 184,
        url: 'https://example.com/notedrop',
        accent: 'lime',
        proof: 'Public annual plan checked 27 Aug',
        finePrint: 'New customers · annual plan · renews at the standard rate.',
      },
      {
        id: 'flowkit-team',
        name: 'Flowkit',
        mark: 'FK',
        tagline: 'One calm workspace for your whole team.',
        originalPrice: 118,
        dealPrice: 49,
        term: 'first year',
        discount: 58,
        coupon: 'FIGHT58',
        claims: 96,
        url: 'https://example.com/flowkit',
        accent: 'orange',
        proof: 'Public annual plan checked 27 Aug',
        finePrint: 'Up to five seats · new workspaces · valid for seven days.',
      },
    ],
  },
  {
    slug: 'design-tools',
    round: '002',
    category: 'Design tools',
    title: 'Pixels versus pixels',
    closesAt: '2026-08-30T15:00:00.000Z',
    entrants: 5,
    watching: 74,
    status: 'live',
    offers: [
      {
        id: 'framebase-pro',
        name: 'Framebase',
        mark: 'FB',
        tagline: 'Production-ready UI blocks for product teams.',
        originalPrice: 199,
        dealPrice: 49,
        term: 'lifetime',
        discount: 75,
        coupon: 'FRAMEFIGHT',
        claims: 221,
        url: 'https://example.com/framebase',
        accent: 'blue',
        proof: 'Public lifetime price checked 27 Aug',
        finePrint: 'One user · lifetime updates · commercial projects included.',
      },
      {
        id: 'typecase-studio',
        name: 'Typecase',
        mark: 'TC',
        tagline: 'Brand systems without the six-week handoff.',
        originalPrice: 149,
        dealPrice: 44,
        term: 'lifetime',
        discount: 70,
        coupon: 'TYPE70',
        claims: 138,
        url: 'https://example.com/typecase',
        accent: 'pink',
        proof: 'Public lifetime price checked 27 Aug',
        finePrint: 'One user · all templates · future template drops included.',
      },
    ],
  },
  {
    slug: 'developer-tools',
    round: '003',
    category: 'Developer tools',
    title: 'Ship faster showdown',
    closesAt: '2026-09-01T18:30:00.000Z',
    entrants: 11,
    watching: 93,
    status: 'next',
    offers: [
      {
        id: 'shiplog-cloud',
        name: 'Shiplog',
        mark: 'SL',
        tagline: 'Logs, traces and alerts without the enterprise invoice.',
        originalPrice: 240,
        dealPrice: 72,
        term: 'first year',
        discount: 70,
        coupon: 'SHIP70',
        claims: 81,
        url: 'https://example.com/shiplog',
        accent: 'orange',
        proof: 'Public starter plan checked 27 Aug',
        finePrint: 'Starter plan · 50 GB monthly ingest · new accounts only.',
      },
      {
        id: 'cronboard-pro',
        name: 'Cronboard',
        mark: 'CB',
        tagline: 'Know when every background job breaks.',
        originalPrice: 108,
        dealPrice: 39,
        term: 'first year',
        discount: 64,
        coupon: 'CRON64',
        claims: 62,
        url: 'https://example.com/cronboard',
        accent: 'blue',
        proof: 'Public annual plan checked 27 Aug',
        finePrint: 'Up to 100 monitors · new accounts · standard renewal.',
      },
    ],
  },
];

export const categories = [
  'AI productivity',
  'Design tools',
  'Developer tools',
  'Marketing',
  'Creator tools',
  'Other',
] as const;
