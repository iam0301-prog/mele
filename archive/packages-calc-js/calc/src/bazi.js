// 八字 (BaZi / Four Pillars of Destiny)
//
// 演算庫：lunar-javascript（中國農曆 / 八字 / 節氣 標準庫，github.com/6tail/lunar-javascript, MIT）
// 作者 6tail 為中國命理研究者，演算法已被廣泛採用。
//
// 確定性：同一輸入必同一輸出。
//
// 重要規範：
// 1. 年柱以「立春」為界（不是 1/1 或農曆元旦）
// 2. 月柱以「節氣」為界（每月的「節」，如立春、驚蟄、清明...）
// 3. 日柱為 60 甲子連續循環
// 4. 時柱由日干 + 時辰決定（每 2 小時為 1 時辰）
// 5. 子時派別：
//    - sect=1 (傳統派 / 早子夜子分派): 23:00 後算次日子時，前一日的時柱為「夜子」
//    - sect=2 (現代派 / 預設): 23:00 後仍算當日的子時（不分早夜）
// 6. 真太陽時校正：可選 longitude 參數，按地理經度修正

import lunar from 'lunar-javascript';
const { Solar } = lunar;

// 五行
const WUXING_GAN = {
  甲: '木', 乙: '木', 丙: '火', 丁: '火',
  戊: '土', 己: '土', 庚: '金', 辛: '金',
  壬: '水', 癸: '水',
};
const WUXING_ZHI = {
  子: '水', 丑: '土', 寅: '木', 卯: '木',
  辰: '土', 巳: '火', 午: '火', 未: '土',
  申: '金', 酉: '金', 戌: '土', 亥: '水',
};

// 陰陽
const YIN_YANG_GAN = {
  甲: '陽', 乙: '陰', 丙: '陽', 丁: '陰',
  戊: '陽', 己: '陰', 庚: '陽', 辛: '陰',
  壬: '陽', 癸: '陰',
};

function validateInput({ year, month, day, hour, minute }) {
  if (!Number.isInteger(year) || year < 1900 || year > 2100)
    throw new Error(`Year out of supported range (1900-2100): ${year}`);
  if (!Number.isInteger(month) || month < 1 || month > 12)
    throw new Error(`Invalid month: ${month}`);
  if (!Number.isInteger(day) || day < 1 || day > 31)
    throw new Error(`Invalid day: ${day}`);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23)
    throw new Error(`Invalid hour: ${hour}`);
  if (!Number.isInteger(minute) || minute < 0 || minute > 59)
    throw new Error(`Invalid minute: ${minute}`);
}

/**
 * 真太陽時校正（按經度）
 * @param {number} longitude 出生地經度（東經正、西經負）
 * @returns {number} minutes offset（要從標準時減去/加上的分鐘）
 *
 * 公式：每 15° 經度差 = 1 小時時差。台北標準時 (UTC+8) 對應 120°E。
 * 例：台北 (121.5°E) 真太陽時比標準時快 (121.5-120) × 4 = 6 分鐘
 */
export function trueSolarTimeOffset(longitude, standardMeridian = 120) {
  if (typeof longitude !== 'number') return 0;
  return (longitude - standardMeridian) * 4; // minutes
}

/**
 * 計算八字
 * @param {{
 *   year: number,
 *   month: number,
 *   day: number,
 *   hour: number,
 *   minute: number,
 *   sect?: 1 | 2,             // 子時派別，預設 2 (現代派)
 *   longitude?: number,        // 出生地經度（用於真太陽時校正）
 *   standardMeridian?: number, // 標準時區經度（台灣 = 120）
 * }} input
 * @returns {object} 完整八字資訊
 */
export function calculateBaZi(input) {
  validateInput(input);
  const {
    year, month, day, hour, minute,
    sect = 2,
    longitude = null,
    standardMeridian = 120,
  } = input;

  // 真太陽時校正
  let adjMin = minute;
  let adjHour = hour;
  let adjDay = day;
  let adjMonth = month;
  let adjYear = year;
  if (longitude !== null) {
    const offsetMin = trueSolarTimeOffset(longitude, standardMeridian);
    const date = new Date(Date.UTC(year, month - 1, day, hour, minute));
    date.setUTCMinutes(date.getUTCMinutes() + offsetMin);
    adjYear = date.getUTCFullYear();
    adjMonth = date.getUTCMonth() + 1;
    adjDay = date.getUTCDate();
    adjHour = date.getUTCHours();
    adjMin = date.getUTCMinutes();
  }

  const solar = Solar.fromYmdHms(adjYear, adjMonth, adjDay, adjHour, adjMin, 0);
  const ec = solar.getLunar().getEightChar();
  ec.setSect(sect);

  const yearGZ = ec.getYear();
  const monthGZ = ec.getMonth();
  const dayGZ = ec.getDay();
  const timeGZ = ec.getTime();

  const yearGan = ec.getYearGan();
  const yearZhi = ec.getYearZhi();
  const monthGan = ec.getMonthGan();
  const monthZhi = ec.getMonthZhi();
  const dayGan = ec.getDayGan();
  const dayZhi = ec.getDayZhi();
  const timeGan = ec.getTimeGan();
  const timeZhi = ec.getTimeZhi();

  // 五行統計
  const wuxingCount = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };
  for (const g of [yearGan, monthGan, dayGan, timeGan]) wuxingCount[WUXING_GAN[g]]++;
  for (const z of [yearZhi, monthZhi, dayZhi, timeZhi]) wuxingCount[WUXING_ZHI[z]]++;

  return {
    pillars: {
      year: yearGZ,
      month: monthGZ,
      day: dayGZ,
      time: timeGZ,
    },
    dayMaster: dayGan,
    dayMasterElement: WUXING_GAN[dayGan],
    dayMasterYinYang: YIN_YANG_GAN[dayGan],
    stems: { year: yearGan, month: monthGan, day: dayGan, time: timeGan },
    branches: { year: yearZhi, month: monthZhi, day: dayZhi, time: timeZhi },
    wuxing: {
      counts: wuxingCount,
      missing: Object.entries(wuxingCount).filter(([, c]) => c === 0).map(([k]) => k),
      strongest: Object.entries(wuxingCount).sort((a, b) => b[1] - a[1])[0][0],
    },
    nayin: {
      year: ec.getYearNaYin(),
      month: ec.getMonthNaYin(),
      day: ec.getDayNaYin(),
      time: ec.getTimeNaYin(),
    },
    shishen: {
      // 十神（以日主為基準）
      yearGan: ec.getYearShiShenGan(),
      yearZhi: ec.getYearShiShenZhi(),
      monthGan: ec.getMonthShiShenGan(),
      monthZhi: ec.getMonthShiShenZhi(),
      dayZhi: ec.getDayShiShenZhi(),
      timeGan: ec.getTimeShiShenGan(),
      timeZhi: ec.getTimeShiShenZhi(),
    },
    hideGan: {
      // 藏干（地支藏的天干）
      year: ec.getYearHideGan(),
      month: ec.getMonthHideGan(),
      day: ec.getDayHideGan(),
      time: ec.getTimeHideGan(),
    },
    additional: {
      mingGong: ec.getMingGong(),     // 命宮
      shenGong: ec.getShenGong(),     // 身宮
      taiYuan: ec.getTaiYuan(),       // 胎元
      taiXi: ec.getTaiXi(),           // 胎息
    },
    meta: {
      sect,
      longitudeAdjusted: longitude !== null,
      adjustedTime: longitude !== null
        ? `${adjYear}-${String(adjMonth).padStart(2,'0')}-${String(adjDay).padStart(2,'0')} ${String(adjHour).padStart(2,'0')}:${String(adjMin).padStart(2,'0')}`
        : null,
    },
  };
}

export const __data = { WUXING_GAN, WUXING_ZHI, YIN_YANG_GAN };
