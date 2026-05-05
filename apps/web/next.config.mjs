import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {import('next').NextConfig} */
const webRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(webRoot, '..', '..');
const configuredApiUrl = process.env.MELE_API_URL;
const calcApiUrl = configuredApiUrl ?? 'http://127.0.0.1:8015';

if (process.env.NODE_ENV === 'production' && !configuredApiUrl) {
  throw new Error('MELE_API_URL is required for production builds.');
}

// Supabase Storage 圖片網域；多環境用 NEXT_PUBLIC_SUPABASE_URL 推導
const supabaseHost = (() => {
  try {
    return process.env.NEXT_PUBLIC_SUPABASE_URL
      ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
      : null;
  } catch {
    return null;
  }
})();

const remotePatterns = [
  // LINE 頭像
  { protocol: 'https', hostname: 'profile.line-scdn.net' },
  // Google 頭像
  { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
  // Gravatar
  { protocol: 'https', hostname: 'www.gravatar.com' },
];
if (supabaseHost) {
  remotePatterns.push({ protocol: 'https', hostname: supabaseHost });
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(self)' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  outputFileTracingRoot: repoRoot,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  images: {
    remotePatterns,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: ['@supabase/supabase-js', '@supabase/ssr'],
  },
  async rewrites() {
    return [
      {
        source: '/api/calc/:path*',
        destination: `${calcApiUrl}/api/v1/calc/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }],
      },
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
    ];
  },
};

export default process.env.ANALYZE === 'true'
  ? (await import('@next/bundle-analyzer')).default({ enabled: true })(nextConfig)
  : nextConfig;
