export {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  LOCALE_LABELS,
  LOCALES,
  PATH_HEADER,
  buildAlternateLanguages,
  getLocaleFromPathname,
  isLocale,
  isLocalizedPath,
  localeToOpenGraphLocale,
  localizePath,
  stripLocaleFromPathname,
  switchLocaleInPathname,
  type Locale,
} from './config';
export { absoluteUrl, buildLocalizedMetadata, defaultCanonicalPath } from './seo';
export { getAllDictionaries, getDictionary, type Dictionary } from './dictionaries';
