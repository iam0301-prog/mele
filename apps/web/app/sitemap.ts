import type { MetadataRoute } from 'next';
import { LOCALES, buildAlternateLanguages, localizePath } from '@/lib/i18n/config';
import { SITE_URL } from '@/lib/i18n/seo';

const PUBLIC_ROUTES = [
  '/',
  '/spiritual',
  '/tools',
  '/daily',
  '/mobile',
  '/ar',
  '/teachers',
  '/teachers/apply',
  '/legal/privacy',
  '/legal/tos',
  '/legal/disclaimer',
  '/tools/numerology',
  '/tools/maya',
  '/tools/bazi',
  '/tools/tarot',
  '/tools/runes',
  '/tools/astro',
  '/tools/ziwei',
  '/tools/humandesign',
];

function absolute(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_ROUTES.flatMap((route) =>
    LOCALES.map((locale) => {
      const url = localizePath(route, locale);
      const languages = Object.fromEntries(
        Object.entries(buildAlternateLanguages(url)).map(([lang, href]) => [lang, absolute(href)]),
      );

      return {
        url: absolute(url),
        lastModified: new Date(),
        changeFrequency: route === '/' ? 'daily' : 'weekly',
        priority: route === '/' ? 1 : route === '/spiritual' ? 0.9 : 0.7,
        alternates: {
          languages,
        },
      } satisfies MetadataRoute.Sitemap[number];
    }),
  );
}
