import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getDemoTeacher, getDemoTeacherServices, isDemoTeacherId } from '@/lib/demo-teachers';
import { DEFAULT_LOCALE, LOCALE_HEADER, isLocale, localizePath } from '@/lib/i18n';
import {
  getTeacherCopy,
  localizeDemoService,
  localizeDemoTeacher,
  specialtyLabel,
  teacherLocaleTag,
} from '@/lib/i18n/teacher-copy';
import { createClient } from '@/lib/supabase/server';
import type { Review, Teacher, TeacherService } from '@/types/db';

interface PageProps {
  params: Promise<{ id: string }>;
}

const SOCIAL_LABELS: Record<string, string> = {
  line_url: 'LINE',
  instagram: 'Instagram',
  threads: 'Threads',
  facebook: 'Facebook',
  youtube: 'YouTube',
  website: 'Website',
};

export default async function TeacherDetailPage({ params }: PageProps) {
  const { id } = await params;
  const requestHeaders = await headers();
  const headerLocale = requestHeaders.get(LOCALE_HEADER);
  const locale = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
  const copy = getTeacherCopy(locale);
  const localeTag = teacherLocaleTag(locale);
  const supabase = await createClient();
  const { data } = await supabase
    .from('teachers')
    .select('*')
    .eq('id', id)
    .eq('status', 'active')
    .maybeSingle();

  const demoTeacher = !data && isDemoTeacherId(id) ? getDemoTeacher(id) : null;
  if (!data && !demoTeacher) notFound();
  const rawTeacher = (data || demoTeacher) as Teacher;
  const teacher = isDemoTeacherId(rawTeacher.id) ? localizeDemoTeacher(rawTeacher, locale) : rawTeacher;

  const isDemo = isDemoTeacherId(teacher.id);
  const [{ data: services }, { data: reviews }] = isDemo
    ? [{ data: getDemoTeacherServices(teacher.id).map((service) => localizeDemoService(service, locale)) }, { data: [] as Review[] }]
    : await Promise.all([
      supabase.from('teacher_services').select('*').eq('teacher_id', id).eq('is_active', true).order('display_order'),
      supabase.from('reviews').select('*').eq('teacher_id', id).eq('is_visible', true).order('created_at', { ascending: false }).limit(10),
    ]);

  return (
    <main className="container mx-auto max-w-4xl px-5 py-10">
      <Link href={localizePath('/teachers', locale)} className="text-accent text-xs tracking-widest hover:opacity-80">
        {copy.detail.back}
      </Link>

      <section className="mele-card mt-5">
        {isDemo && (
          <div className="mb-5 rounded-xl border border-accent-dim bg-black/25 p-4 text-sm leading-relaxed text-white/70">
            {copy.detail.demoNotice}
          </div>
        )}

        <div className="grid gap-7 md:grid-cols-[140px_1fr] md:items-center">
          <div className="mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-mele-gold font-serif text-5xl font-bold text-primary md:mx-0 md:h-36 md:w-36">
            {teacher.display_name.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-3xl tracking-widest text-accent">{teacher.display_name}</h1>
            <div className="mt-1 text-sm text-white/60">{teacher.title || copy.detail.fallbackTitle}</div>
            <div className="mt-3 text-sm text-yellow-400">
              {Number(teacher.rating || 0).toFixed(1)} {copy.detail.ratingSuffix}
              <span className="text-white/60">{copy.detail.reviewCaseText(teacher.total_reviews || 0, teacher.cases_count || 0)}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(teacher.specialties || []).map((specialty) => (
                <span key={specialty} className="rounded-full border border-accent-dim px-3 py-1 text-xs">{specialtyLabel(locale, specialty)}</span>
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
          {teacher.intro_long || teacher.intro_short || copy.detail.fallbackIntro}
        </div>

        <div className="mt-7 grid gap-3 md:grid-cols-3">
          {[
            [copy.detail.fitTitle, copy.detail.fitBody],
            [copy.detail.styleTitle, teacher.consultation_style || copy.detail.styleFallback],
            [copy.detail.safetyTitle, copy.detail.safetyBody],
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
          <div className="mele-section-title">{copy.detail.servicesTitle}</div>
          <div className="mele-section-subtitle">{copy.detail.servicesSubtitle}</div>
          <div className="space-y-3">
            {services.map((service: TeacherService) => (
              <div key={service.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-accent-dim bg-white/[0.04] p-5">
                <div className="min-w-[200px] flex-1">
                  <div className="text-base font-semibold">{service.name}</div>
                  <div className="my-1 text-xs text-white/60">{service.duration_minutes} {copy.detail.minutes}</div>
                  {service.description && <div className="text-sm leading-relaxed text-white/70">{service.description}</div>}
                  <div className="mt-3 text-[11px] leading-relaxed text-white/45">
                    {copy.detail.serviceNote}
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl text-accent">NT$ {service.price_ntd.toLocaleString(localeTag)}</div>
                  {isDemo ? (
                    <Link href={localizePath('/mobile', locale)} className="mele-btn-secondary mt-2 !px-5 !py-2 !text-xs">
                      {copy.detail.guideBack}
                    </Link>
                  ) : (
                    <Link
                      href={localizePath(`/account/book?teacher=${teacher.id}&service=${service.id}`, locale)}
                      className="mele-btn-primary mt-2 !px-5 !py-2 !text-xs"
                    >
                      {copy.detail.book}
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="mele-card text-center">
          <div className="mele-section-title">{copy.detail.unavailableTitle}</div>
          <p className="text-sm leading-relaxed text-white/68">
            {copy.detail.unavailableBody}
          </p>
        </section>
      )}

      {reviews && reviews.length > 0 && (
        <section className="mele-card">
          <div className="mele-section-title">{copy.detail.reviewsTitle}</div>
          <div className="mele-section-subtitle">{copy.detail.reviewsSubtitle}</div>
          <div className="space-y-4">
            {reviews.map((review: Review) => (
              <div key={review.id} className="border-b border-accent-dim/30 py-3">
                <div className="text-yellow-400">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</div>
                <div className="mt-1 text-sm text-white/85">{review.comment || copy.detail.noComment}</div>
                <div className="mt-1 text-[11px] text-white/40">
                  {new Date(review.created_at).toLocaleDateString(localeTag)}
                  {review.is_anonymous && ` · ${copy.detail.anonymous}`}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
