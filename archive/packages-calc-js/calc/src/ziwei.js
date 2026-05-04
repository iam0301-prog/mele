// 紫微斗數 (Zǐwēi Dǒushù / Purple Star Astrology)
//
// 演算庫：iztro (github.com/SylarLong/iztro, MIT)
// — TypeScript 紫微斗數庫，支援 14 主星 + 60+ 輔星 + 12 宮位 + 大限/流年
// — 預設台版「紫微斗數全書」算法，符合主流派別
//
// 確定性：同一輸入必同一輸出。
//
// 重要規則：
// - 命宮位置由農曆月 + 出生時辰決定
// - iztro 使用真太陽時可選（fixLeap 為閏月修正）
// - 時辰 index 0-12（0=早子、1=丑、2=寅、...、11=亥、12=夜子）

import { astro } from 'iztro';
import { calculateBaZi } from './bazi.js';

/**
 * 將時鐘小時 (0-23) 轉為 iztro 時辰 index (0-12)
 * 預設 sect 2: 23:00 後仍算當日早子時 (index 0)
 * 可選 sect 1: 23:00 後算夜子時 (index 12)
 */
export function clockHourToTimeIndex(hour, sect = 2) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23)
    throw new Error(`Invalid hour: ${hour}`);
  if (hour === 23) return sect === 1 ? 12 : 0;
  return Math.floor((hour + 1) / 2);
}

/**
 * 計算紫微斗數命盤
 * @param {{
 *   year:number, month:number, day:number, hour:number, minute?:number,
 *   gender: '男' | '女',
 *   fixLeap?: boolean,    // 預設 true，閏月修正
 *   useTrueSolarTime?: boolean,
 *   sect?: 1 | 2,
 * }} input
 */
export function calculateZiwei(input) {
  const {
    year, month, day, hour, minute = 0,
    gender,
    fixLeap = true,
    sect = 2,
  } = input;

  if (!['男', '女'].includes(gender))
    throw new Error(`Gender must be 男 or 女, got: ${gender}`);

  const dateStr = `${year}-${month}-${day}`;
  const timeIdx = clockHourToTimeIndex(hour, sect);

  const a = astro.bySolar(dateStr, timeIdx, gender, fixLeap, 'zh-TW');

  // 修正 chineseDate (八字四柱)：iztro 使用農曆月，但標準八字應用節氣月。
  // 用 lunar-javascript (BaZi 模組) 補上正確的八字四柱。
  const correctBazi = calculateBaZi({ year, month, day, hour, minute, sect });
  const correctedChineseDate = `${correctBazi.pillars.year} ${correctBazi.pillars.month} ${correctBazi.pillars.day} ${correctBazi.pillars.time}`;

  // 簡化的宮位資料給前端用
  const palaces = a.palaces.map((p) => ({
    name: p.name,
    index: p.index,
    heavenlyStem: p.heavenlyStem,
    earthlyBranch: p.earthlyBranch,
    majorStars: p.majorStars.map((s) => ({
      name: s.name,
      brightness: s.brightness,
      mutagen: s.mutagen,
    })),
    minorStars: p.minorStars.map((s) => ({ name: s.name, brightness: s.brightness })),
    adjectiveStars: p.adjectiveStars.map((s) => ({ name: s.name })),
  }));

  // 找出命宮
  const mingGong = palaces.find((p) => p.name === '命宮');

  return {
    solarDate: a.solarDate,
    lunarDate: a.lunarDate,
    chineseDate: correctedChineseDate, // 八字四柱字串（用 lunar-javascript 校正過的節氣月柱）
    chineseDateRaw: a.chineseDate,     // iztro 原始輸出（農曆月柱），保留供參考
    time: a.time,                      // 時辰名稱（如「未時」）
    timeRange: a.timeRange,
    sign: a.sign,                      // 西方星座
    zodiac: a.zodiac,                  // 生肖
    gender,
    soul: a.soul,                      // 命主（依命宮地支）
    body: a.body,                      // 身主（依出生年地支）
    fiveElementsClass: a.fiveElementsClass, // 五行局（水二/木三/金四/土五/火六）
    mingGong,
    palaces,
    raw: a,                            // 完整原始資料
  };
}

/**
 * 取得單一宮位
 */
export function getPalace(chart, palaceName) {
  return chart.palaces.find((p) => p.name === palaceName);
}
