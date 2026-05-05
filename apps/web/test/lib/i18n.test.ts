import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LOCALE,
  LOCALES,
  buildAlternateLanguages,
  getLocaleFromPathname,
  localizePath,
  switchLocaleInPathname,
} from '@/lib/i18n';

describe('i18n navigation helpers', () => {
  it('recognizes supported locale prefixes and falls back to the default locale', () => {
    expect(LOCALES).toEqual(['zh-TW', 'en', 'vi', 'id', 'ja', 'ko']);
    expect(DEFAULT_LOCALE).toBe('zh-TW');
    expect(getLocaleFromPathname('/vi/tools/tarot')).toBe('vi');
    expect(getLocaleFromPathname('/tools/tarot')).toBe('zh-TW');
  });

  it('keeps the current page path when switching locales', () => {
    expect(switchLocaleInPathname('/zh-TW/spiritual', 'vi')).toBe('/vi/spiritual');
    expect(switchLocaleInPathname('/en/tools/tarot?spread=three#result', 'id')).toBe(
      '/id/tools/tarot?spread=three#result',
    );
    expect(switchLocaleInPathname('/teachers', 'ja')).toBe('/ja/teachers');
  });

  it('builds localized paths and hreflang alternate links', () => {
    expect(localizePath('/tools/maya', 'ko')).toBe('/ko/tools/maya');
    expect(localizePath('/zh-TW/tools/maya', 'en')).toBe('/en/tools/maya');

    const alternates = buildAlternateLanguages('/zh-TW/tools/maya');

    expect(alternates['zh-TW']).toBe('/zh-TW/tools/maya');
    expect(alternates.en).toBe('/en/tools/maya');
    expect(alternates.vi).toBe('/vi/tools/maya');
    expect(alternates['x-default']).toBe('/zh-TW/tools/maya');
  });
});
