import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type StatTone = 'gold' | 'green' | 'blue' | 'red';

type CountResult = {
  count: number | null;
  error?: { message?: string } | null;
};

type StatCard = {
  label: string;
  value: number;
  detail: string;
  href: string;
  tone: StatTone;
};

async function safeCount(query: PromiseLike<CountResult>): Promise<CountResult> {
  try {
    return await query;
  } catch (error) {
    return { count: 0, error: { message: error instanceof Error ? error.message : 'Unknown error' } };
  }
}

function countOf(result: CountResult) {
  return result.count ?? 0;
}

export default async function AdminDashboard() {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date().toISOString();

  const [
    pendingApplications,
    reviewingApplications,
    activeTeachers,
    pausedTeachers,
    upcomingBookings,
    paidBookings,
    completedBookings,
    hiddenReviews,
    dailyReadings,
    dailyDraws,
  ] = await Promise.all([
    safeCount(supabase.from('teacher_applications').select('id', { count: 'exact', head: true }).eq('status', 'pending')),
    safeCount(supabase.from('teacher_applications').select('id', { count: 'exact', head: true }).in('status', ['reviewing', 'revision', 'interview', 'contracted'])),
    safeCount(supabase.from('teachers').select('id', { count: 'exact', head: true }).eq('status', 'active')),
    safeCount(supabase.from('teachers').select('id', { count: 'exact', head: true }).in('status', ['paused', 'suspended'])),
    safeCount(supabase.from('bookings').select('id', { count: 'exact', head: true }).gte('scheduled_at', now)),
    safeCount(supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'paid')),
    safeCount(supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'completed')),
    safeCount(supabase.from('reviews').select('id', { count: 'exact', head: true }).eq('is_visible', false)),
    safeCount(supabase.from('daily_readings').select('id', { count: 'exact', head: true }).eq('reading_date', today)),
    safeCount(supabase.from('daily_draws').select('id', { count: 'exact', head: true }).eq('draw_date', today)),
  ]);

  const hasDataError = [
    pendingApplications,
    reviewingApplications,
    activeTeachers,
    pausedTeachers,
    upcomingBookings,
    paidBookings,
    completedBookings,
    hiddenReviews,
    dailyReadings,
    dailyDraws,
  ].some((item) => item.error);

  const stats: StatCard[] = [
    {
      label: '待審老師',
      value: countOf(pendingApplications),
      detail: `${countOf(reviewingApplications)} 位正在審核、補件或面談`,
      href: '/admin/applications',
      tone: 'gold',
    },
    {
      label: '上架老師',
      value: countOf(activeTeachers),
      detail: `${countOf(pausedTeachers)} 位暫停或停權`,
      href: '/admin/teachers',
      tone: 'green',
    },
    {
      label: '未來預約',
      value: countOf(upcomingBookings),
      detail: `${countOf(paidBookings)} 筆已付款等待服務`,
      href: '/admin/bookings',
      tone: 'blue',
    },
    {
      label: '完成諮詢',
      value: countOf(completedBookings),
      detail: `${countOf(hiddenReviews)} 則評價目前未公開`,
      href: '/admin/reviews',
      tone: 'green',
    },
    {
      label: '今日解盤',
      value: countOf(dailyReadings),
      detail: '每日儀式與 LINE Daily Push 的回訪核心',
      href: '/daily',
      tone: 'gold',
    },
    {
      label: '今日抽卡/抽石',
      value: countOf(dailyDraws),
      detail: '觀察 Tarot、Rune 每日互動量',
      href: '/daily',
      tone: 'blue',
    },
  ];

  const launchItems = [
    { label: 'Supabase migrations', status: '正式 project 需完成 0001-0005，並確認 RLS 權限', href: '/admin/launch' },
    { label: 'ECPay sandbox', status: '需完整測通建立訂單、付款、webhook、回跳結果頁', href: '/admin/launch' },
    { label: 'LINE LIFF / Push', status: '需填入 LIFF ID、Channel Access Token 並用真機測登入', href: '/admin/launch' },
    { label: 'Mobile AR assets', status: 'Android GLB 可用；iPhone 需真機確認 fallback 與 USDZ 策略', href: '/admin/launch' },
  ];

  return (
    <div className="space-y-6">
      {hasDataError && (
        <section className="launch-alert launch-alert--warning">
          <strong>管理端資料尚未完全連線</strong>
          <p>部分統計無法讀取，通常代表 Supabase migrations、RLS 或環境變數尚未在正式 project 完成。請先到上線檢查頁逐項確認。</p>
        </section>
      )}

      <section className="mele-card">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mele-section-title">營運總覽</div>
            <div className="mele-section-subtitle">ADMIN OVERVIEW</div>
            <p className="max-w-2xl text-sm leading-loose text-white/68">
              這裡集中追蹤發布前最重要的營運狀態：老師審核、預約金流、每日互動、評價公開與上線檢查。正式公開前，P0 項目必須全數完成。
            </p>
          </div>
          <Link href="/admin/launch" className="mele-btn-primary">
            查看上線檢查
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className={`admin-stat-card admin-stat-card--${stat.tone}`}>
            <span>{stat.label}</span>
            <strong>{stat.value.toLocaleString('zh-TW')}</strong>
            <p>{stat.detail}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="mele-card">
          <div className="mele-section-title">公開發布檢查</div>
          <div className="mele-section-subtitle">PUBLIC BETA READINESS</div>
          <div className="space-y-3">
            {launchItems.map((item) => (
              <Link key={item.label} href={item.href} className="admin-action-row">
                <div>
                  <strong>{item.label}</strong>
                  <p>{item.status}</p>
                </div>
                <span>檢查</span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="mele-card">
          <div className="mele-section-title">接下來 72 小時</div>
          <div className="mele-section-subtitle">NEXT 72 HOURS</div>
          <ol className="admin-next-steps">
            <li>把 5 個 SQL migration 跑到正式 Supabase project。</li>
            <li>用綠界 sandbox 完成一次真實付款閉環。</li>
            <li>邀請 5-10 位測試者用手機跑每日抽卡、預約、付款與 AR。</li>
            <li>修正測試回報中所有「看不懂、點不到、卡住」的體驗問題。</li>
          </ol>
        </aside>
      </section>
    </div>
  );
}
