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
    title: '解鎖本次完整解釋',
    body: '花 100 點看更完整的白話解讀：優勢、卡點、目前最該注意的地方，以及今天可以做的一個小行動。',
  },
  {
    type: 'transit_day',
    label: '流日',
    eyebrow: 'DAILY TRANSIT',
    title: '解鎖今天的流日視角',
    body: '花 100 點看今天適合怎麼使用這份結果：哪裡可以前進、哪裡先不要急，避免把情緒當成答案。',
  },
  {
    type: 'transit_month',
    label: '流月',
    eyebrow: 'MONTHLY TRANSIT',
    title: '解鎖本月流月解讀',
    body: '花 100 點看本月主題：適合累積什麼、要避開什麼消耗，以及每週可以檢查的方向。',
  },
  {
    type: 'transit_year',
    label: '流年',
    eyebrow: 'YEARLY TRANSIT',
    title: '解鎖今年流年解讀',
    body: '花 100 點看今年大方向：哪些事值得長期投入、哪些慣性要調整，幫你把一年拆成可走的階段。',
  },
];

const TOOL_LABEL: Record<CalcTool, string> = {
  numerology: '生命靈數',
  maya: '馬雅曆',
  bazi: '八字',
  ziwei: '紫微斗數',
  tarot: '塔羅',
  runes: '盧恩',
  astro: '占星',
  humandesign: '人類圖',
};

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

function stableJson(value: unknown) {
  try {
    return JSON.stringify(value);
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

function periodCopy(type: MemberUnlockType) {
  if (type === 'transit_day') {
    return {
      period: '今日',
      title: '今日流日解讀',
      tempo: '今天先把注意力收回來，不需要一次解決所有事。選一個最有感的問題，先把它說清楚。',
      risk: '容易把感覺、責任與別人的期待混在一起。越急著立刻回應，越容易做出不是自己真心的選擇。',
      action: '做一件十五分鐘內能完成的小事；完成後再決定下一步，不要用焦慮催自己。',
    };
  }
  if (type === 'transit_month') {
    return {
      period: '本月',
      title: '本月流月解讀',
      tempo: '本月重點是建立節奏。把靈感、學習、人際與休息分開安排，會比臨時硬撐更穩。',
      risk: '反覆出現的狀況不是單純倒楣，而是在提醒你：某個習慣或界線需要重新整理。',
      action: '列出三件可以持續的小習慣，每七天回頭看一次：哪一件真的讓你變穩。',
    };
  }
  if (type === 'transit_year') {
    return {
      period: '今年',
      title: '今年流年解讀',
      tempo: '今年適合把天賦放進長期計畫，不要只靠一時熱情或一時害怕來決定大事。',
      risk: '容易因為想快點看到結果，就做出太急的承諾。年度節奏要看趨勢，不要只看單一事件。',
      action: '把今年分成三段：打底、開展、收束。每一段只設定一個能被驗證的成果。',
    };
  }
  return {
    period: '本次',
    title: '完整深入解釋',
    tempo: '這份解讀不是要替你下定論，而是幫你抓出目前最重要的主軸，讓你知道自己為什麼會卡住。',
    risk: '不要只抓一個詞就判斷全部。命盤、牌面、問題背景與你現在的狀態，要放在一起看才準。',
    action: '先圈出最有感的一句話，再把它變成今天可以實際完成的一件小事。',
  };
}

export function buildUnlockedReadingContent(result: CalcResponse, type: MemberUnlockType): MemberUnlockedReading {
  const toolName = TOOL_LABEL[result.tool];
  const anchor = resultAnchor(result);
  const signals = resultSignals(result);
  const signalText = signals.length ? signals.join('、') : anchor;
  const period = periodCopy(type);

  if (type === 'deep_reading') {
    return {
      title: `${toolName}｜完整深入解釋`,
      summary: `這次先以「${anchor}」當入口，再用 ${signalText} 補充細節。重點不是把你定型，而是幫你看懂：現在最容易被觸發的地方在哪裡，以及可以怎麼調整。`,
      sections: [
        {
          label: '核心',
          title: '這次最該先看什麼',
          body: `${anchor} 是本次結果的主軸。你可以先觀察它有沒有說中：你最近反覆遇到的情緒、選擇或人際模式。`,
        },
        {
          label: '優勢',
          title: '可以拿來使用的能力',
          body: `${signalText} 代表你手上其實有資源。不要急著否定自己，先分辨哪些特質是能幫你處理問題的。`,
        },
        {
          label: '行動',
          title: '今天先做哪一步',
          body: '先少一點反射性回應，多一點有意識選擇。把問題縮小到今天能完成的一步，會比一次想通全部更有效。',
        },
      ],
      tasks: ['寫下今天最有感的一句話', '選一件 15 分鐘內能完成的小行動', '晚上回看：這個提醒是否真的有幫助'],
    };
  }

  return {
    title: `${toolName}｜${period.title}`,
    summary: `${period.period}先以「${anchor}」當入口。這段不是要斷定事情一定會怎樣，而是幫你判斷：現在適合前進、整理，還是先停一下。`,
    sections: [
      {
        label: '宜',
        title: `${period.period}可以順著做的事`,
        body: `${period.tempo} 這次 ${toolName} 顯示的 ${signalText}，可以當成今天的提醒。`,
      },
      {
        label: '忌',
        title: `${period.period}需要避開的消耗`,
        body: period.risk,
      },
      {
        label: '行',
        title: `${period.period}可行的小步驟`,
        body: period.action,
      },
    ],
    tasks: [
      `${period.period}只守住一個主題`,
      '用一句話記下現在的心境',
      '把提醒變成一件做得到的小事',
    ],
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
