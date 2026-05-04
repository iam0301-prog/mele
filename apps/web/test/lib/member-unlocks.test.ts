import { describe, expect, it } from 'vitest';
import {
  buildUnlockedReadingContent,
  DAILY_POINT_AMOUNT,
  MEMBER_UNLOCK_OPTIONS,
  POINT_UNLOCK_COST,
  unlockScopeKey,
} from '@/lib/member-unlocks';
import type { CalcResponse } from '@/lib/api';

const tarotResult: CalcResponse = {
  tool: 'tarot',
  version: 'v1',
  computed_at: '2026-05-04T08:30:00Z',
  input: { question: '我該不該換工作' },
  data: {
    cards: [
      { card: { name_zh: '愚者', name_en: 'The Fool' } },
      { card: { name_zh: '魔術師' } },
      { card: { name_zh: '命運之輪' } },
    ],
  },
  render: {},
};

const numerologyResult: CalcResponse = {
  tool: 'numerology',
  version: 'v1',
  computed_at: '2026-05-04T08:30:00Z',
  input: { year: 1990, month: 6, day: 15 },
  data: { lifePath: 4, birthDay: 15, lifePathArchetype: '建造者' },
  render: {},
};

describe('lib/member-unlocks', () => {
  describe('constants', () => {
    it('exposes daily and unlock point values', () => {
      expect(DAILY_POINT_AMOUNT).toBe(200);
      expect(POINT_UNLOCK_COST).toBe(100);
    });

    it('defines four unlock options with required fields', () => {
      expect(MEMBER_UNLOCK_OPTIONS).toHaveLength(4);
      const types = MEMBER_UNLOCK_OPTIONS.map((o) => o.type);
      expect(types).toEqual(['deep_reading', 'transit_day', 'transit_month', 'transit_year']);
      MEMBER_UNLOCK_OPTIONS.forEach((opt) => {
        expect(opt.label).toBeTruthy();
        expect(opt.title).toBeTruthy();
        expect(opt.body).toBeTruthy();
      });
    });
  });

  describe('unlockScopeKey', () => {
    it('namespaces by tool + type + period', () => {
      const key = unlockScopeKey(tarotResult, 'deep_reading');
      expect(key.startsWith('tarot:deep_reading:')).toBe(true);
      // deep_reading 用 computed_at 前 10 碼
      expect(key.split(':')[2]).toBe('2026-05-04');
    });

    it('is stable for the same input', () => {
      expect(unlockScopeKey(tarotResult, 'deep_reading')).toBe(
        unlockScopeKey(tarotResult, 'deep_reading'),
      );
    });

    it('differs across unlock types', () => {
      const a = unlockScopeKey(tarotResult, 'deep_reading');
      const b = unlockScopeKey(tarotResult, 'transit_day');
      expect(a).not.toBe(b);
    });

    it('differs when result data differs', () => {
      const variant: CalcResponse = {
        ...tarotResult,
        data: { cards: [{ card: { name_zh: '高塔' } }] },
      };
      expect(unlockScopeKey(tarotResult, 'deep_reading')).not.toBe(
        unlockScopeKey(variant, 'deep_reading'),
      );
    });
  });

  describe('buildUnlockedReadingContent', () => {
    it('renders deep_reading shape for tarot', () => {
      const r = buildUnlockedReadingContent(tarotResult, 'deep_reading');
      expect(r.title).toBeTruthy();
      expect(r.summary).toBeTruthy();
      expect(Array.isArray(r.sections)).toBe(true);
      expect(r.sections.length).toBeGreaterThan(0);
      expect(Array.isArray(r.tasks)).toBe(true);
    });

    it('renders transit_month for numerology without throwing', () => {
      const r = buildUnlockedReadingContent(numerologyResult, 'transit_month');
      expect(r.title).toContain('本月');
    });

    it('survives missing data gracefully', () => {
      const empty: CalcResponse = {
        tool: 'numerology',
        version: 'v1',
        computed_at: '2026-05-04T00:00:00Z',
        input: {},
        data: {},
        render: {},
      };
      expect(() => buildUnlockedReadingContent(empty, 'deep_reading')).not.toThrow();
    });
  });
});
