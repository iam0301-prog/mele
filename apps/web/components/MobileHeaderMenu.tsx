'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { HeaderUserMenu } from './HeaderUserMenu';

const mobileLinkClass =
  'block rounded-md border border-accent-dim bg-white/[0.05] px-4 py-3 text-center text-xs tracking-widest text-accent transition hover:border-accent';

const primaryLinks = [
  { href: '/daily', label: '每日儀式' },
  { href: '/mobile', label: '手機版' },
  { href: '/ar', label: 'AR 體驗' },
  { href: '/teachers', label: '老師媒合' },
  { href: '/legal/disclaimer', label: '免責聲明' },
];

const guestLinks = [
  { href: '/account/login', label: '登入' },
  { href: '/teachers/apply', label: '老師申請' },
];

export function MobileHeaderMenu({
  isSignedIn,
  displayName,
  isAdmin,
}: {
  isSignedIn: boolean;
  displayName: string | null;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  useEffect(() => {
    close();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative ml-auto md:hidden">
      <button
        type="button"
        className="rounded-full border border-accent-dim bg-black/55 px-4 py-1.5 text-xs tracking-widest text-accent backdrop-blur transition hover:border-accent"
        aria-expanded={open}
        aria-controls="mobile-header-menu"
        onClick={() => setOpen((value) => !value)}
      >
        選單
      </button>

      {open && (
        <div
          id="mobile-header-menu"
          className="absolute right-0 mt-2 w-[min(86vw,280px)] rounded-lg border border-accent-dim bg-primary/95 p-3 shadow-gold-soft backdrop-blur-xl"
        >
          <nav className="grid gap-2" aria-label="手機選單">
            {primaryLinks.map((item) => (
              <Link key={item.href} href={item.href} className={mobileLinkClass} onClick={close}>
                {item.label}
              </Link>
            ))}
            {isSignedIn ? (
              <HeaderUserMenu displayName={displayName} isAdmin={isAdmin} variant="panel" onNavigate={close} />
            ) : (
              guestLinks.map((item) => (
                <Link key={item.href} href={item.href} className={mobileLinkClass} onClick={close}>
                  {item.label}
                </Link>
              ))
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
