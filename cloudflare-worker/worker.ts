/**
 * Cloudflare Worker for edge routing
 * Handles short link redirects, QR code serving, and public profile caching
 *
 * Deploy with: wrangler publish
 */

export interface Env {
  API_ORIGIN: string;
  SHORT_LINK_CACHE: KVNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Short link routing: /s/:shortCode
    if (url.pathname.startsWith('/s/')) {
      return handleShortLink(request, url, env);
    }

    // Public profile view: /p/:profileId
    if (url.pathname.startsWith('/p/')) {
      return handlePublicProfile(request, url, env);
    }

    // QR code serving: /qr/:profileId
    if (url.pathname.startsWith('/qr/')) {
      return handleQRCode(request, url, env);
    }

    // Pass through to origin for all other requests
    return fetch(request);
  },
};

async function handleShortLink(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response> {
  const shortCode = url.pathname.split('/s/')[1];
  if (!shortCode) {
    return new Response('Not Found', { status: 404 });
  }

  // Check KV cache first
  let profileId = await env.SHORT_LINK_CACHE.get(`shortlink:${shortCode}`);

  if (!profileId) {
    // Fetch from API
    const apiResponse = await fetch(
      `${env.API_ORIGIN}/api/v1/s/${shortCode}`,
      { headers: { 'X-Forwarded-For': request.headers.get('CF-Connecting-IP') || '' } },
    );

    if (!apiResponse.ok) {
      return new Response('Not Found', { status: 404 });
    }

    const data: any = await apiResponse.json();
    profileId = data.profileId;

    // Cache for 5 minutes
    await env.SHORT_LINK_CACHE.put(`shortlink:${shortCode}`, profileId!, {
      expirationTtl: 300,
    });
  }

  // Track click asynchronously (fire and forget)
  const trackPromise = fetch(`${env.API_ORIGIN}/api/v1/analytics/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      profile_id: profileId,
      event_type: 'click',
      event_metadata: {
        referrer: request.headers.get('Referer') || '',
        device: request.headers.get('User-Agent') || '',
      },
      ip_address: request.headers.get('CF-Connecting-IP') || '',
      user_agent: request.headers.get('User-Agent') || '',
    }),
  });

  // Don't await tracking - redirect immediately
  void trackPromise;

  return Response.redirect(`${url.origin}/p/${profileId}`, 302);
}

async function handlePublicProfile(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response> {
  const profileId = url.pathname.split('/p/')[1];
  if (!profileId) {
    return new Response('Not Found', { status: 404 });
  }

  // Check cache
  const cacheKey = new Request(url.toString(), request);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (!response) {
    // Fetch from origin
    response = await fetch(`${env.API_ORIGIN}/api/v1/p/${profileId}`, {
      headers: {
        'User-Agent': request.headers.get('User-Agent') || '',
        'X-Forwarded-For': request.headers.get('CF-Connecting-IP') || '',
      },
    });

    // Only cache non-password-protected profiles
    if (response.ok) {
      const body = await response.json() as any;
      if (!body.password_protected) {
        response = new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300', // 5 minute cache
            'Vary': 'User-Agent',
          },
        });
        void cache.put(cacheKey, response.clone());
      } else {
        response = new Response(JSON.stringify(body), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store',
          },
        });
      }
    }
  }

  return response;
}

async function handleQRCode(
  request: Request,
  url: URL,
  env: Env,
): Promise<Response> {
  const profileId = url.pathname.split('/qr/')[1];
  if (!profileId) {
    return new Response('Not Found', { status: 404 });
  }

  // Cache QR codes at edge for 24 hours
  const cacheKey = new Request(url.toString(), request);
  const cache = caches.default;
  let response = await cache.match(cacheKey);

  if (!response) {
    response = await fetch(
      `${env.API_ORIGIN}/api/v1/profiles/${profileId}/qr?${url.searchParams.toString()}`,
    );

    if (response.ok) {
      response = new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': response.headers.get('Content-Type') || 'image/png',
          'Cache-Control': 'public, max-age=86400', // 24 hours
        },
      });
      void cache.put(cacheKey, response.clone());
    }
  }

  return response;
}
