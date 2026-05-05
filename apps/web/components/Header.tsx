import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { getServerTestUser } from '@/lib/test-auth-server';
import { HeaderUserMenu } from './HeaderUserMenu';
import { MobileHeaderMenu } from './MobileHeaderMenu';
import { SeaStarLogo } from './SeaStarLogo';

const linkClass =
  'rounded-full border border-accent-dim bg-black/50 px-4 py-1.5 text-xs tracking-widest text-accent backdrop-blur transition-colors hover:border-accent';

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const testUser = user ? null : await getServerTestUser();

  let isAdmin = false;
  let displayName: string | null = testUser?.displayName ?? null;
  if (user) {
    const [adminCheck, profile] = await Promise.all([
      supabase.from('admins').select('user_id').eq('user_id', user.id).maybeSingle(),
      supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
    ]);
    isAdmin = !!adminCheck.data;
    displayName = profile.data?.display_name ?? user.email ?? null;
  }

  const publicLinks = (
    <>
      <Link href="/daily" className={linkClass}>每日儀式</Link>
      <Link href="/mobile" className={linkClass}>手機版</Link>
      <Link href="/ar" className={linkClass}>AR 體驗</Link>
      <Link href="/teachers" className={linkClass}>老師媒合</Link>
    </>
  );

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] flex items-start justify-between gap-2 px-4 py-3">
      <Link
        href="/"
        className="header-brand-link"
      >
        <SeaStarLogo />
      </Link>

      <nav className="ml-auto hidden gap-2 md:flex">
        {publicLinks}
        {user || testUser ? (
          <HeaderUserMenu displayName={displayName} isAdmin={isAdmin} />
        ) : (
          <>
            <Link href="/account/login" className={linkClass}>登入</Link>
            <Link href="/teachers/apply" className={linkClass}>老師申請</Link>
          </>
        )}
      </nav>

      <MobileHeaderMenu isSignedIn={Boolean(user || testUser)} displayName={displayName} isAdmin={isAdmin} />
    </header>
  );
}
