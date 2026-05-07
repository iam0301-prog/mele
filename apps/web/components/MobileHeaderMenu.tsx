'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { DEFAULT_LOCALE, localizePath, type Locale } from '@/lib/i18n/config';
import { HeaderUserMenu } from './HeaderUserMenu';
import { LanguageSwitcher } from './LanguageSwitcher';

const mobileLinkClass =
  'block rounded-md border border-accent-dim bg-white/[0.05] px-4 py-3 text-center text-xs tracking-widest text-accent transition hover:border-accent';

export function MobileHeaderMenu({
  isSignedIn,
  displayName,
  isAdmin,
  locale = DEFAULT_LOCALE,
  labels,
}: {
  isSignedIn: boolean;
  displayName: string | null;
  isAdmin: boolean;
  locale?: Locale;
  labels?: {
    menu?: string;
    mobileMenu?: string;
    language?: string;
    myBookings?: string;
    charts?: string;
    profile?: string;
    dataRights?: string;
    admin?: string;
    signOut?: string;
    primaryLinks?: Array<{ href: string; label: string }>;
    guestLinks?: Array<{ href: string; label: string }>;
  };
}) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const close = () => setOpen(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    close();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const primaryLinks = labels?.primaryLinks ?? [
    { href: '/daily', label: '每日儀式' },
    { href: '/mobile', label: '手機版' },
    { href: '/ar', label: 'AR 體驗' },
    { href: '/teachers', label: '諮詢老師' },
    { href: '/legal/disclaimer', label: '免責聲明' },
  ];
  const guestLinks = labels?.guestLinks ?? [
    { href: '/account/login', label: '登入' },
    { href: '/teachers/apply', label: '老師申請' },
  ];

  return (
    <div ref={rootRef} className="relative ml-auto">
      <button
        type="button"
        className={`rounded-full border border-accent-dim bg-black/55 px-4 py-1.5 text-xs tracking-widest text-accent backdrop-blur transition hover:border-accent disabled:cursor-wait disabled:opacity-60 ${hydrated ? '' : 'pointer-events-none'}`}
        aria-expanded={open}
        aria-controls="mobile-header-menu"
        disabled={!hydrated}
        onClick={() => setOpen((value) => !value)}
      >
        {labels?.menu ?? '選單'}
      </button>

      {open && (
        <div
          id="mobile-header-menu"
          className="absolute right-0 mt-2 w-[min(86vw,340px)] rounded-lg border border-accent-dim bg-primary/95 p-3 shadow-gold-soft backdrop-blur-xl"
        >
          <nav className="grid gap-2" aria-label={labels?.mobileMenu ?? 'Menu'}>
            {primaryLinks.map((item) => (
              <a key={item.href} href={localizePath(item.href, locale)} className={mobileLinkClass}>
                {item.label}
              </a>
            ))}
            <LanguageSwitcher label={labels?.language ?? 'Language'} variant="panel" onNavigate={close} />
            {isSignedIn ? (
              <HeaderUserMenu
                displayName={displayName}
                isAdmin={isAdmin}
                locale={locale}
                variant="panel"
                labels={{
                  myBookings: labels?.myBookings,
                  charts: labels?.charts,
                  profile: labels?.profile,
                  dataRights: labels?.dataRights,
                  admin: labels?.admin,
                  signOut: labels?.signOut,
                }}
                onNavigate={close}
              />
            ) : (
              guestLinks.map((item) => (
                <a key={item.href} href={localizePath(item.href, locale)} className={mobileLinkClass}>
                  {item.label}
                </a>
              ))
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
