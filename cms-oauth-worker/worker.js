/**
 * Decap CMS <-> GitHub OAuth proxy.
 *
 * GitHub Pages can only serve static files, but exchanging an OAuth `code`
 * for an access token requires a client secret that must never reach the
 * browser. This tiny Worker is the only server-side piece in the whole
 * project — it does nothing except that one exchange.
 *
 * Deploy: paste this file into a new Worker in the Cloudflare dashboard,
 * then add two secrets (Settings -> Variables -> Encrypt):
 *   GITHUB_CLIENT_ID
 *   GITHUB_CLIENT_SECRET
 * (from a GitHub OAuth App whose callback URL is https://<your-worker>.workers.dev/callback)
 *
 * Then set `backend.base_url` in public/admin/config.yml to your worker's URL.
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/auth') {
      return handleAuth(url, env);
    }
    if (url.pathname === '/callback') {
      return handleCallback(url, env);
    }
    return new Response('Decap CMS OAuth proxy is running.', { status: 200 });
  },
};

function handleAuth(url, env) {
  const state = crypto.randomUUID();
  const redirectUri = `${url.origin}/callback`;

  const authorizeUrl = new URL('https://github.com/login/oauth/authorize');
  authorizeUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  authorizeUrl.searchParams.set('redirect_uri', redirectUri);
  authorizeUrl.searchParams.set('scope', 'repo,user');
  authorizeUrl.searchParams.set('state', state);

  return Response.redirect(authorizeUrl.toString(), 302);
}

async function handleCallback(url, env) {
  const code = url.searchParams.get('code');

  if (!code) {
    return htmlResponse(renderResult('error', 'Missing OAuth code from GitHub.'));
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await tokenResponse.json();

    if (data.error || !data.access_token) {
      return htmlResponse(renderResult('error', data.error_description || 'Token exchange failed.'));
    }

    return htmlResponse(renderResult('success', JSON.stringify({ token: data.access_token, provider: 'github' })));
  } catch (err) {
    return htmlResponse(renderResult('error', 'Unexpected error during token exchange.'));
  }
}

/**
 * Builds the small HTML/JS page Decap CMS's popup window expects.
 * This implements the documented postMessage handshake: the popup announces
 * itself as "authorizing:github", waits for the opener (the CMS admin tab)
 * to acknowledge, and only then sends the token back to that acknowledged origin.
 */
function renderResult(status, payload) {
  const message = status === 'success'
    ? `authorization:github:success:${payload}`
    : `authorization:github:error:${payload}`;

  return `<!doctype html>
<html><body>
<script>
  (function() {
    function receiveMessage(e) {
      window.removeEventListener("message", receiveMessage, false);
      window.opener.postMessage(
        ${JSON.stringify(message)},
        e.origin
      );
    }
    window.addEventListener("message", receiveMessage, false);
    window.opener.postMessage("authorizing:github", "*");
  })();
</script>
${status === 'error' ? `<p>Login failed: ${escapeHtml(payload)}</p>` : '<p>Logged in — you can close this window.</p>'}
</body></html>`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function htmlResponse(body) {
  return new Response(body, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
