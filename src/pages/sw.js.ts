import { SITE } from '@utils/constants';

export const prerender = true;

const workerSource = () => {
  const build = import.meta.env.PUBLIC_BUILD_COMMIT || 'development';
  const base = SITE.basePath;
  const logo = SITE.logo;
  return `
const BUILD = ${JSON.stringify(build)};
const BASE = ${JSON.stringify(base)};
const CACHE_PREFIX = 'citizen-affairs-';
const CACHE_NAME = CACHE_PREFIX + BUILD;
const OFFLINE = {
  en: BASE + 'offline/',
  bn: BASE + 'bn/offline/',
  hi: BASE + 'hi/offline/'
};
const PRECACHE = [
  BASE,
  BASE + 'bn/',
  BASE + 'hi/',
  OFFLINE.en,
  OFFLINE.bn,
  OFFLINE.hi,
  BASE + 'site.webmanifest',
  BASE + 'assets/favicon-32.png',
  BASE + 'assets/favicon-192.png',
  ${JSON.stringify(logo)}
];

const sameOrigin = (request) => new URL(request.url).origin === self.location.origin;
const isPrivateOrMutable = (url) =>
  /\\/(?:admin|staff|api)(?:\\/|$)/.test(url.pathname) ||
  /\\/status(?:\\/|$)/.test(url.pathname) ||
  /\\/(?:deployment\\.json|health\\.json|search-index\\.json)$/.test(url.pathname);
const localeFor = (url) => {
  const path = url.pathname.slice(BASE.length).replace(/^\\/+/, '');
  if (path.startsWith('bn/')) return 'bn';
  if (path.startsWith('hi/')) return 'hi';
  return 'en';
};
const cacheable = (response) =>
  response && response.ok && response.type === 'basic' &&
  !/no-store/i.test(response.headers.get('cache-control') || '');

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !sameOrigin(request)) return;
  const url = new URL(request.url);
  if (isPrivateOrMutable(url) || url.pathname.endsWith('/sw.js')) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      try {
        const response = await fetch(request, { signal: controller.signal });
        clearTimeout(timer);
        if (cacheable(response) && !url.search) await cache.put(request, response.clone());
        return response;
      } catch {
        clearTimeout(timer);
        return (await cache.match(request, { ignoreSearch: true })) ||
          (await cache.match(OFFLINE[localeFor(url)])) ||
          (await cache.match(OFFLINE.en));
      }
    })());
    return;
  }

  if (['style', 'script', 'font', 'image'].includes(request.destination)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      const refresh = fetch(request).then(async (response) => {
        if (cacheable(response)) await cache.put(request, response.clone());
        return response;
      }).catch(() => cached);
      return cached || refresh;
    })());
  }
});
`;
};

export function GET() {
  return new Response(workerSource(), {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Service-Worker-Allowed': SITE.basePath
    }
  });
}
