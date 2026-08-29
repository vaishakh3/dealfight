import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.dealfight.lol',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://www.dealfight.lol/refund-policy',
      lastModified: new Date('2026-08-28'),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...['listing-standards', 'privacy', 'terms'].map((path) => ({
      url: `https://www.dealfight.lol/${path}`,
      lastModified: new Date('2026-08-29'),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    })),
  ];
}
