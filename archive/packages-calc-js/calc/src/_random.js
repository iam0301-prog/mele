// 隨機數工具
// secureRandomInt: 用 crypto.getRandomValues，加密級
// mulberry32: 確定性 PRNG，種子相同時序列相同（測試用）

import { webcrypto } from 'node:crypto';

const cryptoSource = typeof globalThis.crypto !== 'undefined' ? globalThis.crypto : webcrypto;

/**
 * 加密級隨機整數 [0, max)
 * 使用 rejection sampling 避免取模偏差。
 */
export function secureRandomInt(max) {
  if (!Number.isInteger(max) || max < 1) throw new Error(`Invalid max: ${max}`);
  if (max === 1) return 0;
  const range = 2 ** 32;
  const limit = range - (range % max); // bias 切點
  const buf = new Uint32Array(1);
  while (true) {
    cryptoSource.getRandomValues(buf);
    if (buf[0] < limit) return buf[0] % max;
  }
}

/**
 * Mulberry32：種子確定性 PRNG（用於測試）
 * 來源：Tommy Ettinger，公領域
 */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
