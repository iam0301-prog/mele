import { getLocaleFromPathname, localizePath } from '@/lib/i18n/config';

type AuthFailureUrlInput = {
  origin: string;
  next: string;
  error: string;
  message?: string;
};

function safeFallbackPath(fallback: string) {
  if (!fallback.startsWith('/') || fallback.startsWith('//')) return '/account/charts';
  return fallback;
}

export function sanitizeAuthNextPath(next: string | null | undefined, fallback = '/account/charts') {
  const safeFallback = safeFallbackPath(fallback);
  if (!next || !next.startsWith('/') || next.startsWith('//')) {
    return safeFallback;
  }
  return next;
}

export const normalizeLoginReturnPath = sanitizeAuthNextPath;

export function buildLocalizedAuthFailureUrl({ origin, next, error, message }: AuthFailureUrlInput) {
  const safeNext = sanitizeAuthNextPath(next);
  const locale = getLocaleFromPathname(safeNext);
  const url = new URL(localizePath('/account/login', locale), origin);
  url.searchParams.set('error', error);
  url.searchParams.set('return', safeNext);
  if (message) url.searchParams.set('message', message);
  return url;
}
