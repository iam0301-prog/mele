import type { Metadata } from 'next';
import {
  DEFAULT_LOCALE,
  buildAlternateLanguages,
  localeToOpenGraphLocale,
  localizePath,
  type Locale,
} from './config';
import type { Dictionary } from './dictionaries';

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3006';

export function absoluteUrl(pathname: string) {
  return new URL(pathname, SITE_URL).toString();
}

export function buildLocalizedMetadata({
  locale,
  dictionary,
  pathname,
  title,
  description,
}: {
  locale: Locale;
  dictionary: Dictionary;
  pathname: string;
  title?: string;
  description?: string;
}): Metadata {
  const canonical = localizePath(pathname, locale);
  const alternateEntries = buildAlternateLanguages(canonical);

  return {
    metadataBase: new URL(SITE_URL),
    title: title ?? dictionary.meta.title,
    description: description ?? dictionary.meta.description,
    keywords: dictionary.meta.keywords,
    alternates: {
      canonical,
      languages: alternateEntries,
    },
    openGraph: {
      type: 'website',
      locale: localeToOpenGraphLocale(locale),
      alternateLocale: Object.keys(alternateEntries).filter(
        (key) => key !== locale && key !== 'x-default',
      ),
      siteName: dictionary.meta.siteName,
      title: title ?? dictionary.meta.title,
      description: description ?? dictionary.meta.description,
      url: absoluteUrl(canonical),
    },
    twitter: {
      card: 'summary_large_image',
      title: title ?? dictionary.meta.title,
      description: description ?? dictionary.meta.description,
    },
  };
}

export function defaultCanonicalPath() {
  return `/${DEFAULT_LOCALE}`;
}
