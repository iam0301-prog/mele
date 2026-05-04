'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { DEMO_TEACHERS } from '@/lib/demo-teachers';
import { createClient } from '@/lib/supabase/client';
import type { Teacher } from '@/types/db';

const SPECIALTIES = ['全部', '八字', '紫微', '塔羅', '盧恩', '占星', '人類圖', '生命靈數', '馬雅'];

function TeachersInner() {
  const search = useSearchParams();
  const initialSpec = search.get('spec') || '全部';
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
        <div className="text-accent mb-4 text-base tracking-[0.5em] opacity-70">CONSULTATION MARKET</div>
        <h1 className="font-serif text-4xl tracking-widest">命理媒合中心</h1>
        <div className="mele-subtitle mt-2">OUR READERS</div>
        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-white/70">
          你可以先用手機版媒合流程找到適合的老師，也可以在這裡依專長瀏覽所有上架老師、服務風格與評價。
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/mobile" className="mele-btn-primary">進入手機媒合</Link>
          <Link href="/teachers/apply" className="mele-btn-secondary">我是老師，申請加入</Link>
        </div>
      </header>

      <section className="mele-card">
        <div className="mb-6 flex flex-wrap gap-2">
          {SPECIALTIES.map((specialty) => (
            <button
              key={specialty}
              type="button"
              onClick={() => setFilter(specialty)}
              className={`rounded-full border px-4 py-2 text-sm transition-all ${
                filter === specialty
                  ? 'border-accent bg-accent text-primary font-semibold'
                  : 'border-accent-dim bg-white/5 hover:border-accent'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>

        {loading && <div className="py-12 text-center text-white/60">正在讀取老師名單...</div>}

        {!loading && demoMode && teachers.length > 0 && (
          <div className="mb-5 rounded-xl border border-accent-dim bg-black/25 p-4 text-sm leading-relaxed text-white/70">
            目前資料庫尚未上架正式老師，以下顯示本機示範老師，方便測試媒合、老師詳情與服務呈現。正式上線後會自動改用 Supabase 內的真實老師資料。
          </div>
        )}

        {!loading && teachers.length === 0 && (
          <div className="py-16 text-center text-white/60">
            <div className="mb-3 text-4xl text-accent opacity-50">MELE</div>
            目前沒有符合條件的上架老師。
            <div className="mt-4">
              <Link href="/teachers/apply" className="text-accent text-xs tracking-widest hover:opacity-80">
                申請成為 MELE 命理老師
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
  return (
    <Link
      href={`/teachers/${teacher.id}`}
      className="block rounded-2xl border border-accent-dim bg-white/[0.03] p-6 transition-all hover:-translate-y-1 hover:border-accent hover:shadow-gold-soft"
    >
      <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-mele-gold font-serif text-3xl font-bold text-primary">
        {teacher.display_name.charAt(0)}
      </div>
      <div className="text-center font-serif text-xl text-accent">{teacher.display_name}</div>
      <div className="mt-1 text-center text-xs text-white/60">{teacher.title || '命理諮詢老師'}</div>
      <div className="mt-3 text-center text-sm text-yellow-400">
        {Number(teacher.rating || 0).toFixed(1)} 分
        <span className="text-white/50">（{teacher.total_reviews || 0} 則評價） · {teacher.cases_count || 0} 次案例</span>
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {(teacher.specialties || []).slice(0, 4).map((specialty) => (
          <span key={specialty} className="rounded-md border border-accent-dim px-2 py-0.5 text-[11px]">{specialty}</span>
        ))}
      </div>
      <div className="mt-3 min-h-[44px] text-center text-xs leading-relaxed text-white/70">
        {teacher.quote || teacher.intro_short || '查看老師介紹、專長與可預約服務。'}
      </div>
      <div className="mt-4 border-t border-accent-dim pt-3 text-center text-xs tracking-widest text-accent">
        查看老師詳情
      </div>
    </Link>
  );
}

export default function TeachersPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-5 py-16 text-center text-white/60">正在讀取老師名單...</div>}>
      <TeachersInner />
    </Suspense>
  );
}
