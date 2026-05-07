export const LOCALES = ['zh-TW', 'en', 'vi', 'id', 'ja', 'ko'] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'zh-TW';

export const LOCALE_COOKIE = 'mele-locale';
export const LOCALE_HEADER = 'x-mele-locale';
export const PATH_HEADER = 'x-mele-pathname';

export const LOCALE_LABELS: Record<Locale, { nativeName: string; marketName: string; shortName: string }> = {
  'zh-TW': { nativeName: '\u7e41\u9ad4\u4e2d\u6587', marketName: '\u53f0\u7063', shortName: '\u7e41\u4e2d' },
  en: { nativeName: 'English', marketName: 'International', shortName: 'EN' },
  vi: { nativeName: 'Ti\u1ebfng Vi\u1ec7t', marketName: 'Vi\u1ec7t Nam', shortName: 'VI' },
  id: { nativeName: 'Bahasa Indonesia', marketName: 'Indonesia', shortName: 'ID' },
  ja: { nativeName: '\u65e5\u672c\u8a9e', marketName: '\u65e5\u672c', shortName: 'JA' },
  ko: { nativeName: '\ud55c\uad6d\uc5b4', marketName: '\ud55c\uad6d', shortName: 'KO' },
};

export function isLocale(value: string | undefined | null): value is Locale {
  return Boolean(value && (LOCALES as readonly string[]).includes(value));
}

function splitPathname(input: string) {
  const hashIndex = input.indexOf('#');
  const hash = hashIndex >= 0 ? input.slice(hashIndex) : '';
  const withoutHash = hashIndex >= 0 ? input.slice(0, hashIndex) : input;
  const queryIndex = withoutHash.indexOf('?');
  const query = queryIndex >= 0 ? withoutHash.slice(queryIndex) : '';
  const pathname = queryIndex >= 0 ? withoutHash.slice(0, queryIndex) : withoutHash;

  return {
    pathname: pathname.startsWith('/') ? pathname : `/${pathname}`,
    query,
    hash,
  };
}

export function getLocaleFromPathname(pathname: string): Locale {
  const firstSegment = splitPathname(pathname).pathname.split('/').filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
}

export function stripLocaleFromPathname(pathname: string) {
  const { pathname: cleanPathname, query, hash } = splitPathname(pathname);
  const segments = cleanPathname.split('/').filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  const stripped = segments.length ? `/${segments.join('/')}` : '/';
  return `${stripped}${query}${hash}`;
}

export function localizePath(pathname: string, locale: Locale) {
  const stripped = stripLocaleFromPathname(pathname);
  const { pathname: cleanPathname, query, hash } = splitPathname(stripped);
  const suffix = cleanPathname === '/' ? '' : cleanPathname;
  return `/${locale}${suffix}${query}${hash}`;
}

export function switchLocaleInPathname(pathname: string, nextLocale: Locale) {
  return localizePath(pathname, nextLocale);
}

export function buildAlternateLanguages(pathname: string) {
  const languages = Object.fromEntries(
    LOCALES.map((locale) => [locale, localizePath(pathname, locale)]),
  ) as Record<Locale, string> & { 'x-default': string };

  languages['x-default'] = localizePath(pathname, DEFAULT_LOCALE);
  return languages;
}

export function localeToOpenGraphLocale(locale: Locale) {
  return locale === 'zh-TW' ? 'zh_TW' : locale;
}

export function isLocalizedPath(pathname: string) {
  const firstSegment = splitPathname(pathname).pathname.split('/').filter(Boolean)[0];
  return isLocale(firstSegment);
}
