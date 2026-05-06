'use client';

import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { timezoneOffsetAt } from '@/lib/timezone';

const FALLBACK_YEAR = 1990;
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 126 }, (_, index) => CURRENT_YEAR - index);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index);

type DateParts = {
  year?: number;
  month?: number;
  day?: number;
};

type TimeParts = {
  hour?: number;
  minute?: number;
};

type BirthCopy = {
  birthData: string;
  dateOnlyTitle: string;
  dateOnlyBody: string;
  dateTimeTitle: string;
  dateTimeBody: string;
  dateLabel: string;
  timeLabel: string;
  selected: string;
  selectedDatePlaceholder: string;
  selectedTimePlaceholder: string;
  selectedTimezonePlaceholder: string;
  year: string;
  yearSuffix: string;
  month: string;
  day: string;
  hour: string;
  minute: string;
  yearPlaceholder: string;
  monthPlaceholder: string;
  dayPlaceholder: string;
  hourPlaceholder: string;
  minutePlaceholder: string;
  monthSuffix: string;
  daySuffix: string;
  hourSuffix: string;
  minuteSuffix: string;
  timeSelected: string;
  quickTimeCaption: string;
  periodNight: string;
  periodMorning: string;
  periodAfternoon: string;
  periodEvening: string;
  timezoneEyebrow: string;
  timezoneTitle: string;
  timezoneBody: string;
  selectedTimezone: string;
  timezoneHint: string;
  locationEyebrow: string;
  locationTitle: string;
  locationBody: string;
  selectedLocation: string;
  latitude: string;
  longitude: string;
  presetLocation: string;
  longitudeTitle: string;
  longitudeBody: string;
  longitudeHint: string;
  quickTimes: Array<{ label: string; hint: string; value: string }>;
  timezonePresets: Array<{ label: string; value: number }>;
  locationPresets: Array<{ label: string; lat: number; lon: number; timezone?: string | number }>;
};

const BIRTH_COPY: Record<Locale, BirthCopy> = {
  'zh-TW': {
    birthData: '出生資料',
    dateOnlyTitle: '選擇出生日期',
    dateOnlyBody: '先用出生日期建立基礎盤面；正式解讀時可再補上時間與地點。',
    dateTimeTitle: '選擇出生日期與時間',
    dateTimeBody: '出生時間會影響盤面細節；不知道精準時間時，可先用 12:00 測試。',
    dateLabel: '出生日期',
    timeLabel: '出生時間',
    selected: '目前選擇',
    selectedDatePlaceholder: '尚未選擇日期',
    selectedTimePlaceholder: '尚未選擇時間',
    selectedTimezonePlaceholder: '尚未設定時區',
    year: '西元年',
    yearSuffix: '年',
    month: '月份',
    day: '日期',
    hour: '小時',
    minute: '分鐘',
    yearPlaceholder: '年',
    monthPlaceholder: '月',
    dayPlaceholder: '日',
    hourPlaceholder: '時',
    minutePlaceholder: '分',
    monthSuffix: '月',
    daySuffix: '日',
    hourSuffix: '時',
    minuteSuffix: '分',
    timeSelected: '已選擇時間',
    quickTimeCaption: '快速選擇時間',
    periodNight: '深夜',
    periodMorning: '上午',
    periodAfternoon: '下午',
    periodEvening: '晚上',
    timezoneEyebrow: '時區',
    timezoneTitle: '出生地時區',
    timezoneBody: '台灣、香港、新加坡可先使用 UTC+8；若出生地不同，請調整時區。',
    selectedTimezone: '目前時區',
    timezoneHint: '台灣、香港與新加坡通常使用 UTC+8；其他地區請依出生地調整。',
    locationEyebrow: '出生地',
    locationTitle: '出生地座標',
    locationBody: '占星會用出生地計算上升、天頂與宮位。先選城市，再需要時微調經緯度。',
    selectedLocation: '目前座標',
    latitude: '緯度',
    longitude: '經度',
    presetLocation: '常用出生地',
    longitudeTitle: '出生地經度',
    longitudeBody: '八字與紫微可用經度微調真太陽時；不知道精準經度時，可先選最接近的城市。',
    longitudeHint: '若不確定經度，可先選最接近的城市；正式解讀前再確認。',
    quickTimes: [
      { label: '午夜', hint: '00:00', value: '00:00' },
      { label: '清晨', hint: '06:00', value: '06:00' },
      { label: '中午', hint: '12:00', value: '12:00' },
      { label: '傍晚', hint: '18:00', value: '18:00' },
      { label: '未知', hint: '先用 12:00', value: '12:00' },
    ],
    timezonePresets: [
      { label: '台灣 / 香港 / 新加坡', value: 8 },
      { label: '日本', value: 9 },
      { label: '越南', value: 7 },
      { label: '美西', value: -8 },
      { label: '美東', value: -5 },
    ],
    locationPresets: [
      { label: '台北', lat: 25.033, lon: 121.5654 },
      { label: '台中', lat: 24.1477, lon: 120.6736 },
      { label: '台南', lat: 22.9999, lon: 120.227 },
      { label: '高雄', lat: 22.6273, lon: 120.3014 },
      { label: '香港', lat: 22.3193, lon: 114.1694 },
      { label: '新加坡', lat: 1.3521, lon: 103.8198 },
    ],
  },
  en: {
    birthData: 'Birth data',
    dateOnlyTitle: 'Choose birth date',
    dateOnlyBody: 'Start with your birth date. You can add time and location later for deeper readings.',
    dateTimeTitle: 'Choose birth date and time',
    dateTimeBody: 'Birth time changes chart details. If you do not know the exact time, use 12:00 for a first test.',
    dateLabel: 'Birth date',
    timeLabel: 'Birth time',
    selected: 'Selected',
    selectedDatePlaceholder: 'No date selected',
    selectedTimePlaceholder: 'No time selected',
    selectedTimezonePlaceholder: 'No timezone selected',
    year: 'Year',
    yearSuffix: '',
    month: 'Month',
    day: 'Day',
    hour: 'Hour',
    minute: 'Minute',
    yearPlaceholder: 'Year',
    monthPlaceholder: 'Month',
    dayPlaceholder: 'Day',
    hourPlaceholder: 'Hour',
    minutePlaceholder: 'Minute',
    monthSuffix: '',
    daySuffix: '',
    hourSuffix: ':00',
    minuteSuffix: 'min',
    timeSelected: 'Time selected',
    quickTimeCaption: 'Quick time',
    periodNight: 'Night',
    periodMorning: 'Morning',
    periodAfternoon: 'Afternoon',
    periodEvening: 'Evening',
    timezoneEyebrow: 'Timezone',
    timezoneTitle: 'Birthplace timezone',
    timezoneBody: 'Taiwan, Hong Kong, and Singapore usually use UTC+8. Adjust this if you were born elsewhere.',
    selectedTimezone: 'Selected timezone',
    timezoneHint: 'Use the timezone of your birthplace for the reading.',
    locationEyebrow: 'Birthplace',
    locationTitle: 'Birthplace coordinates',
    locationBody: 'Astrology uses location to calculate Ascendant, Midheaven, and houses. Choose a city first, then fine-tune if needed.',
    selectedLocation: 'Selected coordinates',
    latitude: 'Latitude',
    longitude: 'Longitude',
    presetLocation: 'Preset cities',
    longitudeTitle: 'Birthplace longitude',
    longitudeBody: 'Bazi and Zi Wei can use longitude to adjust true solar time. Choose the closest city if you are unsure.',
    longitudeHint: 'If you do not know the exact longitude, choose the nearest city and refine it later.',
    quickTimes: [
      { label: 'Midnight', hint: '00:00', value: '00:00' },
      { label: 'Morning', hint: '06:00', value: '06:00' },
      { label: 'Noon', hint: '12:00', value: '12:00' },
      { label: 'Evening', hint: '18:00', value: '18:00' },
      { label: 'Unknown', hint: 'Use 12:00', value: '12:00' },
    ],
    timezonePresets: [
      { label: 'Taiwan / Hong Kong / Singapore', value: 8 },
      { label: 'Japan', value: 9 },
      { label: 'Vietnam', value: 7 },
      { label: 'US West', value: -8 },
      { label: 'US East', value: -5 },
    ],
    locationPresets: [
      { label: 'Taipei', lat: 25.033, lon: 121.5654, timezone: 'Asia/Taipei' },
      { label: 'Taichung', lat: 24.1477, lon: 120.6736, timezone: 'Asia/Taipei' },
      { label: 'Tainan', lat: 22.9999, lon: 120.227, timezone: 'Asia/Taipei' },
      { label: 'Kaohsiung', lat: 22.6273, lon: 120.3014, timezone: 'Asia/Taipei' },
      { label: 'Hong Kong', lat: 22.3193, lon: 114.1694, timezone: 'Asia/Hong_Kong' },
      { label: 'Singapore', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
      { label: 'Hanoi', lat: 21.0278, lon: 105.8342, timezone: 'Asia/Ho_Chi_Minh' },
      { label: 'Jakarta', lat: -6.2088, lon: 106.8456, timezone: 'Asia/Jakarta' },
      { label: 'Tokyo', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
      { label: 'Seoul', lat: 37.5665, lon: 126.978, timezone: 'Asia/Seoul' },
      { label: 'Los Angeles', lat: 34.0522, lon: -118.2437, timezone: 'America/Los_Angeles' },
      { label: 'New York', lat: 40.7128, lon: -74.006, timezone: 'America/New_York' },
    ],
  },
  vi: {} as BirthCopy,
  id: {} as BirthCopy,
  ja: {} as BirthCopy,
  ko: {} as BirthCopy,
};

BIRTH_COPY.vi = {
  ...BIRTH_COPY.en,
  birthData: 'Dữ liệu sinh',
  dateOnlyTitle: 'Chọn ngày sinh',
  dateTimeTitle: 'Chọn ngày và giờ sinh',
  dateLabel: 'Ngày sinh',
  timeLabel: 'Giờ sinh',
  selected: 'Đã chọn',
  quickTimeCaption: 'Chọn giờ nhanh',
  timezoneTitle: 'Múi giờ nơi sinh',
  locationTitle: 'Tọa độ nơi sinh',
  latitude: 'Vĩ độ',
  longitude: 'Kinh độ',
};
BIRTH_COPY.id = {
  ...BIRTH_COPY.en,
  birthData: 'Data lahir',
  dateOnlyTitle: 'Pilih tanggal lahir',
  dateTimeTitle: 'Pilih tanggal dan waktu lahir',
  dateLabel: 'Tanggal lahir',
  timeLabel: 'Waktu lahir',
  selected: 'Terpilih',
  quickTimeCaption: 'Waktu cepat',
  timezoneTitle: 'Zona waktu tempat lahir',
  locationTitle: 'Koordinat tempat lahir',
  latitude: 'Lintang',
  longitude: 'Bujur',
};
BIRTH_COPY.ja = {
  ...BIRTH_COPY.en,
  birthData: '出生データ',
  dateOnlyTitle: '生年月日を選択',
  dateTimeTitle: '生年月日と時間を選択',
  dateLabel: '生年月日',
  timeLabel: '出生時間',
  selected: '選択中',
  quickTimeCaption: '時間をすばやく選択',
  timezoneTitle: '出生地のタイムゾーン',
  locationTitle: '出生地の座標',
  latitude: '緯度',
  longitude: '経度',
};
BIRTH_COPY.ko = {
  ...BIRTH_COPY.en,
  birthData: '출생 데이터',
  dateOnlyTitle: '생년월일 선택',
  dateTimeTitle: '생년월일과 시간 선택',
  dateLabel: '생년월일',
  timeLabel: '출생 시간',
  selected: '선택됨',
  quickTimeCaption: '빠른 시간 선택',
  timezoneTitle: '출생지 시간대',
  locationTitle: '출생지 좌표',
  latitude: '위도',
  longitude: '경도',
};

const ADDITIONAL_LOCATION_PRESETS: Record<Locale, BirthCopy['locationPresets']> = {
  'zh-TW': [
    { label: '河內', lat: 21.0278, lon: 105.8342, timezone: 'Asia/Ho_Chi_Minh' },
    { label: '雅加達', lat: -6.2088, lon: 106.8456, timezone: 'Asia/Jakarta' },
    { label: '東京', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
    { label: '首爾', lat: 37.5665, lon: 126.978, timezone: 'Asia/Seoul' },
    { label: '洛杉磯', lat: 34.0522, lon: -118.2437, timezone: 'America/Los_Angeles' },
    { label: '紐約', lat: 40.7128, lon: -74.006, timezone: 'America/New_York' },
  ],
  en: [],
  vi: [],
  id: [],
  ja: [],
  ko: [],
};

function timezoneForPreset(lat: number, lon: number) {
  if (Math.abs(lat - 25.033) < 0.02 && Math.abs(lon - 121.5654) < 0.02) return 'Asia/Taipei';
  if (Math.abs(lat - 24.1477) < 0.02 && Math.abs(lon - 120.6736) < 0.02) return 'Asia/Taipei';
  if (Math.abs(lat - 22.9999) < 0.02 && Math.abs(lon - 120.227) < 0.02) return 'Asia/Taipei';
  if (Math.abs(lat - 22.6273) < 0.02 && Math.abs(lon - 120.3014) < 0.02) return 'Asia/Taipei';
  if (Math.abs(lat - 22.3193) < 0.02 && Math.abs(lon - 114.1694) < 0.02) return 'Asia/Hong_Kong';
  if (Math.abs(lat - 1.3521) < 0.02 && Math.abs(lon - 103.8198) < 0.02) return 'Asia/Singapore';
  return undefined;
}

function applyLocationPresetTimezones() {
  (Object.keys(BIRTH_COPY) as Locale[]).forEach((locale) => {
    const existing = BIRTH_COPY[locale].locationPresets.map((item) => ({
      ...item,
      timezone: item.timezone ?? timezoneForPreset(item.lat, item.lon),
    }));
    const seen = new Set(existing.map((item) => `${item.lat.toFixed(4)}:${item.lon.toFixed(4)}`));
    const additions = ADDITIONAL_LOCATION_PRESETS[locale].filter((item) => {
      const key = `${item.lat.toFixed(4)}:${item.lon.toFixed(4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    BIRTH_COPY[locale].locationPresets = [...existing, ...additions];
  });
}

applyLocationPresetTimezones();

function copyFor(locale: Locale) {
  return BIRTH_COPY[locale] ?? BIRTH_COPY[DEFAULT_LOCALE];
}

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function parseDateParts(value: string): DateParts {
  const [year, month, day] = value.split('-').map((part) => Number.parseInt(part, 10));
  return {
    year: Number.isFinite(year) ? year : undefined,
    month: Number.isFinite(month) ? month : undefined,
    day: Number.isFinite(day) ? day : undefined,
  };
}

function parseTimeParts(value: string): TimeParts {
  const [hour, minute] = value.split(':').map((part) => Number.parseInt(part, 10));
  return {
    hour: Number.isFinite(hour) ? hour : undefined,
    minute: Number.isFinite(minute) ? minute : undefined,
  };
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function composeDate(parts: Required<DateParts>) {
  const safeDay = Math.min(parts.day, daysInMonth(parts.year, parts.month));
  return `${parts.year}-${pad2(parts.month)}-${pad2(safeDay)}`;
}

function composeTime(parts: Required<TimeParts>) {
  return `${pad2(parts.hour)}:${pad2(parts.minute)}`;
}

function formatDateDisplay(date: string, copy: BirthCopy) {
  if (!date) return copy.selectedDatePlaceholder;
  const { year, month, day } = parseDateParts(date);
  if (!year || !month || !day) return date;
  return `${year} ${copy.yearSuffix || copy.year} ${pad2(month)} ${copy.monthSuffix || copy.month} ${pad2(day)} ${copy.daySuffix || copy.day}`;
}

function formatTimeDisplay(time: string, copy: BirthCopy) {
  if (!time) return copy.selectedTimePlaceholder;
  const { hour, minute } = parseTimeParts(time);
  if (typeof hour !== 'number' || typeof minute !== 'number') return time;
  const period = hour < 6
    ? copy.periodNight
    : hour < 12
      ? copy.periodMorning
      : hour < 18
        ? copy.periodAfternoon
        : copy.periodEvening;
  return `${period} ${pad2(hour)}:${pad2(minute)}`;
}

function formatTimezone(value: number | undefined, copy: BirthCopy) {
  if (typeof value !== 'number' || Number.isNaN(value)) return copy.selectedTimezonePlaceholder;
  return `UTC${value >= 0 ? '+' : ''}${value}`;
}

function DateSegmentPicker({
  value,
  onChange,
  label,
  copy,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  copy: BirthCopy;
}) {
  const parts = parseDateParts(value);
  const selectedYear = parts.year ?? '';
  const selectedMonth = parts.month ?? '';
  const selectedDay = parts.day ?? '';
  const dayCount = daysInMonth(parts.year ?? FALLBACK_YEAR, parts.month ?? 1);

  const updateDate = (part: keyof DateParts, rawValue: string) => {
    const nextValue = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(nextValue)) return;

    const next = {
      year: parts.year ?? FALLBACK_YEAR,
      month: parts.month ?? 1,
      day: parts.day ?? 1,
      [part]: nextValue,
    };

    onChange(composeDate(next));
  };

  return (
    <div className="birth-inputs__select-row birth-inputs__select-row--date" role="group" aria-label={label}>
      <label className="birth-inputs__select-card">
        <span>{copy.year}</span>
        <select value={selectedYear} required onChange={(event) => updateDate('year', event.target.value)} className="birth-inputs__select">
          <option value="" disabled>{copy.yearPlaceholder}</option>
          {YEAR_OPTIONS.map((year) => <option key={year} value={year}>{year}</option>)}
        </select>
      </label>
      <label className="birth-inputs__select-card">
        <span>{copy.month}</span>
        <select value={selectedMonth} required onChange={(event) => updateDate('month', event.target.value)} className="birth-inputs__select">
          <option value="" disabled>{copy.monthPlaceholder}</option>
          {MONTH_OPTIONS.map((month) => <option key={month} value={month}>{month} {copy.monthSuffix}</option>)}
        </select>
      </label>
      <label className="birth-inputs__select-card">
        <span>{copy.day}</span>
        <select value={selectedDay} required onChange={(event) => updateDate('day', event.target.value)} className="birth-inputs__select">
          <option value="" disabled>{copy.dayPlaceholder}</option>
          {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) => <option key={day} value={day}>{day} {copy.daySuffix}</option>)}
        </select>
      </label>
    </div>
  );
}

function TimeSegmentPicker({
  value,
  onChange,
  label,
  copy,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  copy: BirthCopy;
}) {
  const parts = parseTimeParts(value);
  const selectedHour = typeof parts.hour === 'number' ? parts.hour : '';
  const selectedMinute = typeof parts.minute === 'number' ? parts.minute : '';

  const updateTime = (part: keyof TimeParts, rawValue: string) => {
    const nextValue = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(nextValue)) return;

    const next = {
      hour: parts.hour ?? 12,
      minute: parts.minute ?? 0,
      [part]: nextValue,
    };

    onChange(composeTime(next));
  };

  return (
    <div className="birth-inputs__select-row birth-inputs__select-row--time" role="group" aria-label={label}>
      <label className="birth-inputs__select-card">
        <span>{copy.hour}</span>
        <select value={selectedHour} required onChange={(event) => updateTime('hour', event.target.value)} className="birth-inputs__select">
          <option value="" disabled>{copy.hourPlaceholder}</option>
          {HOUR_OPTIONS.map((hour) => <option key={hour} value={hour}>{pad2(hour)} {copy.hourSuffix}</option>)}
        </select>
      </label>
      <label className="birth-inputs__select-card">
        <span>{copy.minute}</span>
        <select value={selectedMinute} required onChange={(event) => updateTime('minute', event.target.value)} className="birth-inputs__select">
          <option value="" disabled>{copy.minutePlaceholder}</option>
          {MINUTE_OPTIONS.map((minute) => <option key={minute} value={minute}>{pad2(minute)} {copy.minuteSuffix}</option>)}
        </select>
      </label>
    </div>
  );
}

export function DateOnlyField({
  date,
  onDateChange,
  label,
  hint,
  locale = DEFAULT_LOCALE,
}: {
  date: string;
  onDateChange: (value: string) => void;
  label?: string;
  hint?: string;
  locale?: Locale;
}) {
  const copy = copyFor(locale);
  const dateLabel = label ?? copy.dateLabel;

  return (
    <div className="birth-inputs birth-inputs--oracle">
      <div className="birth-inputs__panel">
        <div className="birth-inputs__header">
          <span>{copy.birthData}</span>
          <h3>{dateLabel}</h3>
          <p>{copy.dateOnlyBody}</p>
        </div>
        <div className="birth-inputs__summary" aria-live="polite">
          <span>{copy.selected}</span>
          <strong>{formatDateDisplay(date, copy)}</strong>
        </div>
        <div className="birth-inputs__field">
          <span>{dateLabel} *</span>
          <DateSegmentPicker value={date} onChange={onDateChange} label={dateLabel} copy={copy} />
          <small>{formatDateDisplay(date, copy)}</small>
        </div>
        {hint && <p className="birth-inputs__hint">{hint}</p>}
      </div>
    </div>
  );
}

export function BirthDateTimeFields({
  date,
  time,
  onDateChange,
  onTimeChange,
  timezone,
  onTimezoneChange,
  dateLabel,
  timeLabel,
  unknownTimeHint,
  locale = DEFAULT_LOCALE,
}: {
  date: string;
  time: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  timezone?: number;
  onTimezoneChange?: (value: number) => void;
  dateLabel?: string;
  timeLabel?: string;
  unknownTimeHint?: string;
  locale?: Locale;
}) {
  const copy = copyFor(locale);
  const resolvedDateLabel = dateLabel ?? copy.dateLabel;
  const resolvedTimeLabel = timeLabel ?? copy.timeLabel;

  return (
    <div className="birth-inputs birth-inputs--oracle">
      <div className="birth-inputs__panel">
        <div className="birth-inputs__header">
          <span>{copy.birthData}</span>
          <h3>{copy.dateTimeTitle}</h3>
          <p>{copy.dateTimeBody}</p>
        </div>

        <div className="birth-inputs__summary" aria-live="polite">
          <span>{copy.selected}</span>
          <strong>{formatDateDisplay(date, copy)} / {formatTimeDisplay(time, copy)}</strong>
        </div>

        <div className="birth-inputs__grid birth-inputs__picker-grid">
          <div className="birth-inputs__field">
            <span>{resolvedDateLabel} *</span>
            <DateSegmentPicker value={date} onChange={onDateChange} label={resolvedDateLabel} copy={copy} />
            <small>{formatDateDisplay(date, copy)}</small>
          </div>
          <div className="birth-inputs__field birth-inputs__field--time">
            <span>{resolvedTimeLabel} *</span>
            <TimeSegmentPicker value={time} onChange={onTimeChange} label={resolvedTimeLabel} copy={copy} />
            <small>{time ? copy.timeSelected : copy.selectedTimePlaceholder}</small>
          </div>
        </div>

        <div className="birth-inputs__quick">
          <div className="birth-inputs__caption">{copy.quickTimeCaption}</div>
          <div className="birth-inputs__chips birth-inputs__chips--time">
            {copy.quickTimes.map((item, index) => (
              <button key={`${item.value}-${index}`} type="button" className={time === item.value ? 'is-active' : ''} onClick={() => onTimeChange(item.value)}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.hint}</small>
              </button>
            ))}
          </div>
          <p className="birth-inputs__hint">{unknownTimeHint ?? copy.dateTimeBody}</p>
        </div>
      </div>

      {typeof timezone === 'number' && onTimezoneChange && (
        <div className="birth-inputs__panel birth-inputs__panel--compact">
          <div className="birth-inputs__header">
            <span>{copy.timezoneEyebrow}</span>
            <h3>{copy.timezoneTitle}</h3>
            <p>{copy.timezoneBody}</p>
          </div>
          <div className="birth-inputs__summary">
            <span>{copy.selectedTimezone}</span>
            <strong>{formatTimezone(timezone, copy)}</strong>
          </div>
          <div className="birth-inputs__timezone">
            <input type="number" step="0.5" value={timezone} onChange={(event) => onTimezoneChange(Number.parseFloat(event.target.value))} className="birth-inputs__control" />
            <div className="birth-inputs__chips">
              {copy.timezonePresets.map((item) => (
                <button key={item.label} type="button" className={timezone === item.value ? 'is-active' : ''} onClick={() => onTimezoneChange(item.value)}>
                  {item.label} UTC{item.value >= 0 ? '+' : ''}{item.value}
                </button>
              ))}
            </div>
          </div>
          <p className="birth-inputs__hint">{copy.timezoneHint}</p>
        </div>
      )}
    </div>
  );
}

export function LocationFields({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  onTimezoneChange,
  timezoneDate,
  timezoneTime,
  locale = DEFAULT_LOCALE,
}: {
  latitude: number;
  longitude: number;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  onTimezoneChange?: (value: number) => void;
  timezoneDate?: string;
  timezoneTime?: string;
  locale?: Locale;
}) {
  const copy = copyFor(locale);

  return (
    <div className="birth-inputs birth-inputs--oracle">
      <div className="birth-inputs__panel">
        <div className="birth-inputs__header">
          <span>{copy.locationEyebrow}</span>
          <h3>{copy.locationTitle}</h3>
          <p>{copy.locationBody}</p>
        </div>
        <div className="birth-inputs__summary">
          <span>{copy.selectedLocation}</span>
          <strong>{latitude.toFixed(4)}, {longitude.toFixed(4)}</strong>
        </div>
        <div className="birth-inputs__grid birth-inputs__grid--three">
          <label className="birth-inputs__field">
            <span>{copy.latitude}</span>
            <input type="number" step="0.0001" value={latitude} onChange={(event) => onLatitudeChange(Number.parseFloat(event.target.value))} className="birth-inputs__control" />
          </label>
          <label className="birth-inputs__field">
            <span>{copy.longitude}</span>
            <input type="number" step="0.0001" value={longitude} onChange={(event) => onLongitudeChange(Number.parseFloat(event.target.value))} className="birth-inputs__control" />
          </label>
        </div>
        <div className="birth-inputs__caption">{copy.presetLocation}</div>
        <div className="birth-inputs__chips">
          {copy.locationPresets.map((item) => (
            <button key={item.label} type="button" onClick={() => {
              onLatitudeChange(item.lat);
              onLongitudeChange(item.lon);
              if (item.timezone && onTimezoneChange) {
                onTimezoneChange(timezoneOffsetAt(item.timezone, timezoneDate, timezoneTime));
              }
            }}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LongitudeField({
  longitude,
  onLongitudeChange,
  locale = DEFAULT_LOCALE,
}: {
  longitude: number;
  onLongitudeChange: (value: number) => void;
  locale?: Locale;
}) {
  const copy = copyFor(locale);

  return (
    <div className="birth-inputs birth-inputs--oracle">
      <div className="birth-inputs__panel">
        <div className="birth-inputs__header">
          <span>{copy.locationEyebrow}</span>
          <h3>{copy.longitudeTitle}</h3>
          <p>{copy.longitudeBody}</p>
        </div>
        <div className="birth-inputs__summary">
          <span>{copy.selectedLocation}</span>
          <strong>{longitude.toFixed(4)}</strong>
        </div>
        <label className="birth-inputs__field">
          <span>{copy.longitude}</span>
          <input type="number" step="0.0001" value={longitude} onChange={(event) => onLongitudeChange(Number.parseFloat(event.target.value))} className="birth-inputs__control" />
        </label>
        <p className="birth-inputs__hint">{copy.longitudeHint}</p>
        <div className="birth-inputs__caption">{copy.presetLocation}</div>
        <div className="birth-inputs__chips">
          {copy.locationPresets.map((item) => (
            <button key={item.label} type="button" onClick={() => onLongitudeChange(item.lon)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
