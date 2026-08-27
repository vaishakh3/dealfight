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
  ];
}
