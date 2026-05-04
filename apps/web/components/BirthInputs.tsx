'use client';

const FALLBACK_YEAR = 1990;
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 126 }, (_, index) => CURRENT_YEAR - index);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => index + 1);
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, index) => index);
const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, index) => index);

const QUICK_TIMES = [
  { label: '午夜', hint: '子夜參考', value: '00:00' },
  { label: '清晨', hint: '日出前後', value: '06:00' },
  { label: '中午', hint: '不知道時先用', value: '12:00' },
  { label: '傍晚', hint: '日落前後', value: '18:00' },
  { label: '不確定', hint: '先用中午試排', value: '12:00' },
];

const TIMEZONE_PRESETS = [
  { label: '台灣 / 香港 / 新加坡', value: 8 },
  { label: '日本', value: 9 },
  { label: '泰國', value: 7 },
  { label: '美西', value: -8 },
  { label: '美東', value: -5 },
];

const LOCATION_PRESETS = [
  { label: '台北', lat: 25.033, lon: 121.5654 },
  { label: '台中', lat: 24.1477, lon: 120.6736 },
  { label: '台南', lat: 22.9999, lon: 120.227 },
  { label: '高雄', lat: 22.6273, lon: 120.3014 },
  { label: '香港', lat: 22.3193, lon: 114.1694 },
  { label: '新加坡', lat: 1.3521, lon: 103.8198 },
];

type DateParts = {
  year?: number;
  month?: number;
  day?: number;
};

type TimeParts = {
  hour?: number;
  minute?: number;
};

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

function formatDateDisplay(date: string) {
  if (!date) return '尚未選擇日期';
  const { year, month, day } = parseDateParts(date);
  if (!year || !month || !day) return date;
  return `${year} 年 ${pad2(month)} 月 ${pad2(day)} 日`;
}

function formatTimeDisplay(time: string) {
  if (!time) return '尚未選擇時間';
  const { hour, minute } = parseTimeParts(time);
  if (typeof hour !== 'number' || typeof minute !== 'number') return time;
  const period = hour < 6 ? '凌晨' : hour < 12 ? '上午' : hour < 18 ? '下午' : '晚上';
  return `${period} ${pad2(hour)}:${pad2(minute)}`;
}

function formatTimezone(value?: number) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '尚未設定時區';
  return `UTC${value >= 0 ? '+' : ''}${value}`;
}

function DateSegmentPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
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
        <span>西元年</span>
        <select
          value={selectedYear}
          required
          onChange={(event) => updateDate('year', event.target.value)}
          className="birth-inputs__select"
        >
          <option value="" disabled>
            年
          </option>
          {YEAR_OPTIONS.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </label>
      <label className="birth-inputs__select-card">
        <span>月份</span>
        <select
          value={selectedMonth}
          required
          onChange={(event) => updateDate('month', event.target.value)}
          className="birth-inputs__select"
        >
          <option value="" disabled>
            月
          </option>
          {MONTH_OPTIONS.map((month) => (
            <option key={month} value={month}>
              {month} 月
            </option>
          ))}
        </select>
      </label>
      <label className="birth-inputs__select-card">
        <span>日期</span>
        <select
          value={selectedDay}
          required
          onChange={(event) => updateDate('day', event.target.value)}
          className="birth-inputs__select"
        >
          <option value="" disabled>
            日
          </option>
          {Array.from({ length: dayCount }, (_, index) => index + 1).map((day) => (
            <option key={day} value={day}>
              {day} 日
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

function TimeSegmentPicker({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
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
        <span>小時</span>
        <select
          value={selectedHour}
          required
          onChange={(event) => updateTime('hour', event.target.value)}
          className="birth-inputs__select"
        >
          <option value="" disabled>
            時
          </option>
          {HOUR_OPTIONS.map((hour) => (
            <option key={hour} value={hour}>
              {pad2(hour)} 時
            </option>
          ))}
        </select>
      </label>
      <label className="birth-inputs__select-card">
        <span>分鐘</span>
        <select
          value={selectedMinute}
          required
          onChange={(event) => updateTime('minute', event.target.value)}
          className="birth-inputs__select"
        >
          <option value="" disabled>
            分
          </option>
          {MINUTE_OPTIONS.map((minute) => (
            <option key={minute} value={minute}>
              {pad2(minute)} 分
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

export function DateOnlyField({
  date,
  onDateChange,
  label = '出生日期',
  hint,
}: {
  date: string;
  onDateChange: (value: string) => void;
  label?: string;
  hint?: string;
}) {
  return (
    <div className="birth-inputs birth-inputs--oracle">
      <div className="birth-inputs__panel">
        <div className="birth-inputs__header">
          <span>出生資料</span>
          <h3>{label}</h3>
          <p>用年月日三段選擇，避免手機跳出難看的原生日期面板。</p>
        </div>
        <div className="birth-inputs__summary" aria-live="polite">
          <span>目前設定</span>
          <strong>{formatDateDisplay(date)}</strong>
        </div>
        <div className="birth-inputs__field">
          <span>{label} *</span>
          <DateSegmentPicker value={date} onChange={onDateChange} label={label} />
          <small>{formatDateDisplay(date)}</small>
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
  dateLabel = '出生日期',
  timeLabel = '出生時間',
  unknownTimeHint = '若暫時不知道精準時間，可以先用 12:00 試排；正式解讀建議再確認出生證明或戶籍資料。',
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
}) {
  return (
    <div className="birth-inputs birth-inputs--oracle">
      <div className="birth-inputs__panel">
        <div className="birth-inputs__header">
          <span>出生資料</span>
          <h3>設定出生日期與時間</h3>
          <p>排盤會依時間改變結果。若暫時不知道時間，可以先用中午 12:00 測試。</p>
        </div>

        <div className="birth-inputs__summary" aria-live="polite">
          <span>目前設定</span>
          <strong>
            {formatDateDisplay(date)} · {formatTimeDisplay(time)}
          </strong>
        </div>

        <div className="birth-inputs__grid birth-inputs__picker-grid">
          <div className="birth-inputs__field">
            <span>{dateLabel} *</span>
            <DateSegmentPicker value={date} onChange={onDateChange} label={dateLabel} />
            <small>{formatDateDisplay(date)}</small>
          </div>
          <div className="birth-inputs__field birth-inputs__field--time">
            <span>{timeLabel} *</span>
            <TimeSegmentPicker value={time} onChange={onTimeChange} label={timeLabel} />
            <small>{time ? '精準時間' : '尚未選擇時間'}</small>
          </div>
        </div>

        <div className="birth-inputs__quick">
          <div className="birth-inputs__caption">快速選擇常用時間</div>
          <div className="birth-inputs__chips birth-inputs__chips--time">
            {QUICK_TIMES.map((item, index) => (
              <button
                key={`${item.value}-${index}`}
                type="button"
                className={time === item.value ? 'is-active' : ''}
                onClick={() => onTimeChange(item.value)}
              >
                <span>{item.label}</span>
                <strong>{item.value}</strong>
                <small>{item.hint}</small>
              </button>
            ))}
          </div>
          <p className="birth-inputs__hint">{unknownTimeHint}</p>
        </div>
      </div>

      {typeof timezone === 'number' && onTimezoneChange && (
        <div className="birth-inputs__panel birth-inputs__panel--compact">
          <div className="birth-inputs__header">
            <span>時區</span>
            <h3>出生地時區</h3>
            <p>若出生地在台灣、香港或新加坡，通常維持 UTC+8 即可。</p>
          </div>
          <div className="birth-inputs__summary">
            <span>目前時區</span>
            <strong>{formatTimezone(timezone)}</strong>
          </div>
          <div className="birth-inputs__timezone">
            <input
              type="number"
              step="0.5"
              value={timezone}
              onChange={(event) => onTimezoneChange(Number.parseFloat(event.target.value))}
              className="birth-inputs__control"
            />
            <div className="birth-inputs__chips">
              {TIMEZONE_PRESETS.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  className={timezone === item.value ? 'is-active' : ''}
                  onClick={() => onTimezoneChange(item.value)}
                >
                  {item.label} UTC{item.value >= 0 ? '+' : ''}
                  {item.value}
                </button>
              ))}
            </div>
          </div>
          <p className="birth-inputs__hint">台灣、香港與新加坡通常使用 UTC+8；若出生地不在上述地區，請依當地時區調整。</p>
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
}: {
  latitude: number;
  longitude: number;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
}) {
  return (
    <div className="birth-inputs birth-inputs--oracle">
      <div className="birth-inputs__panel">
        <div className="birth-inputs__header">
          <span>出生地</span>
          <h3>設定出生城市</h3>
          <p>占星會用出生地計算上升、天頂與宮位。先選城市，再需要時微調經緯度。</p>
        </div>
        <div className="birth-inputs__summary">
          <span>目前座標</span>
          <strong>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </strong>
        </div>
        <div className="birth-inputs__grid birth-inputs__grid--three">
          <label className="birth-inputs__field">
            <span>出生地緯度</span>
            <input
              type="number"
              step="0.0001"
              value={latitude}
              onChange={(event) => onLatitudeChange(Number.parseFloat(event.target.value))}
              className="birth-inputs__control"
            />
          </label>
          <label className="birth-inputs__field">
            <span>出生地經度</span>
            <input
              type="number"
              step="0.0001"
              value={longitude}
              onChange={(event) => onLongitudeChange(Number.parseFloat(event.target.value))}
              className="birth-inputs__control"
            />
          </label>
        </div>
        <div className="birth-inputs__caption">常用出生地</div>
        <div className="birth-inputs__chips">
          {LOCATION_PRESETS.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onLatitudeChange(item.lat);
                onLongitudeChange(item.lon);
              }}
            >
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
}: {
  longitude: number;
  onLongitudeChange: (value: number) => void;
}) {
  return (
    <div className="birth-inputs birth-inputs--oracle">
      <div className="birth-inputs__panel">
        <div className="birth-inputs__header">
          <span>出生地</span>
          <h3>出生地經度</h3>
          <p>八字會用經度微調真太陽時；不知道精準經度時，可先選最接近的城市。</p>
        </div>
        <div className="birth-inputs__summary">
          <span>目前經度</span>
          <strong>{longitude.toFixed(4)}</strong>
        </div>
        <label className="birth-inputs__field">
          <span>經度</span>
          <input
            type="number"
            step="0.0001"
            value={longitude}
            onChange={(event) => onLongitudeChange(Number.parseFloat(event.target.value))}
            className="birth-inputs__control"
          />
        </label>
        <p className="birth-inputs__hint">紫微斗數會用經度微調真太陽時；若不確定，可先選最接近的城市。</p>
        <div className="birth-inputs__caption">常用出生地</div>
        <div className="birth-inputs__chips">
          {LOCATION_PRESETS.map((item) => (
            <button key={item.label} type="button" onClick={() => onLongitudeChange(item.lon)}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
