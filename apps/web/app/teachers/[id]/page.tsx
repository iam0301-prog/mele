import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDemoTeacher, getDemoTeacherServices, isDemoTeacherId } from '@/lib/demo-teachers';
import { createClient } from '@/lib/supabase/server';
import type { Review, Teacher, TeacherService } from '@/types/db';

interface PageProps {
  params: { id: string };
}

const SOCIAL_LABELS: Record<string, string> = {
  line_url: 'LINE',
  instagram: 'Instagram',
  threads: 'Threads',
  facebook: 'Facebook',
  youtube: 'YouTube',
  website: '網站',
};

export default async function TeacherDetailPage({ params }: PageProps) {
  const supabase = createClient();
  const { data } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', params.id)
    .eq('status', 'active')
    .maybeSingle();

  const demoTeacher = !data && isDemoTeacherId(params.id) ? getDemoTeacher(params.id) : null;
  if (!data && !demoTeacher) notFound();
  const teacher = (data || demoTeacher) as Teacher;

  const isDemo = isDemoTeacherId(teacher.id);
  const [{ data: services }, { data: reviews }] = isDemo
    ? [{ data: getDemoTeacherServices(teacher.id) }, { data: [] as Review[] }]
    : await Promise.all([
      supabase.from('teacher_services').select('*').eq('teacher_id', params.id).eq('is_active', true).order('display_order'),
      supabase.from('reviews').select('*').eq('teacher_id', params.id).eq('is_visible', true).order('created_at', { ascending: false }).limit(10),
    ]);

  return (
    <main className="container mx-auto max-w-4xl px-5 py-10">
      <Link href="/teachers" className="text-accent text-xs tracking-widest hover:opacity-80">
        返回老師媒合中心
      </Link>

      <section className="mele-card mt-5">
        {isDemo && (
          <div className="mb-5 rounded-xl border border-accent-dim bg-black/25 p-4 text-sm leading-relaxed text-white/70">
            這是本機示範老師，用來確認前台媒合、老師詳情與服務卡片的完整體驗；正式上線後會顯示 Supabase 審核通過的真實老師。
          </div>
        )}

        <div className="grid gap-7 md:grid-cols-[140px_1fr] md:items-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-mele-gold font-serif text-5xl font-bold text-primary md:mx-0 md:h-36 md:w-36">
            {teacher.display_name.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-3xl tracking-widest text-accent">{teacher.display_name}</h1>
            <div className="mt-1 text-sm text-white/60">{teacher.title || '命理諮詢老師'}</div>
            <div className="mt-3 text-sm text-yellow-400">
              {Number(teacher.rating || 0).toFixed(1)} 分
              <span className="text-white/60">（{teacher.total_reviews || 0} 則評價 · {teacher.cases_count || 0} 次諮詢）</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(teacher.specialties || []).map((specialty) => (
                <span key={specialty} className="rounded-full border border-accent-dim px-3 py-1 text-xs">{specialty}</span>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {Object.keys(SOCIAL_LABELS).map((key) => {
                const url = (teacher as unknown as Record<string, string | null>)[key];
                if (!url) return null;
                return (
                  <a key={key} href={url} target="_blank" rel="noreferrer" className="text-accent-light hover:underline">
                    {SOCIAL_LABELS[key]}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {teacher.quote && (
          <blockquote className="mt-7 border-l-4 border-accent bg-black/25 p-5 italic text-white/85">
            「{teacher.quote}」
          </blockquote>
        )}

        <div className="mt-5 whitespace-pre-wrap leading-loose text-white/85">
          {teacher.intro_long || teacher.intro_short || '這位老師尚未補上完整介紹。預約前可先查看服務項目與評價。'}
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {[
            ['適合對象', '適合想把問題講清楚、需要專業視角整理方向的人。'],
            ['諮詢方式', teacher.consultation_style || '以線上諮詢為主，老師會依你的問題與命盤資料準備解讀。'],
            ['平台保障', '付款、取消、退款與評價都在平台內留存，降低私下交易風險。'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-lg border border-accent-dim bg-white/[0.035] p-4">
              <div className="text-xs tracking-[0.25em] text-accent">{title}</div>
              <p className="mt-2 text-xs leading-relaxed text-white/68">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {services && services.length > 0 ? (
        <section className="mele-card">
          <div className="mele-section-title">服務項目</div>
          <div className="mele-section-subtitle">SERVICES</div>
          <div className="space-y-3">
            {services.map((service: TeacherService) => (
              <div key={service.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent-dim bg-white/[0.04] p-5">
                <div className="min-w-[200px] flex-1">
                  <div className="text-base font-semibold">{service.name}</div>
                  <div className="my-1 text-xs text-white/60">{service.duration_minutes} 分鐘</div>
                  {service.description && <div className="text-sm leading-relaxed text-white/70">{service.description}</div>}
                  <div className="mt-3 text-[11px] leading-relaxed text-white/45">
                    預約前請確認這項服務符合你的問題類型。付款後可在「我的諮詢」查看狀態與管理紀錄。
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl text-accent">NT$ {service.price_ntd.toLocaleString('zh-TW')}</div>
                  {isDemo ? (
                    <Link href="/mobile" className="mele-btn-secondary mt-2 !px-5 !py-2 !text-xs">
                      回到媒合
                    </Link>
                  ) : (
                    <Link
                      href={`/account/book?teacher=${teacher.id}&service=${service.id}`}
                      className="mele-btn-primary mt-2 !px-5 !py-2 !text-xs"
                    >
                      預約
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mele-card text-center">
          <div className="mele-section-title">尚未開放預約</div>
          <p className="text-sm leading-relaxed text-white/68">
            這位老師目前沒有公開服務項目。你可以先回到媒合中心查看其他老師，或稍後再回來確認。
          </p>
        </section>
      )}

      {reviews && reviews.length > 0 && (
        <section className="mele-card">
          <div className="mele-section-title">客戶評價</div>
          <div className="mele-section-subtitle">REVIEWS</div>
          <div className="space-y-4">
            {reviews.map((review: Review) => (
              <div key={review.id} className="border-b border-accent-dim/30 py-3">
                <div className="text-yellow-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                <div className="mt-1 text-sm text-white/85">{review.comment || '這位使用者沒有留下文字評價。'}</div>
                <div className="mt-1 text-[11px] text-white/40">
                  {new Date(review.created_at).toLocaleDateString('zh-TW')}
                  {review.is_anonymous && ' · 匿名'}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
