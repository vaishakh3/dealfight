import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Deal Fight',
    short_name: 'Deal Fight',
    description: 'Exclusive software deals on a transparent sponsored leaderboard.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f3e9',
    theme_color: '#10110f',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
