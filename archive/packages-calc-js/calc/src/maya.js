// 瑪雅曆 (Mayan Tzolkin — Dreamspell System)
//
// 這是 José Argüelles 的 Dreamspell 體系（不是傳統考古學的 GMT correlation）。
// 260 Kin = 20 Solar Seals × 13 Galactic Tones
//
// 錨點：1987-07-26 (UTC) = Kin 34 (8 Wizard / 8 白巫師)
// — Harmonic Convergence 共識，當代 Dreamspell 通用。
//
// 預設「忽略閏日 (Feb 29)」— Dreamspell 規則。
// 可選 includeLeapDay=true 將 2/29 也算入（變體）。
//
// 確定性：同一輸入必同一輸出。

const ANCHOR = { year: 1987, month: 7, day: 26, kin: 34 }; // UTC
const MS_PER_DAY = 86400000;

const SOLAR_SEALS = [
  { idx: 1, zh: '紅龍', en: 'Red Dragon', element: '火' },
  { idx: 2, zh: '白風', en: 'White Wind', element: '風' },
  { idx: 3, zh: '藍夜', en: 'Blue Night', element: '水' },
  { idx: 4, zh: '黃種子', en: 'Yellow Seed', element: '土' },
  { idx: 5, zh: '紅蛇', en: 'Red Serpent', element: '火' },
  { idx: 6, zh: '白世界橋', en: 'White Worldbridger', element: '風' },
  { idx: 7, zh: '藍手', en: 'Blue Hand', element: '水' },
  { idx: 8, zh: '黃星星', en: 'Yellow Star', element: '土' },
  { idx: 9, zh: '紅月', en: 'Red Moon', element: '火' },
  { idx: 10, zh: '白狗', en: 'White Dog', element: '風' },
  { idx: 11, zh: '藍猴', en: 'Blue Monkey', element: '水' },
  { idx: 12, zh: '黃人', en: 'Yellow Human', element: '土' },
  { idx: 13, zh: '紅天行者', en: 'Red Skywalker', element: '火' },
  { idx: 14, zh: '白巫師', en: 'White Wizard', element: '風' },
  { idx: 15, zh: '藍鷹', en: 'Blue Eagle', element: '水' },
  { idx: 16, zh: '黃戰士', en: 'Yellow Warrior', element: '土' },
  { idx: 17, zh: '紅地球', en: 'Red Earth', element: '火' },
  { idx: 18, zh: '白鏡', en: 'White Mirror', element: '風' },
  { idx: 19, zh: '藍風暴', en: 'Blue Storm', element: '水' },
  { idx: 20, zh: '黃太陽', en: 'Yellow Sun', element: '土' },
];

const GALACTIC_TONES = [
  { idx: 1, zh: '磁性', en: 'Magnetic', meaning: '統合' },
  { idx: 2, zh: '月亮', en: 'Lunar', meaning: '挑戰' },
  { idx: 3, zh: '電力', en: 'Electric', meaning: '啟動' },
  { idx: 4, zh: '自我存在', en: 'Self-Existing', meaning: '形式' },
  { idx: 5, zh: '超頻', en: 'Overtone', meaning: '輻射' },
  { idx: 6, zh: '韻律', en: 'Rhythmic', meaning: '平衡' },
  { idx: 7, zh: '共振', en: 'Resonant', meaning: '頻道' },
  { idx: 8, zh: '銀河星系', en: 'Galactic', meaning: '整合' },
  { idx: 9, zh: '太陽', en: 'Solar', meaning: '意圖' },
  { idx: 10, zh: '行星', en: 'Planetary', meaning: '顯現' },
  { idx: 11, zh: '光譜', en: 'Spectral', meaning: '釋放' },
  { idx: 12, zh: '水晶', en: 'Crystal', meaning: '合作' },
  { idx: 13, zh: '宇宙', en: 'Cosmic', meaning: '超越' },
];

function validateDate({ year, month, day }) {
  if (!Number.isInteger(year)) throw new Error(`Invalid year: ${year}`);
  if (!Number.isInteger(month) || month < 1 || month > 12)
    throw new Error(`Invalid month: ${month}`);
  if (!Number.isInteger(day) || day < 1 || day > 31)
    throw new Error(`Invalid day: ${day}`);
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (day > daysInMonth[month - 1])
    throw new Error(`Invalid date: ${year}-${month}-${day}`);
}

/** 計算指定日期區間內的 Feb 29 數量（含端點之間，不含起點當日） */
function countLeapDaysBetween(fromUTC, toUTC) {
  const sign = toUTC >= fromUTC ? 1 : -1;
  const [start, end] = sign > 0 ? [fromUTC, toUTC] : [toUTC, fromUTC];
  let count = 0;
  const y0 = new Date(start).getUTCFullYear();
  const y1 = new Date(end).getUTCFullYear();
  for (let y = y0; y <= y1; y++) {
    const isLeap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    if (!isLeap) continue;
    const leapDay = Date.UTC(y, 1, 29); // Feb 29
    if (leapDay > start && leapDay <= end) count++;
  }
  return count * sign;
}

/**
 * 計算指定生日的 Kin (1-260)
 * @param {{year,month,day}} date
 * @param {{includeLeapDay?:boolean}} [opts]
 * @returns {{
 *   kin: number,
 *   seal: object,
 *   tone: object,
 *   sealNum: number,
 *   toneNum: number,
 *   label: string,    // 例 "8 白巫師"
 *   labelEn: string,  // 例 "Galactic Wizard"
 * }}
 */
export function calculateKin({ year, month, day }, opts = {}) {
  validateDate({ year, month, day });
  const includeLeapDay = !!opts.includeLeapDay;

  const targetUTC = Date.UTC(year, month - 1, day);
  const anchorUTC = Date.UTC(ANCHOR.year, ANCHOR.month - 1, ANCHOR.day);
  let diff = Math.round((targetUTC - anchorUTC) / MS_PER_DAY);

  if (!includeLeapDay) {
    diff -= countLeapDaysBetween(anchorUTC, targetUTC);
  }

  const kin = (((ANCHOR.kin - 1 + diff) % 260) + 260) % 260 + 1;
  const sealNum = ((kin - 1) % 20) + 1;
  const toneNum = ((kin - 1) % 13) + 1;
  const seal = SOLAR_SEALS[sealNum - 1];
  const tone = GALACTIC_TONES[toneNum - 1];

  return {
    kin,
    seal,
    tone,
    sealNum,
    toneNum,
    label: `${tone.zh} ${seal.zh}`,
    labelEn: `${tone.en} ${seal.en}`,
  };
}

/**
 * 從 Kin 數字反推 seal/tone（不需要日期）
 */
export function kinInfo(kin) {
  if (!Number.isInteger(kin) || kin < 1 || kin > 260)
    throw new Error(`Invalid kin: ${kin}`);
  const sealNum = ((kin - 1) % 20) + 1;
  const toneNum = ((kin - 1) % 13) + 1;
  return {
    kin,
    sealNum,
    toneNum,
    seal: SOLAR_SEALS[sealNum - 1],
    tone: GALACTIC_TONES[toneNum - 1],
    label: `${GALACTIC_TONES[toneNum - 1].zh} ${SOLAR_SEALS[sealNum - 1].zh}`,
  };
}

/**
 * 命運神諭板（5 個 Kin：本命、引導、挑戰、隱藏、支持）
 * 算法依據：Argüelles' Dreamspell Oracle
 */
export function calculateOracle(kin) {
  if (!Number.isInteger(kin) || kin < 1 || kin > 260)
    throw new Error(`Invalid kin: ${kin}`);
  const sealNum = ((kin - 1) % 20) + 1;
  const toneNum = ((kin - 1) % 13) + 1;

  function findKin(s, t) {
    for (let k = 1; k <= 260; k++) {
      if (((k - 1) % 20) + 1 === s && ((k - 1) % 13) + 1 === t) return k;
    }
    return null;
  }

  // Analog 支持：seal_a + seal_b = 19 (mod 20) 配對；tone 相同
  // 經典 Dreamspell 規則：seal pairs sum to 19 (or 20-1)
  // 標準對：1↔19, 2↔18, 3↔17 ... 但 9↔11 (9+10=19), 10↔9
  // 採用 "Oracle support" 標準對應表
  const ANALOG = { 1:19, 2:18, 3:17, 4:16, 5:15, 6:14, 7:13, 8:12, 9:11, 10:20, 11:9, 12:8, 13:7, 14:6, 15:5, 16:4, 17:3, 18:2, 19:1, 20:10 };
  const analog = findKin(ANALOG[sealNum], toneNum);

  // Antipode 挑戰：seal 差 10
  const antipodeSeal = ((sealNum - 1 + 10) % 20) + 1;
  const antipode = findKin(antipodeSeal, toneNum);

  // Occult 隱藏：seal_a + seal_b = 21；tone_a + tone_b = 14
  const occultSeal = 21 - sealNum;
  const occultTone = 14 - toneNum;
  const occult = findKin(occultSeal, occultTone);

  // Guide 指引：tone 相同；seal offset = ((tone-1) × 4) mod 20
  // (Dreamspell guide rule: seals advance by tone-related offset)
  const guideOffset = ((toneNum - 1) * 4) % 20;
  const guideSeal = ((sealNum - 1 + guideOffset) % 20) + 1;
  const guide = findKin(guideSeal, toneNum);

  return {
    self: kin,
    analog,    // 支持
    antipode,  // 挑戰
    occult,    // 隱藏
    guide,     // 指引
  };
}

export const __data = { SOLAR_SEALS, GALACTIC_TONES, ANCHOR };
