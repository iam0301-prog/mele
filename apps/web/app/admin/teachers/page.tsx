'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';
import type { Teacher, TeacherStatus } from '@/types/db';

type TeacherForm = {
  display_name: string;
  title: string;
  intro_short: string;
  intro_long: string;
  quote: string;
  specialties: string;
  consultation_style: string;
  line_url: string;
  instagram: string;
  facebook: string;
  threads: string;
  youtube: string;
  website: string;
  commission_rate: string;
  admin_script: string;
};

const STATUS_LABEL: Record<TeacherStatus, string> = {
  pending: '待送審',
  reviewing: '審核中',
  revision: '待補件',
  rejected: '已拒絕',
  interview: '面談中',
  contracted: '待上架',
  active: '已上架',
  paused: '暫停接案',
  suspended: '已停權',
};

const STATUS_BADGE: Record<TeacherStatus, string> = {
  pending: 'border-white/30 text-white/62',
  reviewing: 'border-info text-info',
  revision: 'border-warning text-warning',
  rejected: 'border-reverse text-reverse',
  interview: 'border-info text-info',
  contracted: 'border-accent text-accent',
  active: 'border-success text-success',
  paused: 'border-white/35 text-white/62',
  suspended: 'border-reverse text-reverse',
};

function teacherToForm(teacher: Teacher): TeacherForm {
  return {
    display_name: teacher.display_name ?? '',
    title: teacher.title ?? '',
    intro_short: teacher.intro_short ?? '',
    intro_long: teacher.intro_long ?? '',
    quote: teacher.quote ?? '',
    specialties: (teacher.specialties ?? []).join('、'),
    consultation_style: teacher.consultation_style ?? '',
    line_url: teacher.line_url ?? '',
    instagram: teacher.instagram ?? '',
    facebook: teacher.facebook ?? '',
    threads: teacher.threads ?? '',
    youtube: teacher.youtube ?? '',
    website: teacher.website ?? '',
    commission_rate: String(Math.round((teacher.commission_rate ?? 0.2) * 1000) / 10),
    admin_script: teacher.admin_script ?? '',
  };
}

function splitSpecialties(value: string) {
  return value
    .split(/[、,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 12);
}

function matchesTeacher(teacher: Teacher, term: string) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return true;
  return [
    teacher.display_name,
    teacher.title,
    teacher.intro_short,
    teacher.consultation_style,
    teacher.website,
    ...(teacher.specialties ?? []),
  ].some((value) => String(value ?? '').toLowerCase().includes(normalized));
}

export default function AdminTeachers() {
  const toast = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TeacherStatus | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [form, setForm] = useState<TeacherForm>({
    display_name: '',
    title: '',
    intro_short: '',
    intro_long: '',
    quote: '',
    specialties: '',
    consultation_style: '',
    line_url: '',
    instagram: '',
    facebook: '',
    threads: '',
    youtube: '',
    website: '',
    commission_rate: '20',
    admin_script: '',
  });

  const visibleTeachers = useMemo(
    () => teachers.filter((teacher) => matchesTeacher(teacher, search)),
    [teachers, search],
  );

  const selectedTeacher = useMemo(
    () => visibleTeachers.find((teacher) => teacher.id === selectedId) ?? visibleTeachers[0] ?? null,
    [selectedId, visibleTeachers],
  );

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase.from('teachers').select('*').order('approved_at', { ascending: false });
    if (statusFilter) query = query.eq('status', statusFilter);
    const { data, error } = await query;
    if (error) toast(error.message, 'error');
    const rows = (data as Teacher[]) || [];
    setTeachers(rows);
    setSelectedId((current) => (current && rows.some((teacher) => teacher.id === current) ? current : rows[0]?.id ?? null));
    setLoading(false);
  }, [statusFilter, toast]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selectedTeacher) setForm(teacherToForm(selectedTeacher));
  }, [selectedTeacher]);

  const saveProfile = async () => {
    if (!selectedTeacher || saving) return;
    const specialties = splitSpecialties(form.specialties);
    const commissionRate = Number(form.commission_rate) / 100;
    if (!form.display_name.trim()) return toast('請填寫老師顯示名稱。', 'error');
    if (specialties.length === 0) return toast('請至少填寫一個專長。', 'error');
    if (!Number.isFinite(commissionRate) || commissionRate < 0 || commissionRate > 0.5) {
      return toast('佣金比例需介於 0% 到 50%。', 'error');
    }

    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_update_teacher_profile', {
      p_teacher_id: selectedTeacher.id,
      p_display_name: form.display_name.trim(),
      p_title: form.title || null,
      p_intro_short: form.intro_short || null,
      p_intro_long: form.intro_long || null,
      p_quote: form.quote || null,
      p_specialties: specialties,
      p_consultation_style: form.consultation_style || null,
      p_line_url: form.line_url || null,
      p_instagram: form.instagram || null,
      p_facebook: form.facebook || null,
      p_threads: form.threads || null,
      p_youtube: form.youtube || null,
      p_website: form.website || null,
      p_commission_rate: commissionRate,
      p_admin_script: form.admin_script || null,
    });
    setSaving(false);
    if (error) return toast(error.message, 'error');
    toast('老師資料已更新。', 'success');
    await load();
  };

  const updateStatus = async (status: 'active' | 'paused' | 'suspended') => {
    if (!selectedTeacher || updatingStatus) return;
    const reason = status === 'suspended'
      ? window.prompt('請輸入停權原因，這會留下後台紀錄：')
      : status === 'paused'
        ? window.prompt('請輸入暫停原因，方便日後追蹤：') ?? ''
        : '';
    if (status === 'suspended' && !reason) return;

    setUpdatingStatus(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('admin_update_teacher_status', {
      p_teacher_id: selectedTeacher.id,
      p_status: status,
      p_reason: reason || null,
    });
    setUpdatingStatus(false);
    if (error) return toast(error.message, 'error');
    toast(`老師狀態已更新為「${STATUS_LABEL[status]}」。`, 'success');
    await load();
  };

  return (
    <div className="space-y-6">
      <section className="mele-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mele-section-title">老師管理</div>
            <div className="mele-section-subtitle">TEACHER OPERATIONS</div>
            <p className="max-w-2xl text-sm leading-loose text-white/64">
              這裡處理老師上架後的營運問題：公開資料、專長、社群連結、平台佣金、暫停接案、恢復上架與停權紀錄。
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="mele-input min-w-0 sm:w-64"
              placeholder="搜尋老師、專長、網站"
            />
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TeacherStatus | '')} className="mele-input sm:w-40">
              <option value="">全部狀態</option>
              {(['active', 'paused', 'suspended', 'contracted'] as TeacherStatus[]).map((status) => (
                <option key={status} value={status}>{STATUS_LABEL[status]}</option>
              ))}
            </select>
            <button type="button" onClick={() => void load()} className="mele-btn-secondary">重新載入</button>
          </div>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.72fr_1.28fr]">
        <aside className="mele-card p-0 md:p-0">
          <div className="border-b border-accent-dim px-5 py-4">
            <div className="text-sm font-bold tracking-[0.25em] text-accent">老師清單</div>
            <p className="mt-1 text-xs text-white/50">點選老師後可在右側處理資料與狀態。</p>
          </div>
          {loading && <div className="px-5 py-10 text-center text-sm text-white/58">正在載入老師資料...</div>}
          {!loading && visibleTeachers.length === 0 && <div className="px-5 py-10 text-center text-sm text-white/58">目前沒有符合條件的老師。</div>}
          {!loading && visibleTeachers.length > 0 && (
            <div className="max-h-[720px] overflow-y-auto">
              {visibleTeachers.map((teacher) => (
                <button
                  key={teacher.id}
                  type="button"
                  onClick={() => setSelectedId(teacher.id)}
                  className={`block w-full border-b border-accent-dim/30 px-5 py-4 text-left transition-colors ${
                    selectedTeacher?.id === teacher.id ? 'bg-accent/12' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-serif text-xl text-white">{teacher.display_name}</div>
                      <div className="mt-1 truncate text-xs text-white/48">{teacher.title ?? '未設定頭銜'}</div>
                    </div>
                    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] ${STATUS_BADGE[teacher.status]}`}>
                      {STATUS_LABEL[teacher.status]}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {(teacher.specialties ?? []).slice(0, 4).map((item) => (
                      <span key={item} className="rounded-full border border-accent-dim px-2 py-0.5 text-[11px] text-white/58">{item}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </aside>

        {selectedTeacher && (
          <div className="space-y-5">
            <section className="mele-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="text-xs tracking-[0.35em] text-accent">TEACHER</div>
                  <h2 className="mt-2 font-serif text-3xl text-white">{selectedTeacher.display_name}</h2>
                  <p className="mt-2 text-xs text-white/48">{selectedTeacher.id}</p>
                  <a
                    href={`/teacher-portal?teacher_id=${selectedTeacher.id}`}
                    className="mele-btn-secondary mt-4 inline-flex !px-4 !py-2 !text-xs"
                  >
                    查看此老師後台
                  </a>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                  <div className="rounded-lg border border-accent-dim bg-white/[0.04] px-4 py-3">
                    <div className="text-xs text-white/45">評分</div>
                    <strong className="font-serif text-2xl text-accent">{Number(selectedTeacher.rating || 0).toFixed(1)}</strong>
                  </div>
                  <div className="rounded-lg border border-accent-dim bg-white/[0.04] px-4 py-3">
                    <div className="text-xs text-white/45">案件</div>
                    <strong className="font-serif text-2xl text-white">{selectedTeacher.cases_count}</strong>
                  </div>
                  <div className="rounded-lg border border-accent-dim bg-white/[0.04] px-4 py-3">
                    <div className="text-xs text-white/45">佣金</div>
                    <strong className="font-serif text-2xl text-white">{(selectedTeacher.commission_rate * 100).toFixed(1)}%</strong>
                  </div>
                </div>
              </div>
              {selectedTeacher.suspended_reason && (
                <p className="mt-4 rounded-lg border border-reverse/35 bg-reverse/10 p-3 text-sm text-rose-200">
                  停權原因：{selectedTeacher.suspended_reason}
                </p>
              )}
            </section>

            <section className="mele-card">
              <div className="mele-section-title">狀態處理</div>
              <div className="mele-section-subtitle">STATUS CONTROL</div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button type="button" onClick={() => void updateStatus('active')} disabled={updatingStatus || selectedTeacher.status === 'active'} className="mele-btn-success">
                  恢復上架
                </button>
                <button type="button" onClick={() => void updateStatus('paused')} disabled={updatingStatus || selectedTeacher.status === 'paused'} className="mele-btn-secondary">
                  暫停接案
                </button>
                <button type="button" onClick={() => void updateStatus('suspended')} disabled={updatingStatus || selectedTeacher.status === 'suspended'} className="mele-btn-danger">
                  停權
                </button>
              </div>
            </section>

            <section className="grid gap-5 xl:grid-cols-2">
              <div className="mele-card">
                <div className="mele-section-title">公開資料</div>
                <div className="mele-section-subtitle">PUBLIC PROFILE</div>
                <div className="space-y-4">
                  <label className="mele-label">顯示名稱<input value={form.display_name} onChange={(event) => setForm((prev) => ({ ...prev, display_name: event.target.value }))} className="mele-input mt-2" /></label>
                  <label className="mele-label">頭銜<input value={form.title} onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))} className="mele-input mt-2" placeholder="例：紫微與關係議題諮詢老師" /></label>
                  <label className="mele-label">專長<input value={form.specialties} onChange={(event) => setForm((prev) => ({ ...prev, specialties: event.target.value }))} className="mele-input mt-2" placeholder="用頓號或逗號分隔" /></label>
                  <label className="mele-label">短介紹<textarea value={form.intro_short} onChange={(event) => setForm((prev) => ({ ...prev, intro_short: event.target.value }))} className="mele-input mt-2 min-h-24 resize-y" /></label>
                  <label className="mele-label">完整介紹<textarea value={form.intro_long} onChange={(event) => setForm((prev) => ({ ...prev, intro_long: event.target.value }))} className="mele-input mt-2 min-h-32 resize-y" /></label>
                  <label className="mele-label">一句話風格<input value={form.quote} onChange={(event) => setForm((prev) => ({ ...prev, quote: event.target.value }))} className="mele-input mt-2" /></label>
                  <label className="mele-label">諮詢風格<textarea value={form.consultation_style} onChange={(event) => setForm((prev) => ({ ...prev, consultation_style: event.target.value }))} className="mele-input mt-2 min-h-24 resize-y" /></label>
                </div>
              </div>

              <div className="mele-card">
                <div className="mele-section-title">營運設定</div>
                <div className="mele-section-subtitle">OPERATIONS</div>
                <div className="space-y-4">
                  <label className="mele-label">平台佣金比例（%）<input type="number" min="0" max="50" step="0.5" value={form.commission_rate} onChange={(event) => setForm((prev) => ({ ...prev, commission_rate: event.target.value }))} className="mele-input mt-2" /></label>
                  <label className="mele-label">LINE 連結<input value={form.line_url} onChange={(event) => setForm((prev) => ({ ...prev, line_url: event.target.value }))} className="mele-input mt-2" /></label>
                  <label className="mele-label">Instagram<input value={form.instagram} onChange={(event) => setForm((prev) => ({ ...prev, instagram: event.target.value }))} className="mele-input mt-2" /></label>
                  <label className="mele-label">Facebook<input value={form.facebook} onChange={(event) => setForm((prev) => ({ ...prev, facebook: event.target.value }))} className="mele-input mt-2" /></label>
                  <label className="mele-label">Threads<input value={form.threads} onChange={(event) => setForm((prev) => ({ ...prev, threads: event.target.value }))} className="mele-input mt-2" /></label>
                  <label className="mele-label">YouTube<input value={form.youtube} onChange={(event) => setForm((prev) => ({ ...prev, youtube: event.target.value }))} className="mele-input mt-2" /></label>
                  <label className="mele-label">官方網站<input value={form.website} onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))} className="mele-input mt-2" /></label>
                  <label className="mele-label">老師後台備註 / 服務腳本<textarea value={form.admin_script} onChange={(event) => setForm((prev) => ({ ...prev, admin_script: event.target.value }))} className="mele-input mt-2 min-h-32 resize-y" /></label>
                  <button type="button" onClick={() => void saveProfile()} disabled={saving} className="mele-btn-primary w-full">
                    {saving ? '儲存中...' : '儲存老師設定'}
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
}
