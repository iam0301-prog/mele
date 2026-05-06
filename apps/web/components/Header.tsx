import { headers } from 'next/headers';
import Link from 'next/link';
import { DEFAULT_LOCALE, LOCALE_HEADER, getDictionary, isLocale } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/server';
import { getServerTestUser } from '@/lib/test-auth-server';
import { MobileHeaderMenu } from './MobileHeaderMenu';
import { SeaStarLogo } from './SeaStarLogo';

export async function Header() {
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get(LOCALE_HEADER);
  const locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
  const dict = await getDictionary(locale);
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

  const primaryLinks = [
    { href: '/tools', label: dict.nav.tools },
    { href: '/daily', label: dict.nav.daily },
    { href: '/mobile', label: dict.nav.mobile },
    { href: '/ar', label: dict.nav.ar },
    { href: '/teachers', label: dict.nav.teachers },
  ];
  const guestLinks = [
    { href: '/account/login', label: dict.nav.login },
    { href: '/teachers/apply', label: dict.nav.teacherApply },
  ];

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] flex items-start justify-between gap-2 px-4 py-3">
      <Link href={`/${locale}`} className="header-brand-link">
        <SeaStarLogo />
      </Link>

      <MobileHeaderMenu
        isSignedIn={Boolean(user || testUser)}
        displayName={displayName}
        isAdmin={isAdmin}
        locale={locale}
        labels={{
          menu: dict.nav.menu,
          mobileMenu: dict.nav.mobileMenu,
          language: dict.language.label,
          myBookings: dict.nav.myBookings,
          charts: dict.nav.charts,
          profile: dict.nav.profile,
          dataRights: dict.nav.dataRights,
          admin: dict.nav.admin,
          signOut: dict.nav.signOut,
          primaryLinks: [
            ...primaryLinks,
            { href: '/legal/disclaimer', label: dict.footer.disclaimer },
          ],
          guestLinks,
        }}
      />
    </header>
  );
}
