'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { DailyPointsClaim } from '@/components/DailyPointsClaim';
import { readClientTestUser } from '@/lib/test-auth';

interface NextBooking {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  teachers: { display_name: string } | null;
  teacher_services: { name: string } | null;
}

interface RecentReading {
  id: string;
  tool: string;
  created_at: string;
}

const TOOL_LABEL: Record<string, string> = {
  numerology: '生命靈數',
  maya: '馬雅曆',
  bazi: '八字',
  ziwei: '紫微斗數',
  tarot: '塔羅',
  runes: '盧恩',
  astro: '占星',
  humandesign: '人類圖',
};

const STATUS_LABEL: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  confirmed: '已確認',
  in_progress: '進行中',
};

function formatRelativeDate(value: string): string {
  const target = new Date(value).getTime();
  const now = Date.now();
  const diffMs = target - now;
  const diffDays = Math.round(diffMs / 86400000);
  if (diffDays === 0) return '今天';
  if (diffDays === 1) return '明天';
  if (diffDays === -1) return '昨天';
  if (diffDays > 0 && diffDays < 7) return `${diffDays} 天後`;
  if (diffDays < 0 && diffDays > -7) return `${Math.abs(diffDays)} 天前`;
  return new Date(value).toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Member dashboard — single landing page after login.
 * Pulls greeting, points, next booking, recent readings into one view.
 * Drives engagement loop: claim points → reading → unlock → booking.
 */
export default function AccountIndexPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [nextBooking, setNextBooking] = useState<NextBooking | null>(null);
  const [recentReadings, setRecentReadings] = useState<RecentReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [testMode, setTestMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const testUser = readClientTestUser();
        if (testUser) {
          if (!cancelled) {
            setTestMode(true);
            setDisplayName(testUser.displayName);
            setLoading(false);
          }
          return;
        }
        router.push('/account/login?return=/account');
        return;
      }

      const [profileResult, bookingResult, readingsResult] = await Promise.all([
        supabase.from('profiles').select('display_name').eq('id', user.id).maybeSingle(),
        supabase
          .from('bookings')
          .select('id, scheduled_at, duration_minutes, status, teachers(display_name), teacher_services(name)')
          .eq('customer_id', user.id)
          .in('status', ['pending', 'paid', 'confirmed', 'in_progress'])
          .gte('scheduled_at', new Date().toISOString())
          .order('scheduled_at', { ascending: true })
          .limit(1),
        supabase
          .from('chart_records')
          .select('id, tool, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3),
      ]);

      if (cancelled) return;
      setDisplayName(
        (profileResult.data?.display_name as string | undefined) ?? user.email ?? null,
      );
      const bookingRow = (bookingResult.data as unknown as NextBooking[] | null)?.[0] ?? null;
      setNextBooking(bookingRow);
      setRecentReadings((readingsResult.data ?? []) as RecentReading[]);
      setLoading(false);
    }

    load().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="container mx-auto max-w-4xl px-5 py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs tracking-widest text-accent hover:opacity-80 transition-opacity"
      >
        ← 返回首頁
      </Link>

      <header className="pt-6 pb-8">
        <div className="mele-subtitle">MEMBER DASHBOARD</div>
        <h1 className="font-serif text-3xl tracking-widest mt-2">
          {loading ? '正在讀取會員資料…' : `嗨，${displayName ?? '會員'}`}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/68">
          這裡整合你的點數、預約與排盤紀錄。每天回來領點數、抽今日牌，或是回顧過去解讀。
        </p>
        {testMode && (
          <div className="mt-4 rounded-lg border border-accent-dim bg-accent/[0.08] px-4 py-2 text-xs text-white/72">
            本機測試帳號模式 · 資料為示範，未連 Supabase
          </div>
        )}
      </header>

      {/* Daily points — the engagement trigger */}
      <section className="mb-6" aria-label="會員每日點數">
        <DailyPointsClaim returnPath="/account" />
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Next booking */}
        <section className="mele-card" aria-label="即將諮詢">
          <div className="mele-section-subtitle">UPCOMING SESSION</div>
          <h2 className="font-serif text-lg text-accent mt-1 mb-3">即將諮詢</h2>
          {loading ? (
            <div className="text-sm text-white/60">載入中…</div>
          ) : nextBooking ? (
            <div className="space-y-2 text-sm leading-relaxed text-white/82">
              <div className="text-accent">
                <strong>{formatRelativeDate(nextBooking.scheduled_at)}</strong>
                <span className="ml-2 text-xs text-white/60">
                  {new Date(nextBooking.scheduled_at).toLocaleString('zh-TW', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
              <div className="text-white/72">
                老師：{nextBooking.teachers?.display_name ?? '—'}
              </div>
              <div className="text-xs text-white/64">
                {nextBooking.teacher_services?.name ?? ''} · {nextBooking.duration_minutes} 分鐘 ·
                <span
                  className={`ml-2 rounded-md px-2 py-0.5 text-[10px] ${
                    nextBooking.status === 'pending'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-success/20 text-success'
                  }`}
                >
                  {STATUS_LABEL[nextBooking.status] ?? nextBooking.status}
                </span>
              </div>
              <div className="pt-3">
                <Link
                  href={
                    nextBooking.status === 'pending'
                      ? `/account/payment/${nextBooking.id}`
                      : '/account/mybookings'
                  }
                  className="mele-btn-primary !px-4 !py-2 !text-xs inline-flex items-center"
                >
                  {nextBooking.status === 'pending' ? '前往付款' : '查看詳情'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-sm leading-relaxed text-white/68">
              目前沒有即將諮詢的預約。
              <div className="mt-3">
                <Link
                  href="/teachers"
                  className="mele-btn-primary !px-4 !py-2 !text-xs inline-flex items-center"
                >
                  尋找老師 →
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Recent readings */}
        <section className="mele-card" aria-label="最近排盤">
          <div className="mele-section-subtitle">RECENT READINGS</div>
          <h2 className="font-serif text-lg text-accent mt-1 mb-3">最近排盤</h2>
          {loading ? (
            <div className="text-sm text-white/60">載入中…</div>
          ) : recentReadings.length === 0 ? (
            <div className="text-sm leading-relaxed text-white/68">
              還沒有保存的排盤紀錄。
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href="/tools/numerology" className="mele-btn-secondary !px-3 !py-1.5 !text-xs">
                  生命靈數
                </Link>
                <Link href="/tools/tarot" className="mele-btn-secondary !px-3 !py-1.5 !text-xs">
                  抽今日塔羅
                </Link>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-accent-dim/40">
              {recentReadings.map((reading) => (
                <li key={reading.id} className="flex items-center justify-between py-2.5 text-sm">
                  <div>
                    <div className="text-accent">{TOOL_LABEL[reading.tool] ?? reading.tool}</div>
                    <div className="text-xs text-white/56">
                      {new Date(reading.created_at).toLocaleString('zh-TW', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <Link
                    href={`/tools/${reading.tool}`}
                    className="text-xs text-accent hover:underline"
                  >
                    再次查看 →
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 text-right">
            <Link href="/account/charts" className="text-xs text-accent hover:underline">
              看全部 →
            </Link>
          </div>
        </section>
      </div>

      {/* Quick links grid */}
      <section className="mt-8" aria-label="快速入口">
        <div className="mele-section-subtitle mb-3 text-center">QUICK ACTIONS</div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/account/charts"
            className="mele-card !p-4 text-center hover:border-accent transition-colors group"
          >
            <div className="text-accent text-2xl mb-2 group-hover:scale-110 transition-transform">📚</div>
            <div className="font-serif text-sm text-accent">解讀庫</div>
            <div className="text-[11px] text-white/60 mt-1">點數 · 解鎖 · 排盤紀錄</div>
          </Link>
          <Link
            href="/account/mybookings"
            className="mele-card !p-4 text-center hover:border-accent transition-colors group"
          >
            <div className="text-accent text-2xl mb-2 group-hover:scale-110 transition-transform">📅</div>
            <div className="font-serif text-sm text-accent">我的諮詢</div>
            <div className="text-[11px] text-white/60 mt-1">預約 · 付款 · 評價</div>
          </Link>
          <Link
            href="/account/profile"
            className="mele-card !p-4 text-center hover:border-accent transition-colors group"
          >
            <div className="text-accent text-2xl mb-2 group-hover:scale-110 transition-transform">👤</div>
            <div className="font-serif text-sm text-accent">個人資料</div>
            <div className="text-[11px] text-white/60 mt-1">出生資料 · 自動帶入</div>
          </Link>
          <Link
            href="/daily"
            className="mele-card !p-4 text-center hover:border-accent transition-colors group"
          >
            <div className="text-accent text-2xl mb-2 group-hover:scale-110 transition-transform">🌙</div>
            <div className="font-serif text-sm text-accent">每日儀式</div>
            <div className="text-[11px] text-white/60 mt-1">今日塔羅 / 盧恩擇一</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
