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

function TeachersInner() {
  const locale = useProvidedLocale();
  const copy = getTeacherCopy(locale);
  const search = useSearchParams();
  const initialSpec = normalizeSpecialtyFilter(search.get('spec'));
  const [filter, setFilter] = useState(initialSpec);
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
          setTeachers(
            filter && filter !== '全部'
              ? DEMO_TEACHERS.filter((teacher) => (teacher.specialties || []).includes(filter))
              : DEMO_TEACHERS,
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

  return (
    <main className="container mx-auto max-w-6xl px-5 py-12">
      <header className="pb-8 text-center">
        <div className="text-accent mb-4 text-base tracking-[0.5em] opacity-70">{copy.directory.kicker}</div>
        <h1 className="font-serif text-4xl tracking-widest">{copy.directory.title}</h1>
        <div className="mele-subtitle mt-2">{copy.directory.subtitle}</div>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/70">
          {copy.directory.body}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href={localizePath('/mobile', locale)} className="mele-btn-primary">{copy.directory.guidanceCta}</Link>
          <Link href={localizePath('/teachers/apply', locale)} className="mele-btn-secondary">{copy.directory.applyCta}</Link>
        </div>
      </header>

      <section className="mele-card">
        <div className="mb-6 flex flex-wrap gap-2">
          {copy.specialties.map((specialty) => (
            <button
              key={specialty.value}
              type="button"
              onClick={() => setFilter(specialty.value)}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${
                filter === specialty.value
                  ? 'border-accent bg-accent text-primary font-semibold'
                  : 'border-accent-dim bg-white/5 hover:border-accent'
              }`}
            >
              {specialty.label}
            </button>
          ))}
        </div>

        {loading && <div className="py-12 text-center text-white/60">{copy.directory.loading}</div>}

        {!loading && demoMode && teachers.length > 0 && (
          <div className="mb-5 rounded-xl border border-accent-dim bg-black/25 p-4 text-sm leading-relaxed text-white/70">
            {copy.directory.demoNotice}
          </div>
        )}

        {!loading && teachers.length === 0 && (
          <div className="py-16 text-center text-white/60">
            <div className="mb-3 text-4xl text-accent opacity-50">MELE</div>
            {copy.directory.emptyTitle}
            <div className="mt-4">
              <Link href={localizePath('/teachers/apply', locale)} className="text-accent text-xs tracking-widest hover:opacity-80">
                {copy.directory.emptyAction}
              </Link>
            </div>
          </div>
        )}

        {!loading && teachers.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {teachers.map((teacher) => (
              <TeacherCard key={teacher.id} teacher={teacher} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function TeacherCard({ teacher }: { teacher: Teacher }) {
  const locale = useProvidedLocale();
  const copy = getTeacherCopy(locale);
  const displayTeacher = teacher.id.startsWith('demo-') ? localizeDemoTeacher(teacher, locale) : teacher;
  return (
    <Link
      href={localizePath(`/teachers/${teacher.id}`, locale)}
      className="block rounded-2xl border border-accent-dim bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-gold-soft"
    >
      <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-mele-gold font-serif text-3xl font-bold text-primary">
        {displayTeacher.display_name.charAt(0)}
      </div>
      <div className="text-center font-serif text-xl text-accent">{displayTeacher.display_name}</div>
      <div className="mt-1 text-center text-xs text-white/60">{displayTeacher.title || copy.directory.fallbackTitle}</div>
      <div className="mt-3 text-center text-sm text-yellow-400">
        {Number(teacher.rating || 0).toFixed(1)} {copy.directory.ratingUnit}
        <span className="text-white/50">（{teacher.total_reviews || 0} {copy.directory.reviewsUnit}） · {teacher.cases_count || 0} {copy.directory.casesUnit}</span>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {(teacher.specialties || []).slice(0, 4).map((specialty) => (
          <span key={specialty} className="rounded-md border border-accent-dim px-2 py-0.5 text-[11px]">{specialtyLabel(locale, specialty)}</span>
        ))}
      </div>
      <div className="mt-3 min-h-[44px] text-center text-xs leading-relaxed text-white/70">
        {displayTeacher.quote || displayTeacher.intro_short || copy.directory.fallbackBody}
      </div>
      <div className="mt-4 border-t border-accent-dim pt-3 text-center text-xs tracking-widest text-accent">
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
