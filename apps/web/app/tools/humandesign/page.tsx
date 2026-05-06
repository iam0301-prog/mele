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
import { localizePath } from '@/lib/i18n/config';
import { useCurrentLocale } from '@/lib/i18n/use-current-locale';
import { getToolPageCopy } from '@/lib/i18n/tool-page-copy';
import { getBrowserTimeZone, timezoneOffsetAt } from '@/lib/timezone';

export default function HumanDesignPage() {
  const locale = useCurrentLocale();
  const copy = getToolPageCopy(locale, 'humandesign');
  const toast = useToast();
  const profile = useProfile();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timezone, setTimezone] = useState(() => timezoneOffsetAt(getBrowserTimeZone()));
  const [autofilled, setAutofilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile.loaded || !profile.hasData) return;
    if (date === '' && profile.birth_date) setDate(profile.birth_date);
    if (time === '' && profile.birth_time) setTime(normalizeTime(profile.birth_time));
    if (profile.birth_timezone) {
      setTimezone(timezoneOffsetAt(profile.birth_timezone, profile.birth_date ?? date, profile.birth_time ? normalizeTime(profile.birth_time) : time));
    }
    setAutofilled(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.loaded]);

  const fillDemo = () => {
    setDate('1990-01-01');
    setTime('12:00');
    setTimezone(8);
    setError(null);
    toast(copy.submit.demo ?? 'Demo data filled.');
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!date || !time) {
      const message = copy.validation.dateTimeRequired ?? 'Please enter birth date and time.';
      setError(message);
      toast(message, 'error');
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
    <ToolShell locale={locale} title={copy.title} subtitle={copy.subtitle} description={copy.description} spec={copy.spec}>
      <form onSubmit={onSubmit} className="mele-card">
        <AutofillBanner locale={locale} show={autofilled} fields={copy.autofillFields} />

        <BirthDateTimeFields
          locale={locale}
          date={date}
          time={time}
          timezone={timezone}
          onDateChange={setDate}
          onTimeChange={setTime}
          onTimezoneChange={setTimezone}
          dateLabel={copy.birth?.dateLabel}
          timeLabel={copy.birth?.timeLabel}
          unknownTimeHint={copy.unknownTimeHint}
        />

        <div className="flex flex-col gap-3 sm:flex-row">
          <button type="submit" disabled={loading} className="mele-btn-primary w-full sm:w-auto">
            {loading ? copy.submit.loading : copy.submit.idle}
          </button>
          <button type="button" onClick={fillDemo} disabled={loading} className="mele-btn-secondary w-full sm:w-auto">
            {copy.submit.demo}
          </button>
        </div>
      </form>

      {copy.visualNote && (
        <section className="ritual-panel mt-6">
          <div className="ritual-kicker">{copy.visualNote.kicker}</div>
          <h2>{copy.visualNote.title}</h2>
          <p>{copy.visualNote.body}</p>
          <div className="ritual-stage__actions">
            <Link href={localizePath('/ar', locale)} className="mele-btn-secondary">
              {copy.visualNote.action}
            </Link>
          </div>
        </section>
      )}

      {loading && <ToolLoading locale={locale} label={copy.loadingLabel} />}
      {error && !loading && <ToolError locale={locale} message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="humandesign" result={result} locale={locale} />
          <ConsultCTA locale={locale} spec={copy.spec} label={copy.title} />
        </>
      )}
    </ToolShell>
  );
}
