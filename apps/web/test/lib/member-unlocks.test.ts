import { describe, expect, it } from 'vitest';
import {
  buildUnlockContentMetadata,
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
      expect(key.split(':')[2]).toBe('2026-05-04');
    });

    it('is stable for the same input', () => {
      expect(unlockScopeKey(tarotResult, 'deep_reading')).toBe(
        unlockScopeKey(tarotResult, 'deep_reading'),
      );
    });

    it('is stable when object keys are semantically equal but ordered differently', () => {
      const a: CalcResponse = {
        ...numerologyResult,
        input: { year: 1990, month: 6, day: 15 },
        data: { lifePath: 4, birthDay: 15, lifePathArchetype: '建造者' },
      };
      const b: CalcResponse = {
        ...numerologyResult,
        input: { day: 15, month: 6, year: 1990 },
        data: { lifePathArchetype: '建造者', birthDay: 15, lifePath: 4 },
      };
      expect(unlockScopeKey(a, 'deep_reading')).toBe(unlockScopeKey(b, 'deep_reading'));
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

  describe('buildUnlockContentMetadata', () => {
    it('sends only compact result hints for backend-generated paid content', () => {
      const metadata = buildUnlockContentMetadata(tarotResult);
      expect(metadata.result_anchor).toBe('愚者');
      expect(metadata.result_signals).toEqual(['愚者', '魔術師', '命運之輪']);
      expect(JSON.stringify(metadata)).not.toContain('完整深入解釋');
      expect(JSON.stringify(metadata)).not.toContain('今日流日解讀');
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
      expect(() => buildUnlockContentMetadata(empty)).not.toThrow();
    });
  });
});
