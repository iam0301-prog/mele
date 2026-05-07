import { NextResponse, type NextRequest } from 'next/server';

const LOCALES = ['zh-TW', 'en', 'vi', 'id', 'ja', 'ko'] as const;
const DEFAULT_LOCALE = 'zh-TW';
const LOCALE_COOKIE = 'mele-locale';
const LOCALE_HEADER = 'x-mele-locale';
const PATH_HEADER = 'x-mele-pathname';

const LOCALIZED_APP_ROUTES = new Set(['/', '/spiritual', '/tools', '/beta']);
const LOCALIZED_TOOL_ROUTES = new Set([
  '/tools/numerology',
  '/tools/maya',
  '/tools/bazi',
  '/tools/astro',
  '/tools/ziwei',
  '/tools/humandesign',
  '/tools/tarot',
  '/tools/runes',
]);
const UNTOUCHED_PREFIXES = ['/api', '/auth'];

function isLocale(value: string | undefined | null): value is (typeof LOCALES)[number] {
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

function getLocaleFromPathname(pathname: string) {
  const firstSegment = splitPathname(pathname).pathname.split('/').filter(Boolean)[0];
  return isLocale(firstSegment) ? firstSegment : DEFAULT_LOCALE;
}

function isLocalizedPath(pathname: string) {
  const firstSegment = splitPathname(pathname).pathname.split('/').filter(Boolean)[0];
  return isLocale(firstSegment);
}

function stripLocaleFromPathname(pathname: string) {
  const { pathname: cleanPathname, query, hash } = splitPathname(pathname);
  const segments = cleanPathname.split('/').filter(Boolean);
  if (isLocale(segments[0])) segments.shift();
  const stripped = segments.length ? `/${segments.join('/')}` : '/';
  return `${stripped}${query}${hash}`;
}

function localeFromRequest(request: NextRequest) {
  const pathLocale = getLocaleFromPathname(request.nextUrl.pathname);
  if (isLocalizedPath(request.nextUrl.pathname)) return pathLocale;

  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  return isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
}

function withLocaleHeaders(request: NextRequest, locale = localeFromRequest(request)) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);
  requestHeaders.set(PATH_HEADER, request.nextUrl.pathname);
  return requestHeaders;
}

function shouldLeaveUntouched(pathname: string) {
  return UNTOUCHED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function hasNativeLocalizedRoute(pathname: string) {
  return LOCALIZED_APP_ROUTES.has(pathname) || LOCALIZED_TOOL_ROUTES.has(pathname);
}

function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromRequest(request);
  const requestHeaders = withLocaleHeaders(request, locale);

  if (shouldLeaveUntouched(pathname) || request.method !== 'GET') {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    return setLocaleCookie(NextResponse.redirect(url), locale);
  }

  if (!isLocalizedPath(pathname)) {
    return setLocaleCookie(NextResponse.next({ request: { headers: requestHeaders } }), locale);
  }

  const strippedPath = stripLocaleFromPathname(pathname);
  if (!hasNativeLocalizedRoute(strippedPath)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = strippedPath;
    return setLocaleCookie(
      NextResponse.rewrite(rewriteUrl, {
        request: {
          headers: requestHeaders,
        },
      }),
      locale,
    );
  }

  return setLocaleCookie(NextResponse.next({ request: { headers: requestHeaders } }), locale);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sitemap.xml|robots.txt|sw.js|icons/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
