'use client';

import { useState } from 'react';
import { ToolShell, ConsultCTA } from '@/components/ToolShell';
import { ToolLoading, ToolError } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { DateOnlyField } from '@/components/BirthInputs';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';

export default function MayaPage() {
  const toast = useToast();
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      const response = await calc('maya', { year, month, day });
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
      title="馬雅曆 Kin"
      subtitle="MAYAN TZOLKIN"
      description="以 260 天 Tzolkin 與 Dreamspell 系統計算你的 Kin、調性、圖騰與五方力量，協助理解天賦節奏與每日能量。"
      spec="馬雅曆"
    >
      <form onSubmit={onSubmit} className="mele-card">
        <DateOnlyField
          date={date}
          onDateChange={setDate}
          label="出生日期"
          hint="馬雅 Kin 以日期為主，不需要出生時間。"
        />

        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? '計算 Kin 中...' : '查看 Kin'}
        </button>
      </form>

      {loading && <ToolLoading label="正在計算馬雅 Kin 與圖騰..." />}
      {error && !loading && <ToolError message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="maya" result={result} />
          <ConsultCTA spec="馬雅曆" label="馬雅曆" />
        </>
      )}
    </ToolShell>
  );
}
