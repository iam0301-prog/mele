'use client';

import { usePathname } from 'next/navigation';
import { getLocaleFromPathname, isLocalizedPath, type Locale } from './config';
import { useProvidedLocale } from './LocaleProvider';

export function useCurrentLocale(): Locale {
  const providedLocale = useProvidedLocale();
  const pathname = usePathname();
  if (pathname && isLocalizedPath(pathname)) return getLocaleFromPathname(pathname);
  return providedLocale;
}
