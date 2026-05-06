import { redirect } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { DEFAULT_LOCALE, LOCALE_HEADER, isLocale, localizePath, type Locale } from '@/lib/i18n';
import {
  getTeacherCopy,
  localizeDemoService,
  localizeDemoTeacher,
  teacherLocaleTag,
  type TeacherCopy,
} from '@/lib/i18n/teacher-copy';
import { createClient } from '@/lib/supabase/server';
import { buildTeacherReadingBrief, type TeacherReadingBrief } from '@/lib/member-unlocks';
import { getServerTestUser } from '@/lib/test-auth-server';
import type { Teacher } from '@/types/db';

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
  copy,
  statusLabels,
  localeTag,
  demoMode = false,
}: {
  cards: TeacherBriefCard[];
  copy: TeacherCopy['portal']['memberBrief'];
  statusLabels: TeacherCopy['statusLabels'];
  localeTag: string;
  demoMode?: boolean;
}) {
  return (
    <section className="teacher-member-brief" aria-label={copy.aria}>
      <div className="teacher-member-brief__header">
        <span>{copy.kicker}</span>
        <h2>{copy.title}</h2>
        <p>
          {copy.body}
        </p>
      </div>
      {cards.length === 0 && (
        <div className="teacher-member-brief__empty">
          {copy.empty}
        </div>
      )}
      {cards.length > 0 && (
        <div className="teacher-member-brief__grid">
          {cards.map((card) => (
            <article key={card.id} className="teacher-member-brief__item">
              <div className="teacher-member-brief__meta">
                <span>{statusLabels[card.status] ?? card.status}</span>
                {card.scheduledAt && <time>{new Date(card.scheduledAt).toLocaleString(localeTag)}</time>}
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
          {copy.demoNote}
        </p>
      )}
    </section>
  );
}

function TeacherReadingAssistPanel({
  cards,
  copy,
}: {
  cards: TeacherBriefCard[];
  copy: TeacherCopy['portal']['assist'];
}) {
  const primary = cards[0];
  const question = primary?.brief.items.find((item) => item.label === '所問')?.body ?? primary?.brief.summary;
  const chart = primary?.brief.items.find((item) => item.label === '所附')?.body;
  const prep = primary?.brief.items.find((item) => item.label === '老師備註')?.body;

  return (
    <section className="teacher-member-brief teacher-reading-assist" aria-label={copy.aria}>
      <div className="teacher-member-brief__header">
        <span>{copy.kicker}</span>
        <h2>{copy.title}</h2>
        <p>{copy.body}</p>
      </div>

      {!primary && <div className="teacher-member-brief__empty">{copy.empty}</div>}

      {primary && (
        <div className="teacher-member-brief__grid">
          <article className="teacher-member-brief__item">
            <div className="teacher-member-brief__meta"><span>{copy.questionTitle}</span></div>
            <h3>{primary.brief.title}</h3>
            <p>{question}</p>
          </article>
          <article className="teacher-member-brief__item">
            <div className="teacher-member-brief__meta"><span>{copy.chartTitle}</span></div>
            <p>{chart}</p>
          </article>
          <article className="teacher-member-brief__item">
            <div className="teacher-member-brief__meta"><span>{copy.prepTitle}</span></div>
            <p>{prep}</p>
          </article>
        </div>
      )}

      <div className="teacher-member-brief__grid">
        {[
          [copy.openingTitle, copy.openingQuestions],
          [copy.boundaryTitle, copy.boundaries],
          [copy.transitTitle, copy.transitPrompts],
        ].map(([title, items]) => (
          <article key={title as string} className="teacher-member-brief__item">
            <h3>{title as string}</h3>
            <ul>
              {(items as string[]).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function TeacherPortalReadiness({
  teacher,
  activeServiceCount,
  pendingActionCount,
  isFreeTestMode,
  copy,
  locale,
  demoMode = false,
}: {
  teacher: Teacher;
  activeServiceCount: number;
  pendingActionCount: number;
  isFreeTestMode: boolean;
  copy: TeacherCopy['portal'];
  locale: Locale;
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
      title: copy.readiness.items.profile[0],
      body: profileReady ? copy.readiness.items.profile[1] : copy.readiness.items.profile[2],
      done: profileReady,
    },
    {
      title: copy.readiness.items.services[0],
      body: activeServiceCount > 0 ? copy.readiness.items.services[1](activeServiceCount) : copy.readiness.items.services[2],
      done: activeServiceCount > 0,
    },
    {
      title: copy.readiness.items.bookings[0],
      body: pendingActionCount > 0 ? copy.readiness.items.bookings[1](pendingActionCount) : copy.readiness.items.bookings[2],
      done: pendingActionCount === 0,
    },
    {
      title: copy.readiness.items.testMode[0],
      body: isFreeTestMode ? copy.readiness.items.testMode[1] : copy.readiness.items.testMode[2],
      done: isFreeTestMode,
    },
    {
      title: copy.readiness.items.contact[0],
      body: contactReady ? copy.readiness.items.contact[1] : copy.readiness.items.contact[2],
      done: contactReady,
    },
  ];
  const completed = items.filter((item) => item.done).length;

  return (
    <section className="teacher-readiness" aria-label={copy.readiness.aria}>
      <div className="teacher-readiness__header">
        <span>{copy.readiness.kicker}</span>
        <h2>{copy.readiness.title(completed, items.length)}</h2>
        <p>{copy.readiness.body}</p>
      </div>
      <div className="teacher-readiness__progress" aria-hidden="true">
        <i style={{ width: `${completed / items.length * 100}%` }} />
      </div>
      <div className="teacher-readiness__grid">
        {items.map((item) => (
          <article key={item.title} className={`teacher-readiness__item${item.done ? ' is-complete' : ''}`}>
            <strong>{item.done ? copy.readiness.ok : copy.readiness.todo}</strong>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <div className="teacher-readiness__actions">
        <Link href={demoMode ? localizePath('/teachers', locale) : localizePath(`/teachers/${teacher.id}`, locale)}>{copy.publicPage}</Link>
        <Link href={localizePath('/account/mybookings', locale)}>{copy.bookings}</Link>
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
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get(LOCALE_HEADER);
  const locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
  const copy = getTeacherCopy(locale);
  const localeTag = teacherLocaleTag(locale);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const testUser = user ? null : await getServerTestUser();
  if (!user && !testUser) redirect(localizePath('/account/login?return=/teacher-portal', locale));

  if (testUser) {
    const localizedDemoTeacher = localizeDemoTeacher(demoTeacher, locale);
    const demoBookings = [
      { id: 'demo-1', status: 'confirmed', amount_ntd: 0, scheduled_at: new Date(Date.now() + 86400000).toISOString() },
      { id: 'demo-2', status: 'completed', amount_ntd: 0, scheduled_at: new Date(Date.now() - 86400000 * 2).toISOString() },
    ];
    const demoServices = [
      { id: 'service-1', name: '測試塔羅諮詢', duration_minutes: 30, price_ntd: 0, is_active: true },
      { id: 'service-2', name: '測試八字初談', duration_minutes: 45, price_ntd: 0, is_active: true },
    ].map((service) => localizeDemoService(service, locale));
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
          <h1 className="font-serif text-3xl tracking-widest mb-1">{copy.portal.title}</h1>
          <div className="mele-subtitle">{copy.portal.subtitle}</div>
          <p className="mt-3 text-white/70 text-sm">{localizedDemoTeacher.display_name} · {copy.portal.demoMode}</p>
        </header>

        <div className="mb-5 rounded-lg border border-accent-dim bg-accent/[0.08] p-4 text-sm leading-relaxed text-white/72">
          {copy.portal.demoNotice}
        </div>

        <TeacherPortalReadiness
          teacher={localizedDemoTeacher}
          activeServiceCount={demoServices.filter((service) => service.is_active).length}
          pendingActionCount={pendingActionCount}
          isFreeTestMode
          copy={copy.portal}
          locale={locale}
          demoMode
        />

        <TeacherMemberBriefPanel
          cards={demoBriefCards}
          copy={copy.portal.memberBrief}
          statusLabels={copy.statusLabels}
          localeTag={localeTag}
          demoMode
        />

        <TeacherReadingAssistPanel cards={demoBriefCards} copy={copy.portal.assist} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">1</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.upcoming}</div>
          </div>
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">1</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.completed}</div>
          </div>
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">4.90</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.rating}</div>
          </div>
          <div className="mele-card text-center !p-5">
            <div className="font-serif text-3xl text-accent">{demoServices.length}</div>
            <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.services}</div>
          </div>
        </div>

        <div className="mele-card">
          <div className="mele-section-title">{copy.portal.recentTitle}</div>
          <div className="mele-section-subtitle">{copy.portal.recentSubtitle}</div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-accent text-xs tracking-widest border-b border-accent-dim">
                  <th className="py-3 px-3 text-left">{copy.portal.tableTime}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableStatus}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableAmount}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableReminder}</th>
                </tr>
              </thead>
              <tbody>
                {demoBookings.map((b) => (
                  <tr key={b.id} className="border-b border-accent-dim/30">
                    <td className="py-3 px-3 text-xs">{new Date(b.scheduled_at).toLocaleString(localeTag)}</td>
                    <td className="py-3 px-3 text-xs">{copy.statusLabels[b.status] ?? b.status}</td>
                    <td className="py-3 px-3">{copy.portal.freeTest}</td>
                    <td className="py-3 px-3 text-xs text-white/62">
                      {['paid', 'confirmed'].includes(b.status) ? copy.portal.paidReminder : copy.portal.noAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mele-card mt-6">
          <div className="mele-section-title">{copy.portal.serviceTitle(demoServices.length)}</div>
          <div className="mele-section-subtitle">{copy.portal.serviceSubtitle}</div>
          {demoServices.map((s) => (
            <div key={s.id} className="flex justify-between items-center border-b border-accent-dim/30 py-3">
              <div>
                <div className="text-sm">{s.name}</div>
                <div className="text-xs text-white/60">{s.duration_minutes} min · {copy.portal.freeTest}</div>
              </div>
              <span className="px-2 py-0.5 rounded text-xs bg-success/30 text-success">{copy.portal.active}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!user) redirect(localizePath('/account/login?return=/teacher-portal', locale));

  const { data: teacher } = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!teacher) {
    return (
      <div className="container mx-auto max-w-2xl px-5 py-16 text-center">
        <div className="mele-card">
          <div className="font-serif text-2xl text-accent mb-3">{copy.portal.noTeacherTitle}</div>
          <p className="text-white/70 mb-5">{copy.portal.noTeacherBody}</p>
          <Link href={localizePath('/teachers/apply', locale)} className="mele-btn-primary inline-block">{copy.portal.applyCta}</Link>
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
        <h1 className="font-serif text-3xl tracking-widest mb-1">{copy.portal.title}</h1>
        <div className="mele-subtitle">{copy.portal.subtitle}</div>
        <p className="mt-3 text-white/70 text-sm">{t.display_name} · {t.title ?? ''}</p>
      </header>

      <TeacherPortalReadiness
        teacher={t}
        activeServiceCount={activeServiceCount}
        pendingActionCount={pendingActionCount}
        isFreeTestMode={isFreeTestMode}
        copy={copy.portal}
        locale={locale}
      />

      <TeacherMemberBriefPanel
        cards={teacherBriefCards}
        copy={copy.portal.memberBrief}
        statusLabels={copy.statusLabels}
        localeTag={localeTag}
      />

      <TeacherReadingAssistPanel cards={teacherBriefCards} copy={copy.portal.assist} />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{upcomingCount}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.upcoming}</div>
        </div>
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{completedCount}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.completed}</div>
        </div>
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{avgRating}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.rating}</div>
        </div>
        <div className="mele-card text-center !p-5">
          <div className="font-serif text-3xl text-accent">{services.data?.length ?? 0}</div>
          <div className="text-xs text-white/70 tracking-widest mt-2">{copy.portal.stats.services}</div>
        </div>
      </div>

      <div className="mele-card">
        <div className="mele-section-title">{copy.portal.recentTitle}</div>
        <div className="mele-section-subtitle">{copy.portal.recentSubtitle}</div>
        <div className="mb-4 rounded-lg border border-accent-dim bg-white/[0.035] p-4 text-sm text-white/72">
          {copy.portal.pendingNotice(pendingActionCount)}
        </div>
        {bookingRows.length === 0 && (
          <div className="text-center py-8 text-white/60">{copy.portal.noBookings}</div>
        )}
        {bookingRows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="text-accent text-xs tracking-widest border-b border-accent-dim">
                  <th className="py-3 px-3 text-left">{copy.portal.tableTime}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableStatus}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableAmount}</th>
                  <th className="py-3 px-3 text-left">{copy.portal.tableReminder}</th>
                </tr>
              </thead>
              <tbody>
                {bookingRows.map((b) => (
                  <tr key={b.id} className="border-b border-accent-dim/30">
                    <td className="py-3 px-3 text-xs">{new Date(b.scheduled_at).toLocaleString(localeTag)}</td>
                    <td className="py-3 px-3 text-xs">{copy.statusLabels[b.status] ?? b.status}</td>
                    <td className="py-3 px-3">NT$ {b.amount_ntd.toLocaleString(localeTag)}</td>
                    <td className="py-3 px-3 text-xs text-white/62">
                      {['paid', 'confirmed'].includes(b.status) ? copy.portal.paidReminder : copy.portal.noAction}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mele-card mt-6">
        <div className="mele-section-title">{copy.portal.serviceTitle(services.data?.length ?? 0)}</div>
        <div className="mele-section-subtitle">{copy.portal.serviceSubtitle}</div>
        {services.data?.map((s) => (
          <div key={s.id} className="flex justify-between items-center border-b border-accent-dim/30 py-3">
            <div>
              <div className="text-sm">{s.name}</div>
              <div className="text-xs text-white/60">{s.duration_minutes} min · NT$ {s.price_ntd.toLocaleString(localeTag)}</div>
            </div>
            <span className={`px-2 py-0.5 rounded text-xs ${s.is_active ? 'bg-success/30 text-success' : 'bg-white/10 text-white/60'}`}>
              {s.is_active ? copy.portal.active : copy.portal.inactive}
            </span>
          </div>
        ))}
        <p className="text-xs text-white/50 mt-4">
          {copy.portal.serviceFootnote}
        </p>
      </div>
    </div>
  );
}
