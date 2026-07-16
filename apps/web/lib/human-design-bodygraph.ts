/**
 * 人類圖 BodyGraph 前端輔助資料（純呈現用，不涉及任何命盤計算邏輯）。
 *
 * 中心座標與 python_api/renderers/hd_render.py 的 CENTER_META 保持一致（viewBox 0 0 720 1160），
 * 讓「身體部位對照層」疊在真實後端 SVG 上時，座標能精準對齊。
 * 通道的迴路分類（個體／部落／集體）採簡化教學版本，方便新手辨識線條群組，非嚴謹學術迴路理論。
 */

export type HdCenterId = 'Head' | 'Ajna' | 'Throat' | 'G' | 'Heart' | 'Sacral' | 'SolarPlexus' | 'Spleen' | 'Root';

export const HD_CENTER_IDS: HdCenterId[] = ['Head', 'Ajna', 'Throat', 'G', 'Heart', 'Sacral', 'SolarPlexus', 'Spleen', 'Root'];

/** 與 hd_render.py CENTER_META 的 x/y/size 對應，供身體對照層 overlay 定位用 */
export const HD_CENTER_POSITIONS: Record<HdCenterId, { x: number; y: number; size: number }> = {
  Head: { x: 360, y: 148, size: 76 },
  Ajna: { x: 360, y: 282, size: 76 },
  Throat: { x: 360, y: 424, size: 78 },
  G: { x: 360, y: 582, size: 80 },
  Heart: { x: 505, y: 600, size: 56 },
  Sacral: { x: 360, y: 742, size: 78 },
  SolarPlexus: { x: 522, y: 760, size: 76 },
  Spleen: { x: 198, y: 760, size: 76 },
  Root: { x: 360, y: 942, size: 78 },
};

export const HD_VIEWBOX = { width: 720, height: 1160 };

/** 人類圖的 36 條標準通道。僅供前端繪製結構；是否定義仍完全採用後端 definedChannels。 */
export const HD_CHANNELS: [number, number][] = [
  [64, 47], [61, 24], [63, 4], [17, 62], [43, 23], [11, 56],
  [16, 48], [20, 57], [20, 10], [20, 34], [31, 7], [8, 1],
  [33, 13], [35, 36], [12, 22], [45, 21], [25, 51], [10, 34],
  [10, 57], [15, 5], [2, 14], [46, 29], [40, 37], [26, 44],
  [34, 57], [59, 6], [9, 52], [3, 60], [42, 53], [27, 50],
  [30, 41], [55, 39], [49, 19], [32, 54], [28, 38], [18, 58],
];

export const HD_GATE_TO_CENTER: Record<number, HdCenterId> = {
  64: 'Head', 61: 'Head', 63: 'Head',
  47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
  62: 'Throat', 23: 'Throat', 56: 'Throat', 16: 'Throat', 20: 'Throat', 31: 'Throat', 8: 'Throat', 33: 'Throat', 35: 'Throat', 12: 'Throat', 45: 'Throat',
  7: 'G', 1: 'G', 13: 'G', 25: 'G', 10: 'G', 15: 'G', 2: 'G', 46: 'G',
  21: 'Heart', 40: 'Heart', 26: 'Heart', 51: 'Heart',
  34: 'Sacral', 5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral', 9: 'Sacral', 3: 'Sacral', 42: 'Sacral', 27: 'Sacral',
  6: 'SolarPlexus', 37: 'SolarPlexus', 22: 'SolarPlexus', 36: 'SolarPlexus', 30: 'SolarPlexus', 55: 'SolarPlexus', 49: 'SolarPlexus',
  48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
  53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root', 58: 'Root', 38: 'Root', 54: 'Root',
};

export type HdGateSide = 'top' | 'right' | 'bottom' | 'left';

/** 閘門在各中心周圍的排列，與後端 BodyGraph 幾何一致。 */
export const HD_CENTER_GATE_SIDES: Record<HdCenterId, Partial<Record<HdGateSide, number[]>>> = {
  Head: { bottom: [64, 61, 63] },
  Ajna: { top: [47, 24, 4], bottom: [17, 43, 11] },
  Throat: { top: [62, 23, 56], left: [16, 20, 31], right: [8, 33, 35], bottom: [12, 45] },
  G: { top: [7, 1, 13], left: [25, 10], right: [15, 2], bottom: [46] },
  Heart: { top: [21], left: [40], right: [26], bottom: [51] },
  Sacral: { top: [34, 5, 14, 29], left: [59, 9], right: [3, 42], bottom: [27] },
  SolarPlexus: { top: [6, 37, 22], left: [36, 30], right: [55], bottom: [49] },
  Spleen: { top: [48, 57], right: [44, 50], bottom: [32, 28, 18] },
  Root: { top: [53, 60, 52], left: [19, 39], right: [41, 58], bottom: [38, 54] },
};

function spreadSlots(values: number[], start: number, end: number): number[] {
  if (values.length === 1) return [(start + end) / 2];
  const step = (end - start) / (values.length - 1);
  return values.map((_, index) => start + step * index);
}

/** 每個閘門的實際線端座標，用來繪製完整通道與只啟動一側的懸掛閘門。 */
export function getHdGatePositions(): Record<number, { x: number; y: number }> {
  const positions: Record<number, { x: number; y: number }> = {};
  const offset = 18;
  HD_CENTER_IDS.forEach((centerId) => {
    const center = HD_CENTER_POSITIONS[centerId];
    const half = center.size / 2;
    Object.entries(HD_CENTER_GATE_SIDES[centerId]).forEach(([side, gates]) => {
      if (!gates) return;
      if (side === 'top' || side === 'bottom') {
        const xs = spreadSlots(gates, center.x - half + 10, center.x + half - 10);
        const y = side === 'top' ? center.y - half - offset : center.y + half + offset;
        gates.forEach((gate, index) => { positions[gate] = { x: xs[index], y }; });
      } else {
        const ys = spreadSlots(gates, center.y - half + 10, center.y + half - 10);
        const x = side === 'left' ? center.x - half - offset : center.x + half + offset;
        gates.forEach((gate, index) => { positions[gate] = { x, y: ys[index] }; });
      }
    });
  });
  return positions;
}

export type HdCircuit = 'individual' | 'tribal' | 'collective';

/** 通道分類：sorted "g1-g2" -> 迴路（簡化版，僅供視覺分層辨識用） */
export const HD_CHANNEL_CIRCUITS: Record<string, HdCircuit> = {
  '47-64': 'collective',
  '24-61': 'individual',
  '4-63': 'collective',
  '17-62': 'collective',
  '23-43': 'individual',
  '11-56': 'collective',
  '16-48': 'collective',
  '20-57': 'individual',
  '10-20': 'individual',
  '20-34': 'tribal',
  '7-31': 'tribal',
  '1-8': 'individual',
  '13-33': 'collective',
  '35-36': 'collective',
  '12-22': 'collective',
  '21-45': 'tribal',
  '25-51': 'individual',
  '10-34': 'individual',
  '10-57': 'individual',
  '5-15': 'collective',
  '2-14': 'individual',
  '29-46': 'collective',
  '37-40': 'tribal',
  '26-44': 'tribal',
  '34-57': 'individual',
  '6-59': 'tribal',
  '9-52': 'collective',
  '3-60': 'individual',
  '42-53': 'collective',
  '27-50': 'tribal',
  '30-41': 'collective',
  '39-55': 'individual',
  '19-49': 'tribal',
  '32-54': 'tribal',
  '28-38': 'individual',
  '18-58': 'collective',
};

/** 「常見通道」完整白話資料的 key 清單，其餘 22 條走通用格式帶入閘門編號 */
export const HD_CURATED_CHANNEL_KEYS = [
  '20-34',
  '20-57',
  '10-20',
  '34-57',
  '2-14',
  '10-34',
  '25-51',
  '21-45',
  '6-59',
  '30-41',
  '39-55',
  '19-49',
  '26-44',
  '37-40',
] as const;

export function sortedChannelKey(gateA: number, gateB: number): string {
  return [gateA, gateB].sort((a, b) => a - b).join('-');
}

export function isCuratedChannel(key: string): boolean {
  return (HD_CURATED_CHANNEL_KEYS as readonly string[]).includes(key);
}

export function normalizeDefinedChannels(raw: unknown): [number, number][] {
  if (!Array.isArray(raw)) return [];
  const pairs: [number, number][] = [];
  for (const item of raw) {
    if (Array.isArray(item) && item.length === 2) {
      const a = Number(item[0]);
      const b = Number(item[1]);
      if (Number.isFinite(a) && Number.isFinite(b)) pairs.push([a, b]);
    }
  }
  return pairs;
}

export function normalizeDefinedCenters(raw: unknown): HdCenterId[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is HdCenterId => typeof item === 'string' && (HD_CENTER_IDS as string[]).includes(item));
}
