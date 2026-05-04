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

export default function AstroPage() {
  const toast = useToast();
  const profile = useProfile();
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [timezone, setTimezone] = useState(8);
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
    <ToolShell
      title="西洋占星命盤"
      subtitle="NATAL CHART"
      description="以出生時間與地點計算太陽、月亮、上升、行星宮位與主要相位，協助理解性格核心、情緒模式與生命發展方向。"
      spec="占星"
    >
      <form onSubmit={onSubmit} className="mele-card">
        <AutofillBanner show={autofilled} fields={['出生日期', '出生時間', '出生地']} />

        <BirthDateTimeFields
          date={date}
          time={time}
          timezone={timezone}
          onDateChange={setDate}
          onTimeChange={setTime}
          onTimezoneChange={setTimezone}
          dateLabel="出生日期"
          unknownTimeHint="占星命盤的上升與宮位非常依賴出生時間。若不確定，可先用 12:00 查看行星星座，正式諮詢前建議再確認時間。"
        />

        <LocationFields
          latitude={lat}
          longitude={lon}
          onLatitudeChange={setLat}
          onLongitudeChange={setLon}
        />

        <p className="text-xs text-white/50 mb-5">若城市不在快捷選項中，可以用 Google Maps 查詢緯度與經度後填入。</p>
        <button type="submit" disabled={loading} className="mele-btn-primary w-full md:w-auto">
          {loading ? '正在繪製命盤...' : '開始排盤'}
        </button>
      </form>

      {loading && <ToolLoading label="正在計算行星位置與宮位..." />}
      {error && !loading && <ToolError message={error} />}
      {result && !loading && (
        <>
          <ToolResultSection kind="astro" result={result} />
          <ConsultCTA spec="占星" label="占星" />
        </>
      )}
    </ToolShell>
  );
}
