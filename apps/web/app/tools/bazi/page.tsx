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
import { useCurrentLocale } from '@/lib/i18n/use-current-locale';
import { getToolPageCopy } from '@/lib/i18n/tool-page-copy';

export default function BaziPage() {
  const locale = useCurrentLocale();
  const copy = getToolPageCopy(locale, 'bazi');
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
      toast(copy.validation.dateTimeRequired ?? 'Please enter both birth date and time.', 'error');
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
    <ToolShell locale={locale} title={copy.title} subtitle={copy.subtitle} description={copy.description} spec={copy.spec}>
      <form onSubmit={onSubmit} className="mele-card">
        <AutofillBanner locale={locale} show={autofilled} fields={copy.autofillFields} />

        <BirthDateTimeFields
          locale={locale}
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
          dateLabel={copy.birth?.dateLabel}
          timeLabel={copy.birth?.timeLabel}
          unknownTimeHint={copy.unknownTimeHint}
        />

        <label className="flex items-center gap-2 text-sm text-white/85 mb-5 cursor-pointer">
          <input type="checkbox" checked={useTrueSolar} onChange={(event) => setUseTrueSolar(event.target.checked)} />
          {copy.birth?.trueSolarLabel}
        </label>

        {useTrueSolar && <LongitudeField locale={locale} longitude={longitude} onLongitudeChange={setLongitude} />}

        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? copy.submit.loading : copy.submit.idle}
        </button>
      </form>

      {loading && <ToolLoading locale={locale} label={copy.loadingLabel} />}
      {error && !loading && <ToolError locale={locale} message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="bazi" result={result} locale={locale} />
          <ConsultCTA locale={locale} spec={copy.spec} label={copy.title} />
        </>
      )}
    </ToolShell>
  );
}
