// 給 Python 子程序呼叫的 Swiss Ephemeris helper
// 用法：node _sweph_helper.cjs <json-args>
//
// args 範例：
//   astro:  { tool: "astro", year, month, day, hour, minute, timezone, lat, lon, house? }
//   hd:     { tool: "humandesign", year, month, day, hour, minute, timezone }
//
// 輸出 JSON 到 stdout

const path = require('path');

const candidates = [
  path.resolve(__dirname, '..', 'node_modules', 'sweph'),
  path.resolve(__dirname, 'node_modules', 'sweph'),
];

let sweph;
let lastErr;
for (const p of candidates) {
  try {
    sweph = require(p);
    break;
  } catch (e) {
    lastErr = e;
  }
}
if (!sweph) {
  console.error(JSON.stringify({ error: `sweph not found. tried: ${candidates.join(', ')}. Last err: ${lastErr?.message}` }));
  process.exit(1);
}

const FLAGS = sweph.constants.SEFLG_MOSEPH;

const SIGNS = [
  { idx: 1, zh: '牡羊', en: 'Aries',       symbol: '♈', element: '火' },
  { idx: 2, zh: '金牛', en: 'Taurus',      symbol: '♉', element: '土' },
  { idx: 3, zh: '雙子', en: 'Gemini',      symbol: '♊', element: '風' },
  { idx: 4, zh: '巨蟹', en: 'Cancer',      symbol: '♋', element: '水' },
  { idx: 5, zh: '獅子', en: 'Leo',         symbol: '♌', element: '火' },
  { idx: 6, zh: '處女', en: 'Virgo',       symbol: '♍', element: '土' },
  { idx: 7, zh: '天秤', en: 'Libra',       symbol: '♎', element: '風' },
  { idx: 8, zh: '天蠍', en: 'Scorpio',     symbol: '♏', element: '水' },
  { idx: 9, zh: '射手', en: 'Sagittarius', symbol: '♐', element: '火' },
  { idx: 10, zh: '摩羯', en: 'Capricorn',   symbol: '♑', element: '土' },
  { idx: 11, zh: '水瓶', en: 'Aquarius',    symbol: '♒', element: '風' },
  { idx: 12, zh: '雙魚', en: 'Pisces',      symbol: '♓', element: '水' },
];

const PLANETS = [
  { id: sweph.constants.SE_SUN,     key: 'sun',     zh: '太陽',   en: 'Sun',     symbol: '☉' },
  { id: sweph.constants.SE_MOON,    key: 'moon',    zh: '月亮',   en: 'Moon',    symbol: '☽' },
  { id: sweph.constants.SE_MERCURY, key: 'mercury', zh: '水星',   en: 'Mercury', symbol: '☿' },
  { id: sweph.constants.SE_VENUS,   key: 'venus',   zh: '金星',   en: 'Venus',   symbol: '♀' },
  { id: sweph.constants.SE_MARS,    key: 'mars',    zh: '火星',   en: 'Mars',    symbol: '♂' },
  { id: sweph.constants.SE_JUPITER, key: 'jupiter', zh: '木星',   en: 'Jupiter', symbol: '♃' },
  { id: sweph.constants.SE_SATURN,  key: 'saturn',  zh: '土星',   en: 'Saturn',  symbol: '♄' },
  { id: sweph.constants.SE_URANUS,  key: 'uranus',  zh: '天王星', en: 'Uranus',  symbol: '♅' },
  { id: sweph.constants.SE_NEPTUNE, key: 'neptune', zh: '海王星', en: 'Neptune', symbol: '♆' },
  { id: sweph.constants.SE_PLUTO,   key: 'pluto',   zh: '冥王星', en: 'Pluto',   symbol: '♇' },
];

// 64 閘門順序（人類圖 Mandala，從 0° 牡羊起順時針）
const GATE_SEQUENCE = [
  25, 17, 21, 51, 42, 3, 27, 24, 2, 23,
  8, 20, 16, 35, 45, 12, 15, 52, 39, 53,
  62, 56, 31, 33, 7, 4, 29, 59, 40, 64,
  47, 6, 46, 18, 48, 57, 32, 50, 28, 44,
  1, 43, 14, 34, 9, 5, 26, 11, 10, 58,
  38, 54, 61, 60, 41, 19, 13, 49, 30, 55,
  37, 63, 22, 36,
];
const GATE_START_OFFSET = 358.125;
const GATE_WIDTH = 360 / 64;
const LINE_WIDTH = GATE_WIDTH / 6;

const GATE_TO_CENTER = {
  64: 'Head', 61: 'Head', 63: 'Head',
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  62: 'Throat', 23: 'Throat', 56: 'Throat', 16: 'Throat', 20: 'Throat',
  31: 'Throat', 8: 'Throat', 33: 'Throat', 35: 'Throat', 12: 'Throat', 45: 'Throat',
  7: 'G', 1: 'G', 13: 'G', 25: 'G', 10: 'G', 15: 'G', 2: 'G', 46: 'G',
  21: 'Heart', 40: 'Heart', 26: 'Heart', 51: 'Heart',
  34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral',
  59: 'Sacral', 9: 'Sacral', 3: 'Sacral', 42: 'Sacral', 27: 'Sacral',
  6: 'SolarPlexus', 37: 'SolarPlexus', 22: 'SolarPlexus', 36: 'SolarPlexus',
  30: 'SolarPlexus', 55: 'SolarPlexus', 49: 'SolarPlexus',
  48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
  53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root', 58: 'Root', 38: 'Root', 54: 'Root',
};

const CHANNELS_RAW = [
  [64, 47], [61, 24], [63, 4],
  [17, 62], [43, 23], [11, 56],
  [16, 48], [20, 57], [20, 10], [20, 34], [31, 7], [8, 1],
  [33, 13], [35, 36], [12, 22], [45, 21],
  [25, 51], [10, 34], [10, 57], [15, 5], [2, 14], [46, 29],
  [40, 37], [26, 44],
  [34, 57], [59, 6], [9, 52], [3, 60], [42, 53], [27, 50],
  [22, 12], [30, 41], [55, 39], [49, 19],
  [44, 26], [32, 54], [28, 38], [18, 58],
];
const CHANNELS = (() => {
  const seen = new Set(); const out = [];
  for (const [a, b] of CHANNELS_RAW) {
    const key = a < b ? `${a}-${b}` : `${b}-${a}`;
    if (!seen.has(key)) { seen.add(key); out.push([Math.min(a,b), Math.max(a,b)]); }
  }
  return out;
})();

const CENTERS = ['Head','Ajna','Throat','G','Heart','Sacral','SolarPlexus','Spleen','Root'];
const MOTORS = ['Heart','Sacral','SolarPlexus','Root'];

function longitudeToSign(lon) {
  const norm = ((lon % 360) + 360) % 360;
  const idx = Math.floor(norm / 30);
  const degInSign = norm - idx * 30;
  return { ...SIGNS[idx], longitude: norm, degInSign };
}

function longitudeToGate(lon) {
  const norm = ((lon - GATE_START_OFFSET) % 360 + 360) % 360;
  const seqIdx = Math.floor(norm / GATE_WIDTH);
  const gate = GATE_SEQUENCE[seqIdx];
  const positionInGate = norm - seqIdx * GATE_WIDTH;
  const line = Math.min(6, Math.floor(positionInGate / LINE_WIDTH) + 1);
  return { gate, line, longitude: lon };
}

function dateTimeToJD({ year, month, day, hour, minute, timezone = 0 }) {
  const local = new Date(Date.UTC(year, month - 1, day, hour, minute));
  local.setUTCMinutes(local.getUTCMinutes() - timezone * 60);
  const decH = local.getUTCHours() + local.getUTCMinutes() / 60;
  return sweph.julday(local.getUTCFullYear(), local.getUTCMonth() + 1, local.getUTCDate(), decH, sweph.constants.SE_GREG_CAL);
}

function calcPlanets(jd) {
  const out = {};
  for (const p of PLANETS) {
    const r = sweph.calc_ut(jd, p.id, FLAGS);
    if (r.error) throw new Error(`sweph error for ${p.en}: ${r.error}`);
    const lon = r.data[0];
    const speed = r.data[3];
    out[p.key] = {
      ...p,
      longitude: lon,
      speed,
      retrograde: speed < 0,
      sign: longitudeToSign(lon),
    };
  }
  return out;
}

function calcAstro(args) {
  const jd = dateTimeToJD(args);
  const planets = calcPlanets(jd);

  let result = { jd, planets, sun: planets.sun, moon: planets.moon };

  if (typeof args.lat === 'number' && typeof args.lon === 'number') {
    const houseSystem = args.house || 'P';
    const h = sweph.houses(jd, args.lat, args.lon, houseSystem);
    if (!h.error) {
      const cusps = h.data.houses;
      const points = h.data.points;
      result.location = { lat: args.lat, lon: args.lon };
      result.ascendant = { longitude: points[0], sign: longitudeToSign(points[0]) };
      result.midheaven = { longitude: points[1], sign: longitudeToSign(points[1]) };
      result.houses = cusps.map((c, i) => ({ house: i + 1, longitude: c, sign: longitudeToSign(c) }));
    }
  }
  return result;
}

function calcBodiesForHD(jd) {
  const out = {};
  for (const p of PLANETS) {
    const r = sweph.calc_ut(jd, p.id, FLAGS);
    if (r.error) throw new Error(`sweph error for ${p.en}: ${r.error}`);
    out[p.key] = { label: p.zh, longitude: r.data[0], ...longitudeToGate(r.data[0]) };
  }
  // Earth = Sun + 180
  const earthLon = (out.sun.longitude + 180) % 360;
  out.earth = { label: '地球', longitude: earthLon, ...longitudeToGate(earthLon) };
  // North Node
  const nn = sweph.calc_ut(jd, sweph.constants.SE_TRUE_NODE, FLAGS);
  out.northNode = { label: '北交點', longitude: nn.data[0], ...longitudeToGate(nn.data[0]) };
  const sn = (nn.data[0] + 180) % 360;
  out.southNode = { label: '南交點', longitude: sn, ...longitudeToGate(sn) };
  return out;
}

function findDesignJD(birthJD, birthSunLon) {
  const target = ((birthSunLon - 88) % 360 + 360) % 360;
  let jd = birthJD - 88;
  for (let i = 0; i < 30; i++) {
    const r = sweph.calc_ut(jd, sweph.constants.SE_SUN, FLAGS);
    let lon = r.data[0];
    let diff = lon - target;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    if (Math.abs(diff) < 0.0001) break;
    jd -= diff / 0.985;
  }
  return jd;
}

function determineDefinedCenters(allGates) {
  const set = new Set(allGates);
  const definedCenters = new Set();
  const definedChannels = [];
  for (const [g1, g2] of CHANNELS) {
    if (set.has(g1) && set.has(g2)) {
      definedChannels.push([g1, g2]);
      definedCenters.add(GATE_TO_CENTER[g1]);
      definedCenters.add(GATE_TO_CENTER[g2]);
    }
  }
  return { definedCenters: [...definedCenters], definedChannels };
}

function determineType(definedCenters, definedChannels) {
  const dc = new Set(definedCenters);
  if (dc.size === 0) return 'Reflector';
  const sacralDef = dc.has('Sacral');
  const throatDef = dc.has('Throat');
  const adj = {};
  for (const c of CENTERS) adj[c] = new Set();
  for (const [g1, g2] of definedChannels) {
    const c1 = GATE_TO_CENTER[g1], c2 = GATE_TO_CENTER[g2];
    if (c1 !== c2) { adj[c1].add(c2); adj[c2].add(c1); }
  }
  function throatToMotor() {
    if (!throatDef) return false;
    const visited = new Set(['Throat']);
    const stack = ['Throat'];
    while (stack.length) {
      const cur = stack.pop();
      if (MOTORS.includes(cur)) return true;
      for (const n of adj[cur]) if (!visited.has(n)) { visited.add(n); stack.push(n); }
    }
    return false;
  }
  const t2m = throatToMotor();
  if (sacralDef && t2m) return 'Manifesting Generator';
  if (sacralDef) return 'Generator';
  if (t2m && !sacralDef) return 'Manifestor';
  return 'Projector';
}

function calcHumanDesign(args) {
  const birthJD = dateTimeToJD(args);
  const personality = calcBodiesForHD(birthJD);
  const designJD = findDesignJD(birthJD, personality.sun.longitude);
  const design = calcBodiesForHD(designJD);

  const allGates = [
    ...Object.values(personality).map(b => b.gate),
    ...Object.values(design).map(b => b.gate),
  ];
  const { definedCenters, definedChannels } = determineDefinedCenters(allGates);
  const undefinedCenters = CENTERS.filter(c => !definedCenters.includes(c));
  const type = determineType(definedCenters, definedChannels);

  const profile = `${personality.sun.line}/${design.sun.line}`;
  let authority;
  if (definedCenters.includes('SolarPlexus')) authority = 'Emotional';
  else if (definedCenters.includes('Sacral')) authority = 'Sacral';
  else if (definedCenters.includes('Spleen')) authority = 'Splenic';
  else if (definedCenters.includes('Heart') && definedCenters.includes('Throat')) authority = 'Ego (Heart)';
  else if (definedCenters.includes('G') && definedCenters.includes('Throat')) authority = 'Self-Projected';
  else if (definedCenters.length === 0) authority = 'Lunar';
  else authority = 'Mental (Outer)';

  const STRATEGIES = {
    'Reflector': '等待月相循環 28 天',
    'Manifestor': '告知後行動',
    'Generator': '回應再行動',
    'Manifesting Generator': '回應再告知後行動',
    'Projector': '等待邀請',
  };

  const designDate = sweph.revjul(designJD, sweph.constants.SE_GREG_CAL);

  return {
    type,
    profile,
    authority,
    strategy: STRATEGIES[type],
    personalityBodies: personality,
    designBodies: design,
    designTime: {
      year: designDate.year,
      month: designDate.month,
      day: designDate.day,
      hour: Math.floor(designDate.hour),
      minute: Math.round((designDate.hour - Math.floor(designDate.hour)) * 60),
    },
    definedCenters,
    undefinedCenters,
    definedChannels,
    activatedGates: [...new Set(allGates)].sort((a, b) => a - b),
  };
}

function main() {
  const raw = process.argv[2] || '';
  if (!raw) {
    let buf = '';
    process.stdin.on('data', c => buf += c);
    process.stdin.on('end', () => run(buf));
    return;
  }
  run(raw);
}

function run(raw) {
  let args;
  try { args = JSON.parse(raw); }
  catch (e) { console.error(JSON.stringify({ error: `bad JSON: ${e.message}` })); process.exit(1); }

  try {
    let result;
    if (args.tool === 'astro') result = calcAstro(args);
    else if (args.tool === 'humandesign') result = calcHumanDesign(args);
    else throw new Error(`unknown tool: ${args.tool}`);
    console.log(JSON.stringify(result));
  } catch (e) {
    console.error(JSON.stringify({ error: e.message }));
    process.exit(1);
  }
}

main();
