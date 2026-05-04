'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';

type RequestKind = 'export' | 'correction' | 'delete' | 'stop_processing';

const REQUESTS: Array<{ value: RequestKind; label: string; description: string }> = [
  { value: 'export', label: '匯出我的資料', description: '索取帳號、命盤、每日紀錄與預約摘要。' },
  { value: 'correction', label: '更正資料', description: '請客服協助確認或更正無法自行修改的資料。' },
  { value: 'delete', label: '刪除帳號與資料', description: '刪除或匿名化非必要資料；交易與爭議紀錄依法保留。' },
  { value: 'stop_processing', label: '停止特定使用', description: '停止行銷、推播或非必要資料處理。' },
];

const SUBJECT_BY_KIND: Record<RequestKind, string> = {
  export: '個資權利請求：匯出資料',
  correction: '個資權利請求：更正資料',
  delete: '個資權利請求：刪除帳號與資料',
  stop_processing: '個資權利請求：停止特定使用',
};

export default function AccountPrivacyPage() {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [kind, setKind] = useState<RequestKind>('export');
  const [details, setDetails] = useState('');

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/account/login?return=/account/privacy');
        return;
      }
      setEmail(user.email ?? '');
      setLoading(false);
    })();
  }, [router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      router.push('/account/login?return=/account/privacy');
      return;
    }

    const body = [
      `請求類型：${REQUESTS.find((item) => item.value === kind)?.label}`,
      `帳號 Email：${email || user.email || '未提供'}`,
      `補充說明：${details || '無'}`,
      '',
      'SLA：請於 7 個工作天內回覆，30 天內完成一般資料請求；若涉及交易、稅務或爭議紀錄，請說明保留原因。',
    ].join('\n');

    const { error } = await supabase.rpc('create_support_thread', {
      p_category: 'other',
      p_subject: SUBJECT_BY_KIND[kind],
      p_body: body,
      p_booking_id: null,
    });

    setSubmitting(false);
    if (error) return toast(error.message, 'error');
    toast('資料權利請求已送出，客服會依序處理。', 'success');
    setDetails('');
  };

  if (loading) {
    return <div className="container mx-auto max-w-3xl px-5 py-16 text-center text-white/60">載入中...</div>;
  }

  return (
    <div className="container mx-auto max-w-3xl px-5 py-12">
      <header className="pb-8 text-center">
        <h1 className="mb-2 font-serif text-3xl tracking-widest">資料權利中心</h1>
        <div className="mele-subtitle">PRIVACY REQUESTS</div>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          你可以在這裡提出資料匯出、更正、停止使用或刪除請求。交易、退款、刷退、稅務與爭議紀錄可能依法保留。
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-[1fr_0.85fr]">
        <form onSubmit={submit} className="mele-card space-y-5">
          <div>
            <label className="mele-label">聯絡 Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mele-input"
              required
            />
          </div>

          <div>
            <label className="mele-label">請求類型</label>
            <div className="privacy-request-options">
              {REQUESTS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setKind(item.value)}
                  className={kind === item.value ? 'is-selected' : ''}
                >
                  <strong>{item.label}</strong>
                  <span>{item.description}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mele-label">補充說明</label>
            <textarea
              rows={5}
              value={details}
              onChange={(event) => setDetails(event.target.value)}
              className="mele-input"
              placeholder="例如：請刪除我的每日抽卡紀錄；或請匯出我目前保存的命盤資料。"
            />
          </div>

          <button type="submit" disabled={submitting} className="mele-btn-primary w-full">
            {submitting ? '送出中...' : '送出資料權利請求'}
          </button>
        </form>

        <aside className="mele-card h-fit space-y-4 text-sm leading-loose text-white/68">
          <h2 className="font-serif text-2xl text-accent">處理原則</h2>
          <p>一般請求會在 7 個工作天內回覆，30 天內完成或說明原因。</p>
          <p>付款、退款、刷退、爭議、稅務或安全稽核紀錄，可能需要依法保留。</p>
          <p>
            詳細說明請看
            <Link href="/legal/privacy" className="mx-1 text-accent-light">隱私權政策</Link>
            與
            <Link href="/legal/tos" className="mx-1 text-accent-light">服務條款</Link>
            。
          </p>
        </aside>
      </div>
    </div>
  );
}
