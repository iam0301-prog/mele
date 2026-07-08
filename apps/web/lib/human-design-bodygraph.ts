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
