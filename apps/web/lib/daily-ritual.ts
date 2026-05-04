import type { CalcResponse } from './api';

export type DailyDrawTool = 'tarot' | 'runes';

export interface DailyReadingSection {
  title: string;
  body: string;
}

export interface DailyReading {
  date: string;
  title: string;
  summary: string;
  tone: string;
  focus: string;
  avoid: string;
  ritual: string;
  sections: DailyReadingSection[];
}

export interface StoredDailyDraw {
  tool: DailyDrawTool;
  date: string;
  response: CalcResponse;
}

const THEMES = [
  {
    title: '穩定根基',
    tone: '把速度放慢，先照顧最基本的安全感與身體節奏。',
    focus: '今天適合整理作息、金錢、空間與承諾，把混亂的事情重新放回可管理的位置。',
    avoid: '避免急著答應所有邀請，也不要用忙碌掩蓋真正需要休息的訊號。',
    ritual: '用三分鐘整理桌面或手機訊息，只留下今天真正需要回應的三件事。',
  },
  {
    title: '清理雜訊',
    tone: '你不需要聽見每一種聲音，只需要辨認哪一種聲音真的屬於你。',
    focus: '今天適合關閉干擾、釐清優先順序，讓直覺從雜訊裡浮出來。',
    avoid: '避免反覆比較、滑太多資訊，或把別人的焦慮當成自己的任務。',
    ritual: '寫下今天最想保護的一件事，然後為它空出一段不被打擾的時間。',
  },
  {
    title: '柔軟前進',
    tone: '真正的前進不一定很用力，有時候是願意用更溫和的方式靠近答案。',
    focus: '今天適合修復關係、說出感受、重新調整期待，讓心裡卡住的地方鬆動。',
    avoid: '避免用冷淡包裝受傷，也不要把還沒確認的想像當成結論。',
    ritual: '對自己說一句誠實但不苛責的話，再決定今天要怎麼回應世界。',
  },
  {
    title: '界線整理',
    tone: '界線不是拒絕愛，而是讓能量回到清楚、健康、可長久的形式。',
    focus: '今天適合確認責任分界、拒絕不合理要求，或把話說得更清楚。',
    avoid: '避免為了討好而過度承擔，也不要把沉默誤認為和平。',
    ritual: '列出一件你願意做的事，以及一件今天不再勉強自己的事。',
  },
  {
    title: '靈感回收',
    tone: '那些看似零散的感受正在變成線索，請給它們一點空間。',
    focus: '今天適合記錄夢境、靈感、同步巧合與突然想到的人事物。',
    avoid: '避免太快否定直覺，也不要急著把每個訊號都解釋成絕對答案。',
    ritual: '把今天出現三次以上的念頭寫下來，晚上再回頭看它想帶你去哪裡。',
  },
];

export function taipeiDateKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function hashToSeed(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

export function buildDailyReading(dateKey: string, identity = 'guest'): DailyReading {
  const seed = hashToSeed(`${dateKey}:${identity}`);
  const theme = THEMES[seed % THEMES.length];
  const cycle = (seed % 9) + 1;
  const gate = (seed % 64) + 1;

  return {
    date: dateKey,
    title: theme.title,
    summary: `今天的養分是「${theme.title}」。它提醒你：${theme.tone} 今日能量數字 ${cycle}，適合用小步驟把狀態帶回清楚。`,
    tone: theme.tone,
    focus: theme.focus,
    avoid: theme.avoid,
    ritual: theme.ritual,
    sections: [
      {
        title: '今日可吸收',
        body: `數字 ${cycle} 帶來一種可以練習的節奏：先把注意力收回來，再決定要投入哪一件事。`,
      },
      {
        title: '內在訊號',
        body: `第 ${gate} 號訊號提醒你觀察身體、情緒與直覺的細節。它不是命令，而是一個協助你辨認方向的提示。`,
      },
      {
        title: '今日行動',
        body: theme.focus,
      },
    ],
  };
}

export function localDrawKey(tool: DailyDrawTool, dateKey: string) {
  return `mele:daily-draw:${tool}:${dateKey}`;
}
