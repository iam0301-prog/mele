'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AutofillBanner } from '@/components/AutofillBanner';
import { BirthDateTimeFields } from '@/components/BirthInputs';
import { ToolError, ToolLoading } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { ConsultCTA, ToolShell } from '@/components/ToolShell';
import { useToast } from '@/components/ToastProvider';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { normalizeTime, useProfile } from '@/lib/use-profile';

export default function HumanDesignPage() {
  const toast = useToast();
  const profile = useProfile();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timezone, setTimezone] = useState(8);
  const [autofilled, setAutofilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile.loaded || !profile.hasData) return;
    if (date === '' && profile.birth_date) setDate(profile.birth_date);
    if (time === '' && profile.birth_time) setTime(normalizeTime(profile.birth_time));
    setAutofilled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.loaded]);

  const fillDemo = () => {
    setDate('1990-01-01');
    setTime('12:00');
    setTimezone(8);
    setError(null);
    toast('已填入測試資料，可以直接按「產生人類圖」。');
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!date || !time) {
      setError('請先填寫出生日期與出生時間；如果不知道準確時間，可以先用 12:00 測試。');
      toast('請先填寫出生日期與出生時間。', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      const response = await calc('humandesign', {
        year,
        month,
        day,
        hour,
        minute,
        timezone,
      });
      setResult(response);
    } catch (err) {
      const message = err instanceof CalcError ? err.message : (err as Error).message;
      setError(message);
      toast(message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ToolShell
      title="人類圖"
      subtitle="BodyGraph、類型、權威、人生角色與啟動閘門"
      description="輸入出生日期與時間後，系統會計算你的人類圖 BodyGraph，整理類型、內在權威、人生角色、中心、通道與啟動閘門，幫你快速看懂自己的能量運作方式。"
      spec="人類圖"
    >
      <form onSubmit={onSubmit} className="mele-card">
        <AutofillBanner show={autofilled} fields={['出生日期', '出生時間']} />

        <BirthDateTimeFields
          date={date}
          time={time}
          timezone={timezone}
          onDateChange={setDate}
          onTimeChange={setTime}
          onTimezoneChange={setTimezone}
          dateLabel="出生日期"
          timeLabel="出生時間"
          unknownTimeHint="人類圖非常依賴出生時間。如果不知道準確時間，可以先用 12:00 測試，但正式解讀建議回頭校正時間。"
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={loading} className="mele-btn-primary w-full sm:w-auto">
            {loading ? '正在產生人類圖...' : '產生人類圖'}
          </button>
          <button type="button" onClick={fillDemo} disabled={loading} className="mele-btn-secondary w-full sm:w-auto">
            填入測試資料
          </button>
        </div>
      </form>

      <section className="ritual-panel mt-6">
        <div className="ritual-kicker">視覺展示</div>
        <h2>計算完成後查看 2D BodyGraph</h2>
        <p>
          為了避免未完成的 3D 模型影響閱讀，目前先使用精修 2D BodyGraph。你會看到命盤、文字解釋與視覺展示；正式 AR 會等模型質感完成後再開放。
        </p>
        <div className="ritual-stage__actions">
          <Link href="/ar" className="mele-btn-secondary">
            查看視覺展示頁
          </Link>
        </div>
      </section>

      {loading && <ToolLoading label="正在計算中心、通道與啟動閘門..." />}
      {error && !loading && <ToolError message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="humandesign" result={result} />
          <ConsultCTA spec="人類圖" label="人類圖" />
        </>
      )}
    </ToolShell>
  );
}
