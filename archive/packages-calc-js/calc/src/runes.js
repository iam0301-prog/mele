// 盧恩占卜 (Elder Futhark Runes)
//
// 24 個 Elder Futhark 古英語符文
// 演算法：Fisher-Yates shuffle + 加密級隨機

import { RUNES } from '@mele/data/runes';
import { secureRandomInt, mulberry32 } from './_random.js';

/**
 * 抽盧恩符文
 * @param {{
 *   count?: number,
 *   reversed?: boolean,
 *   spread?: string,
 *   seed?: number,
 * }} [opts]
 */
export function drawRunes(opts = {}) {
  const count = opts.count ?? 3;
  const allowReversed = opts.reversed ?? true;
  const seeded = opts.seed !== undefined;
  const rng = seeded ? mulberry32(opts.seed) : null;

  if (!Number.isInteger(count) || count < 1 || count > RUNES.length)
    throw new Error(`Invalid count: ${count} (must be 1-${RUNES.length})`);

  const randInt = (max) => seeded ? Math.floor(rng() * max) : secureRandomInt(max);
  const randBool = () => seeded ? rng() < 0.5 : secureRandomInt(2) === 0;

  const indices = RUNES.map((_, i) => i);
  for (let i = indices.length - 1; i > indices.length - 1 - count; i--) {
    const j = randInt(i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const picked = indices.slice(-count).reverse();

  const runes = picked.map((idx, drawIndex) => ({
    rune: RUNES[idx],
    position: allowReversed && randBool() ? 'reversed' : 'upright',
    drawIndex,
  }));

  return {
    runes,
    meta: {
      count,
      reversed: allowReversed,
      spread: opts.spread ?? null,
      seeded,
    },
  };
}

export function getRune(num) {
  const r = RUNES.find((r) => r.num === num);
  if (!r) throw new Error(`Rune not found: ${num}`);
  return r;
}

export { RUNES };
