'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DEFAULT_LOCALE, localizePath, type Locale } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/client';
import { clearClientTestAuth } from '@/lib/test-auth';

const linkClass =
  'rounded-full border border-accent-dim bg-black/50 px-4 py-1.5 text-xs tracking-widest text-accent backdrop-blur transition-colors hover:border-accent';

export function HeaderUserMenu({
  displayName,
  isAdmin,
  locale = DEFAULT_LOCALE,
  variant = 'inline',
  labels,
  onNavigate,
}: {
  displayName: string | null;
  isAdmin: boolean;
  locale?: Locale;
  variant?: 'inline' | 'panel';
  labels?: {
    myBookings?: string;
    charts?: string;
    profile?: string;
    dataRights?: string;
    admin?: string;
    signOut?: string;
  };
  onNavigate?: () => void;
}) {
  const router = useRouter();

  const signOut = async () => {
    onNavigate?.();
    clearClientTestAuth();
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const wrapClass = variant === 'panel' ? 'grid gap-2' : 'flex items-center gap-2';
  const userClass = variant === 'panel'
    ? 'text-xs tracking-widest text-white/60'
    : 'hidden text-xs tracking-widest text-white/60 lg:inline';
  const itemClass = variant === 'panel' ? `${linkClass} justify-center text-center` : linkClass;

  return (
    <div className={wrapClass}>
      <span className={userClass}>{displayName?.slice(0, 12)}</span>
      <Link href={localizePath('/account/mybookings', locale)} className={itemClass} onClick={onNavigate}>{labels?.myBookings ?? '我的諮詢'}</Link>
      <Link href={localizePath('/account/charts', locale)} className={itemClass} onClick={onNavigate}>{labels?.charts ?? '我的命盤'}</Link>
      <Link href={localizePath('/account/profile', locale)} className={itemClass} onClick={onNavigate}>{labels?.profile ?? '個人資料'}</Link>
      <Link href={localizePath('/account/privacy', locale)} className={itemClass} onClick={onNavigate}>{labels?.dataRights ?? '資料權利'}</Link>
      {isAdmin && <Link href={localizePath('/admin', locale)} className={`${itemClass} text-accent-light`} onClick={onNavigate}>{labels?.admin ?? '後台'}</Link>}
      <button type="button" onClick={signOut} className={`${itemClass} cursor-pointer`}>{labels?.signOut ?? '登出'}</button>
    </div>
  );
}
