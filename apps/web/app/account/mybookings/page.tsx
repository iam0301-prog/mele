'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';

type BookingTab = 'upcoming' | 'past' | 'cancelled';

interface Booking {
  id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  amount_ntd: number;
  payment_provider: string | null;
  customer_question: string | null;
  followup_question: string | null;
  teacher_id: string;
  teachers: { display_name: string; line_url: string | null; instagram: string | null } | null;
  teacher_services: { name: string } | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待付款', pending_payment: '待付款', paid: '已付款', confirmed: '已確認', in_progress: '進行中',
  completed: '已完成', cancelled_customer: '客戶取消',
  cancelled_teacher: '老師取消', refunded: '已退款', no_show: '未出席',
};

export default function MyBookingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<BookingTab>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [reviewedSet, setReviewedSet] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState<Booking | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/account/login?return=/account/mybookings'); return; }
    const now = new Date().toISOString();
    let q = supabase
      .from('bookings')
      .select('*, teachers(display_name, line_url, instagram), teacher_services(name)')
      .eq('customer_id', user.id);
    if (tab === 'upcoming') q = q.in('status', ['pending', 'pending_payment', 'paid', 'confirmed', 'in_progress']).gte('scheduled_at', now).order('scheduled_at');
    else if (tab === 'past') q = q.eq('status', 'completed').order('scheduled_at', { ascending: false });
    else q = q.in('status', ['cancelled_customer', 'cancelled_teacher', 'refunded', 'no_show']).order('scheduled_at', { ascending: false });
    const { data } = await q;
    setBookings((data as Booking[]) || []);
    // 已評價過的 booking
    const completedIds = (data || []).filter((b) => b.status === 'completed').map((b) => b.id);
    if (completedIds.length) {
      const { data: reviewed } = await supabase.from('reviews').select('booking_id').in('booking_id', completedIds);
      setReviewedSet(new Set((reviewed || []).map((r) => r.booking_id)));
    } else {
      setReviewedSet(new Set());
    }
    setLoading(false);
  }, [tab, router]);

  useEffect(() => { load(); }, [load]);

  const cancel = async (b: Booking) => {
    const hours = (new Date(b.scheduled_at).getTime() - Date.now()) / 3600000;
    const refund = hours >= 24 ? '全額退款' : hours > 0 ? '退 50%' : '無法退款';
    if (!confirm(`確定取消？預計：${refund}`)) return;
    const supabase = createClient();
    const { error } = await supabase.rpc('cancel_booking', { p_booking_id: b.id, p_reason: '客戶自行取消' });
    if (error) {
      return toast(error.message, 'error');
    }
    toast('已取消');
    load();
  };

  const askFollowup = async (b: Booking) => {
    const q = prompt('追問內容（限一次免費）：');
    if (!q) return;
    const supabase = createClient();
    const { error } = await supabase.rpc('update_booking_followup', {
      p_booking_id: b.id,
      p_question: q,
    });
    if (error) return toast(error.message, 'error');
    toast('追問已送出，老師將在 7 天內回覆');
    load();
  };

  return (
    <div className="container mx-auto max-w-3xl px-5 py-12">
      <header className="text-center pb-8">
        <h1 className="font-serif text-3xl tracking-widest mb-2">我的諮詢</h1>
        <div className="mele-subtitle">MY BOOKINGS</div>
      </header>

      <div className="mele-card">
        <div className="flex border-b border-accent-dim mb-5">
          {(['upcoming', 'past', 'cancelled'] as BookingTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm tracking-widest transition-colors
                ${tab === t ? 'text-accent border-b-2 border-accent' : 'text-white/60 hover:text-white'}`}
            >
              {t === 'upcoming' ? '即將諮詢' : t === 'past' ? '已完成' : '已取消'}
            </button>
          ))}
        </div>

        {loading && <div className="text-center text-white/60 py-8">載入中…</div>}
        {!loading && bookings.length === 0 && (
          <div className="text-center py-12 text-white/60">
            <div className="text-4xl text-accent opacity-50 mb-3">○</div>
            沒有紀錄
          </div>
        )}
        {!loading && bookings.map((b) => (
          <div key={b.id} className="border border-accent-dim rounded-xl p-5 mb-3">
            <div className="flex justify-between items-start gap-4 flex-wrap">
              <div className="flex-1 min-w-[220px]">
                <div className="font-serif text-base text-accent">
                  {new Date(b.scheduled_at).toLocaleString('zh-TW', { dateStyle: 'long', timeStyle: 'short' })}
                </div>
                <div className="text-xs text-white/70 mt-1">
                  老師：{b.teachers?.display_name ?? '?'} · {b.teacher_services?.name ?? ''} ({b.duration_minutes} 分)
                </div>
                <div className="text-xs text-white/70 mt-1">
                  狀態：<span className={`px-2 py-0.5 rounded-md text-[10px] ${
                    b.status === 'completed' ? 'bg-success/30 text-success' :
                    b.status.includes('cancel') ? 'bg-reverse/30 text-reverse' :
                    'bg-info/30 text-info'
                  }`}>{STATUS_LABEL[b.status] || b.status}</span>
                  {b.payment_provider === 'free_test' && (
                    <span className="ml-2 rounded-md bg-success/20 px-2 py-0.5 text-[10px] text-success">測試期免費</span>
                  )}
                </div>
                {b.customer_question && (
                  <div className="text-xs text-white/60 mt-2">問題：{b.customer_question.slice(0, 80)}{b.customer_question.length > 80 ? '…' : ''}</div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {['pending', 'pending_payment'].includes(b.status) && b.payment_provider !== 'free_test' && (
                  <Link href={`/account/payment/${b.id}`} className="mele-btn-primary !px-4 !py-2 !text-xs">前往付款</Link>
                )}
                {(b.status === 'paid' || b.status === 'confirmed') && (
                  <>
                    {b.teachers?.line_url && <a href={b.teachers.line_url} target="_blank" rel="noreferrer" className="mele-btn-secondary !px-4 !py-2 !text-xs">LINE</a>}
                    <button onClick={() => cancel(b)} className="mele-btn-secondary !px-4 !py-2 !text-xs">取消</button>
                  </>
                )}
                {b.status === 'completed' && !reviewedSet.has(b.id) && (
                  <button onClick={() => setReviewModal(b)} className="mele-btn-primary !px-4 !py-2 !text-xs">評價</button>
                )}
                {b.status === 'completed' && !b.followup_question && (
                  <button onClick={() => askFollowup(b)} className="mele-btn-secondary !px-4 !py-2 !text-xs">免費追問</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-6 space-x-4">
        <Link href="/account/charts" className="text-accent text-xs tracking-widest hover:opacity-80">→ 我的排盤紀錄</Link>
        <Link href="/account/profile" className="text-accent text-xs tracking-widest hover:opacity-80">→ 個人資料</Link>
        <Link href="/teachers" className="text-accent text-xs tracking-widest hover:opacity-80">→ 找老師</Link>
      </div>

      {reviewModal && (
        <ReviewModal booking={reviewModal} onClose={() => setReviewModal(null)} onDone={() => { setReviewModal(null); load(); }} />
      )}
    </div>
  );
}

function ReviewModal({ booking, onClose, onDone }: { booking: Booking; onClose: () => void; onDone: () => void }) {
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [anon, setAnon] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setSubmitting(false);
    const { error } = await supabase.from('reviews').insert({
      booking_id: booking.id,
      customer_id: user.id,
      teacher_id: booking.teacher_id,
      rating, comment: comment.trim() || null, is_anonymous: anon,
    });
    setSubmitting(false);
    if (error) return toast(error.message, 'error');
    toast('評價成功 ✦');
    onDone();
  };

  return (
    <div className="fixed inset-0 z-[300] bg-black/85 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gradient-to-br from-primary to-primary-light border-2 border-accent rounded-2xl p-7 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
        <div className="mele-section-title">為這次諮詢評價</div>
        <div className="mele-section-subtitle">REVIEW</div>
        <div className="mb-4">
          <div className="mele-label">評分</div>
          <div className="flex gap-1 text-3xl">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)} className={n <= rating ? 'text-yellow-400' : 'text-white/30'}>★</button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="mele-label">評論（選填）</label>
          <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className="mele-input" placeholder="諮詢過程、老師印象、收穫..." />
        </div>
        <label className="flex items-center gap-2 text-sm text-white/85 mb-5 cursor-pointer">
          <input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
          匿名評價（你的名字不會公開）
        </label>
        <div className="flex gap-3">
          <button onClick={submit} disabled={submitting} className="mele-btn-primary flex-1">
            {submitting ? '送出中…' : '送出'}
          </button>
          <button onClick={onClose} className="mele-btn-secondary">取消</button>
        </div>
      </div>
    </div>
  );
}
