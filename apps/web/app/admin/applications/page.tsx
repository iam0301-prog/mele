'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';
import type { TeacherApplication, TeacherStatus } from '@/types/db';

const STATUS_LABEL: Record<TeacherStatus, string> = {
  pending: '待審核',
  reviewing: '審核中',
  revision: '待補件',
  rejected: '已拒絕',
  interview: '面談中',
  contracted: '已簽約',
  active: '已上架',
  paused: '暫停接案',
  suspended: '已停權',
};

const STATUS_COLOR: Record<TeacherStatus, string> = {
  pending: 'bg-warning/20 text-warning border-warning',
  reviewing: 'bg-info/20 text-info border-info',
  revision: 'bg-warning/20 text-warning border-warning',
  rejected: 'bg-reverse/20 text-reverse border-reverse',
  interview: 'bg-info/20 text-info border-info',
  contracted: 'bg-success/20 text-success border-success',
  active: 'bg-success/20 text-success border-success',
  paused: 'bg-white/10 text-white/60 border-white/30',
  suspended: 'bg-reverse/30 text-reverse border-reverse',
};

export default function AdminApplications() {
  const toast = useToast();
  const [filter, setFilter] = useState<TeacherStatus | ''>('pending');
  const [apps, setApps] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [opened, setOpened] = useState<TeacherApplication | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    let q = supabase.from('teacher_applications').select('*').order('submitted_at', { ascending: false });
    if (filter) q = q.eq('status', filter);
    const { data, error } = await q;
    if (error) toast(error.message, 'error');
    setApps((data as TeacherApplication[]) || []);
    setLoading(false);
  }, [filter, toast]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="mele-card">
      <div className="mele-section-title">老師申請審核</div>
      <div className="mele-section-subtitle">TEACHER APPLICATIONS</div>
      <p className="mb-5 max-w-2xl text-sm leading-loose text-white/64">
        審核老師資料、專長、公開介紹與聯絡資訊。每次操作都應留下清楚備註，讓平台日後可追蹤審核決策。
      </p>

      <div className="flex flex-wrap gap-3 items-center mb-5">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as TeacherStatus | '')}
          className="px-4 py-2 bg-black/40 border border-accent-dim rounded-md text-white"
        >
          <option value="">全部狀態</option>
          {(Object.keys(STATUS_LABEL) as TeacherStatus[]).map((status) => (
            <option key={status} value={status}>{STATUS_LABEL[status]}</option>
          ))}
        </select>
        <button onClick={load} className="mele-btn-secondary !px-4 !py-2 !text-xs">重新載入</button>
      </div>

      {loading && <div className="text-center py-12 text-white/60">正在載入申請資料...</div>}
      {!loading && apps.length === 0 && (
        <div className="text-center py-16 text-white/60">
          <div className="text-4xl text-accent opacity-50 mb-3">✦</div>
          目前沒有符合條件的申請
        </div>
      )}
      {!loading && apps.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-accent text-xs tracking-widest border-b border-accent-dim">
                <th className="py-3 px-3 text-left">申請人</th>
                <th className="py-3 px-3 text-left">專長</th>
                <th className="py-3 px-3 text-left">狀態</th>
                <th className="py-3 px-3 text-left">送出日</th>
                <th className="py-3 px-3 text-left">等待</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => {
                const days = Math.max(0, Math.floor((Date.now() - new Date(app.submitted_at).getTime()) / 86400000));
                return (
                  <tr
                    key={app.id}
                    onClick={() => setOpened(app)}
                    className="border-b border-accent-dim/30 hover:bg-accent/[0.05] cursor-pointer"
                  >
                    <td className="py-3 px-3">
                      <div>{app.display_name}</div>
                      <div className="text-[11px] text-white/50">{app.legal_name}</div>
                    </td>
                    <td className="py-3 px-3">{(app.specialties || []).slice(0, 3).join('、') || '未填寫'}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[11px] border ${STATUS_COLOR[app.status]}`}>
                        {STATUS_LABEL[app.status]}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs">{new Date(app.submitted_at).toLocaleDateString('zh-TW')}</td>
                    <td className="py-3 px-3 text-xs">{days} 天</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {opened && <ApplicationModal app={opened} onClose={() => setOpened(null)} onUpdated={() => { setOpened(null); load(); }} />}
    </div>
  );
}

function ApplicationModal({ app, onClose, onUpdated }: {
  app: TeacherApplication;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const toast = useToast();
  const [notes, setNotes] = useState('');
  const [rate, setRate] = useState(20);
  const [busy, setBusy] = useState(false);

  const act = async (action: string) => {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('review_teacher_application', {
      p_application_id: app.id,
      p_action: action,
      p_notes: notes || null,
      p_commission_rate: rate / 100,
    });
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast('審核狀態已更新', 'success');
    onUpdated();
  };

  const activate = async () => {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.rpc('activate_teacher', { p_application_id: app.id });
    setBusy(false);
    if (error) return toast(error.message, 'error');
    toast('老師已上架', 'success');
    onUpdated();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-gradient-to-br from-primary to-primary-light border-2 border-accent rounded-2xl p-7 max-w-2xl w-full my-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex justify-between items-start gap-4 mb-4">
          <div>
            <div className="font-serif text-2xl text-accent">{app.display_name}</div>
            <div className="text-xs text-white/50 mt-1">{app.legal_name} / {app.email} / {app.phone}</div>
          </div>
          <span className={`px-3 py-1 rounded-md text-xs border ${STATUS_COLOR[app.status]}`}>
            {STATUS_LABEL[app.status]}
          </span>
        </div>

        <div className="space-y-4 text-sm">
          <InfoBlock title="專長">
            <div className="flex flex-wrap gap-1">
              {(app.specialties || []).map((item) => (
                <span key={item} className="text-xs px-2.5 py-0.5 border border-accent-dim rounded-full">{item}</span>
              ))}
            </div>
          </InfoBlock>

          <InfoBlock title="短介紹">{app.intro_short || '尚未填寫'}</InfoBlock>
          {app.intro_long && <InfoBlock title="完整介紹"><div className="whitespace-pre-wrap">{app.intro_long}</div></InfoBlock>}

          <InfoBlock title="公開連結">
            <div className="space-y-1 text-xs">
              {[
                ['LINE', app.line_url],
                ['Instagram', app.instagram],
                ['Threads', app.threads],
                ['Facebook', app.facebook],
                ['YouTube', app.youtube],
              ].filter(([, url]) => Boolean(url)).map(([label, url]) => (
                <div key={label}>
                  {label}: <a href={url || '#'} target="_blank" rel="noreferrer" className="text-accent-light">{url}</a>
                </div>
              ))}
            </div>
          </InfoBlock>

          <InfoBlock title="審核附件">
            <div className="flex flex-wrap gap-3 text-xs">
              {app.id_doc_front_url && <a href={app.id_doc_front_url} target="_blank" rel="noreferrer" className="text-accent-light">身分證正面</a>}
              {app.id_doc_back_url && <a href={app.id_doc_back_url} target="_blank" rel="noreferrer" className="text-accent-light">身分證反面</a>}
              {app.intro_video_url && <a href={app.intro_video_url} target="_blank" rel="noreferrer" className="text-accent-light">自介影片</a>}
            </div>
          </InfoBlock>
        </div>

        <div className="mt-5">
          <label className="mele-label">審核備註</label>
          <textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} className="mele-input" />
        </div>
        {app.status !== 'rejected' && app.status !== 'active' && (
          <div className="mt-4">
            <label className="mele-label">平台佣金比例（%）</label>
            <input type="number" step="0.5" min="0" max="50" value={rate} onChange={(event) => setRate(parseFloat(event.target.value))} className="mele-input" />
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-6">
          <button onClick={() => act('review')} disabled={busy} className="mele-btn-success !px-4 !py-2 !text-xs">進入審核</button>
          <button onClick={() => act('interview')} disabled={busy} className="mele-btn-secondary !px-4 !py-2 !text-xs">安排面談</button>
          <button onClick={() => act('request_revision')} disabled={busy} className="mele-btn-secondary !px-4 !py-2 !text-xs">要求補件</button>
          <button onClick={() => act('approve')} disabled={busy} className="mele-btn-success !px-4 !py-2 !text-xs">審核通過</button>
          <button onClick={() => act('reject')} disabled={busy} className="mele-btn-danger !px-4 !py-2 !text-xs">拒絕</button>
          {app.status === 'contracted' && (
            <button onClick={activate} disabled={busy} className="mele-btn-success !px-4 !py-2 !text-xs">正式上架</button>
          )}
        </div>

        <button onClick={onClose} className="mele-btn-secondary mt-5 !text-xs">關閉</button>
      </div>
    </div>
  );
}

function InfoBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-accent text-xs tracking-widest mb-1">{title}</div>
      <div>{children}</div>
    </div>
  );
}
