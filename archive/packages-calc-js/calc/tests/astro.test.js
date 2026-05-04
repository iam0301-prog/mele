import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import {
  calculateNatalChart,
  calculatePlanets,
  calculateHouses,
  longitudeToSign,
  __data,
} from '../src/astro.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(
  readFileSync(resolve(__dirname, 'golden/astro.golden.json'), 'utf8'),
);

describe('astro — data integrity', () => {
  it('12 zodiac signs', () => {
    expect(__data.SIGNS).toHaveLength(12);
    const expected = ['牡羊','金牛','雙子','巨蟹','獅子','處女','天秤','天蠍','射手','摩羯','水瓶','雙魚'];
    expect(__data.SIGNS.map((s) => s.zh)).toEqual(expected);
  });

  it('10 planets defined', () => {
    expect(__data.PLANETS).toHaveLength(10);
    const expected = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto'];
    expect(__data.PLANETS.map((p) => p.key)).toEqual(expected);
  });
});

describe('astro — longitudeToSign', () => {
  it('0° → Aries', () => {
    expect(longitudeToSign(0).zh).toBe('牡羊');
    expect(longitudeToSign(0).degInSign).toBeCloseTo(0, 4);
  });

  it('30° → Taurus', () => {
    expect(longitudeToSign(30).zh).toBe('金牛');
    expect(longitudeToSign(30).degInSign).toBeCloseTo(0, 4);
  });

  it('89.99° → end of Gemini', () => {
    expect(longitudeToSign(89.99).zh).toBe('雙子');
  });

  it('90° → start of Cancer', () => {
    expect(longitudeToSign(90).zh).toBe('巨蟹');
  });

  it('270° → Capricorn', () => {
    expect(longitudeToSign(270).zh).toBe('摩羯');
  });

  it('359.99° → end of Pisces', () => {
    expect(longitudeToSign(359.99).zh).toBe('雙魚');
  });

  it('handles negative longitude', () => {
    expect(longitudeToSign(-30).zh).toBe('雙魚');
  });

  it('handles >360 longitude', () => {
    expect(longitudeToSign(390).zh).toBe('金牛');
  });
});

describe('astro — equinox/solstice golden tests', () => {
  for (const c of golden.cases.filter((c) => c.expected.sun?.longitudeAround !== undefined)) {
    it(`${c.id}: ${c.label}`, () => {
      const r = calculatePlanets(c.input);
      const lon = r.planets.sun.longitude;
      const expected = c.expected.sun.longitudeAround;
      const tolerance = c.expected.sun.tolerance ?? 0.1;
      const diff = Math.min(
        Math.abs(lon - expected),
        Math.abs(lon - expected - 360),
        Math.abs(lon - expected + 360),
      );
      expect(diff, `Sun longitude ${lon} vs expected ${expected}±${tolerance}`).toBeLessThan(tolerance);
      expect(r.planets.sun.sign.zh).toBe(c.expected.sun.sign);
    });
  }
});

describe('astro — natal chart golden tests', () => {
  for (const c of golden.cases.filter((c) => c.input.datetime)) {
    it(`${c.id}: ${c.label}`, () => {
      const chart = calculateNatalChart(c.input.datetime, c.input.location);
      const exp = c.expected;

      if (exp.sun) {
        if (exp.sun.sign) expect(chart.sun.sign.zh).toBe(exp.sun.sign);
        if (exp.sun.degInSignAround !== undefined) {
          const diff = Math.abs(chart.sun.sign.degInSign - exp.sun.degInSignAround);
          expect(diff, `Sun degInSign ${chart.sun.sign.degInSign}`).toBeLessThan(exp.sun.tolerance ?? 0.5);
        }
      }
      if (exp.moon) {
        if (exp.moon.sign) expect(chart.moon.sign.zh).toBe(exp.moon.sign);
      }
      for (const p of ['mercury','venus','mars','jupiter','saturn','uranus','neptune','pluto']) {
        if (exp[p]?.sign) expect(chart.planets[p].sign.zh, p).toBe(exp[p].sign);
      }
      if (exp.ascendant?.sign) {
        expect(chart.ascendant.sign.zh).toBe(exp.ascendant.sign);
        if (exp.ascendant.degInSignAround !== undefined) {
          const diff = Math.abs(chart.ascendant.sign.degInSign - exp.ascendant.degInSignAround);
          expect(diff).toBeLessThan(exp.ascendant.tolerance ?? 1);
        }
      }
    });
  }
});

describe('astro — sun sign cusp tests', () => {
  for (const c of golden.cases.filter((c) => c.input.year && !c.expected.sun?.longitudeAround)) {
    it(`${c.id}: ${c.label}`, () => {
      const r = calculatePlanets(c.input);
      expect(r.planets.sun.sign.zh).toBe(c.expected.sun.sign);
    });
  }
});

describe('astro — determinism', () => {
  it('same input = same chart', () => {
    const dt = { year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 };
    const loc = { lat: 25.0330, lon: 121.5654 };
    const a = calculateNatalChart(dt, loc);
    const b = calculateNatalChart(dt, loc);
    expect(a.sun.longitude).toBe(b.sun.longitude);
    expect(a.ascendant.longitude).toBe(b.ascendant.longitude);
  });
});

describe('astro — properties', () => {
  it('all 12 houses, increasing longitude (mod 360)', () => {
    const dt = { year: 1990, month: 5, day: 15, hour: 14, minute: 30, timezone: 8 };
    const loc = { lat: 25.0330, lon: 121.5654 };
    const houses = calculateHouses(dt, loc);
    expect(houses.houseCusps).toHaveLength(12);
  });

  it('Sun moves ~1° per day on average', () => {
    const day1 = calculatePlanets({ year: 2024, month: 4, day: 1, hour: 12, minute: 0, timezone: 0 });
    const day2 = calculatePlanets({ year: 2024, month: 4, day: 2, hour: 12, minute: 0, timezone: 0 });
    let diff = day2.planets.sun.longitude - day1.planets.sun.longitude;
    if (diff < 0) diff += 360;
    expect(diff).toBeGreaterThan(0.9);
    expect(diff).toBeLessThan(1.1);
  });

  it('Moon moves ~13° per day on average', () => {
    const day1 = calculatePlanets({ year: 2024, month: 4, day: 1, hour: 12, minute: 0, timezone: 0 });
    const day2 = calculatePlanets({ year: 2024, month: 4, day: 2, hour: 12, minute: 0, timezone: 0 });
    let diff = day2.planets.moon.longitude - day1.planets.moon.longitude;
    if (diff < 0) diff += 360;
    expect(diff).toBeGreaterThan(11);
    expect(diff).toBeLessThan(15);
  });
});
