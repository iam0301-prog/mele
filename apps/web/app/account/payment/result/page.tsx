import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

interface PaymentResultSearchParams {
  booking?: string;
  RtnCode?: string;
  RtnMsg?: string;
  TradeNo?: string;
}

interface BookingResult {
  id: string;
  status: string;
  amount_ntd: number;
  scheduled_at: string;
  paid_at: string | null;
  payment_provider: string | null;
  payment_id: string | null;
  teacher_services: { name: string } | { name: string }[] | null;
  teachers: { display_name: string } | { display_name: string }[] | null;
}

function pickOne<T>(value: T | T[] | null): T | null {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function statusLabel(status?: string) {
  const labels: Record<string, string> = {
    pending_payment: '待付款',
    paid: '已付款',
    confirmed: '已確認',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  };
  return status ? labels[status] ?? status : '確認中';
}

function statusCopy(status?: string) {
  if (status === 'paid' || status === 'confirmed') {
    return {
      title: '付款已收到',
      tone: 'ok',
      body: '系統已收到付款通知，預約正在等待老師確認。請保留此頁或到「我的預約」查看最新狀態。',
    };
  }

  if (status === 'completed') {
    return {
      title: '諮詢已完成',
      tone: 'ok',
      body: '這筆諮詢已完成。若老師提供後續摘要或補充，你可以回到「我的預約」查看紀錄。',
    };
  }

  if (status === 'cancelled' || status === 'refunded') {
    return {
      title: status === 'refunded' ? '款項已退款' : '預約已取消',
      tone: 'warning',
      body: '這筆預約目前不是可進行狀態。若你已付款但狀態不一致，請聯繫平台協助核對。',
    };
  }

  return {
    title: '付款狀態確認中',
    tone: 'warning',
    body: '綠界回跳頁不等於最終付款結果，平台會以背景付款通知 webhook 為準。若幾分鐘後仍未更新，請回到「我的預約」重新整理。',
  };
}

export default async function PaymentResultPage({ searchParams }: { searchParams: PaymentResultSearchParams }) {
  const bookingId = searchParams.booking;
  const supabase = createClient();
  let booking: BookingResult | null = null;
  let loadError: string | null = null;

  if (bookingId) {
    const { data, error } = await supabase
      .from('bookings')
      .select('id, status, amount_ntd, scheduled_at, paid_at, payment_provider, payment_id, teacher_services(name), teachers(display_name)')
      .eq('id', bookingId)
      .maybeSingle();

    if (error) loadError = error.message;
    booking = (data as BookingResult | null) ?? null;
  }

  const service = pickOne(booking?.teacher_services ?? null);
  const teacher = pickOne(booking?.teachers ?? null);
  const copy = statusCopy(booking?.status);
  const ecpayMessage = searchParams.RtnMsg || (searchParams.RtnCode ? `綠界回傳代碼 ${searchParams.RtnCode}` : null);

  return (
    <main className="container mx-auto max-w-2xl px-5 py-12">
      <section className={`mele-card payment-result payment-result--${copy.tone}`}>
        <div className="mele-subtitle">PAYMENT RETURN</div>
        <h1 className="font-serif text-3xl tracking-widest text-accent mt-3">{copy.title}</h1>
        <p className="mt-5 text-sm leading-loose text-white/72">{copy.body}</p>

        {booking && (
          <div className="payment-summary mt-7">
            <div><span>預約編號</span><strong>{booking.id}</strong></div>
            <div><span>付款狀態</span><strong>{statusLabel(booking.status)}</strong></div>
            <div><span>老師</span><strong>{teacher?.display_name || '尚未取得老師資料'}</strong></div>
            <div><span>服務</span><strong>{service?.name || '命理諮詢'}</strong></div>
            <div><span>預約時間</span><strong>{new Date(booking.scheduled_at).toLocaleString('zh-TW')}</strong></div>
            <div><span>金額</span><strong>NT$ {booking.amount_ntd.toLocaleString('zh-TW')}</strong></div>
            {booking.paid_at && (
              <div><span>付款時間</span><strong>{new Date(booking.paid_at).toLocaleString('zh-TW')}</strong></div>
            )}
            {(booking.payment_provider || booking.payment_id || searchParams.TradeNo) && (
              <div>
                <span>交易資訊</span>
                <strong>{[booking.payment_provider, booking.payment_id || searchParams.TradeNo].filter(Boolean).join(' / ')}</strong>
              </div>
            )}
          </div>
        )}

        {!booking && bookingId && (
          <div className="launch-alert launch-alert--warning mt-7">
            <strong>找不到這筆預約</strong>
            <p>可能是 Supabase migration、RLS 權限或付款回傳參數尚未設定完成。請先到「我的預約」確認資料是否已建立。</p>
            {loadError && <code>{loadError}</code>}
          </div>
        )}

        {!bookingId && (
          <div className="launch-alert launch-alert--warning mt-7">
            <strong>缺少預約編號</strong>
            <p>付款回跳網址沒有帶入 booking 參數，請檢查 ecpay-checkout 的 ClientBackURL 設定。</p>
          </div>
        )}

        {ecpayMessage && (
          <p className="mt-5 rounded-lg border border-accent-dim bg-black/25 px-4 py-3 text-xs text-white/58">
            {ecpayMessage}
          </p>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/account/mybookings" className="mele-btn-primary">查看我的預約</Link>
          <Link href="/teachers" className="mele-btn-secondary">繼續找老師</Link>
          <Link href="/" className="mele-btn-secondary">回首頁</Link>
        </div>
      </section>
    </main>
  );
}
