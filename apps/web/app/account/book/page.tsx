'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ToastProvider';

type Gender = 'female' | 'male';

interface Availability {
  day_of_week: number | null;
  start_time: string;
  end_time: string;
}

interface BookedSlot {
  scheduled_at: string;
  duration_minutes: number;
}

interface TeacherLite {
  display_name: string;
  line_url: string | null;
}

interface ServiceLite {
  name: string;
  description: string | null;
  duration_minutes: number;
  price_ntd: number;
}

const CHART_TOOLS = [
  { value: '', label: '不附加命盤' },
  { value: 'bazi', label: '八字' },
  { value: 'ziwei', label: '紫微斗數' },
  { value: 'numerology', label: '生命靈數' },
  { value: 'astro', label: '西洋占星' },
  { value: 'humandesign', label: '人類圖' },
  { value: 'maya', label: '馬雅曆' },
];

const FREE_BOOKING_TEST_MODE =
  process.env.NEXT_PUBLIC_ENABLE_FREE_BOOKING_TEST_MODE === 'true';

function BookFormInner() {
  const router = useRouter();
  const search = useSearchParams();
  const toast = useToast();
  const teacherId = search.get('teacher');
  const serviceId = search.get('service');

  const [step, setStep] = useState(1);
  const [teacher, setTeacher] = useState<TeacherLite | null>(null);
  const [service, setService] = useState<ServiceLite | null>(null);
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [bookedSet, setBookedSet] = useState<Set<number>>(new Set());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [question, setQuestion] = useState('');
  const [chartTool, setChartTool] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('');
  const [gender, setGender] = useState<Gender>('female');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push(`/account/login?return=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      if (!teacherId || !serviceId) return;

      const [teacherResult, serviceResult, availabilityResult, bookingResult] = await Promise.all([
        supabase.from('teachers').select('display_name, line_url').eq('id', teacherId).single(),
        supabase.from('teacher_services').select('name, description, duration_minutes, price_ntd').eq('id', serviceId).single(),
        supabase.from('teacher_availability').select('day_of_week, start_time, end_time').eq('teacher_id', teacherId).eq('is_blocked', false),
        supabase.from('bookings')
          .select('scheduled_at, duration_minutes')
          .eq('teacher_id', teacherId)
          .in('status', ['pending', 'pending_payment', 'paid', 'confirmed', 'in_progress'])
          .gte('scheduled_at', new Date().toISOString()),
      ]);

      if (cancelled) return;
      if (teacherResult.data) setTeacher(teacherResult.data as TeacherLite);
      if (serviceResult.data) setService(serviceResult.data as ServiceLite);
      if (availabilityResult.data) setAvailability(availabilityResult.data as Availability[]);
      if (bookingResult.data) {
        setBookedSet(new Set((bookingResult.data as BookedSlot[]).map((slot) => new Date(slot.scheduled_at).getTime())));
      }
    }

    load().catch((err: Error) => toast(err.message, 'error'));
    return () => {
      cancelled = true;
    };
  }, [teacherId, serviceId, router, toast]);

  const slots = useMemo(() => {
    if (!service || !availability.length) return [] as { time: Date; disabled: boolean }[];
    const out: { time: Date; disabled: boolean }[] = [];
    const now = new Date();
    for (let d = 1; d <= 14; d += 1) {
      const day = new Date(now);
      day.setDate(now.getDate() + d);
      const dayOfWeek = day.getDay();
      const windows = availability.filter((item) => item.day_of_week === dayOfWeek);
      for (const window of windows) {
        const [startHour, startMinute] = window.start_time.split(':').map(Number);
        const [endHour, endMinute] = window.end_time.split(':').map(Number);
        const start = new Date(day);
        start.setHours(startHour, startMinute, 0, 0);
        const end = new Date(day);
        end.setHours(endHour, endMinute, 0, 0);
        for (let cursor = new Date(start); cursor.getTime() + service.duration_minutes * 60000 <= end.getTime(); cursor = new Date(cursor.getTime() + 30 * 60000)) {
          out.push({ time: new Date(cursor), disabled: bookedSet.has(cursor.getTime()) });
        }
      }
    }
    return out;
  }, [availability, bookedSet, service]);

  const groupedSlots = useMemo(() => {
    const groups: Record<string, typeof slots> = {};
    for (const slot of slots) {
      const key = slot.time.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric', weekday: 'short' });
      (groups[key] ??= []).push(slot);
    }
    return groups;
  }, [slots]);

  const submit = async () => {
    if (!selectedSlot || !question.trim() || !teacherId || !serviceId || !service) {
      toast('請先選擇時段並填寫主要問題', 'error');
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSubmitting(false);
      router.push(`/account/login?return=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }

    let chartData: Record<string, unknown> | null = null;
    if (chartTool && birthDate) {
      chartData = {
        tool: chartTool,
        birthDate,
        birthTime: birthTime || '12:00',
        gender: chartTool === 'ziwei' ? gender : undefined,
      };
    }

    const { data: bookingId, error } = await supabase.rpc('create_booking_request', {
      p_teacher_id: teacherId,
      p_service_id: serviceId,
      p_scheduled_at: selectedSlot,
      p_customer_question: question,
      p_chart_tool: chartTool || null,
      p_chart_data: chartData,
      p_free_test_mode: FREE_BOOKING_TEST_MODE,
    });

    setSubmitting(false);
    if (error) {
      toast(error.message, 'error');
      return;
    }

    if (!bookingId) {
      toast('預約建立失敗，請稍後再試。', 'error');
      return;
    }

    if (FREE_BOOKING_TEST_MODE) {
      toast('測試期免費預約已建立，不會收費。');
      router.push('/account/mybookings');
      return;
    }

    toast('預約已建立，正在前往付款頁。');
    router.push(`/account/payment/${bookingId}`);
  };

  if (!teacherId || !serviceId) {
    return (
      <div className="container mx-auto px-5 py-16 text-center text-white/60">
        缺少老師或服務參數。請回到老師媒合中心重新選擇。
      </div>
    );
  }

  if (!teacher || !service) {
    return <div className="container mx-auto px-5 py-16 text-center text-white/60">正在讀取預約資料...</div>;
  }

  return (
    <main className="container mx-auto max-w-2xl px-5 py-8">
      <header className="pb-6 text-center">
        <h1 className="font-serif text-3xl tracking-widest">預約諮詢</h1>
        <div className="mele-subtitle mt-2">BOOK A SESSION</div>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/68">
          預約會分成四步：確認服務、選擇時段、填寫問題、確認付款。付款完成後，老師會依你的問題與附加命盤準備諮詢。
        </p>
      </header>

      <section className="mele-card">
        <Steps current={step} />

        {step === 1 && (
          <div>
            <div className="mb-5 rounded-xl bg-black/25 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-mele-gold font-serif text-xl text-primary">
                  {teacher.display_name.charAt(0)}
                </div>
                <div>
                  <div className="font-serif text-lg text-accent">{teacher.display_name}</div>
                  <div className="text-xs text-white/55">你即將預約這位老師的服務</div>
                </div>
              </div>
            </div>
            <div className="rounded-xl border border-accent-dim p-5">
              <div className="text-lg">{service.name}</div>
              <div className="mt-1 text-xs text-white/60">{service.duration_minutes} 分鐘 · NT$ {service.price_ntd.toLocaleString('zh-TW')}</div>
              {FREE_BOOKING_TEST_MODE && (
                <div className="mt-3 rounded-lg border border-success/30 bg-success/10 p-3 text-xs leading-relaxed text-success">
                  測試期免費：你可以先完整測試預約流程，不會進入付款頁，也不會產生實際收費。
                </div>
              )}
              {service.description && <div className="mt-3 text-sm leading-relaxed">{service.description}</div>}
              <div className="mt-4 rounded-lg bg-white/[0.04] p-3 text-xs leading-relaxed text-white/65">
                建議先確認這項服務是否符合你的問題類型。若需要臨時補充背景，付款後仍可在「我的諮詢」查看與管理。
              </div>
            </div>
            <button type="button" onClick={() => setStep(2)} className="mele-btn-primary mt-6">下一步</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mele-section-title">選擇時段</div>
            <div className="mele-section-subtitle">PICK A TIME</div>
            <p className="mb-5 text-sm leading-relaxed text-white/68">
              下方只顯示老師近期開放且尚未被預約的時段。正式付款前，系統仍會以資料庫狀態再次確認，避免多人同時搶同一格。
            </p>
            {slots.length === 0 ? (
              <div className="py-10 text-center text-white/60">
                <div className="mb-3 text-3xl text-accent opacity-50">MELE</div>
                老師近期無可預約時段
                {teacher.line_url && <div className="mt-3"><a href={teacher.line_url} target="_blank" rel="noreferrer" className="mele-btn-secondary">LINE 詢問</a></div>}
              </div>
            ) : (
              <div>
                {Object.entries(groupedSlots).map(([date, list]) => (
                  <div key={date} className="mb-4">
                    <div className="mb-2 text-xs tracking-widest text-accent">{date}</div>
                    <div className="flex flex-wrap gap-2">
                      {list.map((slot) => {
                        const iso = slot.time.toISOString();
                        const selected = selectedSlot === iso;
                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled={slot.disabled}
                            onClick={() => setSelectedSlot(iso)}
                            className={`rounded-md border px-3 py-1.5 text-sm transition-all ${
                              slot.disabled
                                ? 'cursor-not-allowed border-white/10 opacity-30'
                                : selected
                                  ? 'border-accent bg-accent text-primary font-semibold'
                                  : 'border-accent-dim hover:border-accent'
                            }`}
                          >
                            {slot.time.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="mele-btn-secondary">上一步</button>
              <button type="button" onClick={() => setStep(3)} disabled={!selectedSlot} className="mele-btn-primary">下一步</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="mele-section-title">告訴老師你的狀況</div>
            <div className="mele-section-subtitle">YOUR QUESTION</div>
            <div className="mb-5">
              <label className="mele-label">主要問題 *</label>
              <textarea
                rows={4}
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="mele-input"
                maxLength={500}
                placeholder="例如：目前的職業方向適合我嗎？最近感情卡住的原因？"
              />
              <div className="mt-2 text-right text-[11px] text-white/45">{question.length}/500</div>
            </div>
            <div className="mb-5 rounded-xl border border-accent-dim bg-accent/[0.08] p-4">
              <div className="mb-3 text-xs text-accent">選填：附加簡易命盤資料，讓老師更快掌握背景</div>
              <p className="mb-4 text-xs leading-relaxed text-white/65">
                若你願意提供出生資料，老師能更快掌握背景。這些資料會依隱私權政策保存，之後也可在個人檔案更新。
              </p>
              <select value={chartTool} onChange={(event) => setChartTool(event.target.value)} className="mele-input mb-4">
                {CHART_TOOLS.map((tool) => <option key={tool.value} value={tool.value}>{tool.label}</option>)}
              </select>
              {chartTool && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mele-label">出生日期</label>
                      <input type="date" value={birthDate} onChange={(event) => setBirthDate(event.target.value)} className="mele-input" />
                    </div>
                    <div>
                      <label className="mele-label">出生時間</label>
                      <input type="time" value={birthTime} onChange={(event) => setBirthTime(event.target.value)} className="mele-input" />
                    </div>
                  </div>
                  {chartTool === 'ziwei' && (
                    <div>
                      <label className="mele-label">生理性別</label>
                      <select value={gender} onChange={(event) => setGender(event.target.value as Gender)} className="mele-input">
                        <option value="female">女</option>
                        <option value="male">男</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)} className="mele-btn-secondary">上一步</button>
              <button type="button" onClick={() => setStep(4)} className="mele-btn-primary">下一步</button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="mele-section-title">確認預約</div>
            <div className="mele-section-subtitle">REVIEW & PAY</div>
            <div className="mb-5 rounded-xl bg-black/25 p-5 text-sm leading-loose">
              <div><strong className="text-accent">老師</strong>　{teacher.display_name}</div>
              <div><strong className="text-accent">服務</strong>　{service.name}（{service.duration_minutes} 分鐘）</div>
              <div><strong className="text-accent">時間</strong>　{selectedSlot ? new Date(selectedSlot).toLocaleString('zh-TW') : '尚未選擇'}</div>
              <div><strong className="text-accent">問題</strong>　{question || '尚未填寫'}</div>
              {chartTool && <div><strong className="text-accent">附加命盤</strong>　{CHART_TOOLS.find((tool) => tool.value === chartTool)?.label}</div>}
              <div className="mt-4 border-t border-accent-dim pt-4 text-lg">
                <strong className="text-accent">金額</strong>　
                <span className="font-serif text-2xl text-accent-light">NT$ {service.price_ntd.toLocaleString('zh-TW')}</span>
                {FREE_BOOKING_TEST_MODE && <span className="ml-3 align-middle text-xs text-success">測試期免費</span>}
              </div>
            </div>
            <div className="mb-5 rounded-xl border border-accent-dim bg-white/[0.035] p-4 text-xs leading-relaxed text-white/68">
              {FREE_BOOKING_TEST_MODE
                ? '測試期免費，確認後會直接建立預約並回到「我的諮詢」，不會前往付款頁。'
                : '付款後可在「我的諮詢」查看狀態、聯繫老師、取消預約或在完成後留下評價。若付款頁沒有自動開啟，請回到我的諮詢點選「前往付款」。'}
            </div>
            <div className="mb-5 rounded-xl bg-black/30 p-4 text-xs leading-relaxed">
              <strong className="text-accent">取消政策</strong><br />
              諮詢前 24 小時取消：全額退款<br />
              諮詢前 24 小時內取消：退 50%<br />
              諮詢開始後不予退款<br />
              老師取消：100% 退款
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(3)} className="mele-btn-secondary">上一步</button>
              <button type="button" onClick={submit} disabled={submitting} className="mele-btn-primary">
                {submitting ? '建立預約中...' : FREE_BOOKING_TEST_MODE ? '確認免費預約' : '確認並前往付款'}
              </button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Steps({ current }: { current: number }) {
  const labels = ['確認服務', '選擇時段', '填寫問題', '確認付款'];
  return (
    <div className="relative mb-7 flex justify-between">
      <div className="absolute left-0 right-0 top-3.5 z-0 h-0.5 bg-accent-dim" />
      {labels.map((label, index) => {
        const number = index + 1;
        const done = current > number;
        const active = current === number;
        return (
          <div key={label} className="relative z-10 flex-1 text-center">
            <div className={`inline-flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs ${
              done
                ? 'border-accent bg-accent text-primary'
                : active
                  ? 'border-accent bg-primary text-accent'
                  : 'border-accent-dim bg-primary text-white/50'
            }`}
            >
              {number}
            </div>
            <div className={`mt-1.5 text-[11px] tracking-wide ${active || done ? 'text-accent' : 'text-white/60'}`}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-5 py-16 text-center text-white/60">正在讀取預約資料...</div>}>
      <BookFormInner />
    </Suspense>
  );
}
