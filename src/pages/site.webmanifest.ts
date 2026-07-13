import { BRAND, getBrandName, getBrandTagline, SITE } from '@utils/constants';

export function GET() {
  return new Response(JSON.stringify({
    name: getBrandName('en'),
    short_name: BRAND.brandShortName,
    description: getBrandTagline('en'),
    lang: 'en',
    start_url: SITE.basePath,
    scope: SITE.basePath,
    display: 'standalone',
    background_color: '#F5F7FA',
    theme_color: '#0A4D8C',
    icons: [
      { src: `${SITE.basePath}assets/favicon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${SITE.basePath}assets/logo-512.png`, sizes: '512x512', type: 'image/png' }
    ]
  }), { headers: { 'Content-Type': 'application/manifest+json; charset=utf-8' } });
}
