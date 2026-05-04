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
    body: '付 100 點可開深解。此段以文言感書寫，先明其象，再立其行。',
  },
  {
    type: 'transit_day',
    label: '流日',
    eyebrow: 'DAILY TRANSIT',
    title: '解鎖今天的流日視角',
    body: '付 100 點觀今日之氣。宜知所進退，忌為雜念牽行。',
  },
  {
    type: 'transit_month',
    label: '流月',
    eyebrow: 'MONTHLY TRANSIT',
    title: '解鎖本月流月解讀',
    body: '付 100 點觀本月之勢。明其主題，辨其消長，安排行止。',
  },
  {
    type: 'transit_year',
    label: '流年',
    eyebrow: 'YEARLY TRANSIT',
    title: '解鎖今年流年解讀',
    body: '付 100 點觀今年之局。察其大勢，定其修習，分段而行。',
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
  return cleanText(data.lifePath, '核心數字');
}

function resultSignals(result: CalcResponse) {
  const data = result.data ?? {};
  const keys: Partial<Record<CalcTool, string[]>> = {
    numerology: ['lifePath', 'birthDay', 'lifePathArchetype'],
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
      tempo: '今日宜收斂心神，先定一事，不貪多功。',
      risk: '忌見一念而即動。身感、情緒、責任三者宜分辨，不宜混作一團。',
      action: '取一件十五分鐘可成之事，成後再議下一步。',
    };
  }
  if (type === 'transit_month') {
    return {
      period: '本月',
      title: '本月流月解讀',
      tempo: '本月宜立常課，使靈感、學習與人事各得其位。',
      risk: '忌一時求盡解。凡反覆來者，正是本月當修之處。',
      action: '列三件可久行之習，每七日自省一次。',
    };
  }
  if (type === 'transit_year') {
    return {
      period: '今年',
      title: '今年流年解讀',
      tempo: '今年宜將天賦入於長策，不以一時情緒為舟楫。',
      risk: '忌急迫決大事。歲運之象，貴在觀其漸成。',
      action: '分今年為三段：定基、開展、收束；每段各立一可驗之果。',
    };
  }
  return {
    period: '本次',
    title: '完整深入解釋',
    tempo: '此解不以吉凶定論，重在辨其主軸，使心有所據。',
    risk: '忌執一詞為全局。圖像、數據、位置與所問之事，宜合參而觀。',
    action: '先錄最有感之一句，再化為今日可行之一事。',
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
      summary: `此象以「${anchor}」為眼。${signalText} 皆為旁證；先明其所指，再定今日所行。`,
      sections: [
        {
          label: '其象',
          title: '本象所指',
          body: `${anchor} 為本次主象。此象不專言吉凶，乃示你當收回散逸之心，復見真正要處。`,
        },
        {
          label: '其用',
          title: '當如何承接',
          body: `${signalText} 同現，宜先立序，再求變。凡眼前最具體、最可改善之事，便是入手處。`,
        },
        {
          label: '其行',
          title: '今日可行之法',
          body: '宜少反應，多選擇；少自責，多整理。能行一小步，勝於徒得千言。',
        },
      ],
      tasks: ['記一字為今日主題', '擇一事於今日完成', '入夜回看其應驗處'],
    };
  }

  return {
    title: `${toolName}｜${period.title}`,
    summary: `${period.period}以「${anchor}」為門。所重不在斷一事成敗，而在知其節候，使進退有據。`,
    sections: [
      {
        label: '宜',
        title: `${period.period}可順之勢`,
        body: `${period.tempo} ${toolName} 所示 ${signalText}，可作定心之準。`,
      },
      {
        label: '忌',
        title: `${period.period}當避之耗`,
        body: period.risk,
      },
      {
        label: '行',
        title: `${period.period}可行之事`,
        body: period.action,
      },
    ],
    tasks: [
      `${period.period}只守一個主題`,
      '以一句話記其心境',
      '將提醒化為一件可成之事',
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
