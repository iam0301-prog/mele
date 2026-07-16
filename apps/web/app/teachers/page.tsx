'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DEMO_TEACHERS } from '@/lib/demo-teachers';
import { useProvidedLocale } from '@/lib/i18n/LocaleProvider';
import { localizePath } from '@/lib/i18n/config';
import {
  getTeacherCopy,
  localizeDemoTeacher,
  normalizeSpecialtyFilter,
  specialtyLabel,
} from '@/lib/i18n/teacher-copy';
import { createClient } from '@/lib/supabase/client';
import type { Teacher } from '@/types/db';

type TeacherNeed = 'relationship' | 'career' | 'decision' | 'self';
const TEACHER_NEEDS: Array<{ key: TeacherNeed; zh: string; en: string; specialties: string[]; reasonZh: string; reasonEn: string }> = [
  { key: 'relationship', zh: '感情與人際', en: 'Love and relationships', specialties: ['塔羅', '占星', '人類圖'], reasonZh: '適合整理關係模式、界線與彼此互動', reasonEn: 'Good for relationship patterns, boundaries, and interaction' },
  { key: 'career', zh: '工作與方向', en: 'Career and direction', specialties: ['八字', '紫微', '占星'], reasonZh: '適合整理職涯節奏、長期方向與資源取捨', reasonEn: 'Good for career rhythm, long-term direction, and trade-offs' },
  { key: 'decision', zh: '一個選擇卡住了', en: 'I am stuck on a decision', specialties: ['塔羅', '盧恩', '八字'], reasonZh: '適合釐清當下選項、盲點與下一步', reasonEn: 'Good for clarifying options, blind spots, and the next step' },
  { key: 'self', zh: '更深入理解自己', en: 'Understand myself more deeply', specialties: ['人類圖', '生命靈數', '馬雅', '占星'], reasonZh: '適合把性格、決策方式與生活節奏放在一起看', reasonEn: 'Good for connecting personality, decisions, and daily rhythm' },
];

function TeachersInner() {
  const locale = useProvidedLocale();
  const copy = getTeacherCopy(locale);
  const search = useSearchParams();
  const initialSpec = normalizeSpecialtyFilter(search.get('spec'));
  const [filter, setFilter] = useState(initialSpec);
  const [need, setNeed] = useState<TeacherNeed | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const supabase = createClient();
      let query = supabase.from('teachers').select('*').eq('status', 'active');
      if (filter && filter !== '全部') query = query.contains('specialties', [filter]);
      const { data, error } = await query.order('rating', { ascending: false });
      if (!cancelled) {
        const rows = error ? [] : ((data || []) as Teacher[]);
        if (rows.length > 0) {
          setTeachers(rows);
          setDemoMode(false);
        } else {
          const sortByRating = (list: typeof DEMO_TEACHERS) =>
            [...list].sort((a, b) => Number(b.rating ?? 0) - Number(a.rating ?? 0));
          setTeachers(
            sortByRating(
              filter && filter !== '全部'
                ? DEMO_TEACHERS.filter((teacher) => (teacher.specialties || []).includes(filter))
                : DEMO_TEACHERS,
            ),
          );
          setDemoMode(true);
        }
        setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filter]);

  const selectedNeed = TEACHER_NEEDS.find((item) => item.key === need) ?? null;
  const visibleTeachers = selectedNeed
    ? [...teachers].sort((a, b) => {
        const score = (teacher: Teacher) => selectedNeed.specialties.filter((item) => (teacher.specialties || []).includes(item)).length;
        return score(b) - score(a) || Number(b.rating || 0) - Number(a.rating || 0);
      })
    : teachers;

  return (
    <main className="mag-teachers-page">
    <div className="container mx-auto max-w-6xl px-5 py-12">
      <header className="pb-8 text-center">
        <div className="mag-teachers-page__kicker mag-label mb-4 text-base tracking-[0.5em] opacity-70">{copy.directory.kicker}</div>
        <h1 className="mag-teachers-page__title text-4xl tracking-widest">{copy.directory.title}</h1>
        <div className="mag-teachers-page__subtitle mele-subtitle mt-2">{copy.directory.subtitle}</div>
        <p className="mag-teachers-page__body mx-auto mt-5 max-w-2xl text-sm leading-relaxed">
          {copy.directory.body}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href={localizePath('/mobile', locale)} className="mele-btn-primary">{copy.directory.guidanceCta}</Link>
          <Link href={localizePath('/teachers/apply', locale)} className="mele-btn-secondary">{copy.directory.applyCta}</Link>
        </div>
      </header>

      <section className="mag-teachers-page__panel mele-card">
        <div className="teacher-needs" aria-labelledby="teacher-needs-title">
          <span className="mag-label">{locale === 'zh-TW' ? '先說你想處理什麼' : 'Start with what you need'}</span>
          <h2 id="teacher-needs-title">{locale === 'zh-TW' ? '你希望這次談完，哪件事更清楚？' : 'What should feel clearer after the session?'}</h2>
          <div role="group" aria-label={locale === 'zh-TW' ? '諮詢需求' : 'Consultation need'}>
            {TEACHER_NEEDS.map((item) => (
              <button key={item.key} type="button" aria-pressed={need === item.key} onClick={() => { setNeed(item.key); setFilter('全部'); }}>{locale === 'zh-TW' ? item.zh : item.en}</button>
            ))}
          </div>
          {selectedNeed && <p aria-live="polite">{locale === 'zh-TW' ? '已依適合程度重新排列；你仍可用下方專長進一步篩選。' : 'Reordered by fit. You can still refine by specialty below.'}</p>}
        </div>
        <div className="mb-6 flex flex-wrap gap-2">
          {copy.specialties.map((specialty) => (
            <button
              key={specialty.value}
              type="button"
              onClick={() => setFilter(specialty.value)}
              className={`mag-teachers-page__filter-chip px-4 py-2 text-sm transition-all ${
                filter === specialty.value ? 'is-active' : ''
              }`}
            >
              {specialty.label}
            </button>
          ))}
        </div>

        {loading && <div className="mag-teachers-page__subtitle py-12 text-center">{copy.directory.loading}</div>}

        {!loading && demoMode && teachers.length > 0 && (
          <div className="mag-teachers-page__notice mb-5 rounded-xl p-4 text-sm leading-relaxed">
            {copy.directory.demoNotice}
          </div>
        )}

        {!loading && teachers.length === 0 && (
          <div className="mag-teachers-page__subtitle py-16 text-center">
            <div className="mag-teachers-page__kicker mb-3 text-4xl opacity-50">MELE</div>
            <p className="mag-teachers-page__title mb-2">{copy.directory.emptyTitle}</p>
            <p className="mag-teachers-page__body mx-auto mb-4 max-w-sm text-sm leading-relaxed">{copy.directory.emptyBody}</p>
            <div className="mt-4">
              <Link href={localizePath('/teachers/apply', locale)} className="mag-teachers-page__kicker text-xs tracking-widest hover:opacity-80">
                {copy.directory.emptyAction}
              </Link>
            </div>
          </div>
        )}

        {!loading && teachers.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleTeachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} recommendation={selectedNeed ? (locale === 'zh-TW' ? selectedNeed.reasonZh : selectedNeed.reasonEn) : undefined} />
            ))}
          </div>
        )}
      </section>
    </div>
    </main>
  );
}

function TeacherCard({ teacher, recommendation }: { teacher: Teacher; recommendation?: string }) {
  const locale = useProvidedLocale();
  const copy = getTeacherCopy(locale);
  const isDemo = teacher.id.startsWith('demo-');
  const displayTeacher = isDemo ? localizeDemoTeacher(teacher, locale) : teacher;
  return (
    <Link
      href={localizePath(`/teachers/${teacher.id}`, locale)}
      className="mag-author-card"
    >
      {isDemo && (
        <div className="mag-author-card__badge">
          {copy.directory.demoBadge}
        </div>
      )}
      <div className="mag-author-card__avatar">
        {displayTeacher.display_name.charAt(0)}
      </div>
      <div className="mag-author-card__name">{displayTeacher.display_name}</div>
      <div className="mag-author-card__title mt-1 text-xs">{displayTeacher.title || copy.directory.fallbackTitle}</div>
      <div className="mag-author-card__rating mt-3 text-sm">
        {Number(teacher.rating || 0).toFixed(1)} {copy.directory.ratingUnit}
        <span className="mag-author-card__title">（{teacher.total_reviews || 0} {copy.directory.reviewsUnit}） · {teacher.cases_count || 0} {copy.directory.casesUnit}</span>
      </div>
      <div className="mag-author-card__tags mt-3">
        {(teacher.specialties || []).slice(0, 4).map((specialty) => (
          <span key={specialty} className="mag-author-card__tag">{specialtyLabel(locale, specialty)}</span>
        ))}
      </div>
      <div className="mag-author-card__quote mt-3 min-h-[44px] text-xs leading-relaxed">
        {displayTeacher.quote || displayTeacher.intro_short || copy.directory.fallbackBody}
      </div>
      {recommendation && <div className="mag-author-card__match"><span>{locale === 'zh-TW' ? '推薦原因' : 'Why this guide'}</span><p>{recommendation}</p></div>}
      <div className="mag-author-card__action mt-4 pt-3 text-xs tracking-widest">
        {copy.directory.detailAction}
      </div>
    </Link>
  );
}

export default function TeachersPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-5 py-16 text-center text-white/60">Loading...</div>}>
      <TeachersInner />
    </Suspense>
  );
}
