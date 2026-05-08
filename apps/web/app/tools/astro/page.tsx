'use client';

import { useEffect, useState } from 'react';
import { ToolShell, ConsultCTA } from '@/components/ToolShell';
import { ToolLoading, ToolError } from '@/components/ToolFeedback';
import { ToolResultSection } from '@/components/ToolResultSection';
import { AutofillBanner } from '@/components/AutofillBanner';
import { BirthDateTimeFields, LocationFields } from '@/components/BirthInputs';
import { calc, CalcError, type CalcResponse } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';
import { useProfile, normalizeTime } from '@/lib/use-profile';
import { useCurrentLocale } from '@/lib/i18n/use-current-locale';
import { getToolPageCopy } from '@/lib/i18n/tool-page-copy';
import { getBrowserTimeZone, timezoneOffsetAt } from '@/lib/timezone';

export default function AstroPage() {
  const locale = useCurrentLocale();
  const copy = getToolPageCopy(locale, 'astro');
  const toast = useToast();
  const profile = useProfile();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timezone, setTimezone] = useState(() => timezoneOffsetAt(getBrowserTimeZone()));
  const [lat, setLat] = useState(25.033);
  const [lon, setLon] = useState(121.5654);
  const [autofilled, setAutofilled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CalcResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile.loaded || !profile.hasData) return;
    if (date === '' && profile.birth_date) setDate(profile.birth_date);
    if (time === '' && profile.birth_time) setTime(normalizeTime(profile.birth_time));
    if (profile.birth_lat) setLat(profile.birth_lat);
    if (profile.birth_lon) setLon(profile.birth_lon);
    if (profile.birth_timezone) {
      setTimezone(timezoneOffsetAt(profile.birth_timezone, profile.birth_date ?? date, profile.birth_time ? normalizeTime(profile.birth_time) : time));
    }
    setAutofilled(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.loaded]);

  const onSubmit = async (event: React.FormEvent | React.MouseEvent<HTMLButtonElement>) => {
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
      const response = await calc('astro', {
        year,
        month,
        day,
        hour,
        minute,
        timezone,
        latitude: lat,
        longitude: lon,
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
      <form onSubmit={onSubmit} className="mele-card" noValidate>
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

        <LocationFields
          locale={locale}
          latitude={lat}
          longitude={lon}
          timezoneDate={date}
          timezoneTime={time}
          onLatitudeChange={setLat}
          onLongitudeChange={setLon}
          onTimezoneChange={setTimezone}
        />

        {copy.birth?.locationNote && <p className="text-xs text-white/50 mb-5">{copy.birth.locationNote}</p>}
        <button type="button" onClick={onSubmit} disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? copy.submit.loading : copy.submit.idle}
        </button>
      </form>

      {loading && <ToolLoading locale={locale} label={copy.loadingLabel} />}
      {error && !loading && <ToolError locale={locale} message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="astro" result={result} locale={locale} />
          <ConsultCTA locale={locale} spec={copy.spec} label={copy.title} />
        </>
      )}
    </ToolShell>
  );
}
