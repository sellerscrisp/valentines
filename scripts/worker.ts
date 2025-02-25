/// <reference types="@cloudflare/workers-types" />

export interface Env {
  SCRAPBOOK: R2Bucket;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const key = url.pathname.slice(1); // Remove leading slash

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
        },
      });
    }

    const obj = await env.SCRAPBOOK.get(key);

    if (!obj) {
      return new Response('Object Not Found', { status: 404 });
    }

    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=31536000');
    headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('etag', obj.httpEtag);

    return new Response(obj.body, {
      headers,
    });
  },
};