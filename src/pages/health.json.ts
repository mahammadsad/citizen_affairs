import { SITE } from '@utils/constants';

export const prerender = true;

export function GET() {
  const commit = import.meta.env.PUBLIC_BUILD_COMMIT || 'local';
  return new Response(
    JSON.stringify({
      service: 'citizen-affairs',
      status: 'ready',
      scope: 'served-build',
      commit,
      generatedAt: new Date().toISOString(),
      resources: {
        homepage: SITE.basePath,
        manifest: `${SITE.basePath}site.webmanifest`,
        serviceWorker: `${SITE.basePath}sw.js`,
        sitemap: `${SITE.basePath}sitemap.xml`,
        robots: `${SITE.basePath}robots.txt`,
        offline: [
          `${SITE.basePath}offline/`,
          `${SITE.basePath}bn/offline/`,
          `${SITE.basePath}hi/offline/`
        ]
      },
      verification: {
        meaning: 'This response identifies the files currently served by this deployment.',
        liveSmoke: 'GitHub Actions production smoke is the independent live verification.'
      }
    }),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
}
