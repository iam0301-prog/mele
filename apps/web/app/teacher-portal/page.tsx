import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { buildTeacherReadingBrief, type TeacherReadingBrief } from '@/lib/member-unlocks';
import { getServerTestUser } from '@/lib/test-auth-server';
import type { Teacher } from '@/types/db';

const STATUS_LABEL: Record<string, string> = {
  pending_payment: '待付款',
  paid: '已付款',
  confirmed: '已確認',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
};

type TeacherBriefCard = {
  id: string;
  scheduledAt: string | null;
  status: string;
  brief: TeacherReadingBrief;
};

type BookingRow = {
  id: string;
  customer_id: string;
  status: string;
  amount_ntd: number;
  scheduled_at: string;
  customer_question: string | null;
  chart_tool: string | null;
  chart_data: Record<string, unknown> | null;
};

function TeacherMemberBriefPanel({
  cards,
  demoMode = false,
}: {
  cards: TeacherBriefCard[];
  demoMode?: boolean;
}) {
  return (
    <section className="teacher-member-brief" aria-label="會員詳解備忘">
      <div className="teacher-member-brief__header">
        <span>MEMBER CONTEXT</span>
        <h2>會員詳解備忘</h2>
        <p>
          會員前台先看簡易解釋；深入解釋、流日、流月、流年會以點數或付費解鎖。老師端在諮詢前可先看會員提問與盤面脈絡，使解讀有本可循。
        </p>
      </div>
      {cards.length === 0 && (
        <div className="teacher-member-brief__empty">
          尚未有可讀取的會員盤面。待會員預約並附上提問或排盤資料後，這裡會整理成老師用備忘卡。
        </div>
      )}
      {cards.length > 0 && (
        <div className="teacher-member-brief__grid">
          {cards.map((card) => (
            <article key={card.id} className="teacher-member-brief__item">
              <div className="teacher-member-brief__meta">
                <span>{STATUS_LABEL[card.status] ?? card.status}</span>
                {card.scheduledAt && <time>{new Date(card.scheduledAt).toLocaleString('zh-TW')}</time>}
              </div>
              <h3>{card.brief.title}</h3>
              <p>{card.brief.summary}</p>
              <dl>
                {card.brief.items.map((item) => (
                  <div key={`${card.id}-${item.label}`}>
                    <dt>{item.label}</dt>
                    <dd>{item.body}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      )}
      {demoMode && (
        <p className="teacher-member-brief__note">
          本機測試模式僅示範資料結構；正式會員付點數解鎖後，後台會依預約與排盤紀錄銜接。
        </p>
      )}
    </section>
  );
}

function TeacherPortalReadiness({
  teacher,
  activeServiceCount,
  pendingActionCount,
  isFreeTestMode,
  demoMode = false,
}: {
  teacher: Teacher;
  activeServiceCount: number;
  pendingActionCount: number;
  isFreeTestMode: boolean;
  demoMode?: boolean;
}) {
  const profileReady = Boolean(
    teacher.display_name &&
    teacher.title &&
    teacher.intro_short &&
    (teacher.specialties || []).length > 0,
  );
  const contactReady = Boolean(teacher.line_url || teacher.instagram || teacher.facebook || teacher.website);
  const items = [
    {
      title: '公開頁完整度',
      body: profileReady ? '名稱、頭銜、簡介與專長已具備，客人能快速判斷是否適合。' : '請補齊頭銜、短介紹與專長，公開頁才會像一位可信任的老師。',
      done: profileReady,
    },
    {
      title: '服務項目已設定',
      body: activeServiceCount > 0 ? `目前有 ${activeServiceCount} 個上架服務，可承接預約。` : '請先請平台管理員設定服務名稱、時長與測試期價格。',
      done: activeServiceCount > 0,
    },
    {
      title: '預約處理節奏',
      body: pendingActionCount > 0 ? `有 ${pendingActionCount} 筆諮詢需要留意，請在諮詢前主動確認問題。` : '目前沒有待處理預約，可以先檢查服務介紹與聯絡方式。',
      done: pendingActionCount === 0,
    },
    {
      title: '測試模式提醒',
      body: isFreeTestMode ? '目前為免費測試期，先用真實流程驗證預約與通知，不向客人收費。' : '正式收費模式下，請先確認金流、取消政策與客服回覆節奏。',
      done: isFreeTestMode,
    },
    {
      title: '聯絡資訊',
      body: contactReady ? '已有 LINE 或社群連結，平台能在補件與諮詢前快速聯繫。' : '建議至少補 LINE 或一個公開社群，減少預約前溝通落差。',
      done: contactReady,
    },
  ];
  const completed = items.filter((item) => item.done).length;

  return (
    <section className="teacher-readiness" aria-label="後台準備度">
      <div className="teacher-readiness__header">
        <span>後台準備度</span>
        <h2>{completed} / {items.length} 項已完成</h2>
        <p>這裡把老師後台最容易漏掉的營運事項整理成清單，測試網站時可以一項一項驗。</p>
      </div>
      <div className="teacher-readiness__progress" aria-hidden="true">
        <i style={{ width: `${completed / items.length * 100}%` }} />
      </div>
      <div className="teacher-readiness__grid">
        {items.map((item) => (
          <article key={item.title} className={`teacher-readiness__item${item.done ? ' is-complete' : ''}`}>
            <strong>{item.done ? 'OK' : '待確認'}</strong>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <div className="teacher-readiness__actions">
        <Link href={demoMode ? '/teachers' : `/teachers/${teacher.id}`}>查看公開頁</Link>
        <Link href="/account/mybookings">查看我的諮詢</Link>
      </div>
    </section>
  );
}

const demoTeacher: Teacher = {
  id: 'demo-teacher',
  user_id: '00000000-0000-4000-8000-000000000001',
  status: 'active',
  display_name: '測試老師',
  avatar_url: null,
  title: '塔羅與八字測試顧問',
  intro_short: '用來檢查老師後台、預約與服務呈現的本機測試資料。',
  intro_long: null,
  quote: '先把流程走順，再把正式資料接上。',
  specialties: ['塔羅', '八字', '自我探索'],
  consultation_style: 'structured',
  line_url: 'https://line.me',
  instagram: null,
  facebook: null,
  threads: null,
  youtube: null,
  website: 'https://mele.local',
  rating: 4.9,
  total_reviews: 12,
  cases_count: 36,
  commission_rate: 0.2,
  approved_at: new Date().toISOString(),
  paused_at: null,
  suspended_at: null,
  suspended_reason: null,
  admin_script: null,
  created_at: new Date().toISOString(),
};

export default async function TeacherPortalPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const testUser = user ? null : getServerTestUser();
  if (!user && !testUser) redirect('/account/login?return=/teacher-portal');

  if (testUser) {
    const demoBookings = [
      { id: 'demo-1', status: 'confirmed', amount_ntd: 0, scheduled_at: new Date(Date.now() + 86400000).toISOString() },
      { id: 'demo-2', status: 'completed', amount_ntd: 0, scheduled_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    ];
    const demoServices = [
      { id: 'service-1', name: '測試塔羅諮詢', duration_minutes: 30, price_ntd: 0, is_active: true },
      { id: 'service-2', name: '測試八字初談', duration_minutes: 45, price_ntd: 0, is_active: true },
    ];
    const pendingActionCount = demoBookings.filter((b) => ['paid', 'confirmed'].includes(b.status)).length;
    const demoBriefCards: TeacherBriefCard[] = [
      {
        id: 'demo-brief-1',
        status: 'confirmed',
        scheduledAt: demoBookings[0].scheduled_at,
        brief: buildTeacherReadingBrief({
          customerQuestion: '我想知道今年是否適合轉職，也想理解自己反覆猶豫的原因。',
          chartTool: '塔羅',
          chartData: { mainCard: '審判', focus: '轉職', transit: '流年轉折', concern: '猶豫' },
        }),
      },
    ];

    return (
      <div className="container mx-auto max-w-5xl px-5 py-10">
        <header className="text-center pb-6">
          <div className="text-accent tracking-[0.5em] text-sm mb-3 opacity-70">◆ ◆ ◆</div>
          <h1 className="font-serif text-3xl tracking-widest mb-1">老師後台</h1>
          <div className="mele-subtitle">TEACHER PORTAL</div>
          <p className="mt-3 text-white/70 text-sm">{demoTeacher.display_name} · 本機測試模式</p>
        </header>

        <div className="mb-5 rounded-lg border border-accent-dim bg-accent/[0.08] p-4 text-sm leading-relaxed text-white/72">
          目前使用本機測試帳號，所以這裡顯示示範老師資料。正式老師資料會在 Supabase 登入與 Email 驗證信修好後，依你的帳號讀取。
        </div>

        <TeacherPortalReadiness
          teacher={demoTeacher}
          activeServiceCount={demoServices.filter((service) => service.is_active).length}
          pendingActionCount={pendingActionCount}
          isFreeTestMode
          demoMode
        />

        <TeacherMemberBriefPanel cards={demoBriefCards} demoMode />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">1</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">待諮詢</div>
          </div>
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">1</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">已完成</div>
          </div>
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">4.90</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">平均評分</div>
          </div>
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">{demoServices.length}</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">服務項目</div>
          </div>
        </div>

        <div className="mele-card">
          <div className="mele-section-title">最近預約</div>
          <div className="mele-section-subtitle">RECENT BOOKINGS</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-accent text-xs tracking-widest border-b border-accent-dim">
                  <th className="py-3 px-3 text-left">時間</th>
                  <th className="py-3 px-3 text-left">狀態</th>
                  <th className="py-3 px-3 text-left">金額</th>
                  <th className="py-3 px-3 text-left">提醒</th>
                </tr>
              </thead>
              <tbody>
                {demoBookings.map((b) => (
                  <tr key={b.id} className="border-b border-accent-dim/30">
                    <td className="py-3 px-3 text-xs">{new Date(b.scheduled_at).toLocaleString('zh-TW')}</td>
                    <td className="py-3 px-3 text-xs">{STATUS_LABEL[b.status] ?? b.status}</td>
                    <td className="py-3 px-3">免費測試</td>
                    <td className="py-3 px-3 text-xs text-white/62">
                      {['paid', 'confirmed'].includes(b.status) ? '請確認諮詢前聯繫' : '無需立即處理'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mele-card mt-6">
          <div className="mele-section-title">服務項目（{demoServices.length}）</div>
          <div className="mele-section-subtitle">SERVICES</div>
          {demoServices.map((s) => (
            <div key={s.id} className="flex justify-between items-center border-b border-accent-dim/30 py-3">
              <div>
                <div className="text-sm">{s.name}</div>
                <div className="text-xs text-white/60">{s.duration_minutes} 分 · 免費測試</div>
              </div>
              <span className="px-2 py-0.5 rounded text-xs bg-success/30 text-success">上架中</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) redirect('/account/login?return=/teacher-portal');

  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!teacher) {
    return (
      <div className="container mx-auto max-w-2xl px-5 py-16 text-center">
        <div className="mele-card">
          <div className="font-serif text-2xl text-accent mb-3">您還不是上架老師</div>
          <p className="text-white/70 mb-5">想成為命理老師？歡迎送出申請。</p>
          <Link href="/teachers/apply" className="mele-btn-primary inline-block">送出申請</Link>
        </div>
      </div>
    );
  }

  const t = teacher as Teacher;

  // 取得統計
  const [bookings, services, reviews] = await Promise.all([
    supabase.from('bookings').select('id, customer_id, status, amount_ntd, scheduled_at, customer_question, chart_tool, chart_data')
      .eq('teacher_id', t.id)
      .order('scheduled_at', { ascending: false })
      .limit(10),
    supabase.from('teacher_services').select('*').eq('teacher_id', t.id).order('display_order'),
    supabase.from('reviews').select('rating').eq('teacher_id', t.id).eq('is_visible', true),
  ]);

  const bookingRows = (bookings.data || []) as BookingRow[];
  const customerIds = Array.from(new Set(bookingRows.map((booking) => booking.customer_id).filter(Boolean)));
  const chartRecords = customerIds.length
    ? await supabase
      .from('chart_records')
      .select('id, user_id, tool, output_data, created_at')
      .in('user_id', customerIds)
      .order('created_at', { ascending: false })
      .limit(30)
    : { data: [] };
  const chartByUser = new Map<string, Record<string, unknown>>();
  for (const record of (chartRecords.data || []) as Array<Record<string, unknown>>) {
    const userId = typeof record.user_id === 'string' ? record.user_id : '';
    if (userId && !chartByUser.has(userId)) chartByUser.set(userId, record);
  }
  const teacherBriefCards: TeacherBriefCard[] = bookingRows.slice(0, 3).map((booking) => ({
    id: booking.id,
    status: booking.status,
    scheduledAt: booking.scheduled_at,
    brief: buildTeacherReadingBrief({
      customerQuestion: booking.customer_question,
      chartTool: booking.chart_tool,
      chartData: booking.chart_data,
      chartRecord: chartByUser.get(booking.customer_id),
    }),
  }));

  const upcomingCount = bookingRows.filter(
    (b) => ['paid', 'confirmed'].includes(b.status) && new Date(b.scheduled_at) > new Date(),
  ).length;
  const completedCount = bookingRows.filter((b) => b.status === 'completed').length;
  const pendingActionCount = bookingRows.filter((b) => ['paid', 'confirmed'].includes(b.status)).length;
  const activeServiceCount = (services.data || []).filter((service) => service.is_active).length;
  const isFreeTestMode = process.env.NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE === 'true';
  const avgRating = reviews.data?.length
    ? (reviews.data.reduce((s, r) => s + r.rating, 0) / reviews.data.length).toFixed(2)
    : '—';

  return (
    <div className="container mx-auto max-w-5xl px-5 py-10">
      <header className="text-center pb-6">
        <div className="text-accent tracking-[0.5em] text-sm mb-3 opacity-70">◆ ◆ ◆</div>
        <h1 className="font-serif text-3xl tracking-widest mb-1">老師後台</h1>
        <div className="mele-subtitle">TEACHER PORTAL</div>
        <p className="mt-3 text-white/70 text-sm">{t.display_name} · {t.title ?? ''}</p>
      </header>

      <TeacherPortalReadiness
        teacher={t}
        activeServiceCount={activeServiceCount}
        pendingActionCount={pendingActionCount}
        isFreeTestMode={isFreeTestMode}
      />

      <TeacherMemberBriefPanel cards={teacherBriefCards} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{upcomingCount}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">待諮詢</div>
        </div>
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{completedCount}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">已完成</div>
        </div>
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{avgRating}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">平均評分</div>
        </div>
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{services.data?.length ?? 0}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">服務項目</div>
        </div>
      </div>

      <div className="mele-card">
        <div className="mele-section-title">最近預約</div>
        <div className="mele-section-subtitle">RECENT BOOKINGS</div>
        <div className="mb-4 rounded-lg border border-accent-dim bg-white/[0.035] p-4 text-sm text-white/72">
          目前有 <span className="text-accent">{pendingActionCount}</span> 筆需要留意的諮詢。請確認已付款與已確認的預約時間，並在諮詢前透過 LINE 或站內訊息與客人確認問題。
        </div>
        {bookingRows.length === 0 && (
          <div className="text-center py-8 text-white/60">還沒有預約</div>
        )}
        {bookingRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-accent text-xs tracking-widest border-b border-accent-dim">
                  <th className="py-3 px-3 text-left">時間</th>
                  <th className="py-3 px-3 text-left">狀態</th>
                  <th className="py-3 px-3 text-left">金額</th>
                  <th className="py-3 px-3 text-left">提醒</th>
                </tr>
              </thead>
              <tbody>
                {bookingRows.map((b) => (
                  <tr key={b.id} className="border-b border-accent-dim/30">
                    <td className="py-3 px-3 text-xs">{new Date(b.scheduled_at).toLocaleString('zh-TW')}</td>
                    <td className="py-3 px-3 text-xs">{STATUS_LABEL[b.status] ?? b.status}</td>
                    <td className="py-3 px-3">NT$ {b.amount_ntd.toLocaleString()}</td>
                    <td className="py-3 px-3 text-xs text-white/62">
                      {['paid', 'confirmed'].includes(b.status) ? '請確認諮詢前聯繫' : '無需立即處理'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mele-card mt-6">
        <div className="mele-section-title">服務項目（{services.data?.length ?? 0}）</div>
        <div className="mele-section-subtitle">SERVICES</div>
        {services.data?.map((s) => (
          <div key={s.id} className="flex justify-between items-center border-b border-accent-dim/30 py-3">
            <div>
              <div className="text-sm">{s.name}</div>
              <div className="text-xs text-white/60">{s.duration_minutes} 分 · NT$ {s.price_ntd.toLocaleString()}</div>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs ${s.is_active ? 'bg-success/30 text-success' : 'bg-white/10 text-white/60'}`}>
              {s.is_active ? '上架中' : '已下架'}
            </span>
          </div>
        ))}
        <p className="text-xs text-white/50 mt-4">
          服務新增、價格調整與時段管理會進入下一階段後台功能；目前可先由平台管理員協助設定，避免老師端操作不完整造成錯單。
        </p>
      </div>
    </div>
  );
}
