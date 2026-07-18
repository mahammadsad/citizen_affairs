import { SITE } from '@utils/constants';

export function GET() {
  const body = [
    'User-agent: *',
    'Allow: /',
    `Disallow: ${SITE.basePath}admin/`,
    `Disallow: ${SITE.basePath}staff/`,
    `Disallow: ${SITE.basePath}search/`,
    `Disallow: ${SITE.basePath}bn/search/`,
    `Disallow: ${SITE.basePath}hi/search/`,
    '',
    `Sitemap: ${SITE.url}/sitemap.xml`,
    '',
  ].join('\n');

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
