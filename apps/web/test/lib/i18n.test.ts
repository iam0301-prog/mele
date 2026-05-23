import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
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
    expect(switchLocaleInPathname('/zh-TW/tools', 'vi')).toBe('/vi/tools');
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

type JsonValue = null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function collectObjectShape(value: JsonValue, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return [`${prefix}[]`];
  }
  if (!value || typeof value !== 'object') {
    return [prefix];
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return [prefix];

  return entries.flatMap(([key, child]) => collectObjectShape(child, prefix ? `${prefix}.${key}` : key));
}

async function readCommon(locale: string) {
  const raw = await readFile(join(process.cwd(), '..', '..', 'locales', locale, 'common.json'), 'utf8');
  return JSON.parse(raw) as JsonValue;
}

describe('i18n dictionary deployment shape', () => {
  it('keeps every locale common.json on the same key structure as zh-TW', async () => {
    const baseShape = collectObjectShape(await readCommon(DEFAULT_LOCALE)).sort();

    for (const locale of LOCALES) {
      const shape = collectObjectShape(await readCommon(locale)).sort();
      expect(shape, `${locale} common.json shape`).toEqual(baseShape);
    }
  });

  it('exposes all eight tool entrances in every locale dictionary', async () => {
    const expected = ['numerology', 'maya', 'bazi', 'tarot', 'runes', 'astro', 'ziwei', 'humandesign'];

    for (const locale of LOCALES) {
      const dictionary = await readCommon(locale);
      const home = dictionary && typeof dictionary === 'object' && !Array.isArray(dictionary) ? dictionary.home : null;
      const tools = home && typeof home === 'object' && !Array.isArray(home) ? home.tools : null;
      expect(Array.isArray(tools), `${locale} home.tools`).toBe(true);
      expect((tools as Array<{ slug?: string }>).map((tool) => tool.slug).sort()).toEqual([...expected].sort());
    }
  });
});
