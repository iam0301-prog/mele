'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';
import type { Teacher, TeacherStatus } from '@/types/db';

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

export default function AdminTeachers() {
  const toast = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.from('teachers').select('*').order('approved_at', { ascending: false });
    if (error) toast(error.message, 'error');
    setTeachers((data as Teacher[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const suspend = async (id: string) => {
    const reason = window.prompt('請輸入停權原因，這會留下後台紀錄：');
    if (!reason) return;
    const supabase = createClient();
    const { error } = await supabase.rpc('suspend_teacher', { p_teacher_id: id, p_reason: reason });
    if (error) return toast(error.message, 'error');
    toast('已停權老師', 'success');
    load();
  };

  return (
    <div className="mele-card">
      <div className="mele-section-title">老師管理</div>
      <div className="mele-section-subtitle">TEACHERS</div>
      <p className="mb-6 max-w-2xl text-sm leading-loose text-white/64">
        管理已通過審核的老師、查看評分與案件量。正式上線後可再加入搜尋、專長篩選與佣金批次調整。
      </p>

      {loading && <div className="text-center py-12 text-white/60">正在載入老師資料...</div>}
      {!loading && teachers.length === 0 && <div className="text-center py-12 text-white/60">目前沒有老師資料</div>}
      {!loading && teachers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-accent text-xs tracking-widest border-b border-accent-dim">
                <th className="py-3 px-3 text-left">名稱</th>
                <th className="py-3 px-3 text-left">專長</th>
                <th className="py-3 px-3 text-left">狀態</th>
                <th className="py-3 px-3 text-left">評分</th>
                <th className="py-3 px-3 text-left">案件數</th>
                <th className="py-3 px-3 text-left">佣金</th>
                <th className="py-3 px-3 text-left">操作</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((teacher) => (
                <tr key={teacher.id} className="border-b border-accent-dim/30">
                  <td className="py-3 px-3">{teacher.display_name}</td>
                  <td className="py-3 px-3">{(teacher.specialties || []).slice(0, 3).join('、') || '未設定'}</td>
                  <td className="py-3 px-3 text-xs">{STATUS_LABEL[teacher.status]}</td>
                  <td className="py-3 px-3">{Number(teacher.rating || 0).toFixed(1)} ({teacher.total_reviews})</td>
                  <td className="py-3 px-3">{teacher.cases_count}</td>
                  <td className="py-3 px-3">{(teacher.commission_rate * 100).toFixed(1)}%</td>
                  <td className="py-3 px-3">
                    {teacher.status === 'active' && (
                      <button onClick={() => suspend(teacher.id)} className="mele-btn-danger !px-3 !py-1 !text-[11px]">
                        停權
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
