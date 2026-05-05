'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import {
  LOCALE_LABELS,
  LOCALES,
  getLocaleFromPathname,
  switchLocaleInPathname,
  type Locale,
} from '@/lib/i18n/config';

const inlineLinkClass =
  'rounded-full border border-accent-dim bg-black/45 px-3 py-1.5 text-[11px] tracking-widest text-accent backdrop-blur transition hover:border-accent';

const panelLinkClass =
  'rounded-md border border-accent-dim bg-white/[0.05] px-3 py-2 text-center text-xs tracking-widest text-accent transition hover:border-accent';

export function LanguageSwitcher({
  label = '切換語言',
  variant = 'inline',
  onNavigate,
}: {
  label?: string;
  variant?: 'inline' | 'panel';
  onNavigate?: () => void;
}) {
  const pathname = usePathname() || '/';
  const searchParams = useSearchParams();
  const query = searchParams?.toString();
  const pathWithQuery = query ? `${pathname}?${query}` : pathname;
  const activeLocale = getLocaleFromPathname(pathname);
  const linkClass = variant === 'panel' ? panelLinkClass : inlineLinkClass;

  return (
    <div
      className={variant === 'panel' ? 'grid gap-2' : 'flex items-center gap-1'}
      aria-label={label}
    >
      {variant === 'panel' && (
        <div className="text-center text-[10px] uppercase tracking-[0.28em] text-white/45">
          {label}
        </div>
      )}
      {LOCALES.map((locale: Locale) => {
        const isActive = locale === activeLocale;
        return (
          <Link
            key={locale}
            href={switchLocaleInPathname(pathWithQuery, locale)}
            hrefLang={locale}
            aria-current={isActive ? 'page' : undefined}
            className={`${linkClass} ${isActive ? 'border-accent bg-accent/[0.14] text-accent-light' : ''}`}
            onClick={onNavigate}
          >
            <span className={variant === 'panel' ? '' : 'sr-only'}>
              {LOCALE_LABELS[locale].nativeName}
            </span>
            {variant === 'panel' ? (
              <span>{LOCALE_LABELS[locale].nativeName}</span>
            ) : (
              <span aria-hidden="true">{LOCALE_LABELS[locale].shortName}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
