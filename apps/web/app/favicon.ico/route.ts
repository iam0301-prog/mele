const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="18" fill="#0d1b2a"/>
  <circle cx="32" cy="32" r="22" fill="none" stroke="#d6af2b" stroke-width="2"/>
  <path d="M32 8l5.8 17.9H56L41.1 36.8 46.8 55 32 43.8 17.2 55l5.7-18.2L8 25.9h18.2L32 8z" fill="none" stroke="#f0d26a" stroke-width="2" stroke-linejoin="round"/>
  <circle cx="32" cy="32" r="5" fill="#9de4ee"/>
</svg>`;

export function GET() {
  return new Response(faviconSvg, {
    headers: {
      'Cache-Control': 'public, max-age=86400',
      'Content-Type': 'image/svg+xml; charset=utf-8',
    },
  });
}
