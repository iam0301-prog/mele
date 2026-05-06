import { redirect } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { PATH_HEADER, isLocalizedPath, stripLocaleFromPathname } from '@/lib/i18n/config';
import { createClient } from '@/lib/supabase/server';

const TABS = [
  { href: '/admin/testers', label: '封測名單' },
  { href: '/admin/members', label: '會員管理' },
  { href: '/admin', label: '統計', exact: true },
  { href: '/admin/applications', label: '申請審核' },
  { href: '/admin/teachers', label: '老師管理' },
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
  if (!admin) redirect('/?error=not_admin');

  return (
    <div className="container mx-auto max-w-6xl px-5 py-8">
      <header className="text-center pb-6">
        <div className="text-accent tracking-[0.5em] text-sm mb-3 opacity-70">◆ ◆ ◆</div>
        <h1 className="font-serif text-3xl tracking-widest mb-1">後台管理</h1>
        <div className="mele-subtitle">ADMIN PANEL</div>
        <div className="text-xs text-white/50 mt-2">{admin.role}</div>
      </header>

      <nav className="flex gap-1 border-b border-accent-dim mb-6 overflow-x-auto no-scrollbar">
        {TABS.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className="px-5 py-3 text-sm tracking-widest text-white/60 hover:text-white border-b-2 border-transparent hover:border-accent-dim transition-colors whitespace-nowrap"
          >
            {t.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
