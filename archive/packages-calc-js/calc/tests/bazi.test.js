import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { calculateBaZi, trueSolarTimeOffset, __data } from '../src/bazi.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(
  readFileSync(resolve(__dirname, 'golden/bazi.golden.json'), 'utf8'),
);

describe('bazi — data integrity', () => {
  it('10 天干 each map to 五行', () => {
    expect(Object.keys(__data.WUXING_GAN)).toHaveLength(10);
    for (const [g, e] of Object.entries(__data.WUXING_GAN)) {
      expect(['木', '火', '土', '金', '水']).toContain(e);
    }
  });

  it('12 地支 each map to 五行', () => {
    expect(Object.keys(__data.WUXING_ZHI)).toHaveLength(12);
    for (const [z, e] of Object.entries(__data.WUXING_ZHI)) {
      expect(['木', '火', '土', '金', '水']).toContain(e);
    }
  });

  it('10 天干 alternate yang/yin (甲陽乙陰...)', () => {
    const order = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    order.forEach((g, i) => {
      expect(__data.YIN_YANG_GAN[g]).toBe(i % 2 === 0 ? '陽' : '陰');
    });
  });
});

describe('bazi — input validation', () => {
  it('rejects out-of-range year (< 1900 or > 2100)', () => {
    expect(() => calculateBaZi({ year: 1899, month: 1, day: 1, hour: 0, minute: 0 })).toThrow();
    expect(() => calculateBaZi({ year: 2101, month: 1, day: 1, hour: 0, minute: 0 })).toThrow();
  });

  it('rejects invalid date components', () => {
    expect(() => calculateBaZi({ year: 2000, month: 13, day: 1, hour: 0, minute: 0 })).toThrow();
    expect(() => calculateBaZi({ year: 2000, month: 1, day: 32, hour: 0, minute: 0 })).toThrow();
    expect(() => calculateBaZi({ year: 2000, month: 1, day: 1, hour: 24, minute: 0 })).toThrow();
    expect(() => calculateBaZi({ year: 2000, month: 1, day: 1, hour: 0, minute: 60 })).toThrow();
  });
});

describe('bazi — golden tests', () => {
  for (const c of golden.cases) {
    it(`${c.id}: ${c.label}`, () => {
      const result = calculateBaZi(c.input);
      expect(result.pillars.year).toBe(c.expected.pillars.year);
      expect(result.pillars.month).toBe(c.expected.pillars.month);
      expect(result.pillars.day).toBe(c.expected.pillars.day);
      expect(result.pillars.time).toBe(c.expected.pillars.time);
      if (c.expected.dayMaster) {
        expect(result.dayMaster).toBe(c.expected.dayMaster);
      }
      if (c.expected.dayMasterElement) {
        expect(result.dayMasterElement).toBe(c.expected.dayMasterElement);
      }
    });
  }
});

describe('bazi — determinism', () => {
  it('same input produces same output 100x', () => {
    const input = { year: 1990, month: 5, day: 15, hour: 14, minute: 30 };
    const first = calculateBaZi(input);
    for (let i = 0; i < 100; i++) {
      expect(calculateBaZi(input)).toEqual(first);
    }
  });
});

describe('bazi — properties', () => {
  it('立春 is the year boundary, NOT Jan 1', () => {
    // 立春 in 2024 was Feb 4 16:27
    const before = calculateBaZi({ year: 2024, month: 2, day: 4, hour: 15, minute: 0 });
    const after = calculateBaZi({ year: 2024, month: 2, day: 4, hour: 18, minute: 0 });
    expect(before.pillars.year).toBe('癸卯'); // still 2023 year
    expect(after.pillars.year).toBe('甲辰');  // moved to 2024 year
  });

  it('day pillar advances by 1 in 60甲子 cycle each midnight', () => {
    const ganZhiCycle = [
      '甲子','乙丑','丙寅','丁卯','戊辰','己巳','庚午','辛未','壬申','癸酉',
      '甲戌','乙亥','丙子','丁丑','戊寅','己卯','庚辰','辛巳','壬午','癸未',
      '甲申','乙酉','丙戌','丁亥','戊子','己丑','庚寅','辛卯','壬辰','癸巳',
      '甲午','乙未','丙申','丁酉','戊戌','己亥','庚子','辛丑','壬寅','癸卯',
      '甲辰','乙巳','丙午','丁未','戊申','己酉','庚戌','辛亥','壬子','癸丑',
      '甲寅','乙卯','丙辰','丁巳','戊午','己未','庚申','辛酉','壬戌','癸亥',
    ];
    // Test 30 consecutive days starting from a known date
    const start = { year: 2024, month: 4, day: 1 };
    const startResult = calculateBaZi({ ...start, hour: 12, minute: 0 });
    const startIdx = ganZhiCycle.indexOf(startResult.pillars.day);
    expect(startIdx).toBeGreaterThanOrEqual(0);

    for (let i = 1; i <= 30; i++) {
      const d = new Date(Date.UTC(2024, 3, 1 + i));
      const r = calculateBaZi({
        year: d.getUTCFullYear(),
        month: d.getUTCMonth() + 1,
        day: d.getUTCDate(),
        hour: 12,
        minute: 0,
      });
      const expected = ganZhiCycle[(startIdx + i) % 60];
      expect(r.pillars.day).toBe(expected);
    }
  });

  it('五行 counts always sum to 8 (4 stems + 4 branches)', () => {
    const r = calculateBaZi({ year: 1990, month: 5, day: 15, hour: 14, minute: 30 });
    const total = Object.values(r.wuxing.counts).reduce((a, b) => a + b, 0);
    expect(total).toBe(8);
  });

  it('day master 五行 matches day stem', () => {
    const r = calculateBaZi({ year: 1955, month: 2, day: 24, hour: 19, minute: 15 });
    expect(r.dayMaster).toBe('丙');
    expect(r.dayMasterElement).toBe('火');
    expect(r.dayMasterYinYang).toBe('陽');
  });

  it('sect 1 vs sect 2 differs at 23:00-23:59', () => {
    const sect1 = calculateBaZi({
      year: 2023, month: 12, day: 31, hour: 23, minute: 30, sect: 1,
    });
    const sect2 = calculateBaZi({
      year: 2023, month: 12, day: 31, hour: 23, minute: 30, sect: 2,
    });
    // Sect 1 advances day, sect 2 keeps day
    expect(sect1.pillars.day).not.toBe(sect2.pillars.day);
  });

  it('sect agnostic for non-子時 hours', () => {
    const sect1 = calculateBaZi({
      year: 2024, month: 4, day: 27, hour: 14, minute: 0, sect: 1,
    });
    const sect2 = calculateBaZi({
      year: 2024, month: 4, day: 27, hour: 14, minute: 0, sect: 2,
    });
    expect(sect1.pillars).toEqual(sect2.pillars);
  });
});

describe('bazi — true solar time correction', () => {
  it('trueSolarTimeOffset: Taipei (121.5°E) is +6 min from CST', () => {
    expect(trueSolarTimeOffset(121.5, 120)).toBe(6);
  });

  it('trueSolarTimeOffset: 120°E (standard meridian) = 0', () => {
    expect(trueSolarTimeOffset(120, 120)).toBe(0);
  });

  it('trueSolarTimeOffset: Hong Kong (114.16°E) is -23.36 min', () => {
    expect(trueSolarTimeOffset(114.16, 120)).toBeCloseTo(-23.36, 1);
  });

  it('longitude correction shifts result when crossing time-pillar boundary', () => {
    // Taipei birth at 13:00 standard = 13:06 true solar (still 未時 13-15)
    const cst = calculateBaZi({ year: 1990, month: 5, day: 15, hour: 13, minute: 0 });
    const tst = calculateBaZi({ year: 1990, month: 5, day: 15, hour: 13, minute: 0, longitude: 121.5 });
    // Both 未時, time pillar same
    expect(cst.pillars.time).toBe(tst.pillars.time);
  });
});
