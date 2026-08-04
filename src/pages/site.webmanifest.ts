import { BRAND, getBrandName, getBrandTagline, SITE } from '@utils/constants';

export function GET() {
  return new Response(JSON.stringify({
    id: SITE.basePath,
    name: getBrandName('en'),
    short_name: BRAND.brandShortName,
    description: getBrandTagline('en'),
    lang: 'en',
    dir: 'ltr',
    start_url: SITE.basePath,
    scope: SITE.basePath,
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: '#F5F7FA',
    theme_color: '#0A4D8C',
    categories: ['news', 'government', 'education', 'utilities'],
    prefer_related_applications: false,
    icons: [
      { src: `${SITE.basePath}assets/favicon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
      { src: `${SITE.basePath}assets/logo-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
    ],
    shortcuts: [
      {
        name: 'Search Citizen Affairs',
        short_name: 'Search',
        url: `${SITE.basePath}search/`,
        icons: [{ src: `${SITE.basePath}assets/favicon-192.png`, sizes: '192x192', type: 'image/png' }]
      },
      {
        name: 'Application deadlines',
        short_name: 'Deadlines',
        url: `${SITE.basePath}deadlines/`,
        icons: [{ src: `${SITE.basePath}assets/favicon-192.png`, sizes: '192x192', type: 'image/png' }]
      }
    ]
  }), { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } });
}
