export const DEFAULT_BIRTH_TIMEZONE = 'Asia/Taipei';
export const DEFAULT_BIRTH_TIMEZONE_OFFSET = 8;

const STATIC_TIMEZONE_OFFSETS: Record<string, number> = {
  UTC: 0,
  'Etc/UTC': 0,
  'Asia/Taipei': 8,
  'Asia/Shanghai': 8,
  'Asia/Hong_Kong': 8,
  'Asia/Singapore': 8,
  'Asia/Tokyo': 9,
  'Asia/Seoul': 9,
  'Asia/Ho_Chi_Minh': 7,
  'Asia/Jakarta': 7,
};

function parseDateParts(date?: string) {
  const [rawYear, rawMonth, rawDay] = (date || '').split('-').map((part) => Number.parseInt(part, 10));
  const now = new Date();
  return {
    year: Number.isFinite(rawYear) ? rawYear : now.getFullYear(),
    month: Number.isFinite(rawMonth) ? rawMonth : now.getMonth() + 1,
    day: Number.isFinite(rawDay) ? rawDay : now.getDate(),
  };
}

function parseTimeParts(time?: string) {
  const [rawHour, rawMinute] = (time || '12:00').split(':').map((part) => Number.parseInt(part, 10));
  return {
    hour: Number.isFinite(rawHour) ? rawHour : 12,
    minute: Number.isFinite(rawMinute) ? rawMinute : 0,
  };
}

export function parseUtcOffset(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const numeric = Number(trimmed);
  if (Number.isFinite(numeric)) return numeric;

  if (/^(UTC|GMT)$/i.test(trimmed)) return 0;
  const match = trimmed.match(/^(?:UTC|GMT)?([+-])(\d{1,2})(?::?(\d{2}))?$/i);
  if (!match) return null;

  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number.parseInt(match[2], 10);
  const minutes = match[3] ? Number.parseInt(match[3], 10) : 0;
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return sign * (hours + minutes / 60);
}

function parseFormattedOffset(value: string): number | null {
  if (/^(UTC|GMT)$/i.test(value)) return 0;
  const normalized = value.replace(/\s/g, '').replace(/^GMT/i, 'UTC');
  return parseUtcOffset(normalized);
}

export function timezoneOffsetAt(
  timezone: string | number | null | undefined,
  date?: string,
  time?: string,
): number {
  if (typeof timezone === 'number' && Number.isFinite(timezone)) return timezone;
  if (typeof timezone !== 'string') return DEFAULT_BIRTH_TIMEZONE_OFFSET;

  const parsed = parseUtcOffset(timezone);
  if (parsed !== null) return parsed;

  const mapped = STATIC_TIMEZONE_OFFSETS[timezone];
  if (typeof mapped === 'number') return mapped;

  const { year, month, day } = parseDateParts(date);
  const { hour, minute } = parseTimeParts(time);
  const probe = new Date(Date.UTC(year, month - 1, day, hour, minute));

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      timeZoneName: 'shortOffset',
      hour: '2-digit',
      minute: '2-digit',
    }).formatToParts(probe);
    const offsetText = parts.find((part) => part.type === 'timeZoneName')?.value;
    const offset = offsetText ? parseFormattedOffset(offsetText) : null;
    return offset ?? DEFAULT_BIRTH_TIMEZONE_OFFSET;
  } catch {
    return DEFAULT_BIRTH_TIMEZONE_OFFSET;
  }
}

export function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_BIRTH_TIMEZONE;
  } catch {
    return DEFAULT_BIRTH_TIMEZONE;
  }
}
