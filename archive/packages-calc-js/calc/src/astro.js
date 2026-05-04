// 占星 (Western Astrology / Tropical Zodiac)
//
// 計算引擎：Swiss Ephemeris (sweph npm 套件，使用內建 Moshier 演算法)
// 精度：太陽月亮約 10 arc seconds、其他行星數 arc minutes
// 業界標準計算庫，Astro.com、Solar Fire 等專業占星軟體共用同一系列
//
// 確定性：給定相同生日/時間/地點 → 完全相同結果。

import sweph from 'sweph';

const FLAGS = sweph.constants.SEFLG_MOSEPH; // 使用內建演算法，不需 .se1 資料檔

const SIGNS = [
  { idx: 1, zh: '牡羊', en: 'Aries', symbol: '♈', element: '火', quality: '本位', ruler: 'Mars' },
  { idx: 2, zh: '金牛', en: 'Taurus', symbol: '♉', element: '土', quality: '固定', ruler: 'Venus' },
  { idx: 3, zh: '雙子', en: 'Gemini', symbol: '♊', element: '風', quality: '變動', ruler: 'Mercury' },
  { idx: 4, zh: '巨蟹', en: 'Cancer', symbol: '♋', element: '水', quality: '本位', ruler: 'Moon' },
  { idx: 5, zh: '獅子', en: 'Leo', symbol: '♌', element: '火', quality: '固定', ruler: 'Sun' },
  { idx: 6, zh: '處女', en: 'Virgo', symbol: '♍', element: '土', quality: '變動', ruler: 'Mercury' },
  { idx: 7, zh: '天秤', en: 'Libra', symbol: '♎', element: '風', quality: '本位', ruler: 'Venus' },
  { idx: 8, zh: '天蠍', en: 'Scorpio', symbol: '♏', element: '水', quality: '固定', ruler: 'Mars/Pluto' },
  { idx: 9, zh: '射手', en: 'Sagittarius', symbol: '♐', element: '火', quality: '變動', ruler: 'Jupiter' },
  { idx: 10, zh: '摩羯', en: 'Capricorn', symbol: '♑', element: '土', quality: '本位', ruler: 'Saturn' },
  { idx: 11, zh: '水瓶', en: 'Aquarius', symbol: '♒', element: '風', quality: '固定', ruler: 'Saturn/Uranus' },
  { idx: 12, zh: '雙魚', en: 'Pisces', symbol: '♓', element: '水', quality: '變動', ruler: 'Jupiter/Neptune' },
];

const PLANETS = [
  { id: sweph.constants.SE_SUN, key: 'sun', zh: '太陽', en: 'Sun', symbol: '☉' },
  { id: sweph.constants.SE_MOON, key: 'moon', zh: '月亮', en: 'Moon', symbol: '☽' },
  { id: sweph.constants.SE_MERCURY, key: 'mercury', zh: '水星', en: 'Mercury', symbol: '☿' },
  { id: sweph.constants.SE_VENUS, key: 'venus', zh: '金星', en: 'Venus', symbol: '♀' },
  { id: sweph.constants.SE_MARS, key: 'mars', zh: '火星', en: 'Mars', symbol: '♂' },
  { id: sweph.constants.SE_JUPITER, key: 'jupiter', zh: '木星', en: 'Jupiter', symbol: '♃' },
  { id: sweph.constants.SE_SATURN, key: 'saturn', zh: '土星', en: 'Saturn', symbol: '♄' },
  { id: sweph.constants.SE_URANUS, key: 'uranus', zh: '天王星', en: 'Uranus', symbol: '♅' },
  { id: sweph.constants.SE_NEPTUNE, key: 'neptune', zh: '海王星', en: 'Neptune', symbol: '♆' },
  { id: sweph.constants.SE_PLUTO, key: 'pluto', zh: '冥王星', en: 'Pluto', symbol: '♇' },
];

/** 黃道經度 → 星座資訊 */
export function longitudeToSign(longitudeDeg) {
  const norm = ((longitudeDeg % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const degInSign = norm - idx * 30;
  return {
    ...SIGNS[idx],
    longitude: norm,
    degInSign,
    formatted: `${SIGNS[idx].zh} ${degInSign.toFixed(2)}°`,
  };
}

/**
 * 計算行星位置（單一時刻，UT）
 * @param {{year,month,day,hour,minute,timezone?}} datetime
 * @returns {object} 10 行星經度 + 星座
 */
export function calculatePlanets(datetime) {
  const { jd } = toJulianDayUT(datetime);
  const planets = {};
  for (const p of PLANETS) {
    const result = sweph.calc_ut(jd, p.id, FLAGS);
    if (result.error) throw new Error(`sweph error for ${p.en}: ${result.error}`);
    const lon = result.data[0];
    const lat = result.data[1];
    const speed = result.data[3]; // longitude speed (deg/day) — negative = retrograde
    planets[p.key] = {
      ...p,
      longitude: lon,
      latitude: lat,
      speed,
      retrograde: speed < 0,
      sign: longitudeToSign(lon),
    };
  }
  return { jd, planets };
}

/**
 * 計算上升 / 中天 / 12 宮頭（需要時間 + 經緯度）
 * @param {{year,month,day,hour,minute,timezone}} datetime
 * @param {{lat,lon}} location
 * @param {string} [houseSystem='P'] P=Placidus, K=Koch, W=WholeSign, E=Equal, R=Regiomontanus...
 */
export function calculateHouses(datetime, location, houseSystem = 'P') {
  const { jd } = toJulianDayUT(datetime);
  const r = sweph.houses(jd, location.lat, location.lon, houseSystem);
  if (r.error) throw new Error(`sweph houses error: ${r.error}`);

  const cusps = r.data.houses; // 12 個宮頭
  const points = r.data.points;
  return {
    ascendant: { longitude: points[0], sign: longitudeToSign(points[0]) },
    midheaven: { longitude: points[1], sign: longitudeToSign(points[1]) },
    armc: points[2],
    vertex: points[3] !== undefined ? { longitude: points[3], sign: longitudeToSign(points[3]) } : null,
    houseCusps: cusps.map((c, i) => ({
      house: i + 1,
      longitude: c,
      sign: longitudeToSign(c),
    })),
    system: houseSystem,
  };
}

/**
 * 完整本命盤
 * @param {{year,month,day,hour,minute,timezone}} datetime  timezone in hours (e.g. +8 for Taipei)
 * @param {{lat,lon}} [location]                           Optional; without it skip houses/ascendant
 */
export function calculateNatalChart(datetime, location = null, houseSystem = 'P') {
  const { jd, ut } = toJulianDayUT(datetime);
  const planetData = calculatePlanets(datetime);
  const result = {
    datetime,
    jd,
    ut,
    planets: planetData.planets,
    sun: planetData.planets.sun,
    moon: planetData.planets.moon,
  };
  if (location) {
    const houses = calculateHouses(datetime, location, houseSystem);
    result.location = location;
    result.ascendant = houses.ascendant;
    result.midheaven = houses.midheaven;
    result.houses = houses.houseCusps;
  }
  return result;
}

/**
 * 將生日/時間/時區 → Julian Day in UT
 * @returns {{ jd: number, ut: { year, month, day, hour, minute } }}
 */
function toJulianDayUT({ year, month, day, hour, minute, timezone = 8 }) {
  // 將本地時減去時區得 UT
  const local = new Date(Date.UTC(year, month - 1, day, hour, minute));
  local.setUTCMinutes(local.getUTCMinutes() - timezone * 60);
  const ut = {
    year: local.getUTCFullYear(),
    month: local.getUTCMonth() + 1,
    day: local.getUTCDate(),
    hour: local.getUTCHours(),
    minute: local.getUTCMinutes(),
  };
  const decimalHour = ut.hour + ut.minute / 60;
  const jd = sweph.julday(ut.year, ut.month, ut.day, decimalHour, sweph.constants.SE_GREG_CAL);
  return { jd, ut };
}

export const __data = { SIGNS, PLANETS };
