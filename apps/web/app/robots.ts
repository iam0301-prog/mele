import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/i18n/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/teacher-portal', '/account'],
    },
    sitemap: new URL('/sitemap.xml', SITE_URL).toString(),
    host: SITE_URL,
  };
}
