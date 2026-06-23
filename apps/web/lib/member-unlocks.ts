import type { CalcResponse, CalcTool } from '@/lib/api';

export type MemberUnlockType = 'deep_reading' | 'transit_day' | 'transit_month' | 'transit_year';

export type MemberUnlockOption = {
  type: MemberUnlockType;
  label: string;
  eyebrow: string;
  title: string;
  body: string;
};

export type MemberUnlockedReading = {
  title: string;
  summary: string;
  sections: Array<{
    label: string;
    title: string;
    body: string;
  }>;
  tasks: string[];
};

export type TeacherReadingBrief = {
  title: string;
  summary: string;
  items: Array<{ label: string; body: string }>;
};

export const DAILY_POINT_AMOUNT = 200;
export const POINT_UNLOCK_COST = 100;

export const MEMBER_UNLOCK_OPTIONS: MemberUnlockOption[] = [
  {
    type: 'deep_reading',
    label: '深入解釋',
    eyebrow: 'DEEP READING',
    title: '查看本次完整解釋',
    body: '查看更完整的白話解讀：優勢、卡點、目前最該注意的地方，以及今天可以做的一個小行動。',
  },
  {
    type: 'transit_day',
    label: '流日',
    eyebrow: 'DAILY TRANSIT',
    title: '查看今天的流日視角',
    body: '查看今天適合怎麼使用這份結果：哪裡可以前進、哪裡先不要急，避免把情緒當成答案。',
  },
  {
    type: 'transit_month',
    label: '流月',
    eyebrow: 'MONTHLY TRANSIT',
    title: '查看本月流月解讀',
    body: '查看本月主題：適合累積什麼、要避開什麼消耗，以及每週可以檢查的方向。',
  },
  {
    type: 'transit_year',
    label: '流年',
    eyebrow: 'YEARLY TRANSIT',
    title: '查看今年流年解讀',
    body: '查看今年大方向：哪些事值得長期投入、哪些慣性要調整，幫你把一年拆成可走的階段。',
  },
];

function taipeiDatePart(part: 'day' | 'month' | 'year') {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());
  if (part === 'year') return day.slice(0, 4);
  if (part === 'month') return day.slice(0, 7);
  return day;
}

function hashScopeText(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function canonicalJson(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map((item) => canonicalJson(item)).join(',')}]`;
  return `{${Object.keys(value as Record<string, unknown>)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson((value as Record<string, unknown>)[key])}`)
    .join(',')}}`;
}

function stableJson(value: unknown) {
  try {
    return canonicalJson(value);
  } catch {
    return String(value);
  }
}

export function unlockScopeKey(result: CalcResponse, type: MemberUnlockType) {
  const period =
    type === 'transit_day' ? taipeiDatePart('day')
      : type === 'transit_month' ? taipeiDatePart('month')
        : type === 'transit_year' ? taipeiDatePart('year')
          : result.computed_at.slice(0, 10);
  const seed = stableJson({
    input: result.input,
    data: result.data,
    version: result.version,
  });
  return `${result.tool}:${type}:${period}:${hashScopeText(seed)}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function cleanText(value: unknown, fallback: string) {
  const text = typeof value === 'string' || typeof value === 'number' ? String(value).trim() : '';
  return text || fallback;
}

function firstCardName(data: Record<string, unknown>) {
  const first = asRecord(asArray(data.cards)[0]);
  const card = asRecord(first.card);
  return cleanText(card.name_zh ?? card.name_en, '抽到的主牌');
}

function firstRuneName(data: Record<string, unknown>) {
  const first = asRecord(asArray(data.runes)[0]);
  const rune = asRecord(first.rune);
  return cleanText(rune.zh ?? rune.name ?? rune.glyph, '今日盧恩');
}

function resultAnchor(result: CalcResponse) {
  const data = result.data ?? {};
  if (result.tool === 'tarot') return firstCardName(data);
  if (result.tool === 'runes') return firstRuneName(data);
  if (result.tool === 'maya') return `Kin ${cleanText(data.kin, '本命')}`;
  if (result.tool === 'bazi') return cleanText(data.dayMaster, '日主');
  if (result.tool === 'ziwei') return cleanText(data.mingGong, '命宮');
  if (result.tool === 'astro') return cleanText(data.sun, '太陽星座');
  if (result.tool === 'humandesign') return cleanText(data.type, '能量類型');
  return cleanText(data.lifePathDisplay ?? data.lifePath, '核心數字');
}

function resultSignals(result: CalcResponse) {
  const data = result.data ?? {};
  const keys: Partial<Record<CalcTool, string[]>> = {
    numerology: ['lifePathDisplay', 'lifePathReduced', 'birthDayDisplay', 'lifePathArchetype'],
    maya: ['kin', 'tone', 'seal', 'guide', 'analog', 'antipode', 'occult'],
    bazi: ['dayMaster', 'dayMasterWuxing', 'dayMasterYinYang', 'nayin'],
    ziwei: ['mingGong', 'shenGong', 'fiveElementsClass'],
    astro: ['sun', 'moon', 'ascendant', 'midheaven'],
    humandesign: ['type', 'authority', 'profile', 'strategy'],
  };

  if (result.tool === 'tarot') return asArray(data.cards).slice(0, 3).map((item) => {
    const row = asRecord(item);
    const card = asRecord(row.card);
    return cleanText(card.name_zh ?? card.name_en, '塔羅牌');
  });

  if (result.tool === 'runes') return asArray(data.runes).slice(0, 3).map((item) => {
    const row = asRecord(item);
    const rune = asRecord(row.rune);
    return cleanText(rune.zh ?? rune.name ?? rune.glyph, '盧恩符文');
  });

  return (keys[result.tool] ?? [])
    .map((key) => cleanText(data[key], ''))
    .filter(Boolean)
    .slice(0, 5);
}

export function buildUnlockContentMetadata(result: CalcResponse) {
  const signals = resultSignals(result);
  return {
    result_anchor: resultAnchor(result),
    result_signals: signals.length ? signals : [resultAnchor(result)],
    computed_at: result.computed_at,
    version: result.version,
  };
}

export function buildTeacherReadingBrief(input: {
  customerQuestion?: string | null;
  chartTool?: string | null;
  chartData?: Record<string, unknown> | null;
  chartRecord?: Record<string, unknown> | null;
}): TeacherReadingBrief {
  const tool = cleanText(input.chartTool ?? input.chartRecord?.tool, '未指定工具');
  const data = asRecord(input.chartData ?? input.chartRecord?.output_data ?? input.chartRecord?.data);
  const question = cleanText(input.customerQuestion, '會員尚未補充提問');
  const keys = Object.entries(data)
    .filter(([, value]) => ['string', 'number'].includes(typeof value))
    .slice(0, 4)
    .map(([key, value]) => `${key}: ${value}`);

  return {
    title: `${tool}｜會員詳解備忘`,
    summary: `會員所問：「${question}」。老師可先看此問，再合參會員已附資料，勿只斷單一字面。`,
    items: [
      {
        label: '所問',
        body: question,
      },
      {
        label: '所附',
        body: keys.length ? keys.join('；') : '會員未附完整盤面，建議諮詢前請會員補充出生資料或已解鎖內容截圖。',
      },
      {
        label: '老師備註',
        body: '宜先釐清會員最想解的現實問題，再以命盤、牌面或流年流月作佐證；忌一開始即下定論。',
      },
    ],
  };
}
