import { describe, it, expect } from 'vitest';
import { drawRunes, getRune, RUNES } from '../src/runes.js';

// Elder Futhark canonical order
const ELDER_FUTHARK_EN = [
  'Fehu', 'Uruz', 'Thurisaz', 'Ansuz', 'Raidho', 'Kenaz',
  'Gebo', 'Wunjo', 'Hagalaz', 'Nauthiz', 'Isa', 'Jera',
  'Eihwaz', 'Perthro', 'Algiz', 'Sowilo', 'Tiwaz', 'Berkano',
  'Ehwaz', 'Mannaz', 'Laguz', 'Ingwaz', 'Dagaz', 'Othala',
];

describe('runes — set integrity', () => {
  it('exactly 24 runes (Elder Futhark)', () => {
    expect(RUNES).toHaveLength(24);
  });

  it('numbered 1-24 unique', () => {
    const nums = RUNES.map((r) => r.num).sort((a, b) => a - b);
    expect(nums).toEqual([...Array(24).keys()].map((i) => i + 1));
  });

  it('matches canonical Elder Futhark order', () => {
    const ens = RUNES.map((r) => r.en);
    expect(ens).toEqual(ELDER_FUTHARK_EN);
  });

  it('every rune has all required fields', () => {
    for (const r of RUNES) {
      expect(r.name).toBeTruthy();
      expect(r.en).toBeTruthy();
      expect(r.symbol).toBeTruthy();
      expect(r.upright).toBeTruthy();
      expect(r.reversed).toBeTruthy();
      expect(r.keywords).toBeInstanceOf(Array);
    }
  });

  it('symbols are unique', () => {
    const symbols = RUNES.map((r) => r.symbol);
    expect(new Set(symbols).size).toBe(24);
  });
});

describe('runes — getRune', () => {
  it('returns rune by num', () => {
    expect(getRune(1).en).toBe('Fehu');
    expect(getRune(24).en).toBe('Othala');
  });

  it('throws on missing', () => {
    expect(() => getRune(0)).toThrow();
    expect(() => getRune(25)).toThrow();
  });
});

describe('runes — drawRunes', () => {
  it('default count 3', () => {
    expect(drawRunes().runes).toHaveLength(3);
  });

  it('no duplicates in draw', () => {
    for (let trial = 0; trial < 50; trial++) {
      const r = drawRunes({ count: 5 });
      const ids = r.runes.map((x) => x.rune.num);
      expect(new Set(ids).size).toBe(5);
    }
  });

  it('rejects invalid count', () => {
    expect(() => drawRunes({ count: 0 })).toThrow();
    expect(() => drawRunes({ count: 25 })).toThrow();
  });

  it('seed reproducibility', () => {
    const a = drawRunes({ count: 3, seed: 7 });
    const b = drawRunes({ count: 3, seed: 7 });
    expect(a.runes.map((r) => r.rune.num)).toEqual(b.runes.map((r) => r.rune.num));
  });

  it('reversed=false → all upright', () => {
    for (let i = 0; i < 30; i++) {
      const r = drawRunes({ count: 5, reversed: false });
      for (const x of r.runes) expect(x.position).toBe('upright');
    }
  });
});

describe('runes — distribution (5000 draws)', () => {
  it('all 24 runes appear at least once', () => {
    const seen = new Set();
    for (let i = 0; i < 5000; i++) {
      const r = drawRunes({ count: 1, reversed: false });
      seen.add(r.runes[0].rune.num);
    }
    expect(seen.size).toBe(24);
  });
});
