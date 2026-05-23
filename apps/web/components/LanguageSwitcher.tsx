'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import {
  LOCALE_LABELS,
  LOCALES,
  getLocaleFromPathname,
  isLocalizedPath,
  switchLocaleInPathname,
  type Locale,
} from '@/lib/i18n/config';
import { useProvidedLocale } from '@/lib/i18n/LocaleProvider';

const inlineLinkClass =
  'rounded-full border border-accent-dim bg-black/45 px-3 py-1.5 text-[11px] tracking-widest text-accent backdrop-blur transition hover:border-accent';

const panelLinkClass =
  'flex min-h-12 flex-col items-center justify-center rounded-md border border-accent-dim bg-white/[0.05] px-2 py-2 text-center text-[11px] tracking-[0.16em] text-accent transition hover:border-accent';

const ENGLISH_LOCALE_NAMES: Record<Locale, string> = {
  'zh-TW': 'Traditional Chinese',
  en: 'English',
  vi: 'Vietnamese',
  id: 'Indonesian',
  ja: 'Japanese',
  ko: 'Korean',
};

export function LanguageSwitcher({
  label = 'Language',
  variant = 'inline',
  onNavigate,
}: {
  label?: string;
  variant?: 'inline' | 'panel';
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || '/';
  const providedLocale = useProvidedLocale();
  const searchParams = useSearchParams();
  const query = searchParams?.toString();
  const pathWithQuery = query ? `${pathname}?${query}` : pathname;
  const activeLocale = isLocalizedPath(pathname) ? getLocaleFromPathname(pathname) : providedLocale;
  const linkClass = variant === 'panel' ? panelLinkClass : inlineLinkClass;

  return (
    <div
      className={variant === 'panel' ? 'mt-1 grid grid-cols-2 gap-2 border-t border-accent-dim/60 pt-3' : 'flex items-center gap-1'}
      aria-label={label}
    >
      {variant === 'panel' && (
        <div className="col-span-2 text-center text-[10px] uppercase tracking-[0.28em] text-white/45">
          {label}
        </div>
      )}
      {LOCALES.map((locale: Locale) => {
        const isActive = locale === activeLocale;
        return (
          <a
            key={locale}
            href={switchLocaleInPathname(pathWithQuery, locale)}
            hrefLang={locale}
            aria-current={isActive ? 'page' : undefined}
            className={`${linkClass} ${isActive ? 'border-accent bg-accent/[0.14] text-accent-light' : ''}`}
            onClick={onNavigate}
          >
            {variant === 'panel' ? (
              <span className="font-bold">{ENGLISH_LOCALE_NAMES[locale]}</span>
            ) : (
              <>
                <span className="sr-only">{LOCALE_LABELS[locale].nativeName}</span>
                <span aria-hidden="true">{LOCALE_LABELS[locale].shortName}</span>
              </>
            )}
          </a>
        );
      })}
    </div>
  );
}
