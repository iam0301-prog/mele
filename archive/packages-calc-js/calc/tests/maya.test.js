import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { calculateKin, kinInfo, calculateOracle, __data } from '../src/maya.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(
  readFileSync(resolve(__dirname, 'golden/maya.golden.json'), 'utf8'),
);

describe('maya — data integrity', () => {
  it('20 solar seals indexed 1-20 with matching idx', () => {
    expect(__data.SOLAR_SEALS).toHaveLength(20);
    __data.SOLAR_SEALS.forEach((s, i) => {
      expect(s.idx).toBe(i + 1);
      expect(s.zh).toBeTruthy();
      expect(s.en).toBeTruthy();
    });
  });

  it('13 galactic tones indexed 1-13', () => {
    expect(__data.GALACTIC_TONES).toHaveLength(13);
    __data.GALACTIC_TONES.forEach((t, i) => {
      expect(t.idx).toBe(i + 1);
    });
  });

  it('260 unique Kin combinations (20 × 13)', () => {
    const seen = new Set();
    for (let k = 1; k <= 260; k++) {
      const i = kinInfo(k);
      const key = `${i.sealNum}-${i.toneNum}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
    }
    expect(seen.size).toBe(260);
  });
});

describe('maya — input validation', () => {
  it('rejects invalid date', () => {
    expect(() => calculateKin({ year: 2023, month: 2, day: 29 })).toThrow();
    expect(() => calculateKin({ year: 2023, month: 13, day: 1 })).toThrow();
  });

  it('kinInfo rejects out-of-range', () => {
    expect(() => kinInfo(0)).toThrow();
    expect(() => kinInfo(261)).toThrow();
    expect(() => kinInfo(1.5)).toThrow();
  });
});

describe('maya — golden tests', () => {
  for (const c of golden.cases) {
    it(`${c.id}: ${c.label}`, () => {
      const result = calculateKin(c.input, c.options);
      expect(result.kin).toBe(c.expected.kin);
      expect(result.sealNum).toBe(c.expected.sealNum);
      expect(result.toneNum).toBe(c.expected.toneNum);
      if (c.expected.label) {
        expect(result.label).toBe(c.expected.label);
      }
    });
  }
});

describe('maya — determinism', () => {
  it('same input = same Kin 100x', () => {
    const input = { year: 1990, month: 5, day: 11 };
    const first = calculateKin(input);
    for (let i = 0; i < 100; i++) {
      expect(calculateKin(input)).toEqual(first);
    }
  });
});

describe('maya — 260-day cycle property', () => {
  it('anchor + 260 effective days = anchor Kin', () => {
    // Pick any non-leap-crossing date pair 260 days apart
    const a = calculateKin({ year: 1987, month: 7, day: 26 });
    expect(a.kin).toBe(34);

    // 1988-04-12 is 261 raw days from 1987-07-26 (crosses Feb 29 1988),
    // = 260 effective days under default ignoreLeapDay
    const b = calculateKin({ year: 1988, month: 4, day: 12 });
    expect(b.kin).toBe(34);
  });

  it('Day Out of Time (Feb 29) merges to Feb 28 Kin in default mode', () => {
    const f28 = calculateKin({ year: 2000, month: 2, day: 28 });
    const f29 = calculateKin({ year: 2000, month: 2, day: 29 });
    expect(f29.kin).toBe(f28.kin);
  });

  it('Feb 29 advances when includeLeapDay=true', () => {
    const f28 = calculateKin({ year: 2000, month: 2, day: 28 });
    const f29 = calculateKin({ year: 2000, month: 2, day: 29 }, { includeLeapDay: true });
    expect(f29.kin).not.toBe(f28.kin);
  });
});

describe('maya — Oracle (神諭板)', () => {
  it('Oracle for Kin 1 (Magnetic Dragon) returns 5 Kins', () => {
    const o = calculateOracle(1);
    expect(o.self).toBe(1);
    expect(o.analog).toBeTypeOf('number');
    expect(o.antipode).toBeTypeOf('number');
    expect(o.occult).toBeTypeOf('number');
    expect(o.guide).toBeTypeOf('number');
  });

  it('Antipode seal differs by 10 from self', () => {
    for (const kin of [1, 34, 130, 207, 260]) {
      const o = calculateOracle(kin);
      const selfSeal = ((kin - 1) % 20) + 1;
      const antipodeSeal = ((o.antipode - 1) % 20) + 1;
      const diff = Math.abs(antipodeSeal - selfSeal);
      expect(diff === 10 || diff === 10).toBe(true);
    }
  });

  it('Antipode shares same tone as self', () => {
    for (const kin of [1, 34, 100, 207]) {
      const o = calculateOracle(kin);
      expect(((kin - 1) % 13) + 1).toBe(((o.antipode - 1) % 13) + 1);
    }
  });

  it('Occult: seals sum to 21, tones sum to 14', () => {
    for (const kin of [34, 100, 207]) {
      const selfSeal = ((kin - 1) % 20) + 1;
      const selfTone = ((kin - 1) % 13) + 1;
      const o = calculateOracle(kin);
      const occultSeal = ((o.occult - 1) % 20) + 1;
      const occultTone = ((o.occult - 1) % 13) + 1;
      expect(selfSeal + occultSeal).toBe(21);
      expect(selfTone + occultTone).toBe(14);
    }
  });

  it('For Magnetic tone (1), guide is self', () => {
    const o = calculateOracle(1); // 1 Dragon
    expect(o.guide).toBe(1);
  });
});
