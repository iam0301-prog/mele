import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { calculateLifePath, __internal } from '../src/numerology.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const golden = JSON.parse(
  readFileSync(resolve(__dirname, 'golden/numerology.golden.json'), 'utf8'),
);

describe('numerology — internal helpers', () => {
  it('sumDigits: positive integers', () => {
    expect(__internal.sumDigits(0)).toBe(0);
    expect(__internal.sumDigits(9)).toBe(9);
    expect(__internal.sumDigits(28)).toBe(10);
    expect(__internal.sumDigits(1955)).toBe(20);
    expect(__internal.sumDigits(99999)).toBe(45);
  });

  it('reduceWithMaster: preserves master numbers', () => {
    expect(__internal.reduceWithMaster(11)).toBe(11);
    expect(__internal.reduceWithMaster(22)).toBe(22);
    expect(__internal.reduceWithMaster(33)).toBe(33);
  });

  it('reduceWithMaster: reduces composite to single', () => {
    expect(__internal.reduceWithMaster(28)).toBe(1); // 28→10→1
    expect(__internal.reduceWithMaster(20)).toBe(2);
    expect(__internal.reduceWithMaster(99)).toBe(9); // 99→18→9
  });

  it('reduceWithMaster: stops at master (44 not master, reduces)', () => {
    // 44 is NOT a master in standard Pythagorean
    expect(__internal.reduceWithMaster(44)).toBe(8);
  });

  it('reduceWithMaster: single digit unchanged', () => {
    for (let i = 0; i <= 9; i++) {
      expect(__internal.reduceWithMaster(i)).toBe(i);
    }
  });
});

describe('numerology — input validation', () => {
  it('rejects invalid year', () => {
    expect(() => calculateLifePath({ year: 0, month: 1, day: 1 })).toThrow();
    expect(() => calculateLifePath({ year: -1, month: 1, day: 1 })).toThrow();
    expect(() => calculateLifePath({ year: 1.5, month: 1, day: 1 })).toThrow();
  });

  it('rejects invalid month', () => {
    expect(() => calculateLifePath({ year: 2000, month: 0, day: 1 })).toThrow();
    expect(() => calculateLifePath({ year: 2000, month: 13, day: 1 })).toThrow();
  });

  it('rejects invalid day', () => {
    expect(() => calculateLifePath({ year: 2000, month: 1, day: 0 })).toThrow();
    expect(() => calculateLifePath({ year: 2000, month: 1, day: 32 })).toThrow();
    expect(() => calculateLifePath({ year: 2023, month: 2, day: 29 })).toThrow(); // not leap
    expect(() => calculateLifePath({ year: 2023, month: 4, day: 31 })).toThrow();
  });

  it('accepts leap year Feb 29', () => {
    expect(() => calculateLifePath({ year: 2024, month: 2, day: 29 })).not.toThrow();
    expect(() => calculateLifePath({ year: 2000, month: 2, day: 29 })).not.toThrow();
    expect(() => calculateLifePath({ year: 1900, month: 2, day: 29 })).toThrow(); // not leap
  });
});

describe('numerology — golden tests', () => {
  for (const c of golden.cases) {
    it(`${c.id}: ${c.label}`, () => {
      const result = calculateLifePath(c.input);
      expect(result.lifePath).toBe(c.expected.lifePath);
      expect(result.isMaster).toBe(c.expected.isMaster);
      expect(result.birthDay).toBe(c.expected.birthDay);
      expect(result.isBirthDayMaster).toBe(c.expected.isBirthDayMaster);
    });
  }

  it(`golden suite size >= 20`, () => {
    expect(golden.cases.length).toBeGreaterThanOrEqual(20);
  });
});

describe('numerology — determinism', () => {
  it('same input produces same output 100 times', () => {
    const input = { year: 1990, month: 5, day: 11 };
    const first = calculateLifePath(input);
    for (let i = 0; i < 100; i++) {
      expect(calculateLifePath(input)).toEqual(first);
    }
  });
});
