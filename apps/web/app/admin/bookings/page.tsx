'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';

interface BookingRow {
  id: string;
  scheduled_at: string;
  status: string;
  amount_ntd: number;
  teachers: { display_name: string } | { display_name: string }[] | null;
  teacher_services: { name: string } | { name: string }[] | null;
}

const STATUS_LABEL: Record<string, string> = {
  pending: '待付款',
  paid: '已付款',
  completed: '已完成',
  cancelled: '已取消',
  refunded: '已退款',
  no_show: '未出席',
};

function pickOne<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

export default function AdminBookings() {
  const toast = useToast();
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('bookings')
        .select('id, scheduled_at, status, amount_ntd, teachers(display_name), teacher_services(name)')
        .order('scheduled_at', { ascending: false })
        .limit(100);
      if (error) toast(error.message, 'error');
      setBookings((data as unknown as BookingRow[]) || []);
      setLoading(false);
    })();
  }, [toast]);

  return (
    <div className="mele-card">
      <div className="mele-section-title">預約監看</div>
      <div className="mele-section-subtitle">BOOKINGS</div>
      <p className="mb-6 max-w-2xl text-sm leading-loose text-white/64">
        這裡顯示最近 100 筆預約，用來確認付款狀態、老師服務與諮詢時間。正式上線後建議再加入狀態篩選與匯出。
      </p>

      {loading && <div className="text-center py-12 text-white/60">正在載入預約...</div>}
      {!loading && bookings.length === 0 && <div className="text-center py-12 text-white/60">目前沒有預約資料</div>}
      {!loading && bookings.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-accent text-xs tracking-widest border-b border-accent-dim">
                <th className="py-3 px-3 text-left">時間</th>
                <th className="py-3 px-3 text-left">老師</th>
                <th className="py-3 px-3 text-left">服務</th>
                <th className="py-3 px-3 text-left">狀態</th>
                <th className="py-3 px-3 text-left">金額</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const teacher = pickOne(booking.teachers);
                const service = pickOne(booking.teacher_services);
                return (
                  <tr key={booking.id} className="border-b border-accent-dim/30">
                    <td className="py-3 px-3 text-xs">{new Date(booking.scheduled_at).toLocaleString('zh-TW')}</td>
                    <td className="py-3 px-3">{teacher?.display_name ?? '未指定'}</td>
                    <td className="py-3 px-3">{service?.name ?? '命理諮詢'}</td>
                    <td className="py-3 px-3 text-xs">{STATUS_LABEL[booking.status] ?? booking.status}</td>
                    <td className="py-3 px-3">NT$ {booking.amount_ntd.toLocaleString('zh-TW')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
