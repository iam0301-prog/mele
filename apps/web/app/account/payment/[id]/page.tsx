'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';

interface CheckoutResponse {
  action: string;
  fields: Record<string, string>;
}

const FREE_BOOKING_TEST_MODE =
  process.env.NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE === 'true';

interface BookingSummary {
  id: string;
  status: string;
  amount_ntd: number;
  payment_provider: string | null;
  payment_id: string | null;
  scheduled_at: string;
  teacher_services: { name: string } | { name: string }[] | null;
  teachers: { display_name: string } | { display_name: string }[] | null;
}

function pickOne<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    pending: '待付款',
    paid: '已付款',
    confirmed: '已確認',
    in_progress: '進行中',
    completed: '已完成',
    cancelled_customer: '客戶取消',
    cancelled_teacher: '老師取消',
    refunded: '已退款',
    no_show: '未出席',
  };
  return status ? labels[status] ?? status : '確認中';
}

export default function PaymentPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const bookingId = params.id;
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [checkout, setCheckout] = useState<CheckoutResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push(`/account/login?return=${encodeURIComponent(`/account/payment/${bookingId}`)}`);
        return;
      }

      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .select('id, status, amount_ntd, payment_provider, payment_id, scheduled_at, teacher_services(name), teachers(display_name)')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;
      if (!cancelled) setBooking(bookingData as BookingSummary);

      if (!FREE_BOOKING_TEST_MODE && bookingData.status === 'pending' && bookingData.payment_provider !== 'free_test') {
        const { data, error: invokeError } = await supabase.functions.invoke('ecpay-checkout', {
          body: { booking_id: bookingId },
        });
        if (invokeError) throw invokeError;
        if (!cancelled) setCheckout(data as CheckoutResponse);
      }
    }

    boot()
      .catch((err: Error) => {
        if (!cancelled) {
          setError(err.message);
          toast(err.message, 'error');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId, router, toast]);

  const submitForm = () => {
    const form = document.getElementById('ecpay-form') as HTMLFormElement | null;
    form?.submit();
  };

  const service = pickOne(booking?.teacher_services ?? null);
  const teacher = pickOne(booking?.teachers ?? null);
  const isFreeTestBooking = FREE_BOOKING_TEST_MODE || booking?.payment_provider === 'free_test';

  return (
    <main className="container mx-auto max-w-2xl px-5 py-10">
      <Link href="/account/mybookings" className="text-accent text-xs tracking-widest hover:opacity-80">
        返回我的預約
      </Link>

      <header className="py-8 text-center">
        <div className="mele-subtitle">SECURE PAYMENT</div>
        <h1 className="mele-h1">確認付款</h1>
        <p className="text-sm leading-loose text-white/65">
          付款會透過綠界金流處理，平台不會保存你的信用卡資料。完成付款後，系統會等待綠界 webhook 確認，再更新預約狀態。
        </p>
      </header>

      <section className="mele-card">
        {loading && <p className="text-center text-white/60">正在準備付款資料...</p>}

        {!loading && booking && (
          <div className="payment-summary">
            <div><span>老師</span><strong>{teacher?.display_name || '命理老師'}</strong></div>
            <div><span>服務</span><strong>{service?.name || '命理諮詢'}</strong></div>
            <div><span>時間</span><strong>{new Date(booking.scheduled_at).toLocaleString('zh-TW')}</strong></div>
            <div><span>金額</span><strong>NT$ {booking.amount_ntd.toLocaleString('zh-TW')}</strong></div>
            <div><span>狀態</span><strong>{statusLabel(booking.status)}</strong></div>
          </div>
        )}

        {!loading && booking && isFreeTestBooking && (
          <div className="launch-alert launch-alert--ok mt-6">
            <strong>測試期免費</strong>
            <p>目前網站測試期不收費，這筆預約不會送出 ECPay 付款表單。</p>
          </div>
        )}

        {error && (
          <div className="launch-alert launch-alert--warning mt-6">
            <strong>付款資料建立失敗</strong>
            <p>目前無法取得綠界付款表單。請確認 ECPay Edge Function、付款 secrets 與 Supabase 權限都已設定完成。</p>
            <code>{error}</code>
          </div>
        )}

        {checkout && (
          <>
            <form id="ecpay-form" method="post" action={checkout.action}>
              {Object.entries(checkout.fields).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
            </form>
            <button type="button" onClick={submitForm} className="mele-btn-primary w-full mt-6">
              前往綠界付款
            </button>
            <p className="mt-4 text-xs leading-relaxed text-white/50">
              回到本站後若狀態仍顯示確認中，代表背景 webhook 尚未完成。通常幾分鐘內會更新，最終結果以「我的預約」顯示為準。
            </p>
          </>
        )}

        {!checkout && !loading && (
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/account/mybookings" className="mele-btn-primary">查看我的預約</Link>
            <Link href="/teachers" className="mele-btn-secondary">重新選擇老師</Link>
          </div>
        )}
      </section>
    </main>
  );
}
