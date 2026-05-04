// 給 Python 子程序呼叫的 iztro 紫微斗數 helper
// 用法：node _iztro_helper.js <json-args>
// 標準輸入或第一個參數接收 JSON：{ year, month, day, hour, gender, fixLeap?, sect? }
// 輸出 JSON 到 stdout
//
// 必須裝 iztro：在 D:\mele 已有 (npm install iztro)
// 從 python_api/ 呼叫時走相對路徑 ../node_modules/iztro

const path = require('path');

// 找到 mele 根目錄的 node_modules（python_api 在根目錄底下）
const candidates = [
  path.resolve(__dirname, '..', 'node_modules', 'iztro'),
  path.resolve(__dirname, 'node_modules', 'iztro'),
];

let iztro;
let lastErr;
for (const p of candidates) {
  try {
    iztro = require(p);
    break;
  } catch (e) {
    lastErr = e;
  }
}
if (!iztro) {
  console.error(JSON.stringify({ error: `iztro not found. tried: ${candidates.join(', ')}. Last error: ${lastErr?.message}` }));
  process.exit(1);
}
const { astro } = iztro;

// 時鐘小時 (0-23) → iztro 時辰 index (0-12)
function clockHourToTimeIndex(hour, sect = 2) {
  if (hour === 23) return sect === 1 ? 12 : 0;
  return Math.floor((hour + 1) / 2);
}

function main() {
  let raw = process.argv[2] || '';
  if (!raw) {
    let buf = '';
    process.stdin.on('data', (chunk) => (buf += chunk));
    process.stdin.on('end', () => run(buf));
    return;
  }
  run(raw);
}

function run(raw) {
  let args;
  try {
    args = JSON.parse(raw);
  } catch (e) {
    console.error(JSON.stringify({ error: `invalid JSON input: ${e.message}` }));
    process.exit(1);
  }

  const { year, month, day, hour, gender = '男', fixLeap = true, sect = 2 } = args;
  if ([year, month, day, hour].some((v) => typeof v !== 'number')) {
    console.error(JSON.stringify({ error: 'year/month/day/hour must be numbers' }));
    process.exit(1);
  }

  const dateStr = `${year}-${month}-${day}`;
  const timeIdx = clockHourToTimeIndex(hour, sect);

  try {
    const a = astro.bySolar(dateStr, timeIdx, gender, fixLeap, 'zh-TW');

    // 整理成乾淨的 JSON（去掉一些循環引用 / 過大的欄位）
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
      minorStars: p.minorStars.map((s) => ({
        name: s.name,
        brightness: s.brightness,
      })),
      adjectiveStars: p.adjectiveStars.map((s) => ({ name: s.name })),
    }));

    const ming = palaces.find((p) => p.name === '命宮');

    const output = {
      solarDate: a.solarDate,
      lunarDate: a.lunarDate,
      chineseDate: a.chineseDate,
      time: a.time,
      timeRange: a.timeRange,
      sign: a.sign,
      zodiac: a.zodiac,
      gender,
      soul: a.soul,
      body: a.body,
      fiveElementsClass: a.fiveElementsClass,
      mingGong: ming ? {
        name: ming.name,
        earthlyBranch: ming.earthlyBranch,
        heavenlyStem: ming.heavenlyStem,
        majorStarNames: ming.majorStars.map((s) => s.name),
      } : null,
      palaces,
    };
    console.log(JSON.stringify(output));
  } catch (e) {
    console.error(JSON.stringify({ error: e.message, stack: e.stack }));
    process.exit(1);
  }
}

main();
