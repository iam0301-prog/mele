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
import { useCurrentLocale } from '@/lib/i18n/use-current-locale';
import { getToolPageCopy } from '@/lib/i18n/tool-page-copy';

export default function NumerologyPage() {
  const locale = useCurrentLocale();
  const copy = getToolPageCopy(locale, 'numerology');
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
      toast(copy.validation.dateRequired ?? 'Please choose your birth date first.', 'error');
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
    <ToolShell locale={locale} title={copy.title} subtitle={copy.subtitle} description={copy.description} spec={copy.spec}>
      <form onSubmit={onSubmit} className="mele-card" noValidate>
        <AutofillBanner locale={locale} show={autofilled} fields={copy.autofillFields} />

        <DateOnlyField locale={locale} date={date} onDateChange={setDate} label={copy.birth?.dateLabel} hint={copy.dateHint} />

        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? copy.submit.loading : copy.submit.idle}
        </button>
      </form>

      {loading && <ToolLoading locale={locale} label={copy.loadingLabel} />}
      {error && !loading && <ToolError locale={locale} message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="numerology" result={result} locale={locale} />
          <ConsultCTA locale={locale} spec={copy.spec} label={copy.title} />
        </>
      )}
    </ToolShell>
  );
}
