'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';

interface ReviewRow {
  id: string;
  rating: number;
  comment: string | null;
  is_anonymous: boolean;
  is_visible: boolean;
  created_at: string;
  teachers: { display_name: string } | null;
}

export default function AdminReviews() {
  const toast = useToast();
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase
      .from('reviews')
      .select('id, rating, comment, is_anonymous, is_visible, created_at, teachers(display_name)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) toast(error.message, 'error');
    setReviews((data as unknown as ReviewRow[]) || []);
    setLoading(false);
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const toggleVisibility = async (id: string, current: boolean) => {
    const supabase = createClient();
    const { error } = await supabase.from('reviews').update({ is_visible: !current }).eq('id', id);
    if (error) return toast(error.message, 'error');
    toast(current ? '已隱藏' : '已顯示');
    load();
  };

  return (
    <div className="mele-card">
      <div className="mele-section-title">評價管理</div>
      <div className="mele-section-subtitle">REVIEWS</div>

      {loading && <div className="text-center py-12 text-white/60">載入中…</div>}
      {!loading && reviews.length === 0 && <div className="text-center py-12 text-white/60">尚無評價</div>}
      {!loading && reviews.map((r) => (
        <div key={r.id} className={`border-b border-accent-dim/30 py-4 ${!r.is_visible ? 'opacity-50' : ''}`}>
          <div className="flex justify-between items-start gap-4 flex-wrap">
            <div className="flex-1">
              <div className="flex gap-3 items-center">
                <span className="text-accent">{r.teachers?.display_name ?? '—'}</span>
                <span className="text-yellow-400">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                {r.is_anonymous && <span className="text-[11px] text-white/50">(匿名)</span>}
                {!r.is_visible && <span className="text-[11px] text-reverse">[已隱藏]</span>}
              </div>
              <div className="mt-2 text-sm">{r.comment ?? '(無評論)'}</div>
              <div className="text-[11px] text-white/40 mt-1">{new Date(r.created_at).toLocaleDateString('zh-TW')}</div>
            </div>
            <button
              onClick={() => toggleVisibility(r.id, r.is_visible)}
              className="mele-btn-secondary !px-3 !py-1.5 !text-xs"
            >
              {r.is_visible ? '隱藏' : '顯示'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
