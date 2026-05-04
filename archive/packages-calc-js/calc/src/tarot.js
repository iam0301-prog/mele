// 塔羅占卜 (Tarot)
//
// 78 張 Rider-Waite 牌組（22 大阿爾克那 + 56 小阿爾克那）
// 演算法：Fisher-Yates shuffle + 加密級隨機 (crypto.getRandomValues)
// 確定性：可選 seed 參數讓抽牌可重現（測試用）；預設使用真隨機

import { TAROT } from '@mele/data/tarot';
import { secureRandomInt, mulberry32 } from './_random.js';

/**
 * 抽塔羅牌
 * @param {{
 *   count?: number,           // 抽幾張（預設 3）
 *   reversed?: boolean,       // 是否啟用逆位（預設 true，50/50）
 *   spread?: string,          // 牌陣名稱（僅 metadata）
 *   seed?: number,            // 種子（測試用，提供時切換為 mulberry32）
 * }} [opts]
 * @returns {{
 *   cards: Array<{
 *     card: object,           // 完整牌資訊
 *     position: 'upright' | 'reversed',
 *     drawIndex: number,
 *   }>,
 *   meta: { count, reversed, spread, seeded }
 * }}
 */
export function drawCards(opts = {}) {
  const count = opts.count ?? 3;
  const allowReversed = opts.reversed ?? true;
  const seeded = opts.seed !== undefined;
  const rng = seeded ? mulberry32(opts.seed) : null;

  if (!Number.isInteger(count) || count < 1 || count > TAROT.length)
    throw new Error(`Invalid count: ${count} (must be 1-${TAROT.length})`);

  const randInt = (max) => seeded ? Math.floor(rng() * max) : secureRandomInt(max);
  const randBool = () => seeded ? rng() < 0.5 : secureRandomInt(2) === 0;

  // Fisher-Yates partial shuffle
  const indices = TAROT.map((_, i) => i);
  for (let i = indices.length - 1; i > indices.length - 1 - count; i--) {
    const j = randInt(i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const picked = indices.slice(-count).reverse();

  const cards = picked.map((idx, drawIndex) => ({
    card: TAROT[idx],
    position: allowReversed && randBool() ? 'reversed' : 'upright',
    drawIndex,
  }));

  return {
    cards,
    meta: {
      count,
      reversed: allowReversed,
      spread: opts.spread ?? null,
      seeded,
    },
  };
}

/** 取得單張牌完整資訊（依 num） */
export function getCard(num) {
  const c = TAROT.find((c) => c.num === num);
  if (!c) throw new Error(`Tarot card not found: ${num}`);
  return c;
}

export { TAROT };
