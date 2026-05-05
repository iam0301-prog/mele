import Link from 'next/link';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_HEADER, getDictionary, isLocale, localizePath } from '@/lib/i18n';
import { createClient } from '@/lib/supabase/server';
import { getServerTestUser } from '@/lib/test-auth-server';
import { HeaderUserMenu } from './HeaderUserMenu';
import { LanguageSwitcher } from './LanguageSwitcher';
import { MobileHeaderMenu } from './MobileHeaderMenu';
import { SeaStarLogo } from './SeaStarLogo';

const linkClass =
  'rounded-full border border-accent-dim bg-black/50 px-4 py-1.5 text-xs tracking-widest text-accent backdrop-blur transition-colors hover:border-accent';

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

  const publicLinks = (
    <>
      {primaryLinks.map((item) => (
        <Link key={item.href} href={localizePath(item.href, locale)} className={linkClass}>
          {item.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="fixed left-0 right-0 top-0 z-[100] flex items-start justify-between gap-2 px-4 py-3">
      <Link
        href={`/${locale}`}
        className="header-brand-link"
      >
        <SeaStarLogo />
      </Link>

      <nav className="ml-auto hidden gap-2 md:flex">
        {publicLinks}
        <LanguageSwitcher label={dict.language.label} />
        {user || testUser ? (
          <HeaderUserMenu
            displayName={displayName}
            isAdmin={isAdmin}
            locale={locale}
            labels={{
              myBookings: dict.nav.myBookings,
              charts: dict.nav.charts,
              profile: dict.nav.profile,
              dataRights: dict.nav.dataRights,
              admin: dict.nav.admin,
              signOut: dict.nav.signOut,
            }}
          />
        ) : (
          <>
            {guestLinks.map((item) => (
              <Link key={item.href} href={localizePath(item.href, locale)} className={linkClass}>
                {item.label}
              </Link>
            ))}
          </>
        )}
      </nav>

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
