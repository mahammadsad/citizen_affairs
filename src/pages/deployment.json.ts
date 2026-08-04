export const prerender = true;

export function GET() {
  const commit = import.meta.env.PUBLIC_BUILD_COMMIT || 'local';
  return new Response(
    JSON.stringify({
      service: 'citizen-affairs',
      commit,
      generatedAt: new Date().toISOString(),
      homepage: 'https://citizenaffairs.in/'
    }),
    {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store, max-age=0'
      }
    }
  );
}
