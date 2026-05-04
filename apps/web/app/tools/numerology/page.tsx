'use client';

import { useEffect, useState } from 'react';
import { ToolShell, ConsultCTA } from '@/components/ToolShell';
import { ToolLoading, ToolError } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { AutofillBanner } from '@/components/AutofillBanner';
import { DateOnlyField } from '@/components/BirthInputs';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useProfile } from '@/lib/use-profile';

export default function NumerologyPage() {
  const toast = useToast();
  const profile = useProfile();
  const [date, setDate] = useState('');
  const [autofilled, setAutofilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile.loaded || !profile.hasData) return;
    if (date === '' && profile.birth_date) {
      setDate(profile.birth_date);
      setAutofilled(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.loaded]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!date) {
      toast('請先選擇出生日期。', 'error');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const [year, month, day] = date.split('-').map(Number);
      const response = await calc('numerology', { year, month, day });
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
      title="生命靈數"
      subtitle="LIFE PATH NUMBER"
      description="用出生日期計算生命靈數、生日數與主數 11 / 22 / 33，快速看見你的天賦傾向、人生課題與行動風格。"
      spec="生命靈數"
    >
      <form onSubmit={onSubmit} className="mele-card" noValidate>
        <AutofillBanner show={autofilled} fields={['出生日期']} />

        <DateOnlyField
          date={date}
          onDateChange={setDate}
          label="出生日期"
          hint="生命靈數只需要出生日期，不需要出生時間。"
        />

        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? '計算中...' : '開始解讀'}
        </button>
      </form>

      {loading && <ToolLoading label="正在計算生命靈數..." />}
      {error && !loading && <ToolError message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="numerology" result={result} />
          <ConsultCTA spec="生命靈數" label="生命靈數" />
        </>
      )}
    </ToolShell>
  );
}
