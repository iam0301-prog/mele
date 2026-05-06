import { describe, expect, it } from 'vitest';
import { timezoneOffsetAt } from '@/lib/timezone';

describe('timezoneOffsetAt', () => {
  it('resolves a fixed Asia timezone', () => {
    expect(timezoneOffsetAt('Asia/Taipei', '1990-06-15', '12:00')).toBe(8);
  });

  it('honours daylight saving time for birthplace timezones', () => {
    expect(timezoneOffsetAt('America/Los_Angeles', '1990-07-01', '12:00')).toBe(-7);
    expect(timezoneOffsetAt('America/Los_Angeles', '1990-01-01', '12:00')).toBe(-8);
  });

  it('parses manual UTC offsets', () => {
    expect(timezoneOffsetAt('UTC+05:30', '1990-06-15', '12:00')).toBe(5.5);
    expect(timezoneOffsetAt(-3, '1990-06-15', '12:00')).toBe(-3);
  });
});
