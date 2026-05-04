import { describe, it, expect } from 'vitest';
import { drawCards, getCard, TAROT } from '../src/tarot.js';

describe('tarot — deck integrity', () => {
  it('exactly 78 cards', () => {
    expect(TAROT).toHaveLength(78);
  });

  it('22 major arcana (num 0-21)', () => {
    const major = TAROT.filter((c) => c.arcana === 'major');
    expect(major).toHaveLength(22);
    const nums = major.map((c) => c.num).sort((a, b) => a - b);
    expect(nums).toEqual([...Array(22).keys()]);
  });

  it('14 cards per minor suit', () => {
    for (const suit of ['wands', 'cups', 'swords', 'pentacles']) {
      const cards = TAROT.filter((c) => c.arcana === suit);
      expect(cards, `suit: ${suit}`).toHaveLength(14);
    }
  });

  it('all card numbers unique 0-77', () => {
    const nums = TAROT.map((c) => c.num);
    expect(new Set(nums).size).toBe(78);
    expect(Math.min(...nums)).toBe(0);
    expect(Math.max(...nums)).toBe(77);
  });

  it('every card has required fields', () => {
    for (const c of TAROT) {
      expect(c.name, `card ${c.num}`).toBeTruthy();
      expect(c.en, `card ${c.num}`).toBeTruthy();
      expect(c.upright, `card ${c.num}`).toBeTruthy();
      expect(c.reversed, `card ${c.num}`).toBeTruthy();
      expect(c.keywords, `card ${c.num}`).toBeInstanceOf(Array);
      expect(c.keywords.length, `card ${c.num}`).toBeGreaterThan(0);
    }
  });

  it('canonical major arcana order (Fool=0, Magician=1, ..., World=21)', () => {
    const expectedFirstFew = [
      [0, 'The Fool'],
      [1, 'The Magician'],
      [2, 'The High Priestess'],
      [13, 'Death'],
      [21, 'The World'],
    ];
    for (const [num, en] of expectedFirstFew) {
      const c = TAROT.find((x) => x.num === num);
      expect(c.en, `num ${num}`).toBe(en);
    }
  });
});

describe('tarot — getCard', () => {
  it('returns card by num', () => {
    expect(getCard(0).en).toBe('The Fool');
    expect(getCard(21).en).toBe('The World');
  });

  it('throws on missing num', () => {
    expect(() => getCard(99)).toThrow();
    expect(() => getCard(-1)).toThrow();
  });
});

describe('tarot — drawCards', () => {
  it('default draws 3 cards', () => {
    const r = drawCards();
    expect(r.cards).toHaveLength(3);
  });

  it('respects count parameter', () => {
    for (const n of [1, 5, 10, 78]) {
      const r = drawCards({ count: n });
      expect(r.cards).toHaveLength(n);
    }
  });

  it('rejects invalid count', () => {
    expect(() => drawCards({ count: 0 })).toThrow();
    expect(() => drawCards({ count: 79 })).toThrow();
    expect(() => drawCards({ count: 1.5 })).toThrow();
  });

  it('drawn cards are unique (no duplicates)', () => {
    for (let trial = 0; trial < 50; trial++) {
      const r = drawCards({ count: 10 });
      const ids = r.cards.map((c) => c.card.num);
      expect(new Set(ids).size).toBe(10);
    }
  });

  it('reversed=false produces all upright', () => {
    for (let trial = 0; trial < 30; trial++) {
      const r = drawCards({ count: 5, reversed: false });
      for (const c of r.cards) expect(c.position).toBe('upright');
    }
  });

  it('seed produces reproducible results', () => {
    const r1 = drawCards({ count: 5, seed: 42 });
    const r2 = drawCards({ count: 5, seed: 42 });
    expect(r1.cards.map((c) => c.card.num)).toEqual(r2.cards.map((c) => c.card.num));
    expect(r1.cards.map((c) => c.position)).toEqual(r2.cards.map((c) => c.position));
  });

  it('different seeds typically produce different draws', () => {
    const a = drawCards({ count: 10, seed: 1 });
    const b = drawCards({ count: 10, seed: 99 });
    const aIds = a.cards.map((c) => c.card.num).join(',');
    const bIds = b.cards.map((c) => c.card.num).join(',');
    expect(aIds).not.toBe(bIds);
  });
});

describe('tarot — distribution sanity (10000 single draws)', () => {
  it('each card appears at least once across 10000 draws', () => {
    const seen = new Set();
    for (let i = 0; i < 10000; i++) {
      const r = drawCards({ count: 1, reversed: false });
      seen.add(r.cards[0].card.num);
    }
    // 10000 / 78 ≈ 128 expected per card; > 99.99% chance all 78 appear
    expect(seen.size).toBe(78);
  });

  it('upright/reversed roughly 50/50 (within ±5%)', () => {
    let upright = 0;
    const N = 10000;
    for (let i = 0; i < N; i++) {
      const r = drawCards({ count: 1 });
      if (r.cards[0].position === 'upright') upright++;
    }
    const ratio = upright / N;
    expect(ratio).toBeGreaterThan(0.45);
    expect(ratio).toBeLessThan(0.55);
  });
});
