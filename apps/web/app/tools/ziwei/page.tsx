'use client';

import { useEffect, useState } from 'react';
import { ToolShell, ConsultCTA } from '@/components/ToolShell';
import { ToolLoading, ToolError } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { AutofillBanner } from '@/components/AutofillBanner';
import { BirthDateTimeFields } from '@/components/BirthInputs';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useProfile, normalizeTime } from '@/lib/use-profile';

type Gender = '男' | '女';

function normalizeGender(value: string | null): Gender | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === '男' || normalized === 'male' || normalized === 'm') return '男';
  if (normalized === '女' || normalized === 'female' || normalized === 'f') return '女';
  return null;
}

export default function ZiweiPage() {
  const toast = useToast();
  const profile = useProfile();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [gender, setGender] = useState<Gender>('女');
  const [autofilled, setAutofilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile.loaded || !profile.hasData) return;
    if (date === '' && profile.birth_date) setDate(profile.birth_date);
    if (time === '' && profile.birth_time) setTime(normalizeTime(profile.birth_time));
    const profileGender = normalizeGender(profile.gender);
    if (profileGender) setGender(profileGender);
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
      const response = await calc('ziwei', { year, month, day, hour, minute, gender });
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
      title="紫微斗數"
      subtitle="ZIWEI DOUSHU"
      description="依出生年月日時排出十二宮、主星與命宮結構，適合觀察人生主軸、事業、人際、感情與長期運勢配置。"
      spec="紫微斗數"
    >
      <form onSubmit={onSubmit} className="mele-card">
        <AutofillBanner show={autofilled} fields={['出生日期', '出生時間', '性別']} />

        <BirthDateTimeFields
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
          dateLabel="出生日期"
          unknownTimeHint="紫微斗數會依出生時辰安命宮與排星曜。若暫時不知道精準時間，可以先用 12:00 試排，但正式解讀建議確認出生時間。"
        />

        <div className="mb-5">
          <label className="mele-label">性別 *</label>
          <select value={gender} onChange={(event) => setGender(event.target.value as Gender)} className="mele-input">
            <option value="女">女</option>
            <option value="男">男</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? '排盤中...' : '開始排盤'}
        </button>
      </form>

      {loading && <ToolLoading label="正在排出十二宮與主星..." />}
      {error && !loading && <ToolError message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="ziwei" result={result} />
          <ConsultCTA spec="紫微斗數" label="紫微斗數" />
        </>
      )}
    </ToolShell>
  );
}
