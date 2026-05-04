import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { calculateZiwei, getPalace, clockHourToTimeIndex } from '../src/ziwei.js';
import { calculateBaZi } from '../src/bazi.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(
  readFileSync(resolve(__dirname, 'golden/ziwei.golden.json'), 'utf8'),
);

describe('ziwei — clockHourToTimeIndex', () => {
  it('hour 0 → 子時 (idx 0)', () => {
    expect(clockHourToTimeIndex(0)).toBe(0);
  });

  it('hours 1-2 → 丑時 (idx 1)', () => {
    expect(clockHourToTimeIndex(1)).toBe(1);
    expect(clockHourToTimeIndex(2)).toBe(1);
  });

  it('hours 13-14 → 未時 (idx 7)', () => {
    expect(clockHourToTimeIndex(13)).toBe(7);
    expect(clockHourToTimeIndex(14)).toBe(7);
  });

  it('hour 22 → 亥時 (idx 11)', () => {
    expect(clockHourToTimeIndex(22)).toBe(11);
  });

  it('hour 23 default sect 2 → 早子 (idx 0)', () => {
    expect(clockHourToTimeIndex(23, 2)).toBe(0);
  });

  it('hour 23 sect 1 → 夜子 (idx 12)', () => {
    expect(clockHourToTimeIndex(23, 1)).toBe(12);
  });

  it('rejects invalid hour', () => {
    expect(() => clockHourToTimeIndex(-1)).toThrow();
    expect(() => clockHourToTimeIndex(24)).toThrow();
    expect(() => clockHourToTimeIndex(1.5)).toThrow();
  });
});

describe('ziwei — input validation', () => {
  it('rejects invalid gender', () => {
    expect(() => calculateZiwei({ year: 2000, month: 1, day: 1, hour: 12, gender: 'M' })).toThrow();
    expect(() => calculateZiwei({ year: 2000, month: 1, day: 1, hour: 12, gender: '' })).toThrow();
  });
});

describe('ziwei — golden tests', () => {
  for (const c of golden.cases) {
    it(`${c.id}: ${c.label}`, () => {
      const result = calculateZiwei(c.input);
      const exp = c.expected;
      if (exp.chineseDate) expect(result.chineseDate).toBe(exp.chineseDate);
      if (exp.time) expect(result.time).toBe(exp.time);
      if (exp.fiveElementsClass) expect(result.fiveElementsClass).toBe(exp.fiveElementsClass);
      if (exp.soul) expect(result.soul).toBe(exp.soul);
      if (exp.body) expect(result.body).toBe(exp.body);
      if (exp.sign) expect(result.sign).toBe(exp.sign);
      if (exp.zodiac) expect(result.zodiac).toBe(exp.zodiac);
      if (exp.mingGongPalace?.earthlyBranch) {
        expect(result.mingGong.earthlyBranch).toBe(exp.mingGongPalace.earthlyBranch);
      }
      if (exp.mingGongMajorStars) {
        const stars = result.mingGong.majorStars.map((s) => s.name);
        for (const s of exp.mingGongMajorStars) expect(stars).toContain(s);
      }
    });
  }
});

describe('ziwei — cross-validation with BaZi', () => {
  it('八字四柱 from iztro matches lunar-javascript', () => {
    const cases = [
      { year: 1990, month: 5, day: 15, hour: 14 },
      { year: 1955, month: 2, day: 24, hour: 19 },
      { year: 2000, month: 1, day: 1, hour: 12 },
    ];
    for (const dt of cases) {
      const z = calculateZiwei({ ...dt, gender: '男' });
      const b = calculateBaZi({ ...dt, minute: 0 });
      const expectedChineseDate = `${b.pillars.year} ${b.pillars.month} ${b.pillars.day} ${b.pillars.time}`;
      expect(z.chineseDate, `${dt.year}-${dt.month}-${dt.day} ${dt.hour}:00`).toBe(expectedChineseDate);
    }
  });
});

describe('ziwei — palace structure', () => {
  it('always has exactly 12 palaces', () => {
    const r = calculateZiwei({ year: 1990, month: 5, day: 15, hour: 14, gender: '男' });
    expect(r.palaces).toHaveLength(12);
  });

  it('contains all 12 standard palace names', () => {
    const r = calculateZiwei({ year: 1990, month: 5, day: 15, hour: 14, gender: '男' });
    const required = ['命宮', '兄弟', '夫妻', '子女', '財帛', '疾厄', '遷移', '僕役', '官祿', '田宅', '福德', '父母'];
    const names = r.palaces.map((p) => p.name);
    for (const r of required) expect(names).toContain(r);
  });

  it('getPalace returns correct palace', () => {
    const r = calculateZiwei({ year: 1990, month: 5, day: 15, hour: 14, gender: '男' });
    const ming = getPalace(r, '命宮');
    expect(ming).toBeDefined();
    expect(ming.name).toBe('命宮');
  });
});

describe('ziwei — determinism', () => {
  it('same input = same chart', () => {
    const input = { year: 1990, month: 5, day: 15, hour: 14, gender: '男' };
    const a = calculateZiwei(input);
    const b = calculateZiwei(input);
    expect(a.chineseDate).toBe(b.chineseDate);
    expect(a.fiveElementsClass).toBe(b.fiveElementsClass);
    expect(a.mingGong.earthlyBranch).toBe(b.mingGong.earthlyBranch);
  });
});
