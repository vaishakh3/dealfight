import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://www.dealfight.lol/sitemap.xml',
    host: 'https://www.dealfight.lol',
  };
}
