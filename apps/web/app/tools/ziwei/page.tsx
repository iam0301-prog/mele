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
import { useCurrentLocale } from '@/lib/i18n/use-current-locale';
import { getToolPageCopy } from '@/lib/i18n/tool-page-copy';

type Gender = '男' | '女';

function normalizeGender(value: string | null): Gender | null {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === '男' || normalized === 'male' || normalized === 'm') return '男';
  if (normalized === '女' || normalized === 'female' || normalized === 'f') return '女';
  return null;
}

export default function ZiweiPage() {
  const locale = useCurrentLocale();
  const copy = getToolPageCopy(locale, 'ziwei');
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
      toast(copy.validation.dateTimeRequired ?? 'Please enter both birth date and time.', 'error');
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

        <div className="mb-5">
          <label className="mele-label">{copy.birth?.genderLabel ?? 'Gender'} *</label>
          <select value={gender} onChange={(event) => setGender(event.target.value as Gender)} className="mele-input">
            <option value="女">{copy.birth?.female ?? 'Female'}</option>
            <option value="男">{copy.birth?.male ?? 'Male'}</option>
          </select>
        </div>

        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? copy.submit.loading : copy.submit.idle}
        </button>
      </form>

      {loading && <ToolLoading locale={locale} label={copy.loadingLabel} />}
      {error && !loading && <ToolError locale={locale} message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="ziwei" result={result} locale={locale} />
          <ConsultCTA locale={locale} spec={copy.spec} label={copy.title} />
        </>
      )}
    </ToolShell>
  );
}
