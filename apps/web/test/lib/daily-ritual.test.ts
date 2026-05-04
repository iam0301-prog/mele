import { describe, expect, it } from 'vitest';
import {
  buildDailyReading,
  hashToSeed,
  localDrawKey,
  taipeiDateKey,
} from '@/lib/daily-ritual';

describe('lib/daily-ritual', () => {
  describe('hashToSeed', () => {
    it('is deterministic for the same input', () => {
      expect(hashToSeed('abc')).toBe(hashToSeed('abc'));
      expect(hashToSeed('2026-05-04:guest')).toBe(hashToSeed('2026-05-04:guest'));
    });

    it('produces different seeds for different inputs', () => {
      expect(hashToSeed('a')).not.toBe(hashToSeed('b'));
      expect(hashToSeed('2026-05-04:guest')).not.toBe(hashToSeed('2026-05-05:guest'));
    });

    it('returns non-negative 32-bit integer', () => {
      const h = hashToSeed('arbitrary string with 中文 and emoji 🌒');
      expect(Number.isInteger(h)).toBe(true);
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThan(2 ** 32);
    });
  });

  describe('taipeiDateKey', () => {
    it('returns YYYY-MM-DD format', () => {
      const key = taipeiDateKey(new Date('2026-05-04T12:00:00Z'));
      expect(key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('honours Taipei timezone (UTC+8) at midnight boundary', () => {
      // 2026-05-04 23:30 UTC = 2026-05-05 07:30 Taipei
      const key = taipeiDateKey(new Date('2026-05-04T23:30:00Z'));
      expect(key).toBe('2026-05-05');
    });
  });

  describe('buildDailyReading', () => {
    it('is deterministic for the same date + identity', () => {
      const a = buildDailyReading('2026-05-04', 'user-1');
      const b = buildDailyReading('2026-05-04', 'user-1');
      expect(a).toEqual(b);
    });

    it('changes when identity changes', () => {
      const guest = buildDailyReading('2026-05-04', 'guest');
      const userA = buildDailyReading('2026-05-04', 'user-1');
      // 不一定 100% 不同（hash collisions），但 title/section body 應有差異
      const sameTitle = guest.title === userA.title;
      const sameRitual = guest.ritual === userA.ritual;
      expect(sameTitle && sameRitual && guest.summary === userA.summary).toBe(false);
    });

    it('returns required shape', () => {
      const r = buildDailyReading('2026-05-04');
      expect(r.date).toBe('2026-05-04');
      expect(typeof r.title).toBe('string');
      expect(typeof r.summary).toBe('string');
      expect(r.sections).toHaveLength(3);
      r.sections.forEach((s) => {
        expect(s.title).toBeTruthy();
        expect(s.body).toBeTruthy();
      });
    });
  });

  describe('localDrawKey', () => {
    it('namespaces by tool and date', () => {
      expect(localDrawKey('tarot', '2026-05-04')).toBe('mele:daily-draw:tarot:2026-05-04');
      expect(localDrawKey('runes', '2026-05-04')).toBe('mele:daily-draw:runes:2026-05-04');
    });
  });
});
