import { type NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  PATH_HEADER,
  getLocaleFromPathname,
  isLocale,
  isLocalizedPath,
  stripLocaleFromPathname,
} from './lib/i18n/config';
import { updateSession } from './lib/supabase/middleware';

const LOCALIZED_APP_ROUTES = new Set(['/', '/spiritual', '/tools']);
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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = localeFromRequest(request);
  const requestHeaders = withLocaleHeaders(request, locale);

  if (shouldLeaveUntouched(pathname) || request.method !== 'GET') {
    return await updateSession(request, requestHeaders);
  }

  if (pathname === '/') {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}`;
    const response = NextResponse.redirect(url);
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  if (!isLocalizedPath(pathname)) {
    const response = await updateSession(request, requestHeaders);
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const strippedPath = stripLocaleFromPathname(pathname);
  if (!hasNativeLocalizedRoute(strippedPath)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = strippedPath;
    const response = await updateSession(request, requestHeaders, (headers) =>
      NextResponse.rewrite(rewriteUrl, {
        request: {
          headers,
        },
      }),
    );
    response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
    return response;
  }

  const response = await updateSession(request, requestHeaders);
  response.cookies.set(LOCALE_COOKIE, locale, { path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 });
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.json|sitemap.xml|robots.txt|sw.js|icons/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
