import { SITE } from '@utils/constants';

export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${SITE.basePath}admin/`,
    '',
    `Sitemap: ${SITE.url}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
