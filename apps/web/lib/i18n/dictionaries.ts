import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from './config';

export interface Dictionary {
  meta: {
    siteName: string;
    title: string;
    description: string;
    keywords: string[];
  };
  nav: Record<string, string>;
  footer: Record<string, string>;
  home: {
    badge: string;
    title: string;
    subtitle: string;
    description: string;
    actions: Record<string, string>;
    console: {
      ariaLabel: string;
      label: string;
      title: string;
      tarotAlt: string;
      mayaAlt: string;
      tasks: string[];
    };
    stats: Array<{ label: string; value: string; hint: string }>;
    marketsKicker: string;
    marketsTitle: string;
    marketsBody: string;
    toolsKicker: string;
    toolsTitle: string;
    toolsBody: string;
    roleKicker: string;
    roleTitle: string;
    roleBody: string;
    finalKicker: string;
    finalTitle: string;
    finalBody: string;
    proof: string[];
    tools: Array<{ slug: string; name: string; tag: string; desc: string }>;
    roles: Array<{ role: string; title: string; body: string; href: string; action: string }>;
  };
  markets: {
    items: Array<{ locale: Locale; name: string; status: string; body: string; href: string }>;
    page: Record<string, string>;
  };
  language: Record<string, string>;
}

function findLocalesRoot() {
  const candidates = [
    join(process.cwd(), 'locales'),
    join(process.cwd(), '..', '..', 'locales'),
  ];

  const root = candidates.find((candidate) =>
    existsSync(join(candidate, DEFAULT_LOCALE, 'common.json')),
  );

  if (!root) {
    throw new Error('Unable to locate locales directory.');
  }

  return root;
}

const dictionaryCache = new Map<Locale, Promise<Dictionary>>();

export function getDictionary(locale: Locale): Promise<Dictionary> {
  const safeLocale = isLocale(locale) ? locale : DEFAULT_LOCALE;

  if (!dictionaryCache.has(safeLocale)) {
    dictionaryCache.set(safeLocale, (async () => {
      const root = findLocalesRoot();
      const file = join(root, safeLocale, 'common.json');
      const fallback = join(root, DEFAULT_LOCALE, 'common.json');
      const raw = await readFile(existsSync(file) ? file : fallback, 'utf8');
      return JSON.parse(raw) as Dictionary;
    })());
  }

  return dictionaryCache.get(safeLocale)!;
}

export async function getAllDictionaries() {
  const entries = await Promise.all(
    LOCALES.map(async (locale) => [locale, await getDictionary(locale)] as const),
  );
  return Object.fromEntries(entries) as Record<Locale, Dictionary>;
}
