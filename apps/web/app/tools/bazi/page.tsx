'use client';

import { useEffect, useState } from 'react';
import { AutofillBanner } from '@/components/AutofillBanner';
import { BirthDateTimeFields, LongitudeField } from '@/components/BirthInputs';
import { ConsultCTA, ToolShell } from '@/components/ToolShell';
import { ToolError, ToolLoading } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { useProfile, normalizeTime } from '@/lib/use-profile';
import { useToast } from '@/components/ToastProvider';

export default function BaziPage() {
  const toast = useToast();
  const profile = useProfile();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [longitude, setLongitude] = useState(121.5654);
  const [useTrueSolar, setUseTrueSolar] = useState(true);
  const [autofilled, setAutofilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile.loaded || !profile.hasData) return;
    if (date === '' && profile.birth_date) setDate(profile.birth_date);
    if (time === '' && profile.birth_time) setTime(normalizeTime(profile.birth_time));
    if (profile.birth_lon) setLongitude(profile.birth_lon);
    setAutofilled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.loaded]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!date || !time) {
      toast('請先填寫出生日期與出生時間。', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const [year, month, day] = date.split('-').map(Number);
      const [hour, minute] = time.split(':').map(Number);
      const response = await calc('bazi', {
        year,
        month,
        day,
        hour,
        minute,
        sect: 2,
        longitude: useTrueSolar ? longitude : null,
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
      title="八字排盤"
      subtitle="四柱、五行與十神"
      description="依出生年月日時排出年柱、月柱、日柱、時柱，並整理五行分布、日主與十神脈絡，適合看性格底色與人生運勢結構。"
      spec="八字"
    >
      <form onSubmit={onSubmit} className="mele-card">
        <AutofillBanner show={autofilled} fields={['出生日期', '出生時間', '出生地']} />

        <BirthDateTimeFields
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
          unknownTimeHint="八字對出生時辰敏感。若暫時不知道精準時間，可以先用 12:00 試排，但正式解讀建議確認出生證明或戶籍資料。"
        />

        <label className="flex items-center gap-2 text-sm text-white/85 mb-5 cursor-pointer">
          <input type="checkbox" checked={useTrueSolar} onChange={(event) => setUseTrueSolar(event.target.checked)} />
          使用真太陽時修正
        </label>

        {useTrueSolar && (
          <LongitudeField longitude={longitude} onLongitudeChange={setLongitude} />
        )}

        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? '正在排八字...' : '排出八字'}
        </button>
      </form>

      {loading && <ToolLoading label="正在排出四柱與五行結構..." />}
      {error && !loading && <ToolError message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="bazi" result={result} />
          <ConsultCTA spec="八字" label="八字" />
        </>
      )}
    </ToolShell>
  );
}
