'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MayaOracleBoard, MayaTotemGallery, MayaTotemGlyph, getMayaTotemBySeal } from '@/components/MayaTotemGlyph';
import type { CalcResponse, CalcTool } from '@/lib/api';
import {
  DAILY_POINT_AMOUNT,
  MEMBER_UNLOCK_OPTIONS,
  POINT_UNLOCK_COST,
  buildUnlockContentMetadata,
  unlockScopeKey as getUnlockScopeKey,
  type MemberUnlockedReading,
  type MemberUnlockOption,
  type MemberUnlockType,
} from '@/lib/member-unlocks';
import { createClient } from '@/lib/supabase/client';
import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import { getToolResultCopy, type ToolResultCopy } from '@/lib/i18n/tool-result-copy';

type Dict = Record<string, unknown>;

type InsightFact = {
  label: string;
  value: string;
};

type InsightCard = {
  title: string;
  subtitle?: string;
  body?: string;
  tags?: string[];
  mayaSeal?: unknown;
};

type ResultInsight = {
  eyebrow: string;
  title: string;
  intro: string;
  facts: InsightFact[];
  cards: InsightCard[];
};

type PersonalReadingPoint = {
  label: string;
  title: string;
  body: string;
};

type PersonalReading = {
  eyebrow: string;
  title: string;
  subtitle: string;
  points: PersonalReadingPoint[];
};

type PointRpcResult = {
  claimed?: boolean;
  amount?: number;
  balance?: number;
  already_unlocked?: boolean;
  content?: MemberUnlockedReading;
};

type BeginnerGuideItem = {
  label: string;
  title: string;
  body: string;
};

type BeginnerGuide = {
  title: string;
  intro: string;
  items: BeginnerGuideItem[];
  note: string;
};

type MemberResonancePoint = {
  label: string;
  title: string;
  body: string;
};

type MemberResonance = {
  eyebrow: string;
  title: string;
  lead: string;
  mirror: string;
  points: MemberResonancePoint[];
  nextQuestion: string;
};

type GameStat = {
  label: string;
  value: string;
  tone: 'gold' | 'cyan' | 'rose' | 'violet';
};

type GameQuest = {
  title: string;
  body: string;
  reward: string;
};

type GameProfile = {
  title: string;
  className: string;
  rank: string;
  progress: number;
  stats: GameStat[];
  badges: string[];
  quests: GameQuest[];
};

const GAME_META: Record<CalcTool, { title: string; className: string; rank: string; focus: string; badge: string }> = {
  numerology: {
    title: '靈數旅人',
    className: '數字占星師',
    rank: '命運序章',
    focus: '核心數字',
    badge: '生命路徑',
  },
  maya: {
    title: '星際 Kin 旅者',
    className: '銀河行者',
    rank: '時間印記',
    focus: '銀河原型',
    badge: 'Kin 印記',
  },
  bazi: {
    title: '五行鍊金師',
    className: '四柱鍛造',
    rank: '本命火種',
    focus: '五行平衡',
    badge: '日主能量',
  },
  ziwei: {
    title: '星宮策士',
    className: '十二宮探索',
    rank: '命宮開局',
    focus: '宮位線索',
    badge: '主星導航',
  },
  tarot: {
    title: '牌陣旅人',
    className: '神諭抽牌',
    rank: '今日啟示',
    focus: '牌面訊息',
    badge: '牌陣覺察',
  },
  runes: {
    title: '符文探險者',
    className: '古石召喚',
    rank: '符印回聲',
    focus: '符文訊號',
    badge: '古石提醒',
  },
  astro: {
    title: '星盤航海士',
    className: '天體定位',
    rank: '星圖校準',
    focus: '星體座標',
    badge: '三核心',
  },
  humandesign: {
    title: '能量建築師',
    className: 'BodyGraph 啟動',
    rank: '閘門任務',
    focus: '能量中心',
    badge: '策略權威',
  },
};

const BEGINNER_GUIDES: Record<CalcTool, BeginnerGuide> = {
  numerology: {
    title: '數字命理初步認識自己',
    intro: '會員可以先把生命靈數當成一張性格地圖：它不替你下結論，而是幫你看見自己常用的思考方式、行動節奏與人生課題。',
    items: [
      { label: '01', title: '生命靈數', body: '看你自然會重視什麼，以及遇到選擇時常用的判斷方式。' },
      { label: '02', title: '生日數', body: '看你比較容易被別人感受到的天賦、說話方式與日常反應。' },
      { label: '03', title: '原型提示', body: '把數字轉成比較好懂的角色語言，幫你快速抓到自己的強項與盲點。' },
    ],
    note: '初階先看「我像什麼」，再看「我最近可以練習什麼」。',
  },
  maya: {
    title: '瑪雅曆初步認識自己：用 Kin 看行動節奏',
    intro: '先不要把 Kin 當神祕名詞。它比較像一張「我怎麼啟動、怎麼卡住、該借哪股力」的說明書：調性看節奏，圖騰看天賦，神諭板看你遇到壓力時可以怎麼轉向。',
    items: [
      { label: 'Kin', title: 'Kin 是你的瑪雅曆身份編號，但不是流水號', body: '它把你的調性、圖騰、支持與挑戰串在一起。先看它，是為了知道整份解讀在講哪一種生命操作模式。' },
      { label: 'Tone', title: '調性像是你的做事節奏：看你怎麼推進事情', body: '有人需要先有目的，有人需要先整理阻力，有人要透過行動才有感。調性會直接指出：你順的時候怎麼動，卡的時候常卡在哪。' },
      { label: 'Seal', title: '圖騰像是你的核心天賦，也是你的慣用武器', body: '圖騰不是好聽稱號，而是你的慣用力量。例如溝通、照顧、突破、整理、美感或直覺；優勢用過頭時，也會變成壓力反應。' },
    ],
    note: '讀法：先看「先給會員的命中感」有沒有刺中，再看神諭板的支持與挑戰，最後只選一個今日行動。',
  },
  bazi: {
    title: '八字初步認識自己',
    intro: '八字用出生年月日時看五行流動與日主狀態，適合拿來理解你的能量配置、做事穩定度、人際互動與資源使用方式。',
    items: [
      { label: '01', title: '日主', body: '日主是八字裡最像「自己」的位置，先看它是什麼五行，再看自己如何補足或平衡。' },
      { label: '02', title: '五行分布', body: '五行不是好壞分數，而是看你的能量偏向：哪裡順手、哪裡需要慢慢練。' },
      { label: '03', title: '四柱角色', body: '年、月、日、時像不同生活層面，能幫會員分辨家庭、工作、關係與長期方向。' },
    ],
    note: '初階不用急著看吉凶，先理解自己哪種能量過強、哪種能量需要支持。',
  },
  ziwei: {
    title: '紫微斗數初步認識自己',
    intro: '紫微斗數像一張人生宮位地圖，從命宮、身宮與各宮位的星曜，看你在不同生活題目裡的習慣與發展方向。',
    items: [
      { label: '01', title: '命宮', body: '命宮先看你的基本性格、人生主題與外在呈現，是新會員最適合先讀的位置。' },
      { label: '02', title: '身宮', body: '身宮看你長大後更常用的行動方式，也能補充命宮沒有說完的生活重心。' },
      { label: '03', title: '宮位', body: '每個宮位對應一個生活題目，例如感情、工作、財務、家人或內在安全感。' },
    ],
    note: '初階先看命宮與身宮，再挑一個最近最在意的宮位深入讀。',
  },
  tarot: {
    title: '塔羅初步認識自己',
    intro: '塔羅適合看當下狀態與選擇脈絡。它不是替你決定，而是把你心裡已經浮現的訊號整理成畫面與提醒。',
    items: [
      { label: '01', title: '牌面主題', body: '先看牌名和圖像帶給你的第一感覺，通常那就是最接近當下狀態的入口。' },
      { label: '02', title: '位置意義', body: '過去、現在、未來或其他牌陣位置，會讓同一張牌有不同焦點。' },
      { label: '03', title: '正逆位', body: '正位多半是能量順流，逆位常提醒卡住、過度或需要換角度。' },
    ],
    note: '初階先問：這張牌在提醒我看見什麼，而不是急著問結果好不好。',
  },
  runes: {
    title: '盧恩符文初步認識自己',
    intro: '盧恩像古老符號的短訊息，適合用來看今天的提醒、內在狀態或一個問題背後的核心力量。',
    items: [
      { label: '01', title: '符文名稱', body: '先讀符文代表的主題，例如保護、旅程、突破、耐心或交換。' },
      { label: '02', title: '材質與感覺', body: '石、木、晶體會帶出不同氛圍，會員可以從直覺感受進入解讀。' },
      { label: '03', title: '行動提醒', body: '盧恩通常很適合轉成一句短行動：今天我要保留、釋放或前進什麼。' },
    ],
    note: '初階把符文當成一天的方向提示，簡短但很適合反覆回看。',
  },
  astro: {
    title: '星盤初步認識自己',
    intro: '星盤用出生時刻的星體位置看人格結構。新會員可以先從太陽、月亮與上升三個入口開始理解自己。',
    items: [
      { label: 'Sun', title: '太陽看核心意志', body: '太陽像你想成為的樣子，也常代表自我認同與生命方向。' },
      { label: 'Moon', title: '月亮看情緒需求', body: '月亮描述你怎麼感受安全、怎麼安撫自己，以及親密關係裡需要什麼。' },
      { label: 'ASC', title: '上升看外在表現', body: '上升像你進入世界的方式，別人常先看到這一層。' },
    ],
    note: '初階先用太陽、月亮、上升做三角定位，就能先理解自己一大半。',
  },
  humandesign: {
    title: '人類圖初步認識自己',
    intro: '人類圖重點是看你如何做決定、如何消耗或保存能量，以及什麼環境能讓你活得更順。',
    items: [
      { label: '01', title: '類型', body: '類型先看你的能量運作方式，例如主動啟動、回應、等待邀請或觀察環境。' },
      { label: '02', title: '權威', body: '權威是做決定的內在指南，提醒你不要只用頭腦硬判斷。' },
      { label: '03', title: '中心與通道', body: '有定義的中心像穩定輸出，未定義中心像敏感接收，兩者都不是好壞。' },
    ],
    note: '初階先看類型與權威，先練習用自己的節奏做決定。',
  },
};

const TOOL_COPY: Record<CalcTool, { eyebrow: string; title: string; intro: string }> = {
  numerology: {
    eyebrow: '生命靈數解讀',
    title: '從核心數字看見天賦與人生課題',
    intro: '這份結果會先整理你的主要數字，再把它轉成容易理解的性格傾向、行動風格與提醒。數字不是限制，而是一種觀察自己的語言。',
  },
  maya: {
    eyebrow: '馬雅 Kin 解讀',
    title: '這不是稱號表，是你的行動節奏與壓力反應',
    intro: '先看調性，再看圖騰：調性說你怎麼推進事情，圖騰說你最自然的力量。下面會把它翻成白話：你順的時候怎麼動、卡住時容易怎麼反應、今天可以先做哪一步。',
  },
  bazi: {
    eyebrow: '八字解讀',
    title: '四柱、日主與五行呈現命盤結構',
    intro: '八字重視出生時空形成的氣場結構。這裡先整理四柱、日主與五行，再協助你看見性格底色與需要平衡的方向。',
  },
  ziwei: {
    eyebrow: '紫微斗數解讀',
    title: '從命宮、身宮與星曜看人生配置',
    intro: '紫微斗數適合觀察人生主軸與各宮位互動。請先看命宮與主要星曜，再延伸到事業、關係、財務與長期發展。',
  },
  tarot: {
    eyebrow: '塔羅牌解讀',
    title: '牌面位置、正逆位與關鍵字形成當下訊息',
    intro: '塔羅適合看此刻的心理狀態、事件流向與可採取的行動。請把牌面當作一面鏡子，協助你把問題問得更準。',
  },
  runes: {
    eyebrow: '盧恩符文解讀',
    title: '符文材質與正逆位帶出行動提醒',
    intro: '盧恩的語氣通常比較直接，適合看阻礙、資源與下一步。它提醒你回到當下，看清楚能做什麼。',
  },
  astro: {
    eyebrow: '占星命盤解讀',
    title: '行星、星座與宮位呈現你的內在系統',
    intro: '占星命盤不是單一星座，而是太陽、月亮、上升與行星宮位交織而成。請從核心三要素開始，再看細節。',
  },
  humandesign: {
    eyebrow: '人類圖解讀',
    title: '類型、策略、權威與閘門說明能量運作方式',
    intro: '人類圖適合觀察你如何做決定、如何與世界互動，以及哪些中心或閘門較容易被啟動。',
  },
};


const TOOL_PERSONA_TITLE: Record<CalcTool, string> = {
  numerology: '你的生命節奏',
  maya: '你的 Kin 能量',
  bazi: '你的五行結構',
  ziwei: '你的命盤主軸',
  tarot: '這次牌面給你的訊息',
  runes: '這次符文給你的提醒',
  astro: '你的星盤入口',
  humandesign: '你的能量運作方式',
};

const KEY_LABELS: Record<string, string> = {
  lifePath: '生命靈數',
  birthDay: '生日數',
  lifePathArchetype: '生命原型',
  birthDayArchetype: '生日原型',
  kin: 'Kin',
  label: '完整名稱',
  tone: '調性',
  seal: '圖騰',
  classicTzolkin: '古典 Tzolkin',
  starroot: 'Starroot 對照',
  longCount: '長紀曆',
  pillars: '四柱',
  dayMaster: '日主',
  dayMasterYinYang: '日主陰陽',
  dayMasterWuxing: '日主五行',
  wuxing: '五行分布',
  nayin: '納音',
  hiddenStems: '地支藏干',
  changSheng: '十二長生',
  daYun: '大運',
  shensha: '神煞',
  strength: '日主強弱',
  pattern: '格局',
  mingGong: '命宮',
  shenGong: '身宮',
  fiveElementsClass: '五行局',
  palaces: '十二宮',
  majorStars: '主星',
  sun: '太陽',
  moon: '月亮',
  ascendant: '上升',
  midheaven: '天頂',
  type: '類型',
  authority: '內在權威',
  profile: '人生角色',
  strategy: '策略',
  definedCenters: '已定義中心',
  undefinedCenters: '未定義中心',
  definedChannels: '已定義通道',
  activatedGates: '啟動閘門',
};

const PILLAR_LABELS: Record<string, string> = {
  year: '年柱',
  month: '月柱',
  day: '日柱',
  time: '時柱',
  hour: '時柱',
};

const NUMEROLOGY_FACT_LABELS: Record<string, string> = {
  lifePath: '生命靈數',
  lifePathReduced: '底色數',
  lifePathDisplay: '生命靈數',
  birthDay: '生日數',
  birthDayReduced: '生日底色',
  birthDayDisplay: '生日數',
  calculationMethod: '算法說明',
  calculationNote: '數字說明',
};

const HIDDEN_FACT_KEYS = new Set([
  'jd',
  'meta',
  'input',
  'location',
  'planets',
  'houses',
  'render',
  'svg',
  'html',
  'animations',
]);

const HD_VALUE_LABELS: Record<string, string> = {
  Manifestor: '顯示者',
  Generator: '生產者',
  'Manifesting Generator': '顯示生產者',
  Projector: '投射者',
  Reflector: '反映者',
  Emotional: '情緒權威',
  Sacral: '薦骨權威',
  Splenic: '脾臟權威',
  'Ego (Heart)': '意志權威',
  'Self-Projected': '自我投射權威',
  Lunar: '月亮權威',
  'Mental (Outer)': '環境權威',
  'To Inform': '先告知再行動',
  'To Respond': '等待回應',
  'To Wait for the Invitation': '等待邀請',
  'To Wait a Lunar Cycle': '等待月亮週期',
  Head: '頭頂中心',
  Ajna: '邏輯中心',
  Throat: '喉嚨中心',
  G: 'G 中心',
  Heart: '意志中心',
  SolarPlexus: '情緒中心',
  Spleen: '脾臟中心',
  Root: '根部中心',
};

const MAYA_ORACLE_COPY: Record<string, string> = {
  self: '核心 Kin 說明你最自然的生命題目，是整份馬雅解讀的中心。',
  guide: '引導力量像內在指南針，適合用來判斷下一步要往哪裡走。',
  analog: '支持力量是你的友軍與補給，能幫你找回穩定感。',
  antipode: '挑戰力量不是敵人，而是訓練你整合反面能力的入口。',
  occult: '隱藏力量常在意外或低谷中出現，像潛意識送來的暗線禮物。',
};

const GATE_BRIEFS: Record<number, { title: string; body: string }> = {
  1: { title: '創造', body: '用獨特方式表達自己，當不急著證明時，創造力會自然被看見。' },
  2: { title: '方向', body: '對人生方向與資源接收敏感，適合先確認內在感受再前進。' },
  3: { title: '起始混沌', body: '能把新循環初期的混亂整理成新的秩序。' },
  4: { title: '解答', body: '擅長尋找邏輯答案，也要辨認問題是否真的屬於你。' },
  5: { title: '節奏', body: '需要穩定規律，節奏被打亂時能量容易消耗。' },
  6: { title: '情緒邊界', body: '關係中的親近與距離很重要，情緒清楚後再承諾更穩。' },
  7: { title: '角色方向', body: '容易感覺群體方向，適合以服務整體的方式帶路。' },
  8: { title: '貢獻風格', body: '透過個人風格帶來貢獻，越真實越容易吸引適合舞台。' },
  9: { title: '專注', body: '擁有細節專注力，適合聚焦少數真正重要的事情。' },
  10: { title: '自我行為', body: '課題是活出真實自我，而不是只扮演別人期待的樣子。' },
  11: { title: '想法', body: '腦中有許多故事與靈感，適合分享啟發但不必每個都執行。' },
  12: { title: '謹慎表達', body: '表達需要對的情緒與時機；狀態對了，話語會很有感染力。' },
  13: { title: '聆聽', body: '容易承接他人的故事，適合成為理解者，也要保護容量。' },
  14: { title: '資源動能', body: '能把能量投入資源與工作，重點是投入有回應的方向。' },
  15: { title: '極端節奏', body: '節奏可能不固定，適合接納變化並建立可持續框架。' },
  16: { title: '技藝熱情', body: '透過練習養成技能，熱情加上重複會變成才華。' },
  17: { title: '觀點', body: '擅長形成觀點與分類，需要用溫和方式讓人願意聽見。' },
  18: { title: '修正', body: '能看見可改善之處，重點是讓批判變成修正。' },
  19: { title: '需求敏感', body: '對歸屬、親密與資源需求敏感，適合誠實說出需要。' },
  20: { title: '當下', body: '需要活在此刻，身體在場時表達與行動會更精準。' },
  21: { title: '掌控', body: '需要在資源與責任中有掌控感，適合清楚談條件與界線。' },
  22: { title: '優雅情緒', body: '魅力與情緒狀態連動，狀態對了自然有吸引力。' },
  23: { title: '簡化', body: '能把複雜洞見說得簡單，但需要等待他人準備好接收。' },
  24: { title: '反覆思考', body: '會反覆咀嚼靈感，直到它變成可理解的答案。' },
  25: { title: '純真', body: '力量在於真誠與心的純度，也要學會保護自己。' },
  26: { title: '影響與說服', body: '擅長包裝價值與說服他人，誠實會讓影響力更長久。' },
  27: { title: '照顧', body: '有照顧與滋養本能，也要記得先讓自己有足夠能量。' },
  28: { title: '生命意義', body: '會追問值得不值得，找到意義時能非常有韌性。' },
  29: { title: '承諾', body: '有投入經驗的力量，承諾前需要確認身體真的願意。' },
  30: { title: '渴望', body: '容易被強烈渴望推動，適合把慾望看成方向訊號。' },
  31: { title: '領導之聲', body: '能透過表達帶領群體，但真正的領導需要被認可。' },
  32: { title: '延續', body: '對可持續性與風險敏銳，適合判斷什麼值得長期投入。' },
  33: { title: '退隱回顧', body: '需要時間消化經驗；整理後，故事才會變成智慧。' },
  34: { title: '強大動能', body: '生命動能強，適合投入有回應的事，避免為忙而忙。' },
  35: { title: '經驗變化', body: '渴望新經驗，重點是讓變化帶來成熟。' },
  36: { title: '情緒經驗', body: '在未知與情緒波動中學習，越放慢越能穿越混亂。' },
  37: { title: '家庭與承諾', body: '重視互惠、情感安全與承諾，公平會影響穩定感。' },
  38: { title: '奮戰', body: '會為有意義的事情奮戰，先確認值得，力量才不浪費。' },
  39: { title: '挑動', body: '可能觸動他人情緒或創意，目的是喚醒真正感受。' },
  40: { title: '獨立與休息', body: '需要在承諾與獨處間平衡，休息會讓意志力回來。' },
  41: { title: '想像起點', body: '是情緒經驗的起點，想像力會推動新的故事。' },
  42: { title: '完成循環', body: '適合把開始的事情走完，完成後才看見經驗禮物。' },
  43: { title: '突破洞見', body: '有突如其來的洞見，需要等待時機與語言讓人聽懂。' },
  44: { title: '模式辨識', body: '能感覺過去模式是否重演，適合辨認合作可靠度。' },
  45: { title: '資源管理', body: '適合管理資源與分配價值，安全感來自互惠。' },
  46: { title: '身體之愛', body: '成長透過身體與經驗發生，適合相信自己正在學習。' },
  47: { title: '理解壓力', body: '會把混亂片段整理成理解，別急著在壓力中下結論。' },
  48: { title: '深度', body: '有追求深度與專業的潛力，別因覺得不夠好而停住。' },
  49: { title: '原則', body: '對關係中的原則敏感，價值不合時需要重定界線。' },
  50: { title: '價值守護', body: '關心責任、照顧與倫理，適合建立讓人安心的規範。' },
  51: { title: '震撼啟動', body: '可能透過突發事件被喚醒，勇氣來自回到心的方向。' },
  52: { title: '靜止', body: '需要停下來集中能量；靜止也是在累積定力。' },
  53: { title: '開始', body: '有開啟新循環的壓力，開始前先確認是否有資源走完。' },
  54: { title: '野心', body: '有向上提升的動力，適合放進合作與長期策略。' },
  55: { title: '豐盛情緒', body: '精神狀態影響豐盛感，情緒自由比外在擁有更重要。' },
  56: { title: '故事旅行', body: '適合用故事與經驗啟發他人，分享前先消化感受。' },
  57: { title: '直覺清明', body: '有當下生存直覺，越安靜越能聽見身體訊號。' },
  58: { title: '生命喜悅', body: '想改善生活並追求活力，批判背後是想讓事情更好。' },
  59: { title: '親密破冰', body: '能打開親密與合作入口，也需要尊重彼此界線。' },
  60: { title: '限制', body: '會感覺到限制，但限制也能逼出新的形式與突破。' },
  61: { title: '內在真理', body: '會追問不可見的真理，答案需要時間在內在成形。' },
  62: { title: '細節表達', body: '能把細節說清楚，適合用精準語言讓抽象落地。' },
  63: { title: '懷疑', body: '懷疑能幫助檢查邏輯，重點是變成驗證而不是焦慮。' },
  64: { title: '未解之謎', body: '腦中常有片段與疑問，需要時間讓靈感拼成意義。' },
};

function asDict(value: unknown): Dict {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Dict) : {};
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function cleanText(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') return value.trim() || fallback;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function compact(items: Array<string | null | undefined>, separator = ' / '): string {
  return items.map((item) => cleanText(item)).filter(Boolean).join(separator);
}

function firstValue(data: Dict, keys: string[], fallback = '尚未取得'): string {
  for (const key of keys) {
    const formatted = formatPrimitive(data[key]);
    if (formatted) return formatted;
  }
  return fallback;
}

function formatDegree(value: unknown): string {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) return `${numeric.toFixed(1)}度`;
  const raw = cleanText(value);
  return raw ? `${raw}度` : '';
}

function formatZodiacPoint(value: unknown): string {
  const obj = asDict(value);
  const sign = asDict(obj.sign);
  if (Object.keys(sign).length === 0) return '';
  return compact([cleanText(sign.symbol), cleanText(sign.zh), formatDegree(sign.degInSign)], ' ');
}

function formatPrimitive(value: unknown): string {
  if (value === null || value === undefined || value === '') return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    const raw = String(value);
    return HD_VALUE_LABELS[raw] ?? raw;
  }
  if (Array.isArray(value)) {
    return value
      .slice(0, 8)
      .map((item) => formatPrimitive(item))
      .filter(Boolean)
      .join(' / ');
  }

  const obj = asDict(value);
  const zodiacPoint = formatZodiacPoint(obj);
  if (zodiacPoint) return zodiacPoint;

  const direct = cleanText(obj.name_zh) || cleanText(obj.zh) || cleanText(obj.label) || cleanText(obj.name) || cleanText(obj.text);
  if (direct) return direct;

  const counts = asDict(obj.counts);
  if (Object.keys(counts).length > 0) {
    const countText = Object.entries(counts).map(([name, count]) => `${name}${cleanText(count)}`).join(' / ');
    const missing = asArray(obj.missing).map((item) => cleanText(item)).filter(Boolean);
    return missing.length ? `${countText}，缺 ${missing.join(' / ')}` : countText;
  }

  return '';
}

function formatPillars(value: unknown): string {
  const pillars = asDict(value);
  return Object.entries(pillars)
    .map(([key, pillar]) => {
      const pillarText = Array.isArray(pillar) ? pillar.map((part) => cleanText(part)).join('') : formatPrimitive(pillar);
      return pillarText ? `${PILLAR_LABELS[key] ?? key} ${pillarText}` : '';
    })
    .filter(Boolean)
    .join(' / ');
}

function formatFact(data: Dict, key: string): InsightFact | null {
  const raw = data[key];
  let value = key === 'pillars' ? formatPillars(raw) : formatPrimitive(raw);

  if (key === 'starroot') {
    const starroot = asDict(raw);
    const dreamspell = asDict(starroot.dreamspell);
    const longCount = asDict(starroot.longCount);
    value = compact([formatPrimitive(dreamspell), formatPrimitive(longCount)], ' / ');
  }

  if (!value) return null;
  return { label: NUMEROLOGY_FACT_LABELS[key] ?? KEY_LABELS[key] ?? key, value };
}

function collectFacts(data: Dict, keys: string[], limit = 6): InsightFact[] {
  const facts: InsightFact[] = [];

  for (const key of keys) {
    const fact = formatFact(data, key);
    if (fact) facts.push(fact);
    if (facts.length >= limit) return facts;
  }

  for (const key of Object.keys(data)) {
    if (keys.includes(key)) continue;
    if (HIDDEN_FACT_KEYS.has(key)) continue;
    const fact = formatFact(data, key);
    if (fact) facts.push(fact);
    if (facts.length >= limit) break;
  }

  return facts;
}

function keywordsFrom(draw: Dict, source: Dict): string[] {
  const direct = asArray(draw.keywords).map((item) => cleanText(item)).filter(Boolean);
  if (direct.length) return direct.slice(0, 4);

  const position = cleanText(draw.position);
  const meaning = asDict(position === 'reversed' ? source.reversed : source.upright);
  const nested = asArray(meaning.keywords).map((item) => cleanText(item)).filter(Boolean);
  const base = asArray(source.keywords).map((item) => cleanText(item)).filter(Boolean);
  return (nested.length ? nested : base).slice(0, 4);
}

function meaningFrom(draw: Dict, source: Dict): string {
  const direct = cleanText(draw.meaning);
  if (direct) return direct;
  const position = cleanText(draw.position);
  const meaning = asDict(position === 'reversed' ? source.reversed : source.upright);
  return cleanText(meaning.text) || cleanText(source.text);
}

function positionLabel(position: unknown): string {
  return cleanText(position) === 'reversed' ? '逆位' : '正位';
}

function tarotPositionReading(slot: string, position: string, meaning: string): string {
  const label = slot || '這張牌';
  const reversed = position === 'reversed';
  if (/過去|背景|起因/.test(label)) {
    return `${label}：這裡不是重複牌義，而是在看事情怎麼開始。${meaning} ${reversed ? '逆位表示這個舊狀態還沒完全鬆開，可能仍在影響你現在的判斷。' : '正位表示這股力量曾經幫你撐住局面，但現在要看它是否還適用。'}`;
  }
  if (/現在|當下|現況/.test(label)) {
    return `${label}：這張牌只看你此刻正在面對的核心壓力。${meaning} ${reversed ? '逆位表示你現在可能卡在不敢承認、或不想正面處理的狀態。' : '正位表示現在最該先承認這個訊號，而不是急著跳到結論。'}`;
  }
  if (/未來|下一步|建議|行動|結果/.test(label)) {
    return `${label}：這裡要轉成可以做的事。${meaning} ${reversed ? '逆位提醒你先停下錯誤慣性，不要用同一種方式硬推。' : '正位提醒你把這張牌變成一個具體行動，今天先做最小的一步。'}`;
  }
  return `${label}：${meaning} ${reversed ? '逆位重點是阻塞、壓抑或過度使用這股能量。' : '正位重點是把這股能量用在正確的位置。'}`;
}

function tarotCards(data: Dict): InsightCard[] {
  return asArray(data.cards).slice(0, 6).map((item, index) => {
    const draw = asDict(item);
    const card = asDict(draw.card);
    const name = cleanText(card.name_zh) || cleanText(card.name_en) || `第 ${index + 1} 張牌`;
    const slot = cleanText(draw.spread_position) || cleanText(draw.slot) || `位置 ${index + 1}`;
    const position = cleanText(draw.position);
    const meaning = meaningFrom(draw, card) || '這張牌指出你目前最需要面對的心理狀態與下一步提醒。';
    return {
      title: name,
      subtitle: `${slot} / ${positionLabel(position)}`,
      body: tarotPositionReading(slot, position, meaning),
      tags: keywordsFrom(draw, card),
    };
  });
}

function runeCards(data: Dict): InsightCard[] {
  return asArray(data.runes).slice(0, 6).map((item, index) => {
    const draw = asDict(item);
    const rune = asDict(draw.rune);
    const name = cleanText(rune.zh) || cleanText(rune.name) || `第 ${index + 1} 枚符文`;
    const glyph = cleanText(rune.glyph) || cleanText(rune.symbol);
    return {
      title: compact([glyph, name], ' '),
      subtitle: `${cleanText(draw.spread_position) || cleanText(draw.slot) || `符文 ${index + 1}`} / ${positionLabel(draw.position)}`,
      body: meaningFrom(draw, rune) || '這枚符文提醒你回到當下，先辨認可用資源，再決定下一個清楚的行動。',
      tags: keywordsFrom(draw, rune),
    };
  });
}

function mayaCards(data: Dict): InsightCard[] {
  const oracle = asDict(data.oracle);
  const labels: Record<string, string> = {
    self: '核心 Kin',
    guide: '引導力量',
    analog: '支持力量',
    antipode: '挑戰力量',
    occult: '隱藏力量',
  };

  return Object.entries(labels)
    .map(([key, label]) => {
      const item = asDict(oracle[key]);
      const seal = asDict(item.seal);
      const tone = asDict(item.tone);
      const kin = cleanText(item.kin);
      const sealText = formatPrimitive(seal);
      const toneText = formatPrimitive(tone);
      const memberCopy = mayaMemberCopy(sealText);
      const toneCopy = mayaToneCopy(toneText);
      const roleCopy: Record<string, string> = {
        self: `${memberCopy.gift} ${toneCopy.rhythm}`,
        guide: `卡住時先借這股引導：${memberCopy.gift} 把它化成動作，就是先問「我下一步怎麼做會比較像自己」。`,
        analog: `這是你的補給站：${memberCopy.gift} 需要支持時，不要硬撐，先把這種力量找回來。`,
        antipode: `${memberCopy.shadow} 它不是來否定你，而是提醒你把反面能力練成熟。`,
        occult: `低潮或意外裡會冒出的暗線：${memberCopy.gift} 這通常不是計畫出來的，而是在你願意放鬆控制時出現。`,
      };
      if (!kin && !formatPrimitive(item)) return null;
      return {
        title: label,
        subtitle: kin ? `Kin ${kin}｜${compact([toneText, sealText], ' ')}` : undefined,
        body: roleCopy[key] || MAYA_ORACLE_COPY[key] || '這個位置說明今日能量如何與你的核心 Kin 互動。',
        tags: compact([sealText, toneText], ' / ').split(' / ').filter(Boolean).slice(0, 3),
        mayaSeal: seal,
      };
    })
    .filter(Boolean) as InsightCard[];
}

function gateCards(data: Dict): InsightCard[] {
  const gates = asArray(data.activatedGates).slice(0, 18);
  if (!gates.length) return [];

  return gates.map((gate, index) => {
    const item = asDict(gate);
    const gateNumber = cleanText(item.gate) || cleanText(item.number) || cleanText(gate);
    const numericGate = Number(gateNumber);
    const brief = Number.isFinite(numericGate) ? GATE_BRIEFS[numericGate] : undefined;
    return {
      title: `閘門 ${gateNumber || index + 1}${brief ? `｜${brief.title}` : ''}`,
      subtitle: cleanText(item.line) ? `第 ${cleanText(item.line)} 爻` : '啟動閘門',
      body: cleanText(item.description) || cleanText(item.name) || brief?.body || '這個閘門描述一種被啟動的能量主題，適合放在你的類型、策略與權威下理解。',
      tags: asArray(item.keywords).map((entry) => cleanText(entry)).filter(Boolean).slice(0, 4),
    };
  });
}

function firstQuestion(result: CalcResponse): string {
  return cleanText(result.input.question)
    || cleanText(result.input.topic)
    || cleanText(result.input.intent)
    || '這次想理解的問題';
}

function symbolCopy(source: string, copyMap: Record<string, SymbolMemberCopy>, fallback: SymbolMemberCopy): SymbolMemberCopy {
  const text = source || '';
  const entry = Object.entries(copyMap).find(([key]) => text.includes(key));
  return entry?.[1] ?? fallback;
}

function mayaMemberCopy(seal: string): SymbolMemberCopy {
  return symbolCopy(seal, MAYA_SEAL_MEMBER_COPY, {
    gift: '你的圖騰像一種面對世界的慣用語氣；先觀察它在日常選擇、關係與壓力反應裡怎麼出現。',
    shadow: '卡住時通常不是圖騰不好，而是你把這股力量用得太急、太滿，或用在不適合的地方。',
    teacherQuestion: '我的圖騰力量現在最該用在哪個生活問題上？',
  });
}

function mayaToneCopy(tone: string): MayaToneCopy {
  const entry = Object.entries(MAYA_TONE_MEMBER_COPY).find(([key]) => tone.includes(key));
  return entry?.[1] ?? {
    rhythm: '你的調性描述你推進事情的節奏：你是先召喚、先校準、先行動，還是先整理成形。',
    stuck: '卡住時，通常不是你沒有天賦，而是節奏用錯了。',
    action: '今天先觀察一件事：我是在硬推，還是在用自己的節奏前進？',
  };
}

function astroMemberCopy(point: string): SymbolMemberCopy {
  return symbolCopy(point, ASTRO_SIGN_MEMBER_COPY, {
    gift: '這個星座位置代表你的一種慣用模式，需要放回生活場景才會真正有感。',
    shadow: '卡住時，這股能量可能會過度補償或失去彈性。',
    teacherQuestion: '這個星盤位置在我的關係、工作或情緒裡，最明顯表現在哪裡？',
  });
}

function palaceName(palace: Dict): string {
  return cleanText(palace.name) || cleanText(palace.earthlyBranch) || '宮位';
}

function palaceStarText(palace: Dict): string {
  const stars = asArray(palace.majorStarNames).length ? asArray(palace.majorStarNames) : asArray(palace.majorStars);
  return stars.map((star) => formatPrimitive(star) || cleanText(star)).filter(Boolean).join(' / ');
}

function palaceByName(data: Dict, name: string): Dict {
  const palaces = asArray(data.palaces).map((item) => asDict(item));
  return palaces.find((palace) => palaceName(palace).includes(name)) ?? {};
}

function describeZiweiPalace(data: Dict, name: string, fallback: string) {
  const palace = palaceByName(data, name);
  const branch = cleanText(palace.earthlyBranch);
  const stars = palaceStarText(palace);
  if (branch || stars) {
    return {
      title: compact([branch ? `${branch}${name}` : name, stars || '無主星'], '｜'),
      body: stars
        ? `${name}落在${branch || '此宮'}，主星是 ${stars}。這不是單一答案，而是你在「${fallback}」這個生活題目裡常用的反應方式。`
        : `${name}是空宮時，更需要看對宮與三方四正；會員會有感的重點不是「沒有」，而是這個題目容易透過環境、對象或外部事件被觸發。`,
    };
  }
  return { title: name, body: fallback };
}

type NumerologyProfileCopy = {
  headline: string;
  lead: string;
  mirror: string;
  advantage: string;
  shadow: string;
  action: string;
};

type SymbolMemberCopy = {
  gift: string;
  shadow: string;
  teacherQuestion: string;
};

type MayaToneCopy = {
  rhythm: string;
  stuck: string;
  action: string;
};

const MAYA_TONE_MEMBER_COPY: Record<string, MayaToneCopy> = {
  磁性: {
    rhythm: '你做事需要先抓到「我為什麼要做」。目的感一清楚，人才會聚過來，事情也比較不會散。',
    stuck: '卡住時，你會一直找方向，或把別人的期待誤認成自己的任務。',
    action: '今天只寫一句主題：我現在最想召喚的是什麼？不要先排十個計畫。',
  },
  月亮: {
    rhythm: '你很容易看見事情的兩面：想前進，也會立刻看見阻力。這不是負面，而是你的校準能力。',
    stuck: '卡住時，你會把挑戰看得太大，還沒開始就先防守。',
    action: '今天先把阻力寫出來，再圈出一個你真的能處理的點。',
  },
  電力: {
    rhythm: '你的節奏是透過行動把能量接起來。只想不做會悶，開始服務某件事後，靈感反而會回來。',
    stuck: '卡住時，你容易一直幫忙，卻忘了問自己是不是還有電。',
    action: '今天只做一個小服務：一句提醒、一個整理、一個交付就好。',
  },
  自我存在: {
    rhythm: '你需要把模糊感變成形式。越能定義規則、邊界和步驟，越能安心往下做。',
    stuck: '卡住時，你會一直想把事情想完整，結果拖到遲遲不開始。',
    action: '今天先定義一個框：這件事的範圍是什麼？先做到哪裡算完成？',
  },
  超頻: {
    rhythm: '你有把人和資源聚焦起來的力量。當你相信自己可以發號施令，事情會比較快成形。',
    stuck: '卡住時，你可能想證明自己夠強，反而變得硬撐或太用力。',
    action: '今天只選一件事加強，不要全部都想推到滿。',
  },
  韻律: {
    rhythm: '你的重點是節奏與平衡。環境太亂、責任不均時，你會比別人更快失去穩定感。',
    stuck: '卡住時，你容易一邊想公平，一邊默默承擔太多。',
    action: '今天調整一個節奏：時間、空間、工作量或關係裡的責任分配。',
  },
  共振: {
    rhythm: '你像天線，容易接收到場域裡的情緒、語氣與靈感。狀態對了，你會很會說中重點。',
    stuck: '卡住時，你會吸太多訊號，分不清哪些是自己的感覺。',
    action: '今天先安靜十分鐘，再決定要回應什麼，不要一接收到就立刻反應。',
  },
  銀河星系: {
    rhythm: '你在意一致性。表面做對沒有用，你需要感覺自己的選擇和價值觀是對齊的。',
    stuck: '卡住時，你會很怕自己不夠完整，或因為想維持形象而不敢改變。',
    action: '今天檢查一件事：我現在做的選擇，真的跟我想成為的人一致嗎？',
  },
  太陽: {
    rhythm: '你的節奏是把意圖推到明處。當你願意明確說出想要什麼，事情會開始往前。',
    stuck: '卡住時，你會一直等更有把握，結果意圖沒有被任何人看見。',
    action: '今天把一個想法說出口，哪怕只是傳給一個可信任的人。',
  },
  行星: {
    rhythm: '你需要看見結果落地。只談感覺會讓你不踏實，能被實際驗證的進展會讓你有力量。',
    stuck: '卡住時，你容易把價值綁在結果上，沒有成果就否定自己。',
    action: '今天做一個能被看見的小成果，不求完美，只求真的完成。',
  },
  光譜: {
    rhythm: '你有釋放舊模式的能力。你不是一定要一直維持原樣，很多時候你的力量來自敢鬆手。',
    stuck: '卡住時，你會一邊想自由，一邊又抓著舊責任不放。',
    action: '今天釋放一件事：一個不必要的承諾、一個過期期待，或一個一直拖著你的念頭。',
  },
  水晶: {
    rhythm: '你的能量適合合作與分享。你不是單打獨鬥型，對的人會讓你的判斷變清楚。',
    stuck: '卡住時，你可能太顧團體，或一直等大家都同意才敢動。',
    action: '今天找一個人討論，但最後要留下你自己的選擇。',
  },
  宇宙: {
    rhythm: '你像在收尾一個大循環。很多事不是要更用力，而是要消化、保存，讓經驗變成智慧。',
    stuck: '卡住時，你會不想結束，或把已經完成的事反覆拿出來重想。',
    action: '今天為一件事寫下結語：我從這裡學到什麼？下一輪不想再重複什麼？',
  },
};

const MAYA_SEAL_MEMBER_COPY: Record<string, SymbolMemberCopy> = {
  龍: {
    gift: '你有把事情重新養起來的能力，適合從建立基礎、照顧資源、讓一件事重新有生命力開始。',
    shadow: '你容易把所有人都放在前面，最後分不清什麼是照顧、什麼是過度承擔。',
    teacherQuestion: '我在哪些關係或工作裡一直扮演照顧者，卻忘了先照顧自己的根基？',
  },
  風: {
    gift: '你的力量在溝通、連結與把感受說成話；當你願意說清楚，混亂會開始流動。',
    shadow: '你容易想很多、說很多，但真正重要的需求反而沒有講出口。',
    teacherQuestion: '我最近哪一句話一直沒有說清楚，導致關係或選擇卡住？',
  },
  夜: {
    gift: '你的內在世界很豐富，直覺、夢境與想像力常能先感覺到答案。',
    shadow: '你容易退回自己的世界，把不安藏起來，讓別人不知道怎麼靠近你。',
    teacherQuestion: '我現在的不安全感，是真的來自現實，還是來自過去累積的想像與擔心？',
  },
  種子: {
    gift: '你適合專注培養一件事，只要環境與時間對了，成長會很紮實。',
    shadow: '你容易一直等更好的時機，結果讓真正想發芽的事停太久。',
    teacherQuestion: '我現在該繼續等待、調整環境，還是已經可以開始行動？',
  },
  蛇: {
    gift: '你的身體感很強，對喜歡、不喜歡、靠近或遠離，常比頭腦更早知道。',
    shadow: '你容易壓住本能，或在壓力下用過度反應保護自己。',
    teacherQuestion: '我最近的身體反應在提醒我什麼界線或真實需求？',
  },
  世界橋: {
    gift: '你有結束舊階段、轉換關係位置、讓事情重新連接的能力。',
    shadow: '你容易捨不得放下已經不適合的角色，卡在中間地帶。',
    teacherQuestion: '我現在真正需要結束的是一段關係、一種責任，還是一個舊身份？',
  },
  手: {
    gift: '你適合親手把問題處理掉，理解不只停在想法，而是要落到修補、整理與完成。',
    shadow: '你容易一直幫忙、一直處理，卻沒有問自己是否真的有餘裕。',
    teacherQuestion: '我正在替誰完成本該由對方完成的事？我可以怎麼把責任交回去？',
  },
  星星: {
    gift: '你對美感、和諧與秩序敏感，能把混亂整理成讓人舒服的形式。',
    shadow: '你容易為了維持好看或和諧，忽略真正不舒服的地方。',
    teacherQuestion: '我現在追求的和諧，是出於真心，還是害怕衝突？',
  },
  月: {
    gift: '你對情緒流動很敏感，適合透過感受辨認什麼需要被清理或更新。',
    shadow: '你容易被情緒浪潮帶走，把一時的感覺當成全部真相。',
    teacherQuestion: '我這次的情緒是在提醒真需求，還是在重播舊模式？',
  },
  狗: {
    gift: '你的核心在愛、信任與忠誠，關係品質會深深影響你的狀態。',
    shadow: '你容易因為愛而過度忍耐，或把忠誠變成不能離開。',
    teacherQuestion: '我在關係裡的付出，是出於愛，還是出於害怕失去？',
  },
  猴: {
    gift: '你有幽默、創意與打破僵局的能力，越放鬆越能找到新解法。',
    shadow: '你容易用玩笑或轉移注意力避開真正脆弱的問題。',
    teacherQuestion: '我最近是不是用輕鬆帶過，避開了一件其實很重要的事？',
  },
  人: {
    gift: '你的課題在自由意志與選擇，你需要感覺這個決定真的屬於自己。',
    shadow: '你容易聽太多意見，最後反而失去自己的判斷。',
    teacherQuestion: '這個選擇如果不考慮別人的期待，我真正想怎麼走？',
  },
  天行者: {
    gift: '你需要空間、經驗與探索，透過走出去才會更認識自己。',
    shadow: '你容易一直想換環境，卻沒有看清自己真正想逃離什麼。',
    teacherQuestion: '我想離開現況，是因為要拓展，還是因為不想面對眼前問題？',
  },
  巫師: {
    gift: '你有很強的臨在感，當你不急著控制，反而能感覺到時機。',
    shadow: '你容易停在等待或相信感覺，卻少了把感覺落地的步驟。',
    teacherQuestion: '我現在該信任時機，還是該把直覺轉成具體安排？',
  },
  鷹: {
    gift: '你能看見大局與未來藍圖，適合把複雜狀況拉高一層重新設計。',
    shadow: '你容易看得太遠，反而忽略眼前最需要被處理的一步。',
    teacherQuestion: '我的遠景很清楚，但第一個可執行的小步驟是什麼？',
  },
  戰士: {
    gift: '你適合透過提問找到真相，越能誠實面對問題，越能長出勇氣。',
    shadow: '你容易用質疑保護自己，或一直追問到不敢行動。',
    teacherQuestion: '我現在的懷疑是在幫我確認方向，還是在阻止我前進？',
  },
  地球: {
    gift: '你適合聽環境訊號與生活節奏，很多答案會透過身邊事件同步出現。',
    shadow: '你容易太想找外在徵兆，卻忽略自己已經知道的感受。',
    teacherQuestion: '最近反覆出現的事件，正在把我帶回哪個現實問題？',
  },
  鏡: {
    gift: '你容易看見真相與界線，能把事情照得很清楚。',
    shadow: '你容易太快切割或太銳利，讓清楚變成防衛。',
    teacherQuestion: '我現在需要更清楚的界線，還是需要更柔軟的表達方式？',
  },
  風暴: {
    gift: '你有更新與重啟的力量，混亂有時是在逼你離開不適合的舊模式。',
    shadow: '你容易在變動中慌張，急著抓回控制感，反而更累。',
    teacherQuestion: '這場變動想帶我更新哪個舊習慣？我該放掉什麼？',
  },
  太陽: {
    gift: '你有照亮事情、帶來清楚與溫暖的能力，適合把模糊處說明白。',
    shadow: '你容易一直扮演明亮的人，卻不讓別人看見你也需要支持。',
    teacherQuestion: '我在哪裡一直照亮別人，卻沒有讓自己的需要被看見？',
  },
};

const ASTRO_SIGN_MEMBER_COPY: Record<string, SymbolMemberCopy> = {
  牡羊: {
    gift: '你需要直接感、行動感與可以自己開路的空間。',
    shadow: '卡住時容易太快反應，還沒聽完就先衝出去。',
    teacherQuestion: '我最近是需要勇敢開始，還是需要先慢下來看清楚？',
  },
  金牛: {
    gift: '你需要穩定、身體感與能慢慢累積的安全感。',
    shadow: '卡住時容易太怕改變，明知道不適合也不想動。',
    teacherQuestion: '我現在守住的是價值，還是只是習慣性的安全感？',
  },
  雙子: {
    gift: '你需要理解、交流與讓資訊流動，說出來會幫你釐清自己。',
    shadow: '卡住時容易想太多、分心太多，真正的感受反而被跳過。',
    teacherQuestion: '我現在需要更多資訊，還是需要把已知的事整理成決定？',
  },
  巨蟹: {
    gift: '你需要情感安全、歸屬感與能照顧自己也照顧他人的空間。',
    shadow: '卡住時容易用保護殼防衛，或把過去感受帶進現在。',
    teacherQuestion: '我現在的防衛是在保護我，還是讓我無法靠近真正想要的人事物？',
  },
  獅子: {
    gift: '你需要被看見、創造與真心投入，越真誠越有光。',
    shadow: '卡住時容易太在意表現，怕不被肯定就不敢自然發揮。',
    teacherQuestion: '我現在想被看見的是成就，還是真正的自己？',
  },
  處女: {
    gift: '你需要把事情整理清楚，能透過細節、修正與服務建立價值。',
    shadow: '卡住時容易過度挑剔自己，一直修到不敢開始。',
    teacherQuestion: '我現在的修正是讓事情更好，還是在拖延真正開始？',
  },
  天秤: {
    gift: '你需要關係中的平衡、互相理解與好好協調的空間。',
    shadow: '卡住時容易太怕衝突，為了和諧先放掉自己的立場。',
    teacherQuestion: '我現在維持的和平，有沒有包含我自己的真實需求？',
  },
  天蠍: {
    gift: '你需要深度、真相與真正可信任的連結，不適合只停在表面。',
    shadow: '卡住時容易太警戒或太想掌控，反而更難放鬆。',
    teacherQuestion: '我現在想控制的是局面，還是害怕再次受傷的自己？',
  },
  射手: {
    gift: '你需要意義、遠方與能讓你擴展視野的方向。',
    shadow: '卡住時容易只想離開，卻沒有整理真正要追求的是什麼。',
    teacherQuestion: '我現在想追的是自由，還是一個更有意義的方向？',
  },
  摩羯: {
    gift: '你需要長期目標、責任感與能一步步建立成果的路線。',
    shadow: '卡住時容易把自己逼太緊，用表現證明價值。',
    teacherQuestion: '我現在承擔的責任，哪些是真的必要，哪些只是我不敢放下？',
  },
  水瓶: {
    gift: '你需要獨立思考、系統視角與跟一般規則保持距離的空間。',
    shadow: '卡住時容易太抽離，知道很多卻不一定讓人靠近。',
    teacherQuestion: '我現在需要保持距離看清楚，還是需要讓真實感受進來？',
  },
  雙魚: {
    gift: '你需要想像力、感受力與能讓心柔軟下來的空間。',
    shadow: '卡住時容易界線模糊，把別人的情緒也當成自己的責任。',
    teacherQuestion: '我現在感受到的是自己的需要，還是我吸收了別人的狀態？',
  },
};

const NUMEROLOGY_PROFILE_COPY: Record<string, NumerologyProfileCopy> = {
  '1': {
    headline: '1：你需要感覺自己有主導權，才會真的動起來',
    lead: '你通常不是沒有能力，而是需要一個清楚的起點。當方向模糊時，你會比別人更容易急、悶或想自己扛。',
    mirror: '如果最近覺得卡，可能不是你不夠努力，而是你把所有責任都攬到自己身上，忘了先定義真正要解決的問題。',
    advantage: '你的優勢是開路、決定、把事情從零推到一。',
    shadow: '你的卡點是太急著證明自己，或不容易開口求助。',
    action: '今天先選一件你能主導的小事，把它完成，不需要一次扛完整局。',
  },
  '2': {
    headline: '2：你很會感受關係氣氛，但要學會不把所有情緒都收進自己身上',
    lead: '你常能讀到別人的需要，也擅長協調氣氛。問題是，你有時會太快配合，最後反而不知道自己真正想要什麼。',
    mirror: '如果你之前被算成 2，那是在看你最後落地的底色：關係、合作、界線與安全感。',
    advantage: '你的優勢是敏感、同理、連結與讓人安心。',
    shadow: '你的卡點是怕衝突、怕讓人失望，或把別人的狀態誤以為是自己的責任。',
    action: '今天先練習一句話：「我需要想一下再回覆你。」這會幫你把界線放回來。',
  },
  '3': {
    headline: '3：你需要把感受說出來，才會重新找回流動感',
    lead: '你不是只適合開心或外向，而是很需要表達。當你長期壓住情緒，靈感與行動力都會變鈍。',
    mirror: '如果最近覺得散，可能是你腦中有太多未說出口的感受，需要先整理成話。',
    advantage: '你的優勢是表達、創作、帶動氣氛與把複雜感受變得可理解。',
    shadow: '你的卡點是逃避沉重議題，或用忙碌、玩笑蓋過真正的需要。',
    action: '今天寫下三句真心話：我在意什麼、我害怕什麼、我下一步要做什麼。',
  },
  '4': {
    headline: '4：你需要穩定架構，混亂會讓你比別人更耗能',
    lead: '你通常很重視實際、可靠與可執行。當事情太飄、規則一直變，你會很難安心。',
    mirror: '如果最近很累，可能是生活裡有太多未整理的責任，讓你一直在補洞。',
    advantage: '你的優勢是規劃、落地、負責與建立秩序。',
    shadow: '你的卡點是太硬撐、太怕失控，或把安全感綁在完美表現上。',
    action: '今天只整理一個範圍：桌面、行程、帳務或一段關係的界線。',
  },
  '5': {
    headline: '5：你需要空間與變化，但自由也需要方向感',
    lead: '你很容易被新鮮感、可能性與移動吸引。你不是不穩，而是需要知道自己為什麼要前進。',
    mirror: '如果最近覺得卡，可能不是你不想承諾，而是眼前的選擇沒有讓你感覺到生命力。',
    advantage: '你的優勢是彈性、探索、溝通與快速適應。',
    shadow: '你的卡點是容易分心、逃避限制，或用新的刺激避開真正要面對的事。',
    action: '今天選一個方向實驗 24 小時，不急著承諾一輩子。',
  },
  '6': {
    headline: '6：你很在乎愛與責任，但要小心把照顧變成壓力',
    lead: '你容易看見誰需要被照顧，也很在乎關係是否和諧。你的課題是：愛人時不要把自己消耗掉。',
    mirror: '如果最近覺得委屈，可能是你給太多、說太少，讓別人以為你一直都可以。',
    advantage: '你的優勢是照顧、美感、責任感與讓關係變得更溫暖。',
    shadow: '你的卡點是過度負責、想修好所有人，或用付出換安全感。',
    action: '今天把一個責任分出去，或清楚說出你也需要被支持。',
  },
  '7': {
    headline: '7：你需要理解事情背後的原因，不能只被表面答案打發',
    lead: '你常會想得很深，也需要獨處整理。你不是冷淡，而是需要時間把資訊消化成自己的答案。',
    mirror: '如果最近想躲起來，可能是外界太吵，讓你無法聽見真正的判斷。',
    advantage: '你的優勢是洞察、研究、直覺與看見深層脈絡。',
    shadow: '你的卡點是想太多、過度懷疑，或因為怕不準備好而遲遲不行動。',
    action: '今天留 20 分鐘不被打擾，只問自己：我真正知道的是什麼？還沒證實的是什麼？',
  },
  '8': {
    headline: '8：你需要把能力變成成果，也要學會不只用成敗評價自己',
    lead: '你對結果、資源與影響力很敏銳。當你把力量用對地方，會很能整合人事物。',
    mirror: '如果最近壓力大，可能是你把價值感綁在表現上，忘了成果也需要節奏。',
    advantage: '你的優勢是管理、判斷、整合資源與承擔大局。',
    shadow: '你的卡點是控制感太重、太怕失敗，或容易把自己逼到過勞。',
    action: '今天先定義一個真正重要的成果，刪掉一件只是看起來很忙的事。',
  },
  '9': {
    headline: '9：你看事情很有大局感，但要學會把理想落到眼前一步',
    lead: '你容易感受到更大的意義，也常想幫助別人。你的課題是不要因為想照顧全部，反而忽略自己現在的位置。',
    mirror: '如果最近感到失望，可能是理想與現實落差太大，需要先回到可執行的範圍。',
    advantage: '你的優勢是包容、整合、同理與看見長遠意義。',
    shadow: '你的卡點是過度犧牲、難以放下，或對自己與世界都太嚴格。',
    action: '今天只做一件能讓世界或自己好一點的小事，不需要一次拯救全部。',
  },
  '11/2': {
    headline: '11/2：你直覺很強，但真正的課題常在關係、界線與安全感',
    lead: '11 代表放大的感受力與靈感，2 代表最後要回到合作、關係與界線。你可能很快讀到氣氛，但也容易被氣氛影響。',
    mirror: '你之前被算成 2，是因為有些算法會把 11 繼續化簡。MELE 顯示 11/2，是同時保留「敏銳天線」與「關係底色」。',
    advantage: '你的優勢是靈感、同理、感受細節與把人連結起來。',
    shadow: '你的卡點是過度敏感、怕衝突、或把別人的期待誤認成自己的責任。',
    action: '今天先不要急著替別人感受。先問自己：這是我的感覺，還是我接收到別人的情緒？',
  },
  '22/4': {
    headline: '22/4：你有把大想法落地的能力，但需要穩定步驟',
    lead: '22 代表大型建構力，4 代表制度、步驟與耐心。你的力量不在一時爆發，而在把願景變成可以真的完成的路線。',
    mirror: '你若被算成 4，是因為算法只看最後底色。22/4 則提醒你：你的 4 不是普通穩定，而是帶著更大的建構課題。',
    advantage: '你的優勢是規劃、整合、承擔與把理想落地。',
    shadow: '你的卡點是壓力過大、怕失控，或因為標準太高而不敢開始。',
    action: '今天把一個大目標拆成第一個可驗證的小步驟。',
  },
  '33/6': {
    headline: '33/6：你很容易承接他人的需要，但愛人之前要先照顧自己',
    lead: '33 放大了照顧、支持與陪伴能力，6 則提醒你回到責任、家庭、關係與美感。',
    mirror: '你若被算成 6，是因為算法只看最後底色。33/6 會多看見你對他人痛苦的敏感度與承接力。',
    advantage: '你的優勢是陪伴、包容、支持與讓人感覺被接住。',
    shadow: '你的卡點是過度付出、想拯救所有人，或把被需要當成被愛。',
    action: '今天先問自己：我願意幫忙到哪裡？哪一段需要交還給對方？',
  },
};

function numerologyProfile(data: Dict) {
  const lifePath = firstValue(data, ['lifePathDisplay', 'lifePath'], '生命靈數');
  const reduced = firstValue(data, ['lifePathReduced', 'baseNumber'], '');
  const birthday = firstValue(data, ['birthDayDisplay', 'birthDay'], '生日數');
  const archetype = firstValue(data, ['lifePathArchetype', 'birthDayArchetype'], '生命原型');
  const profileKey = lifePath.startsWith('11') ? '11/2'
    : lifePath.startsWith('22') ? '22/4'
      : lifePath.startsWith('33') ? '33/6'
        : reduced || lifePath;
  const copy = NUMEROLOGY_PROFILE_COPY[profileKey] ?? NUMEROLOGY_PROFILE_COPY[reduced] ?? NUMEROLOGY_PROFILE_COPY['2'];

  return { lifePath, reduced, birthday, archetype, copy };
}

function buildMemberResonance(result: CalcResponse): MemberResonance {
  const data = result.data ?? {};
  const question = firstQuestion(result);

  if (result.tool === 'tarot') {
    const draw = asDict(asArray(data.cards)[0]);
    const card = asDict(draw.card);
    const name = firstValue(card, ['name_zh', 'name_en'], '這張牌');
    const position = positionLabel(draw.position);
    const keywords = compact(keywordsFrom(draw, card).slice(0, 3), '、') || '當下訊息';

    return {
      eyebrow: '先給會員的命中感',
      title: `${name}（${position}）`,
      lead: `它不是在判斷好壞，而是在回應你現在最明顯的拉扯：「${question}」。`,
      mirror: `核心感覺：${keywords}。先看這幾個字有沒有刺中你，不用一次讀完整份。`,
      points: [
        { label: '感覺', title: '你想面對，但還有壓力', body: '先承認這件事對你有重量。' },
        { label: '卡點', title: '不要急著求結論', body: '先分清楚：你怕的是對方反應，還是自己的答案。' },
        { label: '行動', title: '今天只做一件事', body: '把問題縮成一句：「我下一步可以先確認什麼？」' },
      ],
      nextQuestion: '這張牌比較像你、你爸，還是你們之間的氣氛？',
    };
  }

  if (result.tool === 'runes') {
    const draw = asDict(asArray(data.runes)[0]);
    const rune = asDict(draw.rune);
    const name = firstValue(rune, ['zh', 'name'], '這枚符文');
    const position = positionLabel(draw.position);
    const keywords = compact(keywordsFrom(draw, rune).slice(0, 3), '、') || '當下提醒';

    return {
      eyebrow: '先給會員的命中感',
      title: `${name}（${position}）在提醒：「${question}」`,
      lead: '盧恩不適合講太長，它像一句古老的短訊息：把注意力拉回你今天真正能處理的那一步。',
      mirror: `你可能已經知道該做什麼，只是需要一個更清楚的界線。這次訊息聚焦在「${keywords}」。`,
      points: [
        { label: '感覺', title: '先看第一直覺', body: '如果符文一出現你就有某個人、事件或選擇浮上來，那通常就是今天要先看的地方。' },
        { label: '卡點', title: '不要把簡單變複雜', body: '盧恩的提醒通常很直接；越想一次解完全部，越容易錯過最重要的一句。' },
        { label: '行動', title: '留下一句行動咒語', body: '把今天的結果濃縮成一句話，例如「我先守住界線」或「我先走出一步」。' },
      ],
      nextQuestion: '這枚符文比較像在叫你前進、停下，還是先保護自己？',
    };
  }

  if (result.tool === 'humandesign') {
    const type = firstValue(data, ['type'], '你的類型');
    const authority = firstValue(data, ['authority'], '內在權威');
    const strategy = firstValue(data, ['strategy'], '你的策略');
    const gates = gateCards(data).slice(0, 3).map((card) => card.title.replace('閘門 ', '')).join('、') || '目前啟動的閘門';

    return {
      eyebrow: '先給會員的命中感',
      title: `${type} 的重點不是更用力，而是用對節奏`,
      lead: `這張圖先看三件事：你怎麼跟世界互動、怎麼做決定，以及哪些閘門正在形成你的行為習慣。`,
      mirror: `你可能常在「要不要現在決定」上用頭腦搶答；但這張圖提醒你先回到「${strategy}」與「${authority}」。`,
      points: [
        { label: '類型', title: type, body: '這不是人格標籤，而是你比較省力的互動方式；照錯節奏時，容易覺得一直在硬撐。' },
        { label: '權威', title: authority, body: '權威是做決定的內在訊號。越重要的選擇，越不適合只靠焦慮或道理立刻判斷。' },
        { label: '閘門', title: gates, body: '啟動閘門像你身上比較常亮的開關；先看最有感的三個，比一次讀完 64 個更容易吸收。' },
      ],
      nextQuestion: '最近一個重要決定，你是用身體、情緒、直覺，還是頭腦先回答？',
    };
  }

  if (result.tool === 'bazi') {
    const dayMaster = firstValue(data, ['dayMaster'], '日主');
    const wuxing = firstValue(data, ['dayMasterWuxing', 'wuxing'], '五行');

    return {
      eyebrow: '先給會員的命中感',
      title: `你的入口是日主 ${dayMaster}，先看你怎麼消耗與補充能量`,
      lead: '八字初階不要先講吉凶，先讓會員聽懂：自己遇到事情時，通常會用哪種方式反應。',
      mirror: `你可能會在某些情境很能撐，但一累就變成固定反應。這張盤先把「${wuxing}」拿出來看平衡。`,
      points: [
        { label: '自己', title: `日主 ${dayMaster}`, body: '日主像你的內在質地，先看你自然的反應方式，再看什麼會讓你更穩。' },
        { label: '卡點', title: '五行不是好壞分數', body: '某個元素多，不代表一定好；少，也不代表一定差。重點是能量流動是否卡住。' },
        { label: '行動', title: '補一個平衡動作', body: '今天先做一件能讓生活回穩的事：整理、溝通、休息、規劃或把需求說清楚。' },
      ],
      nextQuestion: '你最近最常是太急、太撐、太亂，還是太不想動？',
    };
  }

  if (result.tool === 'maya') {
    const kin = firstValue(data, ['kin'], 'Kin');
    const label = firstValue(data, ['label', 'seal'], '本命 Kin');
    const tone = firstValue(data, ['tone'], '調性');
    const copy = mayaMemberCopy(label);
    const toneCopy = mayaToneCopy(tone);
    const oracle = asDict(data.oracle);
    const guideSeal = formatPrimitive(asDict(asDict(oracle.guide).seal));
    const analogSeal = formatPrimitive(asDict(asDict(oracle.analog).seal));
    const antipodeSeal = formatPrimitive(asDict(asDict(oracle.antipode).seal));
    const occultSeal = formatPrimitive(asDict(asDict(oracle.occult).seal));
    const guideCopy = mayaMemberCopy(guideSeal);
    const analogCopy = mayaMemberCopy(analogSeal);
    const antipodeCopy = mayaMemberCopy(antipodeSeal);
    const occultCopy = mayaMemberCopy(occultSeal);

    return {
      eyebrow: '先給會員的命中感',
      title: `${label}：你不是沒方向，而是需要照自己的節奏動`,
      lead: `你的入口是 ${kin}、${tone}、${label}。白話來看，${copy.gift} ${toneCopy.rhythm}`,
      mirror: `如果這段有中，通常會中在壓力反應：${copy.shadow} ${toneCopy.stuck}`,
      points: [
        { label: '主軸', title: `${label}｜${tone}`, body: `${copy.gift} ${toneCopy.rhythm}` },
        { label: '借力', title: compact([guideSeal, analogSeal], ' / ') || '引導與支持', body: `卡住時不要硬撐。先借「${guideSeal || '指引'}」來決定下一步，再借「${analogSeal || '支持'}」補能量。${compact([guideCopy.gift, analogCopy.gift], ' ')}` },
        { label: '卡點', title: antipodeSeal || '挑戰力量', body: `${antipodeCopy.shadow} 這個位置不是敵人，是你需要練成熟的反面能力。` },
        { label: '今日行動', title: '先做一個 24 小時小實驗', body: toneCopy.action },
      ],
      nextQuestion: occultSeal ? `${copy.teacherQuestion} 另外，${occultSeal} 這條隱藏線也可以問：${occultCopy.teacherQuestion}` : copy.teacherQuestion,
    };
  }

  if (result.tool === 'ziwei') {
    const mingPalace = palaceByName(data, '命宮');
    const shenPalace = palaceByName(data, '身宮');
    const career = describeZiweiPalace(data, '官祿', '工作風格、職涯方向與適合投入的位置');
    const relationship = describeZiweiPalace(data, '夫妻', '關係模式、親密安全感與伴侶互動');
    const fortune = describeZiweiPalace(data, '財帛', '賺錢方式、資源流動與金錢壓力');
    const ming = compact([cleanText(mingPalace.earthlyBranch), palaceStarText(mingPalace) || firstValue(data, ['mingGong', 'lifePalace'], '命宮')], '｜');
    const shen = compact([cleanText(shenPalace.earthlyBranch), palaceStarText(shenPalace) || firstValue(data, ['shenGong', 'bodyPalace'], '身宮')], '｜') || '身宮';

    return {
      eyebrow: '先給會員的命中感',
      title: `你的命盤不是要背十二宮，而是先看哪個生活題目最刺中你`,
      lead: `你的命宮入口是 ${ming || '命宮'}。如果這張盤有命中，通常會命中在「我到底要用哪種方式面對世界、工作與關係」。`,
      mirror: `這張盤已經露出三個很適合問老師的題目：${career.title}、${relationship.title}、${fortune.title}。你不需要一次看完，只要先挑最有感的一個。`,
      points: [
        { label: '主軸', title: `命宮 ${ming || '命宮'}`, body: `命宮不是只代表位置，而是你的第一層人生反應：遇到壓力、選擇與人際時，你習慣怎麼站上舞台。${ming.includes('無主星') ? '命宮無主星時，更要看對宮與三方四正，這很適合交給老師深看。' : ''}` },
        { label: '現實', title: `身宮 ${shen}`, body: '身宮看你長大後更常用的落地方式。它會回答：你不是怎麼想，而是最後會怎麼承擔、怎麼做選擇。' },
        { label: '最想問', title: career.title, body: `${career.body} 如果你最近剛好卡在職涯或定位，這一宮會比泛泛看整張盤更有用。` },
        { label: '關係線', title: relationship.title, body: `${relationship.body} 如果你一邊想靠近、一邊又不安，這裡很值得帶去問老師。` },
      ],
      nextQuestion: '這張紫微盤裡，你最想先問老師：感情、事業、財務，還是命宮主軸？',
    };
  }

  if (result.tool === 'astro') {
    const sun = firstValue(data, ['sun'], '太陽');
    const moon = firstValue(data, ['moon'], '月亮');
    const asc = firstValue(data, ['ascendant'], '上升');
    const sunCopy = astroMemberCopy(sun);
    const moonCopy = astroMemberCopy(moon);
    const ascCopy = astroMemberCopy(asc);

    return {
      eyebrow: '先給會員的命中感',
      title: `你的星盤不是只有星座，而是三個自己在拉扯`,
      lead: `太陽 ${sun} 說的是你想活出的方向：${sunCopy.gift}`,
      mirror: `月亮 ${moon} 會透露你真正需要的安全感：${moonCopy.gift} 但卡住時，${moonCopy.shadow}`,
      points: [
        { label: '想成為', title: `太陽 ${sun}`, body: sunCopy.gift },
        { label: '真正需要', title: `月亮 ${moon}`, body: moonCopy.shadow },
        { label: '別人先看到', title: `上升 ${asc}`, body: `${ascCopy.gift} 如果你覺得別人誤會你，通常要從上升和月亮的落差開始看。` },
      ],
      nextQuestion: moonCopy.teacherQuestion,
    };
  }

  const profile = numerologyProfile(data);

  return {
    eyebrow: '先給會員的命中感',
    title: profile.copy.headline,
    lead: profile.copy.lead,
    mirror: profile.copy.mirror,
    points: [
      { label: '主軸', title: `生命靈數 ${profile.lifePath}`, body: `你的入口是 ${profile.lifePath}，底色是 ${profile.reduced || '核心數字'}。先把它當成一種反覆出現的反應節奏，而不是固定命運。` },
      { label: '優勢', title: profile.archetype, body: profile.copy.advantage },
      { label: '卡點', title: `生日數 ${profile.birthday}`, body: profile.copy.shadow },
      { label: '行動', title: '今天先做一個小選擇', body: profile.copy.action },
    ],
    nextQuestion: '這段比較像你的優勢、你的壓力反應，還是你在關係裡常遇到的狀況？',
  };
}

function buildPersonalReading(result: CalcResponse): PersonalReading {
  const data = result.data ?? {};
  const title = TOOL_PERSONA_TITLE[result.tool];

  if (result.tool === 'tarot') {
    const draw = asDict(asArray(data.cards)[0]);
    const card = asDict(draw.card);
    const name = firstValue(card, ['name_zh', 'name_en'], '這張牌');
    const position = cleanText(draw.position) === 'reversed' ? '逆位' : '正位';
    const keywords = compact(asArray(draw.keywords).map((item) => cleanText(item)).slice(0, 3)) || firstValue(card, ['keywords'], '牌面主題');
    return {
      eyebrow: 'PERSONAL READING',
      title: `${title}：${name}`,
      subtitle: `這次抽到 ${name}（${position}），先把它當成一面鏡子，而不是絕對預言。`,
      points: [
        { label: '我在看什麼', title: '問題與牌位', body: `先回到你問的問題，再看 ${name} 落在這個位置時想提醒你的主題。` },
        { label: '我的優勢', title: '可用資源', body: keywords ? `你可以先運用「${keywords}」這幾個方向，整理眼前真正能控制的事。` : '你可以先把情緒和事實分開，找回可行動的部分。' },
        { label: '可能卡點', title: '不要只等答案', body: '塔羅不是替你決定，而是把盲點攤開。若一直想確認結果，反而容易失去行動主導權。' },
        { label: '今日行動', title: '寫下一個選擇', body: '把今天最想解的問題寫成一句話，再列出一個 24 小時內能完成的小行動。' },
      ],
    };
  }

  if (result.tool === 'runes') {
    const draw = asDict(asArray(data.runes)[0]);
    const rune = asDict(draw.rune);
    const name = firstValue(rune, ['zh', 'name'], '這個符文');
    const position = cleanText(draw.position) === 'reversed' ? '逆位' : '正位';
    const keywords = compact(asArray(draw.keywords).map((item) => cleanText(item)).slice(0, 3)) || firstValue(rune, ['keywords'], '符文主題');
    return {
      eyebrow: 'PERSONAL READING',
      title: `${title}：${name}`,
      subtitle: `這次抽到 ${name}（${position}），適合把它當成今日的行動提醒。`,
      points: [
        { label: '我在看什麼', title: '當下訊號', body: `盧恩先看眼前狀態。${name} 會提醒你現在最需要面對的阻力或資源。` },
        { label: '我的優勢', title: '可用力量', body: `今天可先抓住「${keywords}」這類訊號，讓判斷回到簡單、直接、可執行。` },
        { label: '可能卡點', title: '過度解讀', body: '符文訊息通常很短。不要把它解得太複雜，反而忽略最直覺的那一句提醒。' },
        { label: '今日行動', title: '留一句行動咒語', body: '把這次結果濃縮成一句提醒，放在今天做決定前看一次。' },
      ],
    };
  }

  if (result.tool === 'humandesign') {
    const type = firstValue(data, ['type'], '你的類型');
    const authority = firstValue(data, ['authority'], '內在權威');
    const strategy = firstValue(data, ['strategy'], '你的策略');
    return {
      eyebrow: 'PERSONAL READING',
      title: `${title}：${type}`,
      subtitle: `先用「${type}」理解你怎麼跟世界互動，再用「${authority}」決定真正適合你的節奏。`,
      points: [
        { label: '我在看什麼', title: '類型與權威', body: `類型看互動方式，權威看決策方式。這兩個比單一閘門更適合作為入門核心。` },
        { label: '我的優勢', title: strategy, body: `當你照著「${strategy}」行動，通常比較不需要硬推，也比較容易感覺到身體或情緒的同意。` },
        { label: '可能卡點', title: '用頭腦搶答', body: '人類圖最常見的卡點，是用焦慮急著做決定，而不是等自己的權威給出清楚訊號。' },
        { label: '今日行動', title: '觀察一個決策', body: '今天挑一個小決定，刻意用你的權威等待或確認，再觀察身體反應。' },
      ],
    };
  }

  if (result.tool === 'bazi') {
    const dayMaster = firstValue(data, ['dayMaster'], '日主');
    const wuxing = firstValue(data, ['dayMasterWuxing', 'wuxing'], '五行');
    return {
      eyebrow: 'PERSONAL READING',
      title: `${title}：${dayMaster}`,
      subtitle: `八字先看日主，再看五行分布。你目前這張盤的入口是 ${dayMaster} 與 ${wuxing}。`,
      points: [
        { label: '我在看什麼', title: '日主與五行', body: '日主像你的內在質地，五行分布則像你面對世界時常用、缺乏或過度的能量。' },
        { label: '我的優勢', title: '穩定可用的元素', body: `先觀察盤中比較明顯的五行，這些通常是你容易拿來處理問題的方式。` },
        { label: '可能卡點', title: '元素失衡', body: '當某個元素過強或過弱，容易在情緒、關係或決策上變成固定反應。重點是調節，不是貼標籤。' },
        { label: '今日行動', title: '補一個平衡動作', body: '今天先選一件能讓生活節奏更平衡的事，例如整理環境、規劃時間或明確說出需求。' },
      ],
    };
  }

  if (result.tool === 'maya') {
    const kin = firstValue(data, ['kin'], 'Kin');
    const label = firstValue(data, ['label', 'seal'], '本命 Kin');
    const tone = firstValue(data, ['tone'], '調性');
    const copy = mayaMemberCopy(label);
    const toneCopy = mayaToneCopy(tone);
    const oracle = asDict(data.oracle);
    const guideSeal = formatPrimitive(asDict(asDict(oracle.guide).seal));
    const analogSeal = formatPrimitive(asDict(asDict(oracle.analog).seal));
    const antipodeSeal = formatPrimitive(asDict(asDict(oracle.antipode).seal));
    const guideCopy = mayaMemberCopy(guideSeal);
    const analogCopy = mayaMemberCopy(analogSeal);
    const antipodeCopy = mayaMemberCopy(antipodeSeal);
    return {
      eyebrow: 'PERSONAL READING',
      title: `${title}：${label}`,
      subtitle: `你的入口是 ${kin}、${tone}、${label}。這不是稱號，而是在說你怎麼推進事情、怎麼卡住、怎麼找回節奏；這裡會把它翻成今天可以驗證的小動作。`,
      points: [
        { label: '我在看什麼', title: `${label} × ${tone}`, body: `${copy.gift} ${toneCopy.rhythm}` },
        { label: '我的優勢', title: compact([guideSeal, analogSeal], ' / ') || '可借力的位置', body: `支持與引導不是裝飾資訊。${guideCopy.gift} ${analogCopy.gift}` },
        { label: '可能卡點', title: antipodeSeal || '挑戰力量', body: `${copy.shadow} ${toneCopy.stuck} ${antipodeCopy.shadow}` },
        { label: '今日行動', title: '把 Kin 變成一個小動作', body: toneCopy.action },
      ],
    };
  }

  if (result.tool === 'ziwei') {
    const mingPalace = palaceByName(data, '命宮');
    const shenPalace = palaceByName(data, '身宮');
    const career = describeZiweiPalace(data, '官祿', '工作風格、職涯方向與適合投入的位置');
    const relationship = describeZiweiPalace(data, '夫妻', '關係模式、親密安全感與伴侶互動');
    const ming = compact([cleanText(mingPalace.earthlyBranch), palaceStarText(mingPalace) || firstValue(data, ['mingGong'], '命宮')], '｜') || '命宮';
    const shen = compact([cleanText(shenPalace.earthlyBranch), palaceStarText(shenPalace) || firstValue(data, ['shenGong'], '身宮')], '｜') || '身宮';
    return {
      eyebrow: 'PERSONAL READING',
      title: `${title}：先挑一個真正想問的宮位`,
      subtitle: `你的命宮入口是 ${ming}。紫微不是背十二宮，而是把人生主軸、工作、關係與財務分題看清楚。`,
      points: [
        { label: '我在看什麼', title: `命宮 ${ming}`, body: '命宮不是名詞解釋，而是你遇到人生選擇時，最常站出來的那一種反應方式。' },
        { label: '我的落地', title: `身宮 ${shen}`, body: '身宮看你長大後更常用的實際做法，常常比「我以為我是怎樣的人」更接近現實。' },
        { label: '可能卡點', title: relationship.title, body: relationship.body },
        { label: '想問老師', title: career.title, body: `${career.body} 這裡很適合延伸成一場老師諮詢，因為它需要合參三方四正，不適合只看單一宮位。` },
      ],
    };
  }

  if (result.tool === 'astro') {
    const sun = firstValue(data, ['sun'], '太陽');
    const moon = firstValue(data, ['moon'], '月亮');
    const asc = firstValue(data, ['ascendant'], '上升');
    const sunCopy = astroMemberCopy(sun);
    const moonCopy = astroMemberCopy(moon);
    const ascCopy = astroMemberCopy(asc);
    return {
      eyebrow: 'PERSONAL READING',
      title: `${title}：三個自己同時在說話`,
      subtitle: `太陽 ${sun}、月亮 ${moon}、上升 ${asc} 不是三個名詞，而是你想成為的樣子、真正需要的安全感、以及別人先看到的你。`,
      points: [
        { label: '我想成為', title: `太陽 ${sun}`, body: sunCopy.gift },
        { label: '我真正需要', title: `月亮 ${moon}`, body: moonCopy.shadow },
        { label: '別人先看到', title: `上升 ${asc}`, body: ascCopy.gift },
        { label: '想問老師', title: '三者落差', body: '如果你覺得自己明明想往前，情緒卻一直拉住，或外在表現和內在需求不一致，這就很適合帶去問老師。' },
      ],
    };
  }

  const profile = numerologyProfile(data);
  return {
    eyebrow: 'PERSONAL READING',
    title: `${title}：${profile.lifePath}`,
    subtitle: `先看 ${profile.lifePath} 的核心節奏，再看它怎麼落在關係、壓力與日常選擇裡。若顯示 11/2，代表同時保留大師數 11 與底色數 2。`,
    points: [
      { label: '我在看什麼', title: '生命數與生日數', body: `你的入口是 ${profile.lifePath}，生日數是 ${profile.birthday}。前者像人生主軸，後者像你很自然會拿出來使用的能力。` },
      { label: '我的優勢', title: profile.archetype, body: profile.copy.advantage },
      { label: '可能卡點', title: '優勢過度使用時', body: profile.copy.shadow },
      { label: '今日行動', title: '把數字變成選擇', body: profile.copy.action },
    ],
  };
}

function buildInsight(result: CalcResponse): ResultInsight {
  const data = result.data ?? {};
  const base = TOOL_COPY[result.tool];
  const keyMap: Record<CalcTool, string[]> = {
    numerology: ['lifePathDisplay', 'lifePathReduced', 'birthDayDisplay', 'calculationNote', 'lifePathArchetype', 'birthDayArchetype'],
    maya: ['kin', 'label', 'tone', 'seal', 'classicTzolkin', 'starroot'],
    bazi: ['pillars', 'dayMaster', 'dayMasterYinYang', 'dayMasterWuxing', 'wuxing', 'nayin'],
    ziwei: ['mingGong', 'shenGong', 'fiveElementsClass', 'palaces', 'majorStars'],
    tarot: [],
    runes: [],
    astro: ['sun', 'moon', 'ascendant', 'midheaven'],
    humandesign: ['type', 'authority', 'profile', 'strategy', 'definedCenters', 'definedChannels', 'activatedGates'],
  };

  let cards: InsightCard[] = [];
  if (result.tool === 'tarot') cards = tarotCards(data);
  if (result.tool === 'runes') cards = runeCards(data);
  if (result.tool === 'maya') cards = mayaCards(data);
  if (result.tool === 'humandesign') cards = gateCards(data);

  return {
    ...base,
    facts: collectFacts(data, keyMap[result.tool]),
    cards,
  };
}

function countResultSignals(result: CalcResponse): number {
  const data = result.data ?? {};

  if (result.tool === 'tarot') return Math.max(1, asArray(data.cards).length);
  if (result.tool === 'runes') return Math.max(1, asArray(data.runes).length);
  if (result.tool === 'humandesign') {
    return asArray(data.activatedGates).length + asArray(data.definedChannels).length + asArray(data.definedCenters).length;
  }
  if (result.tool === 'ziwei') return Object.keys(asDict(data.palaces)).length + asArray(data.majorStars).length;
  if (result.tool === 'bazi') {
    const wuxing = asDict(data.wuxing);
    const wuxingTotal = Object.values(wuxing).reduce<number>((sum, value) => sum + (Number(value) || 0), 0);
    return wuxingTotal + Object.keys(asDict(data.pillars)).length;
  }
  if (result.tool === 'maya') return ['kin', 'tone', 'seal', 'guide', 'analog', 'antipode', 'occult'].filter((key) => data[key]).length;
  if (result.tool === 'astro') return ['sun', 'moon', 'ascendant', 'midheaven'].filter((key) => data[key]).length;
  return ['lifePathDisplay', 'lifePathReduced', 'birthDayDisplay', 'calculationNote', 'lifePathArchetype', 'birthDayArchetype'].filter((key) => data[key]).length;
}

function buildGameProfile(result: CalcResponse, insight: ResultInsight, reading: PersonalReading): GameProfile {
  const meta = GAME_META[result.tool];
  const signalCount = countResultSignals(result);
  const cardCount = insight.cards.length;
  const progress = Math.min(96, Math.max(42, 42 + insight.facts.length * 7 + cardCount * 5 + reading.points.length * 4 + Math.min(signalCount, 12) * 2));
  const badgeSeeds = compact([
    insight.facts[0]?.value,
    insight.facts[1]?.value,
    insight.cards[0]?.title,
  ]).split(' / ').filter(Boolean);
  const badges = [meta.badge, meta.focus, ...badgeSeeds].slice(0, 5);

  return {
    title: meta.title,
    className: meta.className,
    rank: meta.rank,
    progress,
    stats: [
      { label: '閱讀完成度', value: `${progress}%`, tone: 'gold' },
      { label: '重點數', value: String(Math.max(insight.facts.length, cardCount, 1)), tone: 'cyan' },
      { label: '圖面線索', value: String(Math.max(signalCount, reading.points.length)), tone: 'rose' },
      { label: '建議步驟', value: '3 步', tone: 'violet' },
    ],
    badges,
    quests: [
      {
        title: '第 1 步｜先看核心主題',
        body: `先看「${meta.focus}」與上方摘要。它是這次解盤最該先理解的主軸，不用一次看懂全部。`,
        reward: '你會知道：主軸是什麼',
      },
      {
        title: '第 2 步｜再看視覺盤',
        body: '按下方「前往視覺展示」跳到結果視覺區；圖面導覽會說明中間、外圈與線條各代表什麼。',
        reward: '你會知道：圖面怎麼看',
      },
      {
        title: '第 3 步｜選一個行動',
        body: '選一個最有感的提醒，今天只做一個小實驗。先驗證一件事，比一次讀完整份更有用。',
        reward: '你會知道：今天要做什麼',
      },
    ],
  };
}

function palaceListFrom(data: Dict) {
  const palaces = data.palaces;
  if (Array.isArray(palaces)) return palaces.map(asDict);

  const palaceMap = asDict(palaces);
  return Object.entries(palaceMap).map(([key, value]) => ({
    key,
    ...asDict(value),
  }));
}

function palaceTitle(palace: Dict, fallback: string) {
  return cleanText(palace.name)
    || cleanText(palace.palaceName)
    || cleanText(palace.label)
    || cleanText(palace.key)
    || fallback;
}

function palaceBranch(palace: Dict) {
  return cleanText(palace.earthlyBranch)
    || cleanText(palace.branch)
    || cleanText(palace.ground)
    || '';
}

function palaceStars(palace: Dict) {
  const starSources = [
    ...asArray(palace.majorStarNames),
    ...asArray(palace.majorStars),
    ...asArray(palace.stars),
  ];
  const stars = starSources
    .map((star) => formatPrimitive(star))
    .filter(Boolean)
    .filter((star, index, list) => list.indexOf(star) === index);
  return stars.slice(0, 4);
}

// ── 八字專屬詳細排盤面板 ──
const BAZI_PILLAR_LABELS: Record<string, string> = {
  year: '年柱', month: '月柱', day: '日柱', time: '時柱',
};
const BAZI_SHISHEN_TRAD: Record<string, string> = {
  '劫财': '劫財', '伤官': '傷官', '偏财': '偏財',
  '正财': '正財', '七杀': '七殺',
};
const BAZI_CS_TRAD: Record<string, string> = {
  '长生': '長生', '冠带': '冠帶', '临官': '臨官', '养': '養', '绝': '絕',
};
const BAZI_NAYIN_TRAD: Record<string, string> = {
  '杨柳木': '楊柳木', '白蜡金': '白臘金',
  '剑锋金': '劍鋒金', '山头火': '山頭火', '涧下水': '澗下水',
  '炉中火': '爐中火', '覆灯火': '覆燈火', '钗钏金': '釵釧金',
  '长流水': '長流水', '霹雳火': '霹靂火', '大驿土': '大驛土',
  '城头土': '城牆土',
};
function baziSs(text: string): string {
  return BAZI_SHISHEN_TRAD[text] ?? text;
}
function baziCs(text: string): string {
  return BAZI_CS_TRAD[text] ?? text;
}
function baziNayin(text: string): string {
  return BAZI_NAYIN_TRAD[text] ?? text;
}

function BaziDetailPanel({ result }: { result: CalcResponse }) {
  if (result.tool !== 'bazi') return null;
  const data = result.data ?? {};
  const pillars = asDict(data.pillars);
  const hiddenStems = asDict(data.hiddenStems);
  const changSheng = asDict(data.changSheng);
  const shishenGan = asDict(data.shishen);
  const nayin = asDict(data.nayin);
  const shensha = asArray(data.shensha);
  const strengthData = asDict(data.strength);
  const patternData = asDict(data.pattern);
  const daYun = asDict(data.daYun);
  const daYunSteps = asArray(daYun.steps);

  const pillarKeys = ['year', 'month', 'day', 'time'] as const;

  return (
    <section className="bazi-detail" aria-label="八字排盤詳情">
      {/* ── 強弱 + 格局 ── */}
      {(strengthData.strength || patternData.name) && (
        <div className="bazi-detail__header">
          {strengthData.strength && (
            <div className="bazi-detail__strength">
              <span>日主強弱</span>
              <strong>{cleanText(strengthData.strength)}</strong>
              <p>{cleanText(strengthData.desc)}</p>
            </div>
          )}
          {patternData.name && (
            <div className="bazi-detail__pattern">
              <span>格局</span>
              <strong>{cleanText(patternData.name)}</strong>
              <p>{cleanText(patternData.yongShenHint)}</p>
            </div>
          )}
        </div>
      )}

      {/* ── 四柱藏干表格 ── */}
      <div className="bazi-detail__pillars">
        <h3>四柱 · 藏干 · 十神</h3>
        <div className="bazi-detail__pillar-grid">
          {pillarKeys.map((key) => {
            const pillar = asArray(pillars[key]);
            const gan = cleanText(pillar[0]);
            const zhi = cleanText(pillar[1]);
            const ssGan = key !== 'day' ? baziSs(cleanText(shishenGan[key])) : '日主';
            const cs = cleanText(changSheng[key]);
            const ny = cleanText(nayin[key]);
            const stems = asArray(hiddenStems[key]);
            return (
              <article key={key} className={`bazi-detail__pillar${key === 'day' ? ' is-day' : ''}`}>
                <span className="bazi-detail__pillar-label">{BAZI_PILLAR_LABELS[key]}</span>
                <div className="bazi-detail__pillar-ganzhi">
                  <strong className="bazi-detail__gan">{gan}</strong>
                  <span className="bazi-detail__zhi">{zhi}</span>
                </div>
                {ssGan && <span className="bazi-detail__ss-gan">{ssGan}</span>}
                {ny && <span className="bazi-detail__nayin">{baziNayin(ny)}</span>}
                {cs && <span className="bazi-detail__changsheng">{baziCs(cs)}</span>}
                {stems.length > 0 && (
                  <ul className="bazi-detail__hidden-stems">
                    {stems.slice(0, 3).map((stem, i) => {
                      const s = asDict(stem);
                      const stemGan = cleanText(s.gan);
                      const stemSs = baziSs(cleanText(s.shishen));
                      const stemRole = cleanText(s.role);
                      return stemGan ? (
                        <li key={i}>
                          <span>{stemGan}</span>
                          {stemSs && <em>{stemSs}</em>}
                          {stemRole && <small>{stemRole}</small>}
                        </li>
                      ) : null;
                    })}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </div>

      {/* ── 神煞 ── */}
      {shensha.length > 0 && (
        <div className="bazi-detail__shensha">
          <h3>神煞</h3>
          <ul>
            {shensha.map((item, i) => {
              const ss = asDict(item);
              return (
                <li key={i}>
                  <strong>{cleanText(ss.name)}</strong>
                  <span>{cleanText(ss.desc)}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* ── 大運 ── */}
      {daYunSteps.length > 0 && (
        <div className="bazi-detail__dayun">
          <h3>
            大運
            {(daYun.startAge != null) && (
              <span className="bazi-detail__dayun-start">
                {cleanText(daYun.startAge)}歲{cleanText(daYun.startMonth)}個月起運
                · {daYun.isForward ? '順行' : '逆行'}
              </span>
            )}
          </h3>
          <div className="bazi-detail__dayun-steps">
            {daYunSteps.slice(0, 6).map((step, i) => {
              const s = asDict(step);
              const gz = cleanText(s.ganZhi);
              const ssG = baziSs(cleanText(s.shishenGan));
              const startAge = cleanText(s.startAge);
              const endAge = cleanText(s.endAge);
              const startYear = cleanText(s.startYear);
              return gz ? (
                <article key={i} className="bazi-detail__dayun-step">
                  <strong>{gz}</strong>
                  {ssG && <span>{ssG}</span>}
                  <small>{startAge}—{endAge}歲</small>
                  <small>{startYear}年起</small>
                </article>
              ) : null;
            })}
          </div>
        </div>
      )}
    </section>
  );
}

function ZiweiPlainGuide({ result, t }: { result: CalcResponse; t: ToolResultCopy }) {
  if (result.tool !== 'ziwei') return null;

  const data = result.data ?? {};
  const ming = firstValue(data, ['mingGong', 'lifePalace'], '命宮');
  const shen = firstValue(data, ['shenGong', 'bodyPalace'], '身宮');
  const wuxing = firstValue(data, ['fiveElementsClass'], '五行局');
  const palaces = palaceListFrom(data).slice(0, 12);
  const g = t.ziweiGuide;

  return (
    <section className="ziwei-guide" aria-label={g.kicker}>
      <div className="ziwei-guide__header">
        <span>{g.kicker}</span>
        <h2>{g.title}</h2>
        <p>{g.body}</p>
      </div>

      <div className="ziwei-guide__core">
        <article>
          <span>01</span>
          <h3>{t.ziweiGuide.mingGongLabel}：{ming}</h3>
          <p>{t.ziweiGuide.mingGongDesc}</p>
        </article>
        <article>
          <span>02</span>
          <h3>{t.ziweiGuide.shenGongLabel}：{shen}</h3>
          <p>{t.ziweiGuide.shenGongDesc}</p>
        </article>
        <article>
          <span>03</span>
          <h3>{t.ziweiGuide.wuxingLabel}：{wuxing}</h3>
          <p>{t.ziweiGuide.wuxingDesc}</p>
        </article>
      </div>

      <div className="ziwei-guide__routes">
        {g.questionRoutes.map((item) => (
          <article key={item.topic}>
            <strong>{item.topic}</strong>
            <h3>{item.palace}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      {palaces.length > 0 && (
        <div className="ziwei-guide__palaces">
          {palaces.map((palace, index) => {
            const title = palaceTitle(palace, `第 ${index + 1} 宮`);
            const branch = palaceBranch(palace);
            const stars = palaceStars(palace);
            return (
              <article key={`${title}-${index}`}>
                <span>{branch || String(index + 1).padStart(2, '0')}</span>
                <h3>{title}</h3>
                <p>{stars.length > 0 ? stars.join(' / ') : t.palaceNoStar}</p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function MemberResonancePanel({ resonance, t }: { resonance: MemberResonance; t: ToolResultCopy }) {
  return (
    <section className="member-resonance" aria-label="member resonance">
      <div className="member-resonance__header">
        <span>{resonance.eyebrow}</span>
        <h2>{resonance.title}</h2>
        <p>{resonance.lead}</p>
      </div>

      <div className="member-resonance__mirror">
        <strong>{t.resonance.understandPrefix}</strong>
        <p>{resonance.mirror}</p>
      </div>

      <div className="member-resonance__grid">
        {resonance.points.map((point) => (
          <article key={`${point.label}-${point.title}`}>
            <span>{point.label}</span>
            <h3>{point.title}</h3>
            <p>{point.body}</p>
          </article>
        ))}
      </div>

      <p className="member-resonance__question">{t.resonance.questionPrefix}{resonance.nextQuestion}</p>
    </section>
  );
}

function BeginnerGuidePanel({ guide }: { guide: BeginnerGuide }) {
  return (
    <section className="beginner-guide" aria-label="beginner guide">
      <div className="beginner-guide__header">
        {/* 會員初階導讀 */}
        <span>MEMBER STARTER</span>
        <h2>{guide.title}</h2>
        <p>{guide.intro}</p>
      </div>
      <div className="beginner-guide__grid">
        {guide.items.map((item) => (
          <article key={`${item.label}-${item.title}`} className="beginner-guide__item">
            <span>{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <p className="beginner-guide__note">{guide.note}</p>
    </section>
  );
}

// ResultGamePanel — 新手閱讀順序（READING MAP）引導
function ResultGamePanel({ profile, t }: { profile: GameProfile; t: ToolResultCopy }) {
  const g = t.game;
  return (
    <section className="result-game result-reading-map" aria-label={g.kicker}>
      <div className="result-game__hero">
        <div>
          <span>{g.kicker}</span>
          <h2>{g.title}</h2>
          <p>{profile.title} · {profile.className}</p>
          <p className="result-game__plain-note">{g.plainNote}</p>
        </div>
      </div>

      <div className="result-game__stats">
        {profile.stats.slice(0, 3).map((stat) => (
          <div key={stat.label} className={`result-game__stat result-game__stat--${stat.tone}`}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
          </div>
        ))}
      </div>

      <div className="result-game__quests">
        {profile.quests.map((quest, index) => (
          <article key={quest.title} className="result-game__quest">
            <span>{g.stepPrefix} {index + 1}</span>
            <h3>{quest.title}</h3>
            <p>{quest.body}</p>
            <strong>{quest.reward}</strong>
          </article>
        ))}
      </div>

      <div className="result-game__actions">
        <a href="#reading-ar-stage">{g.arLink}</a>
        {/* 前往視覺展示（穩定 2D 展示，AR/3D 版本推出前使用） */}
        <small>下面會把重點拆成白話卡片，不需要懂專有名詞也能讀。</small>
      </div>
    </section>
  );
}

function ResultInsightPanel({ insight, speech, t }: { insight: ResultInsight; speech?: string; t: ToolResultCopy }) {
  const [expanded, setExpanded] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [resonantCards, setResonantCards] = useState<number[]>([]);
  const hasManyCards = insight.cards.length > 4;
  const visibleCards = hasManyCards && !expanded ? insight.cards.slice(0, 3) : insight.cards;
  const cardSignature = insight.cards.map((card) => card.title).join('|');
  const resonantCount = resonantCards.length;
  const ins = t.insight;

  useEffect(() => {
    setExpanded(false);
    setActiveCardIndex(null);
    setResonantCards([]);
  }, [insight.title, cardSignature, insight.cards.length]);

  const toggleResonance = (index: number) => {
    setResonantCards((cards) => (
      cards.includes(index) ? cards.filter((cardIndex) => cardIndex !== index) : [...cards, index]
    ));
  };

  const toggleExpanded = () => {
    const nextExpanded = !expanded;
    setExpanded(nextExpanded);
    if (!nextExpanded && activeCardIndex !== null && activeCardIndex > 2) {
      setActiveCardIndex(0);
    }
  };

  return (
    <section className="result-insights" aria-label="result insights">
      <div className="result-insights__header">
        <span>{insight.eyebrow}</span>
        <h2>{insight.title}</h2>
        <p>{insight.intro}</p>
      </div>

      {insight.facts.length > 0 && (
        <dl className="result-insights__facts">
          {insight.facts.map((fact) => (
            <div key={`${fact.label}-${fact.value}`} className="result-insights__fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {insight.cards.length > 0 && (
        <>
          <div className="result-insights__member-prompt" role="status" aria-live="polite">
            <div>
              <span>{ins.memberNoteKicker}</span>
              <strong>{ins.memberNoteTitle}</strong>
            </div>
            <p>{resonantCount > 0 ? ins.memberNoteCount.replace('{count}', String(resonantCount)) : ins.memberNoteEmpty}</p>
          </div>

          <div className="result-insights__cards">
            {visibleCards.map((card, index) => {
              const isActive = activeCardIndex === index;
              const isResonant = resonantCards.includes(index);
              const mayaTotem = card.mayaSeal ? getMayaTotemBySeal(card.mayaSeal) : null;

              return (
                <article
                  key={`${card.title}-${index}`}
                  className={`result-insights__card${isActive ? ' is-active' : ''}${isResonant ? ' is-resonant' : ''}`}
                >
                  <button
                    type="button"
                    className="result-insights__card-button"
                    aria-expanded={isActive}
                    onClick={() => setActiveCardIndex(isActive ? null : index)}
                  >
                    {mayaTotem ? (
                      <span className="result-insights__card-orb" aria-hidden="true">
                        <MayaTotemGlyph totem={mayaTotem} size="sm" showLabel={false} active={isActive || isResonant} />
                      </span>
                    ) : (
                      <span className="result-insights__card-index" aria-hidden="true">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    )}
                    <span className="result-insights__card-kicker">{card.subtitle || ins.cardSubtitleFallback}</span>
                    <strong>{card.title}</strong>
                    <span className="result-insights__card-state">{isActive ? ins.cardCollapse : ins.cardExpand}</span>
                  </button>

                  <div className="result-insights__card-body" hidden={!isActive}>
                    {card.body && <p>{card.body}</p>}
                    {card.tags && card.tags.length > 0 && (
                      <div className="result-insights__tags">
                        {card.tags.map((tag) => (
                          <em key={tag}>{tag}</em>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="result-insights__card-actions">
                    <button
                      type="button"
                      className="result-insights__resonate"
                      aria-pressed={isResonant}
                      onClick={() => toggleResonance(index)}
                    >
                      {isResonant ? ins.cardResonated : ins.cardResonate}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
          {hasManyCards && (
            <button type="button" className="result-insights__expand" onClick={toggleExpanded}>
              {expanded ? ins.collapseAll : ins.expandAll.replace('{count}', String(insight.cards.length))}
            </button>
          )}
        </>
      )}

      {speech && <p className="result-insights__speech">{speech}</p>}
    </section>
  );
}

function PersonalReadingPanel({ reading, t }: { reading: PersonalReading; t: ToolResultCopy }) {
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const readingSignature = reading.points.map((point) => point.title).join('|');
  const selectedPoint = focusIndex === null ? null : reading.points[focusIndex];
  const pr = t.personalReading;

  useEffect(() => {
    setFocusIndex(null);
  }, [reading.title, readingSignature, reading.points.length]);

  return (
    <section className="personal-reading" aria-label="personal reading">
      <div className="personal-reading__header">
        <span>{reading.eyebrow}</span>
        <h2>{reading.title}</h2>
        <p>{reading.subtitle}</p>
      </div>

      {selectedPoint && (
        <div className="personal-reading__focus" role="status">
          <span>{pr.thisReminder}</span>
          <strong>{selectedPoint.title}</strong>
          <p>{selectedPoint.body}</p>
        </div>
      )}

      <div className="personal-reading__grid">
        {reading.points.map((point, index) => {
          const isSelected = focusIndex === index;

          return (
            <article key={point.label} className={`personal-reading__point${isSelected ? ' is-selected' : ''}`}>
              <span>{point.label}</span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
              <button
                type="button"
                className="personal-reading__point-action"
                aria-pressed={isSelected}
                onClick={() => setFocusIndex(isSelected ? null : index)}
              >
                {isSelected ? pr.reminderSet : pr.setReminder}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

// RESULT_NEXT_STEPS — 接下來可以這樣看（預約老師解讀、穩定 2D 盤面）
// PointUnlockPanel: 每天可領 200 點，100 點解鎖流日、流月、流年延伸解讀
function ResultNextSteps({ tool, t }: { tool: CalcTool; t: ToolResultCopy }) {
  const steps = t.nextStepsTools[tool];
  const ns = t.nextSteps;
  return (
    <section className="result-next-steps" aria-label={ns.kicker}>
      <div className="result-next-steps__header">
        <span>{ns.kicker}</span>
        <h2>{ns.title}</h2>
      </div>
      <div className="result-next-steps__grid">
        {steps.map((step, index) => (
          <article key={step.title} className="result-next-steps__item">
            <strong>{String(index + 1).padStart(2, '0')}</strong>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
      <div className="result-next-steps__actions">
        <Link href="/teachers">{ns.bookTeacher}</Link>
        <Link href="/account/charts">{ns.viewHistory}</Link>
      </div>
    </section>
  );
}

// MEMBER ONBOARDING — 保存這次解讀 / 回到每日儀式 / 找老師深度解讀
function MemberActionPath({ tool, t }: { tool: CalcTool; t: ToolResultCopy }) {
  const toolName = TOOL_COPY[tool]?.title ?? '';
  const ap = t.actionPath;
  const actions = [
    {
      title: ap.saveTitle,
      body: toolName ? `${toolName} — ${ap.saveTitle}` : ap.saveTitle,
      href: '/account/login?return=/account/charts',
      label: ap.saveLabel,
      primary: true,
    },
    {
      title: ap.dailyTitle,
      body: ap.dailyBody,
      href: '/daily',
      label: ap.dailyLabel,
      primary: false,
    },
    {
      title: ap.consultTitle,
      body: ap.consultBody,
      href: '/teachers',
      label: ap.consultLabel,
      primary: false,
    },
  ];

  return (
    <section className="member-action-path" aria-label={ap.kicker}>
      <div className="member-action-path__header">
        <span>{ap.kicker}</span>
        <h2>{ap.title}</h2>
        <p>{ap.body}</p>
      </div>
      <div className="member-action-path__steps">
        {actions.map((action, index) => (
          <article key={action.title} className={`member-action-path__step${action.primary ? ' is-primary' : ''}`}>
            <strong>{String(index + 1).padStart(2, '0')}</strong>
            <h3>{action.title}</h3>
            <p>{action.body}</p>
            <Link href={action.href}>{action.label}</Link>
          </article>
        ))}
      </div>
      <div className="member-action-path__actions">
        <Link href="/account/login?return=/account/charts">{ap.footerSave}</Link>
        <Link href="/teachers">{ap.footerConsult}</Link>
      </div>
    </section>
  );
}

function taipeiDatePart(part: 'day' | 'month' | 'year') {
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei' }).format(new Date());
  if (part === 'year') return day.slice(0, 4);
  if (part === 'month') return day.slice(0, 7);
  return day;
}

function pointErrorMessage(message: string, notices: ToolResultCopy['notices']) {
  if (message.includes('insufficient_points')) return notices.insufficientPoints;
  if (message.includes('not_authenticated')) return notices.notAuthenticated;
  return notices.generic;
}

function PointUnlockPanel({ result, t }: { result: CalcResponse; t: ToolResultCopy }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [claimedToday, setClaimedToday] = useState(false);
  const [unlocked, setUnlocked] = useState<Partial<Record<MemberUnlockType, boolean>>>({});
  const [unlockedContent, setUnlockedContent] = useState<Partial<Record<MemberUnlockType, MemberUnlockedReading>>>({});
  const [busy, setBusy] = useState<'claim' | MemberUnlockType | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadMemberPoints() {
      setReady(false);
      setNotice(null);

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (cancelled) return;

      if (authError || !authData.user) {
        setUserId(null);
        setBalance(null);
        setClaimedToday(false);
        setUnlocked({});
        setUnlockedContent({});
        setReady(true);
        return;
      }

      const user = authData.user;
      setUserId(user.id);

      const [walletResult, claimResult, unlockResult] = await Promise.all([
        supabase
          .from('member_wallets')
          .select('balance,lifetime_earned,lifetime_spent')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('daily_point_claims')
          .select('claim_date')
          .eq('user_id', user.id)
          .eq('claim_date', taipeiDatePart('day'))
          .maybeSingle(),
        supabase
          .from('content_unlocks')
          .select('unlock_type,scope_key,metadata')
          .eq('user_id', user.id)
          .eq('tool', result.tool)
          .in('scope_key', MEMBER_UNLOCK_OPTIONS.map((option) => getUnlockScopeKey(result, option.type))),
      ]);

      if (cancelled) return;

      if (walletResult.error) {
        setNotice(pointErrorMessage(walletResult.error.message, t.notices));
      }

      const wallet = walletResult.data as { balance?: number } | null;
      setBalance(typeof wallet?.balance === 'number' ? wallet.balance : 0);
      setClaimedToday(Boolean(claimResult.data));

      const nextUnlocked: Partial<Record<MemberUnlockType, boolean>> = {};
      const nextUnlockedContent: Partial<Record<MemberUnlockType, MemberUnlockedReading>> = {};
      const rows = (unlockResult.data || []) as Array<{
        unlock_type?: MemberUnlockType;
        scope_key?: string;
        metadata?: { unlocked_content?: MemberUnlockedReading } | null;
      }>;
      MEMBER_UNLOCK_OPTIONS.forEach((option) => {
        const scopeKey = getUnlockScopeKey(result, option.type);
        const row = rows.find((item) => item.unlock_type === option.type && item.scope_key === scopeKey);
        nextUnlocked[option.type] = Boolean(row);
        if (row?.metadata?.unlocked_content) nextUnlockedContent[option.type] = row.metadata.unlocked_content;
      });
      setUnlocked(nextUnlocked);
      setUnlockedContent(nextUnlockedContent);
      setReady(true);
    }

    loadMemberPoints().catch((error: Error) => {
      if (!cancelled) {
        setNotice(pointErrorMessage(error.message, t.notices));
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [result, t.notices]);

  const claimDailyPoints = async () => {
    if (!userId) return;
    setBusy('claim');
    setNotice(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc('claim_daily_points');
    if (error) {
      setNotice(pointErrorMessage(error.message, t.notices));
      setBusy(null);
      return;
    }

    const payload = (data || {}) as PointRpcResult;
    setBalance(typeof payload.balance === 'number' ? payload.balance : balance);
    setClaimedToday(true);
    setNotice(payload.claimed ? t.notices.claimSuccess : t.notices.claimAlready);
    setBusy(null);
  };

  const unlockContent = async (option: MemberUnlockOption) => {
    if (!userId) return;
    if ((balance ?? 0) < POINT_UNLOCK_COST && !unlocked[option.type]) {
      setNotice(t.notices.signInFirst);
      return;
    }

    setBusy(option.type);
    setNotice(null);

    const supabase = createClient();
    const { data, error } = await supabase.rpc('unlock_content', {
      p_unlock_type: option.type,
      p_tool: result.tool,
      p_scope_key: getUnlockScopeKey(result, option.type),
      p_cost: POINT_UNLOCK_COST,
      p_metadata: buildUnlockContentMetadata(result),
    });

    if (error) {
      setNotice(pointErrorMessage(error.message, t.notices));
      setBusy(null);
      return;
    }

    const payload = (data || {}) as PointRpcResult;
    setBalance(typeof payload.balance === 'number' ? payload.balance : Math.max(0, (balance ?? 0) - POINT_UNLOCK_COST));
    setUnlocked((prev) => ({ ...prev, [option.type]: true }));
    if (payload.content) {
      setUnlockedContent((prev) => ({ ...prev, [option.type]: payload.content }));
    }
    const ul = t.unlock;
    const localLabel = t.unlockOptions[option.type]?.label ?? option.label;
    setNotice(payload.already_unlocked
      ? ul.noticeAlreadyUnlocked.replace('{label}', localLabel)
      : ul.noticeUnlocked.replace('{label}', localLabel));
    setBusy(null);
  };

  const ul = t.unlock;

  return (
    <section className="point-unlock" aria-label={ul.kicker}>
      <div className="point-unlock__header">
        <div>
          <span>{ul.kicker}</span>
          <h2>{ul.title}</h2>
          <p>{ul.body}</p>
        </div>
        <div className="point-unlock__balance">
          <span>{ul.memberStatusLabel}</span>
          <strong>{userId ? (ready ? ul.memberLoggedIn : ul.memberPending) : ul.memberGuest}</strong>
        </div>
      </div>

      {!userId ? (
        <div className="point-unlock__guest">
          <p>{ul.guestBody}</p>
          <Link href="/account/login?return=/account/charts">{ul.guestLogin}</Link>
        </div>
      ) : (
        <div className="point-unlock__claim">
          <div>
            <strong>{ul.dailyTitle}</strong>
            <p>{claimedToday ? ul.dailyDone : ul.dailyPending}</p>
          </div>
          <button type="button" onClick={claimDailyPoints} disabled={busy !== null || claimedToday}>
            {busy === 'claim' ? ul.claimingBtn : claimedToday ? ul.claimedBtn : ul.claimBtn}
          </button>
        </div>
      )}

      <div className="point-unlock__grid">
        {MEMBER_UNLOCK_OPTIONS.map((option) => {
          const isUnlocked = Boolean(unlocked[option.type]);
          const reading = unlockedContent[option.type];
          const hasRevealedContent = Boolean(reading);
          // 從 i18n 字典取翻譯版本，fallback 到原本英文 eyebrow
          const optionI18n = t.unlockOptions[option.type];
          const localLabel = optionI18n?.label ?? option.label;
          const localTitle = optionI18n?.title ?? option.title;
          const localBody = optionI18n?.body ?? option.body;
          return (
            <article key={option.type} className={`point-unlock__option${isUnlocked ? ' is-unlocked' : ''}`}>
              <span>{option.eyebrow}</span>
              <h3>{localTitle}</h3>
              <p>{localBody}</p>
              <div className="point-unlock__option-footer">
                <strong>{localLabel}</strong>
                <button
                  type="button"
                  onClick={() => unlockContent(option)}
                  disabled={!userId || busy !== null || (isUnlocked && hasRevealedContent)}
                >
                  {isUnlocked && hasRevealedContent
                    ? ul.alreadyViewed
                    : busy === option.type
                      ? ul.loadingContent
                      : isUnlocked
                        ? ul.loadBtn
                        : ul.viewBtn.replace('{label}', localLabel)}
                </button>
              </div>
              {isUnlocked && reading && (
                <div className="point-unlock__revealed">
                  <strong>{reading.title}</strong>
                  <p>{reading.summary}</p>
                  <div className="point-unlock__revealed-grid">
                    {reading.sections.map((section) => (
                      <div key={`${option.type}-${section.label}`}>
                        <span>{section.label}</span>
                        <h4>{section.title}</h4>
                        <p>{section.body}</p>
                      </div>
                    ))}
                  </div>
                  <ul>
                    {reading.tasks.map((task) => (
                      <li key={task}>{task}</li>
                    ))}
                  </ul>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {notice && <p className="point-unlock__notice">{notice}</p>}
    </section>
  );
}

// 結果重點解讀 — 呈現完整解讀結果；正在整理解讀（載入中）；解讀失敗（錯誤狀態）
export function ToolResult({ result, locale = DEFAULT_LOCALE }: { result: CalcResponse | null; locale?: Locale }) {
  const ref = useRef<HTMLDivElement>(null);
  const savedRecordKeys = useRef<Set<string>>(new Set());
  const t = getToolResultCopy(locale);

  useEffect(() => {
    if (result && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [result]);

  useEffect(() => {
    if (!result) return;

    const resultForSave = result;
    const recordKey = `${resultForSave.tool}:${resultForSave.computed_at}:${JSON.stringify(resultForSave.input)}`;
    if (savedRecordKeys.current.has(recordKey)) return;

    let cancelled = false;

    async function saveChartRecord() {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getUser();
      if (cancelled || !authData.user) return;

      const { error } = await supabase.from('chart_records').insert({
        user_id: authData.user.id,
        tool: resultForSave.tool,
        input_data: resultForSave.input,
        output_data: resultForSave.data,
      });

      if (error) {
        console.warn('chart record save failed:', error);
        return;
      }
      savedRecordKeys.current.add(recordKey);
    }

    void saveChartRecord();

    return () => {
      cancelled = true;
    };
  }, [result]);

  if (!result) return null;

  const { svg, html, speech } = result.render;
  const insight = buildInsight(result);
  const personalReading = buildPersonalReading(result);
  const gameProfile = buildGameProfile(result, insight, personalReading);
  const memberResonance = buildMemberResonance(result);
  const beginnerGuide = BEGINNER_GUIDES[result.tool];

  return (
    <div ref={ref} className={`mele-card tool-result-card tool-result-card--${result.tool} mt-6 animate-fade-in`}>
      {result.tool !== 'tarot' && result.tool !== 'maya' && svg && result.tool !== 'humandesign' && (
        <div
          className={`mele-svg-wrap mele-svg-wrap--${result.tool} mb-6 flex justify-center`}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}

      <MemberResonancePanel resonance={memberResonance} t={t} />
      {result.tool !== 'maya' && <ResultInsightPanel insight={insight} speech={result.tool === 'tarot' ? undefined : speech} t={t} />}
      <BaziDetailPanel result={result} />
      <ZiweiPlainGuide result={result} t={t} />
      {result.tool !== 'tarot' && <PersonalReadingPanel reading={personalReading} t={t} />}
      <PointUnlockPanel result={result} t={t} />
      <p className="mt-6 border-t border-accent-dim pt-4 text-center text-[11px] leading-relaxed text-white/40">
        {t.disclaimer}
      </p>
    </div>
  );
}

