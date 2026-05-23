import { redirect } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { PATH_HEADER, isLocalizedPath, stripLocaleFromPathname } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';

const TABS = [
  { href: '/admin', label: '統計', exact: true },
  { href: '/admin/applications', label: '申請審核' },
  { href: '/admin/teachers', label: '老師資料調整' },
  { href: '/teacher-portal', label: '老師後台' },
  { href: '/admin/members', label: '會員管理' },
  { href: '/admin/testers', label: '封測名單' },
  { href: '/admin/bookings', label: '預約監看' },
  { href: '/admin/reviews', label: '評價管理' },
  { href: '/admin/launch', label: '上線檢查' },
];

async function getAdminReturnPath() {
  const headerStore = await headers();
  const pathname = headerStore.get(PATH_HEADER) || '/admin';
  const normalizedPath = isLocalizedPath(pathname) ? stripLocaleFromPathname(pathname) : pathname;
  return normalizedPath.startsWith('/admin') ? normalizedPath : '/admin';
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const returnPath = await getAdminReturnPath();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/account/login?return=${encodeURIComponent(returnPath)}`);
  const { data: admin } = await supabase.from('admins').select('role').eq('user_id', user.id).maybeSingle();
  if (!admin) redirect(`/account/login?return=${encodeURIComponent(returnPath)}&error=not_admin&force_signout=1`);

  return (
    <div className="container mx-auto max-w-6xl px-5 py-8">
      <header className="text-center pb-6">
        <div className="text-accent tracking-[0.5em] text-sm mb-3 opacity-70">◆ ◆ ◆</div>
        <h1 className="font-serif text-3xl tracking-widest mb-1">後台管理</h1>
        <div className="mele-subtitle">ADMIN PANEL</div>
        <div className="text-xs text-white/50 mt-2">{admin.role}</div>
      </header>

      <nav className="flex gap-1 border-b border-accent-dim mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((t) => {
          const active = t.exact ? returnPath === t.href : returnPath.startsWith(t.href);
          return (
            <Link
              key={t.href}
              href={t.href}
              aria-current={active ? 'page' : undefined}
              className={`px-5 py-3 text-sm tracking-widest border-b-2 transition-colors whitespace-nowrap ${
                active
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-transparent text-white/60 hover:text-white hover:border-accent-dim'
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
