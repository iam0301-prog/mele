'use client';

import { useRef, useState } from 'react';
import { ToolShell, ConsultCTA } from '@/components/ToolShell';
import { ToolLoading, ToolError } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { DateOnlyField } from '@/components/BirthInputs';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useCurrentLocale } from '@/lib/i18n/use-current-locale';
import { getToolPageCopy } from '@/lib/i18n/tool-page-copy';

export default function MayaPage() {
  const locale = useCurrentLocale();
  const copy = getToolPageCopy(locale, 'maya');
  const toast = useToast();
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const submittingRef = useRef(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading || submittingRef.current) return;
    if (!date) {
      toast(copy.validation.dateRequired ?? 'Please choose your birth date first.', 'error');
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const [year, month, day] = date.split('-').map(Number);
      const response = await calc('maya', { year, month, day }, locale);
      setResult(response);
    } catch (err) {
      const message = err instanceof CalcError ? err.message : (err as Error).message;
      setError(message);
      toast(message, 'error');
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <ToolShell tool="maya" locale={locale} title={copy.title} subtitle={copy.subtitle} description={copy.description} spec={copy.spec} themed>
      <form onSubmit={onSubmit} className="mele-card" noValidate>
        <DateOnlyField locale={locale} date={date} onDateChange={setDate} label={copy.birth?.dateLabel} hint={copy.dateHint} />

        <button type="submit" disabled={loading} aria-disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? copy.submit.loading : copy.submit.idle}
        </button>
      </form>

      {loading && <ToolLoading tool="maya" locale={locale} label={copy.loadingLabel} />}
      {error && !loading && <ToolError locale={locale} message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="maya" result={result} locale={locale} />
          <ConsultCTA locale={locale} spec={copy.spec} label={copy.title} />
        </>
      )}
    </ToolShell>
  );
}
