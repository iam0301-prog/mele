function normalizeOrigin(origin: string) {
  return origin.trim().replace(/\/$/, '');
}

function configuredOrigins() {
  const webUrl = normalizeOrigin(Deno.env.get('MELE_WEB_URL') || '');
  const extra = (Deno.env.get('MELE_ALLOWED_ORIGINS') || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean);
  return [...new Set([webUrl, ...extra].filter(Boolean))];
}

export function corsHeadersFor(req?: Request): HeadersInit {
  const allowed = configuredOrigins();
  const requestOrigin = normalizeOrigin(req?.headers.get('Origin') || '');
  const allowedOrigin = allowed.includes(requestOrigin) ? requestOrigin : allowed[0] || 'null';

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Vary': 'Origin',
  };
}

export const corsHeaders = corsHeadersFor();

export function jsonResponse(data: unknown, status = 200, req?: Request): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeadersFor(req), 'Content-Type': 'application/json' },
  });
}

export function errorResponse(message: string, status = 400, req?: Request): Response {
  return jsonResponse({ error: message }, status, req);
}
