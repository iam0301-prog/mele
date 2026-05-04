// 人類圖 (Human Design) — Ra Uru Hu 系統
//
// 核心原理：
//   1. Personality (意識): 出生時刻 13 個天體位置 → 13 個 Gate.Line activation
//   2. Design (潛意識): 出生前太陽走完 88° 的時刻 → 13 個 Gate.Line activation
//   3. 兩張盤合計 26 個閘門 → 9 中心定義 → 36 通道 → 5 類型 + Profile
//
// 計算引擎：sweph (Swiss Ephemeris)
//
// 重要常數：
//   - Mandala anchor: Gate 25 starts at 358.125° (= 28°07'30" Pisces)
//     Equivalent to: Gate 41 starts at 301.875° (= 1°52'30" Aquarius)
//   - Each gate = 5.625° (= 360/64); Each line = 0.9375° (= 5.625/6)
//   - Design Sun is 88° before Personality Sun in ecliptic longitude

import sweph from 'sweph';

const FLAGS = sweph.constants.SEFLG_MOSEPH;

// 從 0° 牡羊起順時針方向的 64 閘門順序 (I-Ching Wheel)
// Source: Ra Uru Hu, "The Rave I-Ching"
const GATE_SEQUENCE = [
  25, 17, 21, 51, 42, 3, 27, 24, 2, 23,
  8, 20, 16, 35, 45, 12, 15, 52, 39, 53,
  62, 56, 31, 33, 7, 4, 29, 59, 40, 64,
  47, 6, 46, 18, 48, 57, 32, 50, 28, 44,
  1, 43, 14, 34, 9, 5, 26, 11, 10, 58,
  38, 54, 61, 60, 41, 19, 13, 49, 30, 55,
  37, 63, 22, 36,
];

// Gate 25 起始於 358.125° (即 0° Aries 之前 1.875°)
const GATE_START_OFFSET = 358.125;
const GATE_WIDTH = 360 / 64; // 5.625
const LINE_WIDTH = GATE_WIDTH / 6; // 0.9375

// 64 閘門 → 9 中心對應表 (Ra Uru Hu)
const GATE_TO_CENTER = {
  // Head (頂輪)
  64: 'Head', 61: 'Head', 63: 'Head',
  // Ajna (邏輯)
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  // Throat (喉嚨)
  62: 'Throat', 23: 'Throat', 56: 'Throat', 16: 'Throat', 20: 'Throat',
  31: 'Throat', 8: 'Throat', 33: 'Throat', 35: 'Throat', 12: 'Throat', 45: 'Throat',
  // G Center (自我)
  7: 'G', 1: 'G', 13: 'G', 25: 'G', 10: 'G', 15: 'G', 2: 'G', 46: 'G',
  // Heart / Will / Ego (意志)
  21: 'Heart', 40: 'Heart', 26: 'Heart', 51: 'Heart',
  // Sacral (薦骨)
  34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral',
  59: 'Sacral', 9: 'Sacral', 3: 'Sacral', 42: 'Sacral', 27: 'Sacral',
  // Solar Plexus (情緒)
  6: 'SolarPlexus', 37: 'SolarPlexus', 22: 'SolarPlexus', 36: 'SolarPlexus',
  30: 'SolarPlexus', 55: 'SolarPlexus', 49: 'SolarPlexus',
  // Spleen (脾)
  48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
  // Root (根)
  53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root', 58: 'Root', 38: 'Root', 54: 'Root',
};

// 36 條通道 (channel = 連接兩中心的兩個閘門)
// Source: Ra Uru Hu's bodygraph
const CHANNELS = [
  [64, 47], [61, 24], [63, 4],                                    // Head ↔ Ajna
  [17, 62], [43, 23], [11, 56],                                   // Ajna ↔ Throat
  [16, 48], [20, 57], [20, 10], [20, 34], [31, 7], [8, 1],
  [33, 13], [35, 36], [12, 22], [45, 21],                         // Throat ↔ various
  [7, 31], [1, 8], [13, 33], [25, 51], [10, 20], [10, 34], [10, 57],
  [15, 5], [2, 14], [46, 29],                                     // G Center
  [21, 45], [40, 37], [26, 44], [51, 25],                         // Heart
  [34, 20], [34, 10], [34, 57], [5, 15], [14, 2], [29, 46],
  [59, 6], [9, 52], [3, 60], [42, 53], [27, 50],                  // Sacral
  [6, 59], [37, 40], [22, 12], [36, 35], [30, 41], [55, 39], [49, 19], // Solar Plexus
  [48, 16], [57, 20], [57, 34], [57, 10], [44, 26], [50, 27], [32, 54], [28, 38], [18, 58], // Spleen
  [53, 42], [60, 3], [52, 9], [19, 49], [39, 55], [41, 30], [58, 18], [38, 28], [54, 32],   // Root
];

// 不重複化 channels（雙向對都保留會重複）
const UNIQUE_CHANNELS = (() => {
  const seen = new Set();
  const out = [];
  for (const [a, b] of CHANNELS) {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!seen.has(key)) {
      seen.add(key);
      out.push([Math.min(a, b), Math.max(a, b)]);
    }
  }
  return out;
})();

const CENTERS = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Sacral', 'SolarPlexus', 'Spleen', 'Root'];
const MOTORS = ['Heart', 'Sacral', 'SolarPlexus', 'Root'];

// 13 個天體（HD 用）
const BODIES = [
  { id: sweph.constants.SE_SUN, key: 'sun', label: '太陽' },
  { id: sweph.constants.SE_MOON, key: 'moon', label: '月亮' },
  { id: sweph.constants.SE_MERCURY, key: 'mercury', label: '水星' },
  { id: sweph.constants.SE_VENUS, key: 'venus', label: '金星' },
  { id: sweph.constants.SE_MARS, key: 'mars', label: '火星' },
  { id: sweph.constants.SE_JUPITER, key: 'jupiter', label: '木星' },
  { id: sweph.constants.SE_SATURN, key: 'saturn', label: '土星' },
  { id: sweph.constants.SE_URANUS, key: 'uranus', label: '天王星' },
  { id: sweph.constants.SE_NEPTUNE, key: 'neptune', label: '海王星' },
  { id: sweph.constants.SE_PLUTO, key: 'pluto', label: '冥王星' },
  { id: sweph.constants.SE_TRUE_NODE, key: 'northNode', label: '北交點' },
  // Earth = Sun + 180°（手動計算）
  // South Node = North Node + 180°（手動計算）
];

/** 黃道經度 → 閘門 + 線 */
export function longitudeToGate(longitudeDeg) {
  const norm = ((longitudeDeg - GATE_START_OFFSET) % 360 + 360) % 360;
  const seqIdx = Math.floor(norm / GATE_WIDTH);
  const gate = GATE_SEQUENCE[seqIdx];
  const positionInGate = norm - seqIdx * GATE_WIDTH;
  const line = Math.floor(positionInGate / LINE_WIDTH) + 1;
  // 細分 color/tone/base（每 line 再分 6 colors × 6 tones × 5 bases）
  const positionInLine = positionInGate - (line - 1) * LINE_WIDTH;
  const color = Math.floor((positionInLine / LINE_WIDTH) * 6) + 1;
  const positionInColor = positionInLine - ((color - 1) / 6) * LINE_WIDTH;
  const tone = Math.floor((positionInColor / (LINE_WIDTH / 6)) * 6) + 1;
  const positionInTone = positionInColor - ((tone - 1) / 6) * (LINE_WIDTH / 6);
  const base = Math.floor((positionInTone / (LINE_WIDTH / 36)) * 5) + 1;
  return {
    gate,
    line,
    color: Math.min(6, color),
    tone: Math.min(6, tone),
    base: Math.min(5, base),
    formatted: `${gate}.${line}`,
    longitude: longitudeDeg,
  };
}

function calcBodies(jd) {
  const out = {};
  for (const b of BODIES) {
    const r = sweph.calc_ut(jd, b.id, FLAGS);
    if (r.error) throw new Error(`sweph error for ${b.label}: ${r.error}`);
    out[b.key] = {
      label: b.label,
      longitude: r.data[0],
      ...longitudeToGate(r.data[0]),
    };
  }
  // Earth = Sun + 180°
  const earthLon = (out.sun.longitude + 180) % 360;
  out.earth = { label: '地球', longitude: earthLon, ...longitudeToGate(earthLon) };
  // South Node = North Node + 180°
  const southLon = (out.northNode.longitude + 180) % 360;
  out.southNode = { label: '南交點', longitude: southLon, ...longitudeToGate(southLon) };
  return out;
}

/** 找出生前太陽走 88° 的 JD（Design 時刻） */
function findDesignJD(birthJD, birthSunLon) {
  // 目標：sun 經度 = (birthSunLon - 88) mod 360
  const target = ((birthSunLon - 88) % 360 + 360) % 360;
  // 大致時間：88 天前
  let jd = birthJD - 88;
  // 二分法 / 牛頓法精細化
  for (let i = 0; i < 30; i++) {
    const r = sweph.calc_ut(jd, sweph.constants.SE_SUN, FLAGS);
    let lon = r.data[0];
    // 角度差（考慮環狀）
    let diff = lon - target;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    if (Math.abs(diff) < 0.0001) break;
    // 太陽日均移動 ~0.985°，diff 度需要 diff/0.985 天
    jd -= diff / 0.985;
  }
  return jd;
}

function dateTimeToJD({ year, month, day, hour, minute, timezone = 0 }) {
  const local = new Date(Date.UTC(year, month - 1, day, hour, minute));
  local.setUTCMinutes(local.getUTCMinutes() - timezone * 60);
  const decimalHour = local.getUTCHours() + local.getUTCMinutes() / 60;
  return sweph.julday(
    local.getUTCFullYear(),
    local.getUTCMonth() + 1,
    local.getUTCDate(),
    decimalHour,
    sweph.constants.SE_GREG_CAL,
  );
}

function jdToDate(jd) {
  const r = sweph.revjul(jd, sweph.constants.SE_GREG_CAL);
  return {
    year: r.year,
    month: r.month,
    day: r.day,
    hour: Math.floor(r.hour),
    minute: Math.round((r.hour - Math.floor(r.hour)) * 60),
  };
}

/** 算定義中心 */
function determineDefinedCenters(allActivatedGates) {
  const activatedSet = new Set(allActivatedGates);
  const definedCenters = new Set();
  const definedChannels = [];
  for (const [g1, g2] of UNIQUE_CHANNELS) {
    if (activatedSet.has(g1) && activatedSet.has(g2)) {
      definedChannels.push([g1, g2]);
      definedCenters.add(GATE_TO_CENTER[g1]);
      definedCenters.add(GATE_TO_CENTER[g2]);
    }
  }
  return { definedCenters: [...definedCenters], definedChannels };
}

/** 判斷類型 */
function determineType(definedCenters, definedChannels) {
  const dc = new Set(definedCenters);
  if (dc.size === 0) return 'Reflector';

  const sacralDefined = dc.has('Sacral');
  const throatDefined = dc.has('Throat');

  // 找 Throat 是否與 motor 通道相連（直接 + 間接）
  // 用 channel 圖做 BFS
  const adj = {};
  for (const c of CENTERS) adj[c] = new Set();
  for (const [g1, g2] of definedChannels) {
    const c1 = GATE_TO_CENTER[g1];
    const c2 = GATE_TO_CENTER[g2];
    if (c1 !== c2) {
      adj[c1].add(c2);
      adj[c2].add(c1);
    }
  }
  function isThroatConnectedToMotor() {
    if (!throatDefined) return false;
    const visited = new Set(['Throat']);
    const stack = ['Throat'];
    while (stack.length) {
      const cur = stack.pop();
      if (MOTORS.includes(cur)) return true;
      for (const next of adj[cur]) {
        if (!visited.has(next)) {
          visited.add(next);
          stack.push(next);
        }
      }
    }
    return false;
  }
  const throatToMotor = isThroatConnectedToMotor();

  if (sacralDefined && throatToMotor) return 'Manifesting Generator';
  if (sacralDefined) return 'Generator';
  if (throatToMotor && !sacralDefined) return 'Manifestor';
  return 'Projector';
}

/** 主入口 */
export function calculateHumanDesign({ year, month, day, hour, minute, timezone = 8 }) {
  const birthJD = dateTimeToJD({ year, month, day, hour, minute, timezone });
  const personalityBodies = calcBodies(birthJD);

  const designJD = findDesignJD(birthJD, personalityBodies.sun.longitude);
  const designBodies = calcBodies(designJD);
  const designDate = jdToDate(designJD);

  // 收集所有啟動的閘門（13 personality + 13 design = 26 個）
  const allGates = [];
  for (const k of Object.keys(personalityBodies)) allGates.push(personalityBodies[k].gate);
  for (const k of Object.keys(designBodies)) allGates.push(designBodies[k].gate);

  const { definedCenters, definedChannels } = determineDefinedCenters(allGates);
  const undefinedCenters = CENTERS.filter((c) => !definedCenters.includes(c));
  const type = determineType(definedCenters, definedChannels);

  // Profile = Personality Sun line / Design Sun line
  const profile = `${personalityBodies.sun.line}/${designBodies.sun.line}`;

  // Authority 判定（簡化版）
  let authority;
  if (definedCenters.includes('SolarPlexus')) authority = 'Emotional';
  else if (definedCenters.includes('Sacral')) authority = 'Sacral';
  else if (definedCenters.includes('Spleen')) authority = 'Splenic';
  else if (definedCenters.includes('Heart') && definedCenters.includes('Throat')) authority = 'Ego (Heart)';
  else if (definedCenters.includes('G') && definedCenters.includes('Throat')) authority = 'Self-Projected';
  else if (definedCenters.length === 0) authority = 'Lunar';
  else authority = 'Mental (Outer)';

  // Strategy
  const STRATEGIES = {
    'Reflector': '等待月相循環 28 天',
    'Manifestor': '告知後行動',
    'Generator': '回應再行動',
    'Manifesting Generator': '回應再告知後行動',
    'Projector': '等待邀請',
  };

  return {
    type,
    profile,
    authority,
    strategy: STRATEGIES[type],
    personalityBodies,
    designBodies,
    designTime: designDate,
    definedCenters,
    undefinedCenters,
    definedChannels,
    activatedGates: [...new Set(allGates)].sort((a, b) => a - b),
  };
}

export const __data = { GATE_SEQUENCE, GATE_TO_CENTER, CHANNELS: UNIQUE_CHANNELS, CENTERS, MOTORS };
