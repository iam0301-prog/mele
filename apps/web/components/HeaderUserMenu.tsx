'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { clearClientTestAuth } from '@/lib/test-auth';

const linkClass =
  'rounded-full border border-accent-dim bg-black/50 px-4 py-1.5 text-xs tracking-widest text-accent backdrop-blur transition-colors hover:border-accent';

export function HeaderUserMenu({
  displayName,
  isAdmin,
  variant = 'inline',
  onNavigate,
}: {
  displayName: string | null;
  isAdmin: boolean;
  variant?: 'inline' | 'panel';
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
      <Link href="/account/mybookings" className={itemClass} onClick={onNavigate}>我的諮詢</Link>
      <Link href="/account/charts" className={itemClass} onClick={onNavigate}>我的命盤</Link>
      <Link href="/account/profile" className={itemClass} onClick={onNavigate}>個人資料</Link>
      <Link href="/account/privacy" className={itemClass} onClick={onNavigate}>資料權利</Link>
      {isAdmin && <Link href="/admin" className={`${itemClass} text-accent-light`} onClick={onNavigate}>後台</Link>}
      <button type="button" onClick={signOut} className={`${itemClass} cursor-pointer`}>登出</button>
    </div>
  );
}
