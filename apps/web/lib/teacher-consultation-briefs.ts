import type { CalcResponse, CalcTool } from '@/lib/api';
import { DEFAULT_LOCALE, LOCALES, type Locale } from '@/lib/i18n/config';

export type TeacherBriefSource = CalcTool | 'daily_tarot' | 'daily_runes' | 'daily_stone';
export type TeacherSopKey = 'opening' | 'gift' | 'shadow' | 'action' | 'closing';

export type TeacherSopStage = {
  key: TeacherSopKey;
  title: string;
  intent: string;
  script: string;
  questions: string[];
  notes: string;
};

export type TeacherBeginnerCard = {
  label: string;
  title: string;
  body: string;
};

export type TeacherDetailItem = {
  label: string;
  title: string;
  body: string;
  meta?: string;
};

export type TeacherDetailSection = {
  title: string;
  intro: string;
  items: TeacherDetailItem[];
};

export type TeacherConsultationBrief = {
  source: TeacherBriefSource;
  sourceLabel: string;
  title: string;
  clientIntent: string;
  beginnerCards: TeacherBeginnerCard[];
  plainOneLiner: string;
  conversationBreakdown: string[];
  coreSummary: string;
  chartHighlights: string[];
  strengths: string[];
  shadows: string[];
  questions: string[];
  avoidSayings: string[];
  sopStages: TeacherSopStage[];
  detailSections: TeacherDetailSection[];
  copyText: string;
  tags: string[];
};

export type TeacherBriefDraft = Partial<Pick<
  TeacherConsultationBrief,
  'title' | 'clientIntent' | 'plainOneLiner' | 'conversationBreakdown' | 'coreSummary' | 'chartHighlights' | 'strengths' | 'shadows' | 'questions' | 'avoidSayings' | 'tags'
>> & {
  sopStages?: Partial<Record<TeacherSopKey, Partial<Omit<TeacherSopStage, 'key'>>>>;
};

type BuildBriefInput = {
  result: CalcResponse;
  customerQuestion?: string | null;
  source?: TeacherBriefSource;
  locale?: Locale;
};

type BuildDailyBriefInput = {
  kind: 'daily_tarot' | 'daily_runes' | 'daily_stone';
  result: CalcResponse;
  date: string;
  customerQuestion?: string | null;
  locale?: Locale;
};

type BriefBlueprint = {
  label: string;
  anchor: string;
  highlights: string[];
  strengths: string[];
  shadows: string[];
  questions: string[];
  avoidSayings: string[];
};

type ClientIssueContext = {
  raw: string;
  topicLabel: string;
  painLabel: string;
  goalLabel: string;
  freeText: string;
  hasStructuredContext: boolean;
};

type BriefLocaleCopy = {
  sourceLabels: Record<TeacherBriefSource, string>;
  issuePrefixes: {
    topic: string;
    pain: string;
    goal: string;
    note: string;
  };
  issueFallbacks: {
    topic: string;
    pain: string;
    goal: string;
  };
  copySections: {
    title: string;
    source: string;
    subject: string;
    plainGuide: string;
    oneLiner: string;
    breakdown: string;
    clientIntent: string;
    coreSummary: string;
    chartHighlights: string;
    strengths: string;
    shadows: string;
    questions: string;
    avoidSayings: string;
    sop: string;
    script: string;
    ask: string;
    note: string;
    origin: string;
  };
  cardLabels: {
    understand: string;
    oneLine: string;
    scene: string;
    stuck: string;
    next: string;
  };
  cardTitles: {
    understandFallback: string;
    oneLine: string;
    scene: string;
    stuck: string;
    next: string;
  };
  breakdownLabels: string[];
  uiWords: {
    noQuestion: string;
    structuredUnderstand: (topic: string, pain: string, goal: string, note: string) => string;
    unstructuredUnderstand: string;
    issueSummaryStructured: (topic: string, pain: string, goal: string) => string;
    issueSummaryPlain: (raw: string) => string;
    issueSummaryMissing: string;
    openingFromNote: (note: string) => string;
    openingFromStructured: (topic: string, pain: string) => string;
    openingMissing: string;
    coreIntentMissing: string;
    rawClues: string;
    teacherNote: (topic: string, pain: string) => string;
    actionByGoal: (goal: string, next: string) => string;
    painByIssue: (pain: string, stuck: string) => string;
    strengthByIssue: (topic: string) => string;
    shadowByIssue: (pain: string) => string;
    questionByPain: (pain: string) => string;
    questionByGoal: (goal: string) => string;
    avoidYouAre: string;
    avoidFate: string;
    avoidGuarantee: string;
  };
  sopLabels: Record<TeacherSopKey, string>;
  sopStages: {
    opening: {
      title: string;
      intent: string;
      scriptStructured: (topic: string, pain: string, goal: string, tool: string) => string;
      scriptFallback: (tool: string) => string;
      questions: string[];
      notes: string;
    };
    gift: { title: string; intent: string; script: (anchor: string) => string; questions: string[]; notes: string };
    shadow: { title: string; intent: string; script: string; questions: string[]; notes: string };
    action: { title: string; intent: string; script: string; questions: string[]; notes: string };
    closing: { title: string; intent: string; script: string; questions: string[]; notes: string };
  };
  beginner: Record<TeacherBriefSource, {
    meaning: string;
    scene: string;
    stuck: string;
    teacherLine: string;
    gift: string;
    shadow: string;
    next: string;
  }>;
  detail: {
    teacherDeepPrep: string;
    humanDesignTitle: string;
    humanDesignIntro: string;
    missingTitle: string;
    missingIntro: string;
    channelTitle: string;
    channelIntro: string;
    activeFixed: string;
    activeHalf: string;
    missingLabel: string;
    channelLabel: string;
    bodyIntro: string;
    fixedSwitch: (partner: number) => string;
    halfSwitch: (partner: number) => string;
    issueFocus: (topic: string, pain: string) => string;
    lifeFocus: string;
    teacherQuestion: string;
    missingBody: string;
    channelBody: string;
    noPartner: string;
  };
};

const SOURCE_LABELS: Record<TeacherBriefSource, string> = {
  numerology: '生命靈數',
  maya: '瑪雅曆',
  bazi: '八字',
  ziwei: '紫微斗數',
  tarot: '塔羅',
  runes: '盧恩',
  astro: '占星',
  humandesign: '人類圖',
  daily_tarot: '每日塔羅',
  daily_runes: '每日盧恩',
  daily_stone: '每日抽石',
};

const SOURCE_LABELS_BY_LOCALE: Record<Locale, Record<TeacherBriefSource, string>> = {
  'zh-TW': SOURCE_LABELS,
  en: {
    numerology: 'Numerology',
    maya: 'Maya Calendar',
    bazi: 'Bazi',
    ziwei: 'Zi Wei Dou Shu',
    tarot: 'Tarot',
    runes: 'Runes',
    astro: 'Astrology',
    humandesign: 'Human Design',
    daily_tarot: 'Daily tarot card',
    daily_runes: 'Daily rune',
    daily_stone: 'Daily stone',
  },
  vi: {
    numerology: 'Thần số học',
    maya: 'Lịch Maya',
    bazi: 'Bát tự',
    ziwei: 'Tử vi Đẩu số',
    tarot: 'Tarot',
    runes: 'Rune',
    astro: 'Chiêm tinh',
    humandesign: 'Thiết kế Con người',
    daily_tarot: 'Tarot mỗi ngày',
    daily_runes: 'Rune mỗi ngày',
    daily_stone: 'Đá mỗi ngày',
  },
  id: {
    numerology: 'Numerologi',
    maya: 'Kalender Maya',
    bazi: 'Bazi',
    ziwei: 'Zi Wei Dou Shu',
    tarot: 'Tarot',
    runes: 'Rune',
    astro: 'Astrologi',
    humandesign: 'Human Design',
    daily_tarot: 'Tarot Harian',
    daily_runes: 'Rune Harian',
    daily_stone: 'Batu Harian',
  },
  ja: {
    numerology: '数秘術',
    maya: 'マヤ暦',
    bazi: '四柱推命',
    ziwei: '紫微斗数',
    tarot: 'タロット',
    runes: 'ルーン',
    astro: '占星術',
    humandesign: 'ヒューマンデザイン',
    daily_tarot: '今日のタロット',
    daily_runes: '今日のルーン',
    daily_stone: '今日のストーン',
  },
  ko: {
    numerology: '수비학',
    maya: '마야력',
    bazi: '사주',
    ziwei: '자미두수',
    tarot: '타로',
    runes: '룬',
    astro: '점성술',
    humandesign: '휴먼 디자인',
    daily_tarot: '오늘의 타로',
    daily_runes: '오늘의 룬',
    daily_stone: '오늘의 스톤',
  },
};

const ZH_BEGINNER: BriefLocaleCopy['beginner'] = {
  bazi: {
    meaning: '你不是沒方向，而是最近太常配合別人，自己的節奏被打亂了。',
    scene: '像是明明心裡有答案，卻因為怕麻煩別人、怕衝突，最後又照別人的步調走。',
    stuck: '卡住的點不是能力不足，而是力氣用錯地方：該休息時硬撐，該表達時又忍住。',
    teacherLine: '最近哪一件事，讓你覺得自己一直在配合，卻沒有真的舒服？',
    gift: '你不是沒有能力，而是需要把力氣放回對的位置；當節奏對了，你其實很能穩住事情。',
    shadow: '卡住的地方不是缺陷，比較像是某一種生活資源用太多或太少了，我們先找出是哪一種。',
    next: '讓客人先選一個生活資源來調整：休息、行動、表達、界線或支持。',
  },
  ziwei: {
    meaning: '你不是不知道自己要什麼，而是太常被放進別人期待的角色裡。',
    scene: '像是大家習慣找你負責、安排或撐場，久了你會忘記自己其實也想被照顧。',
    stuck: '卡住的點不是你不夠好，而是同一個角色演太久，已經很難自由換位置。',
    teacherLine: '你最近最累的是哪一個角色：照顧者、決定者、和事佬，還是撐住場面的人？',
    gift: '你身上有一種角色感，可能很會承擔、安排、照顧或判斷局勢，這是可以被好好使用的能力。',
    shadow: '如果你一直被期待扮演同一種角色，久了會累，也會忘記自己其實可以換一種方式回應。',
    next: '請客人說出最近最累的角色，先從那個角色開始鬆動。',
  },
  astro: {
    meaning: '你不是矛盾，而是外在表現、內在感受和真正想走的方向還沒對齊。',
    scene: '像是表面上可以好好說話、好好工作，但心裡其實有另一個需求一直沒有被看見。',
    stuck: '卡住的點不是想太多，而是你同時在照顧形象、情緒和關係，所以很難只選一邊。',
    teacherLine: '這件事裡，你最想被看見的是表現、情緒，還是關係裡的安全感？',
    gift: '你其實有不同面向，有一面想被理解，有一面想表現好，也有一面需要安全感。',
    shadow: '你卡住時不一定是矛盾，而是不同需求在搶方向；我們先不要急著選邊站。',
    next: '讓客人分辨現在最需要處理的是方向、情緒安全感，還是關係互動。',
  },
  humandesign: {
    meaning: '你不是不能決定，而是需要等身體和情緒也點頭，再往前走。',
    scene: '像是腦袋說可以，但身體很緊；或你太快答應，過幾天才發現自己其實不想。',
    stuck: '卡住的點不是你沒效率，而是你常用別人的速度要求自己，反而消耗更快。',
    teacherLine: '最近哪一個決定，是你嘴巴答應了，但身體其實沒有跟上？',
    gift: '你身上有自己的運作節奏，當你不硬逼自己照別人的速度走，反而比較容易穩定發揮。',
    shadow: '卡住時，你可能不是方向錯，而是太快答應、太快用腦袋決定，沒有等身體或情緒跟上。',
    next: '請客人回想最近一個決定，看看他是用身體、情緒還是頭腦在答應。',
  },
  maya: {
    meaning: '你不是卡住，而是這一段正在練習一種新的力量使用方式。',
    scene: '像是以前靠意志力可以推過去，但現在同樣方法不太有用，需要換角度看自己。',
    stuck: '卡住的點不是運氣不好，而是舊方法已經不夠用，生命在提醒你換一種回應。',
    teacherLine: '最近哪件事一直重複出現，好像在逼你換一種做法？',
    gift: '你有一個自然會散發的生命主題，不一定要用力證明，它可能已經在你的選擇和關係裡出現。',
    shadow: '挑戰力量不是壞東西，它比較像是反覆出現的提醒，幫你看見哪裡需要換角度。',
    next: '請客人把支持、挑戰、隱藏力量各對應到一個最近的人或事件。',
  },
  numerology: {
    meaning: '你不是一直犯同樣的錯，而是同一個人生功課又換了形式出現。',
    scene: '像是在不同工作、不同關係裡，總會遇到很像的情境，讓你有熟悉的無力感。',
    stuck: '卡住的點不是你沒進步，而是你還在用舊反應處理新情境。',
    teacherLine: '最近有沒有一件事，讓你心裡冒出「怎麼又來了」的感覺？',
    gift: '你不是一直重複錯誤，而是有一個很熟悉的學習模式；看懂它之後，就比較能選新的做法。',
    shadow: '同一個特質用得太用力，會變成壓力；我們先把它放輕，不急著否定自己。',
    next: '讓客人說出最近反覆出現的一件小事，從那裡找模式。',
  },
  tarot: {
    meaning: '這張牌不是結局，而是把你現在最說不出口的拉扯照出來。',
    scene: '像是你其實有感覺、有答案，但還不確定能不能相信自己。',
    stuck: '卡住的點不是牌好不好，而是你現在有一個情緒或真相還沒被說清楚。',
    teacherLine: '這張牌比較像你、像對方，還是像你們之間的狀態？',
    gift: '這張牌先讓你看見自己現在其實已經知道一些事，只是還沒整理成清楚的答案。',
    shadow: '牌面提醒的不是好壞，而是現在有哪個地方卡住、哪個地方還沒有被說清楚。',
    next: '請客人先說這張牌像他、像對方，還是像兩人之間的狀態。',
  },
  runes: {
    meaning: '這枚符文不是預言，而是提醒你先整理眼前最重要的一個阻力。',
    scene: '像是事情還沒到要做大決定，但已經有一個地方在提醒你不要再忽略。',
    stuck: '卡住的點不是凶吉，而是你需要先看清楚：現在缺的是資源、界線、溝通還是行動。',
    teacherLine: '如果這枚符文只提醒一件事，你覺得它最像在提醒你哪裡？',
    gift: '這枚符文不是要你一次解決全部，而是提醒你先抓住眼前最重要的一件事。',
    shadow: '如果它看起來比較沉重，也不代表不好，可能只是提醒你先停一下，把資源整理好。',
    next: '讓客人選一個今天就能做的小調整，不要把符文說成重大結論。',
  },
  daily_tarot: {
    meaning: '今天這張牌不是答案，而是提醒你先照顧最有感的情緒。',
    scene: '像是今天不用急著解決全部，只要先承認自己其實有一個感受很明顯。',
    stuck: '卡住的點不是今天會不好，而是你可能太急著找答案，忘了先聽見自己。',
    teacherLine: '今天這張牌讓你第一個想到的人、事或感覺是什麼？',
    gift: '今天先不用追答案，先看哪個感覺最需要被你承認。',
    shadow: '如果今天狀態比較亂，也只是提醒你慢一點，不代表事情就會不好。',
    next: '請客人選一句今天要帶走的提醒。',
  },
  daily_runes: {
    meaning: '今天這枚符文不是大事預告，而是一個先穩住自己的小提醒。',
    scene: '像是出門前有人輕輕提醒你：今天先顧好一件小事，不要把自己弄亂。',
    stuck: '卡住的點不是符文在警告你，而是提醒你今天少一點急、多一點覺察。',
    teacherLine: '今天如果只穩住一件事，你最想先穩住什麼？',
    gift: '今天只要先抓一個方向，不需要一次把所有問題處理完。',
    shadow: '如果提醒比較直接，可以把它當作檢查點，不要急著責備自己。',
    next: '請客人把提醒落成一個今天可以做的小動作。',
  },
  daily_stone: {
    meaning: '今天這顆石面不是壓力，而是提醒你先補回一種需要的養分。',
    scene: '像是身體或心情在說：我需要被照顧一下，不要一直只往前衝。',
    stuck: '卡住的點不是你狀態差，而是你可能太久沒有補充真正需要的支持。',
    teacherLine: '今天你最需要補回的是休息、安全感、勇氣，還是被理解？',
    gift: '石面提醒的是滋養，不是壓力；先看它想補給你哪一種力量。',
    shadow: '如果你覺得沒感覺也沒關係，我們先從今天身體最明顯的反應開始。',
    next: '請客人用一個詞描述今天需要的養分。',
  },
};

function buildTranslatedBeginner(locale: Locale, sourceLabels: Record<TeacherBriefSource, string>): BriefLocaleCopy['beginner'] {
  const textByLocale: Record<Exclude<Locale, 'zh-TW'>, {
    notDirection: string;
    role: string;
    alignment: string;
    rhythm: string;
    pattern: string;
    image: string;
    daily: string;
  }> = {
    en: {
      notDirection: 'You may not be without direction; your own rhythm may simply be buried under other people’s pace.',
      role: 'You may not be confused about yourself; you may have stayed too long in a role others expect from you.',
      alignment: 'The issue may not be contradiction. It may be that outer behavior, inner need, and next direction are not aligned yet.',
      rhythm: 'You may not be unable to decide; your body and emotions may need time to agree before you move.',
      pattern: 'You may not be repeating failure; the same life lesson may be appearing in a new form.',
      image: 'This symbol is not a final verdict. It gives the member a clear picture of the tension they are living with now.',
      daily: 'This daily draw is not a full destiny reading. It is a small mirror for today’s state and next gentle action.',
    },
    vi: {
      notDirection: 'Có thể khách không mất phương hướng; nhịp riêng của họ đang bị nhịp của người khác che lấp.',
      role: 'Có thể khách không mơ hồ về bản thân; họ đã ở quá lâu trong vai mà người khác mong đợi.',
      alignment: 'Điểm chính không hẳn là mâu thuẫn, mà là biểu hiện bên ngoài, nhu cầu bên trong và hướng đi chưa khớp nhau.',
      rhythm: 'Có thể khách không phải không quyết được; cơ thể và cảm xúc cần thêm thời gian để cùng đồng ý.',
      pattern: 'Có thể khách không lặp lại lỗi cũ; cùng một bài học đang quay lại dưới hình thức mới.',
      image: 'Biểu tượng này không phải phán quyết cuối cùng. Nó soi rõ lực kéo mà khách đang sống cùng.',
      daily: 'Lượt rút hôm nay không phải lá số hoàn chỉnh, mà là tấm gương nhỏ cho trạng thái và hành động nhẹ hôm nay.',
    },
    id: {
      notDirection: 'Klien mungkin bukan tidak punya arah; ritme pribadinya sedang tertutup oleh tempo orang lain.',
      role: 'Klien mungkin bukan tidak tahu diri; ia terlalu lama berada dalam peran yang diharapkan orang lain.',
      alignment: 'Masalahnya mungkin bukan kontradiksi, tetapi ekspresi luar, kebutuhan batin, dan arah berikutnya belum selaras.',
      rhythm: 'Klien mungkin bukan tidak bisa memilih; tubuh dan emosinya perlu waktu untuk ikut setuju.',
      pattern: 'Klien mungkin bukan mengulang kegagalan; pelajaran hidup yang sama muncul dalam bentuk baru.',
      image: 'Simbol ini bukan keputusan akhir. Ia memperlihatkan ketegangan yang sedang dialami klien.',
      daily: 'Tarikan harian bukan bacaan nasib lengkap. Ini cermin kecil untuk kondisi hari ini dan satu langkah lembut.',
    },
    ja: {
      notDirection: '方向がないのではなく、他人のペースに合わせすぎて自分のリズムが見えにくくなっている可能性があります。',
      role: '自分が分からないのではなく、周りが期待する役割を長く担いすぎているのかもしれません。',
      alignment: '矛盾しているのではなく、外に見せる姿、内側の欲求、進みたい方向がまだそろっていない状態です。',
      rhythm: '決められないのではなく、身体と感情が納得するまで少し時間が必要なのかもしれません。',
      pattern: '同じ失敗をしているのではなく、同じ人生のテーマが別の形で現れています。',
      image: 'この象徴は結論ではありません。今の葛藤を見える形にしてくれる鏡です。',
      daily: '今日のドローは完全な命盤ではなく、今日の状態と小さな一歩を見るための鏡です。',
    },
    ko: {
      notDirection: '방향이 없는 것이 아니라, 타인의 속도에 맞추느라 자신의 리듬이 흐려졌을 수 있습니다.',
      role: '자신을 모르는 것이 아니라, 다른 사람이 기대한 역할 안에 너무 오래 머물렀을 수 있습니다.',
      alignment: '모순이라기보다, 겉으로 보이는 모습과 내면의 욕구, 다음 방향이 아직 맞물리지 않은 상태입니다.',
      rhythm: '결정을 못 하는 것이 아니라, 몸과 감정이 함께 고개를 끄덕일 시간이 필요한 것일 수 있습니다.',
      pattern: '같은 실패를 반복하는 것이 아니라, 같은 삶의 과제가 다른 모습으로 다시 온 것일 수 있습니다.',
      image: '이 상징은 결론이 아니라 지금의 긴장을 보여 주는 거울입니다.',
      daily: '오늘의 뽑기는 완전한 운명 해석이 아니라 오늘의 상태와 작은 행동을 보는 거울입니다.',
    },
  };
  const t = textByLocale[locale as Exclude<Locale, 'zh-TW'>] ?? textByLocale.en;
  const genericByLocale: Record<Exclude<Locale, 'zh-TW'>, {
    scene: (tool: string) => string;
    stuck: string;
    teacherLine: string;
    gift: string;
    shadow: string;
    nextResource: string;
    nextRole: string;
    nextAstro: string;
    nextHd: string;
    nextMaya: string;
    nextNumerology: string;
    nextTarot: string;
    nextRunes: string;
    nextDailySentence: string;
    nextDailyAction: string;
    nextDailyNourishment: string;
  }> = {
    en: {
      scene: (tool) => `${tool} gives the guide a simple life scene first, then the technical details can be added after the member nods.`,
      stuck: 'Treat the stuck point as a pattern to observe, not as a flaw in the member.',
      teacherLine: 'Which part of this feels most present in your daily life right now?',
      gift: 'Name one usable strength first, then invite the member to give a real example.',
      shadow: 'Speak about the challenge gently as a repeated pattern, never as a fixed identity.',
      nextResource: 'Choose one life resource to adjust first: rest, action, expression, boundary, or support.',
      nextRole: 'Ask which role feels most tiring now, then loosen that role first.',
      nextAstro: 'Separate direction, emotional safety, and relationship dynamics before giving advice.',
      nextHd: 'Ask the member to revisit one recent decision and notice whether the body, emotion, or mind answered first.',
      nextMaya: 'Map guide, support, challenge, and hidden force to real people or events.',
      nextNumerology: 'Find one recent repeated situation and use it to name the pattern.',
      nextTarot: 'Ask whether the card feels like the member, the other person, or the space between them.',
      nextRunes: 'Turn the rune into one small adjustment the member can try today.',
      nextDailySentence: 'Let the member choose one sentence to carry today.',
      nextDailyAction: 'Turn the reminder into one small action today.',
      nextDailyNourishment: 'Ask the member to name the nourishment they need today.',
    },
    vi: {
      scene: (tool) => `${tool} nên được nói thành một cảnh đời thường trước, khi khách gật đầu rồi mới thêm thuật ngữ.`,
      stuck: 'Hãy xem điểm kẹt như một mẫu hình để quan sát, không phải lỗi của khách.',
      teacherLine: 'Phần nào trong câu này đang xuất hiện rõ nhất trong đời sống của bạn lúc này?',
      gift: 'Gọi tên một điểm mạnh dùng được trước, rồi mời khách kể một ví dụ thật.',
      shadow: 'Nói về thử thách như một mẫu hình lặp lại, đừng nói thành bản chất cố định.',
      nextResource: 'Chọn một nguồn lực đời sống để điều chỉnh trước: nghỉ ngơi, hành động, biểu đạt, ranh giới hoặc hỗ trợ.',
      nextRole: 'Hỏi vai nào đang làm khách mệt nhất, rồi giúp vai đó nhẹ lại trước.',
      nextAstro: 'Tách riêng hướng đi, cảm giác an toàn và quan hệ trước khi đưa lời khuyên.',
      nextHd: 'Mời khách nhìn lại một quyết định gần đây: cơ thể, cảm xúc hay lý trí đã trả lời trước?',
      nextMaya: 'Gắn lực dẫn đường, hỗ trợ, thử thách và ẩn lực vào người hoặc sự kiện thật.',
      nextNumerology: 'Tìm một tình huống lặp lại gần đây rồi dùng nó để gọi tên mẫu hình.',
      nextTarot: 'Hỏi lá bài giống khách, giống người kia, hay giống khoảng giữa hai bên.',
      nextRunes: 'Biến rune thành một điều chỉnh nhỏ khách có thể thử hôm nay.',
      nextDailySentence: 'Để khách chọn một câu nhắc nhở mang theo hôm nay.',
      nextDailyAction: 'Biến lời nhắc thành một hành động nhỏ hôm nay.',
      nextDailyNourishment: 'Hỏi hôm nay khách cần loại dưỡng chất tinh thần nào.',
    },
    id: {
      scene: (tool) => `${tool} sebaiknya diterjemahkan dulu menjadi adegan hidup yang sederhana, lalu istilah teknis ditambahkan setelah klien paham.`,
      stuck: 'Lihat bagian yang macet sebagai pola untuk diamati, bukan kekurangan klien.',
      teacherLine: 'Bagian mana yang paling terasa dalam kehidupanmu sekarang?',
      gift: 'Sebut satu kekuatan yang bisa dipakai, lalu minta klien memberi contoh nyata.',
      shadow: 'Bicarakan tantangan sebagai pola berulang, bukan identitas tetap.',
      nextResource: 'Pilih satu sumber daya hidup untuk disesuaikan: istirahat, tindakan, ekspresi, batas, atau dukungan.',
      nextRole: 'Tanyakan peran mana yang paling melelahkan, lalu longgarkan peran itu dulu.',
      nextAstro: 'Pisahkan arah hidup, rasa aman emosional, dan dinamika relasi sebelum memberi saran.',
      nextHd: 'Ajak klien meninjau satu keputusan terbaru: tubuh, emosi, atau pikiran yang menjawab lebih dulu?',
      nextMaya: 'Hubungkan kekuatan penuntun, dukungan, tantangan, dan tersembunyi dengan orang atau kejadian nyata.',
      nextNumerology: 'Temukan satu situasi berulang baru-baru ini dan gunakan untuk menamai polanya.',
      nextTarot: 'Tanyakan apakah kartu terasa seperti klien, orang lain, atau ruang di antara mereka.',
      nextRunes: 'Ubah rune menjadi satu penyesuaian kecil yang bisa dicoba hari ini.',
      nextDailySentence: 'Biarkan klien memilih satu kalimat untuk dibawa hari ini.',
      nextDailyAction: 'Ubah pengingat menjadi satu tindakan kecil hari ini.',
      nextDailyNourishment: 'Tanyakan bentuk nutrisi batin apa yang dibutuhkan hari ini.',
    },
    ja: {
      scene: (tool) => `${tool} はまず生活の場面として説明し、相談者が納得してから専門用語を足します。`,
      stuck: 'つまずきは欠点ではなく、観察できるパターンとして扱います。',
      teacherLine: 'この中で、今の日常にいちばん出ているのはどの部分ですか？',
      gift: 'まず使える強みを一つだけ言葉にし、相談者自身の具体例を聞きます。',
      shadow: '課題は固定された性格ではなく、繰り返し出るパターンとしてやさしく伝えます。',
      nextResource: '休息、行動、表現、境界線、支援の中から、まず整える資源を一つ選びます。',
      nextRole: '今いちばん疲れる役割を聞き、その役割を少しゆるめるところから始めます。',
      nextAstro: '助言の前に、方向性、感情の安全、関係性の動きを分けて見ます。',
      nextHd: '最近の決断を一つ振り返り、身体、感情、思考のどれが先に答えたかを見ます。',
      nextMaya: '導き、支え、挑戦、隠れた力を、実際の人や出来事に結びつけます。',
      nextNumerology: '最近繰り返された場面を一つ選び、そこからパターンに名前をつけます。',
      nextTarot: 'カードが自分、相手、二人の間の空気のどれに近いかを聞きます。',
      nextRunes: 'ルーンを今日試せる小さな調整に変えます。',
      nextDailySentence: '今日持ち帰る一文を相談者に選んでもらいます。',
      nextDailyAction: '今日できる小さな行動に落とし込みます。',
      nextDailyNourishment: '今日必要な心の養分を一語で選んでもらいます。',
    },
    ko: {
      scene: (tool) => `${tool} 는 먼저 생활 장면으로 풀어 설명하고, 고객이 이해한 뒤에 전문 용어를 더합니다.`,
      stuck: '막힌 지점은 결함이 아니라 관찰할 수 있는 패턴으로 다룹니다.',
      teacherLine: '이 내용 중 지금 일상에서 가장 크게 느껴지는 부분은 무엇인가요?',
      gift: '먼저 사용할 수 있는 강점을 하나만 말하고, 고객의 실제 예시를 들어 봅니다.',
      shadow: '과제는 고정된 성격이 아니라 반복되는 패턴으로 부드럽게 말합니다.',
      nextResource: '휴식, 행동, 표현, 경계, 지원 중 먼저 조정할 삶의 자원을 하나 고릅니다.',
      nextRole: '지금 가장 피곤한 역할을 묻고, 그 역할을 먼저 조금 느슨하게 합니다.',
      nextAstro: '조언 전에 방향, 정서적 안전감, 관계 역학을 나누어 봅니다.',
      nextHd: '최근 결정 하나를 돌아보며 몸, 감정, 생각 중 무엇이 먼저 답했는지 봅니다.',
      nextMaya: '인도, 지원, 도전, 숨은 힘을 실제 사람이나 사건과 연결합니다.',
      nextNumerology: '최근 반복된 상황 하나를 찾아 그 패턴에 이름을 붙입니다.',
      nextTarot: '카드가 고객, 상대, 두 사람 사이의 분위기 중 무엇에 가까운지 묻습니다.',
      nextRunes: '룬을 오늘 시도할 수 있는 작은 조정으로 바꿉니다.',
      nextDailySentence: '오늘 가져갈 한 문장을 고객이 고르게 합니다.',
      nextDailyAction: '오늘 할 수 있는 작은 행동으로 바꿉니다.',
      nextDailyNourishment: '오늘 필요한 내면의 양분을 한 단어로 말하게 합니다.',
    },
  };
  const g = genericByLocale[locale as Exclude<Locale, 'zh-TW'>] ?? genericByLocale.en;
  const make = (meaning: string, tool: TeacherBriefSource, next: string) => ({
    meaning,
    scene: g.scene(sourceLabels[tool]),
    stuck: g.stuck,
    teacherLine: g.teacherLine,
    gift: g.gift,
    shadow: g.shadow,
    next,
  });
  return {
    bazi: make(t.notDirection, 'bazi', g.nextResource),
    ziwei: make(t.role, 'ziwei', g.nextRole),
    astro: make(t.alignment, 'astro', g.nextAstro),
    humandesign: make(t.rhythm, 'humandesign', g.nextHd),
    maya: make(t.alignment, 'maya', g.nextMaya),
    numerology: make(t.pattern, 'numerology', g.nextNumerology),
    tarot: make(t.image, 'tarot', g.nextTarot),
    runes: make(t.image, 'runes', g.nextRunes),
    daily_tarot: make(t.daily, 'daily_tarot', g.nextDailySentence),
    daily_runes: make(t.daily, 'daily_runes', g.nextDailyAction),
    daily_stone: make(t.daily, 'daily_stone', g.nextDailyNourishment),
  };
}

function makeBriefLocaleCopy(locale: Locale): BriefLocaleCopy {
  const labels = SOURCE_LABELS_BY_LOCALE[locale] ?? SOURCE_LABELS_BY_LOCALE[DEFAULT_LOCALE];
  if (locale === 'zh-TW') {
    return {
      sourceLabels: labels,
      issuePrefixes: { topic: '想問主題：', pain: '目前卡點：', goal: '這次想帶走：', note: '客人補充：' },
      issueFallbacks: { topic: '尚未選擇主題', pain: '尚未說明卡點', goal: '先把問題看清楚' },
      copySections: {
        title: '老師解盤工作台',
        source: '來源',
        subject: '主題',
        plainGuide: '完全白話導讀',
        oneLiner: '一句話切入',
        breakdown: '拆解再拆解',
        clientIntent: '客人來意',
        coreSummary: '核心摘要',
        chartHighlights: '盤面重點',
        strengths: '天賦與優勢',
        shadows: '卡點與陰影',
        questions: '適合問的問題',
        avoidSayings: '諮詢中要避免的說法',
        sop: '諮詢 SOP',
        script: '說法',
        ask: '提問',
        note: '注意',
        origin: '來源',
      },
      cardLabels: { understand: '先了解客人', oneLine: '一句話翻譯', scene: '生活畫面', stuck: '卡住時', next: '下一句' },
      cardTitles: { understandFallback: '先問清楚，不急著解盤', oneLine: '先讓客人聽懂', scene: '可能就是這種感覺', stuck: '不要說成缺點', next: '老師可以這樣問' },
      breakdownLabels: ['第一層｜先了解客人', '第二層｜生活畫面', '第三層｜命理依據', '第四層｜卡點翻譯', '第五層｜老師追問', '第六層｜落地行動'],
      uiWords: {
        noQuestion: '客人尚未填寫問題，建議先從最近最想被理解的生活面向開始。',
        structuredUnderstand: (topic, pain, goal, note) => `先不要急著解盤。老師可以先回覆：「我聽到你想看 ${topic}，最卡的是 ${pain}，這次想帶走 ${goal}。我們會用盤面找出這個卡點怎麼形成、怎麼鬆開。」${note ? ` 客人補充的是：「${note}」` : ''}`,
        unstructuredUnderstand: '客人還沒有把問題說完整。第一步先問清楚：想問哪個面向、現在卡在哪裡、這次希望帶走方向還是安定感。',
        issueSummaryStructured: (topic, pain, goal) => `客人想看「${topic}」，目前卡在「${pain}」，希望這次帶走「${goal}」。`,
        issueSummaryPlain: (raw) => `客人用自己的話說：「${raw}」`,
        issueSummaryMissing: '客人還沒有把問題說清楚，老師第一步要先陪他整理「想問什麼、卡在哪裡、想帶走什麼」。',
        openingFromNote: (note) => `你剛剛說「${note}」，這件事裡最讓你卡住的是哪一小段？`,
        openingFromStructured: (topic, pain) => `你選了「${topic}」和「${pain}」，可以先跟我說最近最明顯的一個例子嗎？`,
        openingMissing: '你今天最想先被理解的是哪一件事？',
        coreIntentMissing: '客人還沒把問題說清楚，所以先用輕一點的方式陪他說出近況。',
        rawClues: '命理原始線索：',
        teacherNote: (topic, pain) => `老師備註：先讓客人聽懂和點頭，再補術語。這次要優先服務「${topic}」與「${pain}」，不要急著證明盤很準。`,
        actionByGoal: (goal, next) => `對齊客人想帶走的「${goal}」，再收成一個今天做得到的小動作。${next}`,
        painByIssue: (pain, stuck) => `客人說卡在「${pain}」，可以用盤面看這個卡點比較像能量耗損、關係拉扯、決策不清，還是節奏失衡。${stuck}`,
        strengthByIssue: (topic) => `針對客人問題的亮點：在「${topic}」這題上，先找出客人其實已經做得到、只是還沒穩定使用的能力。`,
        shadowByIssue: (pain) => `針對客人問題的卡點：先把「${pain}」說成可觀察的模式，不要說成個性缺陷。`,
        questionByPain: (pain) => `如果這次只先處理「${pain}」，你最希望哪一小段先變輕？`,
        questionByGoal: (goal) => `你說想帶走「${goal}」，那對你來說什麼樣的答案才算有幫助？`,
        avoidYouAre: '你就是這樣的人。',
        avoidFate: '這個盤已經決定你的未來。',
        avoidGuarantee: '你只要照我說的做就會好。',
      },
      sopLabels: { opening: '開場', gift: '天賦', shadow: '陰影', action: '行動', closing: '收尾' },
      sopStages: {
        opening: {
          title: '01 先了解客人，不急著解盤',
          intent: '先讓客人知道：老師真的有聽懂他的問題，命盤只是後面用來找方向的工具。',
          scriptStructured: (topic, pain, goal, tool) => `我先確認一下：你這次主要想看「${topic}」，目前最卡的是「${pain}」，希望帶走「${goal}」。我會先聽你講一個例子，再用「${tool}」幫你找卡住的位置。`,
          scriptFallback: (tool) => `我們先不用命理術語。我會先陪你把事情講清楚，「${tool}」只是幫我們找方向，不是要判斷你對或錯。`,
          questions: ['你今天比較想先得到方向，還是先被理解？'],
          notes: '開場越簡單越好。先複述客人的問題，等他覺得「有被懂」，再進入盤面。',
        },
        gift: { title: '02 先說一個客人聽得懂的亮點', intent: '用生活語言說優勢，讓客人先有「我被懂了」的感覺。', script: (anchor) => `我先講一個生活化版本：${anchor} 不是標籤，它比較像你本來就有的一種能力。用得順的時候，你會比較知道自己該怎麼走。`, questions: ['這句話比較像你的工作、關係，還是你對自己的感覺？'], notes: '只講一個亮點。讓客人自己補生活例子，比老師講很多更有說服力。' },
        shadow: { title: '03 再說卡點，但不要刺傷客人', intent: '把卡住說成「模式」，不要說成「缺點」。', script: '接下來我會講得輕一點。這不是說你有問題，而是有一個模式可能最近一直重複出現。你先聽聽看像不像就好。', questions: ['你聽到這裡，是覺得有點被說中，還是有點抗拒？'], notes: '避免「你的問題是」。改成「你可能常遇到」或「我們可以觀察看看」。' },
        action: { title: '04 收成一個小行動', intent: '把解盤收成一件今天或這週真的做得到的事。', script: '如果今天只帶走一件事，我會希望它很小、很做得到。你先不用改變整個人生，只要先練習一個小動作。', questions: ['接下來一週，你願意先練習哪一個小改變？', '你要怎麼提醒自己真的做一次？'], notes: '不要塞太多作業。一個行動就好，越小越容易做到。' },
        closing: { title: '05 收尾留下一句記得住的話', intent: '讓客人離開時覺得被理解，而不是被資訊淹沒。', script: '今天我們看見的是一張地圖，不是判決書。你不用一次把自己修好，只要把最有感的一句話帶走，慢慢觀察它怎麼在生活裡出現。', questions: ['今天哪一句話最需要被你帶走？', '現在你的身體或心情，和剛開始相比有什麼不同？'], notes: '收尾不要再加新資訊。幫客人整理一句話，會比再講十個重點更有記憶點。' },
      },
      beginner: ZH_BEGINNER,
      detail: {
        teacherDeepPrep: '老師深度備課',
        humanDesignTitle: '人類圖閘門深讀：已開、未開與懸掛閘門',
        humanDesignIntro: '先用人話講：已開像比較常亮的開關，未開不是缺點，而是比較容易被別人或環境打開。老師先連回客人的問題，再補閘門名稱。',
        missingTitle: '未啟動對面閘門：容易被誰或什麼情境勾動',
        missingIntro: '這些不是客人的固定設定，而是關係、工作場域或合作對象可能帶來的放大器。適合拿來問「你最近是不是常被這類人事物牽動」。',
        channelTitle: '完整通道：比較穩定的天賦迴路',
        channelIntro: '完整通道比單一閘門更穩定，可以優先放進老師的解盤主軸；但仍要回到類型、策略與權威，不要把通道講成命令。',
        activeFixed: '已開・比較固定',
        activeHalf: '已開・半開的開關',
        missingLabel: '未開・容易被場域觸發',
        channelLabel: '完整通道',
        bodyIntro: '先翻成人話',
        fixedSwitch: (partner) => `對面的第 ${partner} 閘門也有啟動，像兩個開關都接上了，這個主題比較穩定，常會自然出現在他的生活裡。`,
        halfSwitch: (partner) => `對面的第 ${partner} 閘門沒有固定啟動，像只有一半接上的開關：自己會很有感，但容易被有第 ${partner} 閘門的人、關係或工作場域放大。`,
        issueFocus: (topic, pain) => `放回客人的問題看：他現在想處理「${topic}」，又卡在「${pain}」，所以這個閘門不要講成知識點，要問它最近怎麼影響他的選擇、關係或行動。`,
        lifeFocus: '放回生活看：不要先講術語，先問這個主題最近在哪件事裡最明顯。',
        teacherQuestion: '老師問法：「這個主題最近是在工作、關係，還是你對自己的感覺裡最明顯？」',
        missingBody: '不是少了這個能力，而是這個開關不固定。遇到有這個閘門的人或環境時，這個主題會被放大。老師可以說：「這不一定是你每天固定出現的樣子，但某些人事物靠近時，它會被打開。」',
        channelBody: '兩端都啟動時，像一條線路接完整了。這不只是偶爾有感，而是比較常出現的運作方式。老師可以先問它在客人的問題裡是幫助、慣性，還是壓力下的反應。',
        noPartner: '這個閘門沒有找到明確對應端，先以所在中心與行星來源解讀。',
      },
    };
  }

  const translatedBeginner = buildTranslatedBeginner(locale, labels);
  const enLike = locale === 'en';
  const languagePack = {
    en: {
      topic: 'Topic: ', pain: 'Current block: ', goal: 'Takeaway: ', note: 'Client note: ',
      understand: 'Understand the client first', oneLine: 'Plain translation', scene: 'Life scene', stuck: 'When stuck', next: 'Next question',
      guide: 'Guide prep desk', noTopic: 'No topic selected', noPain: 'No block described', noGoal: 'Clarify the question first',
      noQuestion: 'The member has not written a question yet. Start with the life area where they most want to be understood.',
      source: 'Source', subject: 'Subject', plainGuide: 'Beginner-friendly guide', oneLiner: 'One-line opening', breakdown: 'Layer-by-layer breakdown', clientIntent: 'Client intent', coreSummary: 'Core summary', chartHighlights: 'Chart signals', strengths: 'Gifts and strengths', shadows: 'Blocks and shadows', questions: 'Useful questions', avoid: 'Avoid saying', sop: 'Consultation SOP',
      rawClues: 'Original chart signals:',
      dailyPrefix: 'Today',
    },
    vi: {
      topic: 'Chủ đề muốn hỏi: ', pain: 'Điểm đang kẹt: ', goal: 'Muốn mang về: ', note: 'Ghi chú của khách: ',
      understand: 'Hiểu khách trước', oneLine: 'Diễn giải dễ hiểu', scene: 'Bối cảnh đời sống', stuck: 'Khi bị kẹt', next: 'Câu hỏi tiếp theo',
      guide: 'Bàn chuẩn bị của guide', noTopic: 'Chưa chọn chủ đề', noPain: 'Chưa mô tả điểm kẹt', noGoal: 'Trước tiên làm rõ câu hỏi',
      noQuestion: 'Khách chưa viết rõ câu hỏi. Hãy bắt đầu từ lĩnh vực họ muốn được thấu hiểu nhất.',
      source: 'Nguồn', subject: 'Chủ đề', plainGuide: 'Diễn giải cho người mới', oneLiner: 'Câu mở đầu', breakdown: 'Tách từng lớp', clientIntent: 'Ý định của khách', coreSummary: 'Tóm tắt chính', chartHighlights: 'Tín hiệu lá số', strengths: 'Năng lực và điểm mạnh', shadows: 'Điểm kẹt và bóng tối', questions: 'Câu hỏi nên dùng', avoid: 'Tránh nói', sop: 'Quy trình tư vấn',
      rawClues: 'Tín hiệu gốc từ lá số:',
      dailyPrefix: 'Hôm nay',
    },
    id: {
      topic: 'Topik yang ingin ditanya: ', pain: 'Bagian yang macet: ', goal: 'Yang ingin dibawa pulang: ', note: 'Catatan klien: ',
      understand: 'Pahami klien dulu', oneLine: 'Terjemahan sederhana', scene: 'Gambaran hidup', stuck: 'Saat macet', next: 'Pertanyaan berikutnya',
      guide: 'Meja persiapan guide', noTopic: 'Topik belum dipilih', noPain: 'Hambatan belum dijelaskan', noGoal: 'Perjelas pertanyaan dulu',
      noQuestion: 'Klien belum menulis pertanyaan. Mulailah dari area hidup yang paling ingin dipahami.',
      source: 'Sumber', subject: 'Subjek', plainGuide: 'Panduan ramah pemula', oneLiner: 'Kalimat pembuka', breakdown: 'Uraian bertahap', clientIntent: 'Niat klien', coreSummary: 'Ringkasan inti', chartHighlights: 'Sinyal bagan', strengths: 'Bakat dan kekuatan', shadows: 'Hambatan dan bayangan', questions: 'Pertanyaan yang cocok', avoid: 'Hindari mengatakan', sop: 'SOP konsultasi',
      rawClues: 'Sinyal asli dari bagan:',
      dailyPrefix: 'Hari ini',
    },
    ja: {
      topic: '相談テーマ：', pain: '今つまずいている点：', goal: '持ち帰りたいこと：', note: '相談者メモ：',
      understand: 'まず相談者を理解する', oneLine: 'やさしい一言訳', scene: '生活の場面', stuck: 'つまずく時', next: '次の質問',
      guide: '鑑定準備デスク', noTopic: 'テーマ未選択', noPain: 'つまずき未記入', noGoal: 'まず問いを明確にする',
      noQuestion: '相談者の質問がまだ明確ではありません。まず理解されたい生活領域から始めます。',
      source: 'ソース', subject: 'テーマ', plainGuide: '初心者向け導読', oneLiner: '一言の切り口', breakdown: '段階的な分解', clientIntent: '相談者の意図', coreSummary: '核心まとめ', chartHighlights: '盤面のサイン', strengths: '才能と強み', shadows: 'つまずきと影', questions: '使いやすい質問', avoid: '避けたい言い方', sop: '相談 SOP',
      rawClues: '元の盤面サイン：',
      dailyPrefix: '今日',
    },
    ko: {
      topic: '질문 주제: ', pain: '현재 막힌 지점: ', goal: '가져가고 싶은 것: ', note: '고객 메모: ',
      understand: '먼저 고객 이해하기', oneLine: '쉬운 한 줄 번역', scene: '생활 장면', stuck: '막힐 때', next: '다음 질문',
      guide: '상담 준비 데스크', noTopic: '주제 미선택', noPain: '막힌 지점 미기재', noGoal: '질문부터 명확히 하기',
      noQuestion: '고객의 질문이 아직 명확하지 않습니다. 먼저 이해받고 싶은 생활 영역부터 확인합니다.',
      source: '출처', subject: '주제', plainGuide: '초보자도 이해하는 안내', oneLiner: '한 줄 시작점', breakdown: '단계별 분해', clientIntent: '고객 의도', coreSummary: '핵심 요약', chartHighlights: '차트 신호', strengths: '재능과 강점', shadows: '막힘과 그림자', questions: '좋은 질문', avoid: '피해야 할 표현', sop: '상담 SOP',
      rawClues: '원래 차트 신호:',
      dailyPrefix: '오늘',
    },
  }[locale as Exclude<Locale, 'zh-TW'>];
  return {
    sourceLabels: labels,
    issuePrefixes: { topic: languagePack.topic, pain: languagePack.pain, goal: languagePack.goal, note: languagePack.note },
    issueFallbacks: { topic: languagePack.noTopic, pain: languagePack.noPain, goal: languagePack.noGoal },
    copySections: {
      title: languagePack.guide,
      source: languagePack.source,
      subject: languagePack.subject,
      plainGuide: languagePack.plainGuide,
      oneLiner: languagePack.oneLiner,
      breakdown: languagePack.breakdown,
      clientIntent: languagePack.clientIntent,
      coreSummary: languagePack.coreSummary,
      chartHighlights: languagePack.chartHighlights,
      strengths: languagePack.strengths,
      shadows: languagePack.shadows,
      questions: languagePack.questions,
      avoidSayings: languagePack.avoid,
      sop: languagePack.sop,
      script: enLike ? 'Script' : languagePack.oneLine,
      ask: enLike ? 'Ask' : languagePack.questions,
      note: enLike ? 'Note' : languagePack.next,
      origin: enLike ? 'Origin' : languagePack.source,
    },
    cardLabels: { understand: languagePack.understand, oneLine: languagePack.oneLine, scene: languagePack.scene, stuck: languagePack.stuck, next: languagePack.next },
    cardTitles: { understandFallback: languagePack.noGoal, oneLine: languagePack.plainGuide, scene: languagePack.scene, stuck: languagePack.stuck, next: languagePack.next },
    breakdownLabels: enLike ? ['Layer 1 | Understand', 'Layer 2 | Life scene', 'Layer 3 | Chart clue', 'Layer 4 | Block translation', 'Layer 5 | Guide question', 'Layer 6 | Grounded action'] : [languagePack.understand, languagePack.scene, languagePack.chartHighlights, languagePack.shadows, languagePack.questions, languagePack.sop],
    uiWords: {
      noQuestion: languagePack.noQuestion,
      structuredUnderstand: (topic, pain, goal, note) => `${languagePack.understand}: ${topic} / ${pain} / ${goal}. ${note ? `${languagePack.note}${note}` : ''}`,
      unstructuredUnderstand: languagePack.noQuestion,
      issueSummaryStructured: (topic, pain, goal) => `${languagePack.topic}${topic} ${languagePack.pain}${pain} ${languagePack.goal}${goal}`,
      issueSummaryPlain: (raw) => `${languagePack.note}${raw}`,
      issueSummaryMissing: languagePack.noQuestion,
      openingFromNote: (note) => `${languagePack.note}${note} What part feels most stuck right now?`,
      openingFromStructured: (topic, pain) => `${languagePack.topic}${topic} ${languagePack.pain}${pain} Can you share one real recent example?`,
      openingMissing: languagePack.noQuestion,
      coreIntentMissing: languagePack.noQuestion,
      rawClues: languagePack.rawClues,
      teacherNote: (topic, pain) => `${languagePack.understand}: keep the reading focused on ${topic} and ${pain}; let the member nod before adding technical terms.`,
      actionByGoal: (goal, next) => `${languagePack.goal}${goal}. ${next}`,
      painByIssue: (pain, stuck) => `${languagePack.pain}${pain}. ${stuck}`,
      strengthByIssue: (topic) => `${languagePack.strengths}: connect the chart back to ${topic} and name one ability the member can already use.`,
      shadowByIssue: (pain) => `${languagePack.shadows}: describe ${pain} as an observable pattern, not a flaw.`,
      questionByPain: (pain) => `${languagePack.pain}${pain} Which small part would you like to feel lighter first?`,
      questionByGoal: (goal) => `${languagePack.goal}${goal} What kind of answer would actually help you?`,
      avoidYouAre: enLike ? 'You are just this kind of person.' : `${languagePack.avoid}: fixed identity labels.`,
      avoidFate: enLike ? 'This chart has decided your future.' : `${languagePack.avoid}: fixed fate claims.`,
      avoidGuarantee: enLike ? 'If you do exactly what I say, everything will be fine.' : `${languagePack.avoid}: guarantees.`,
    },
    sopLabels: enLike ? { opening: 'Opening', gift: 'Gift', shadow: 'Shadow', action: 'Action', closing: 'Closing' } : { opening: '01', gift: '02', shadow: '03', action: '04', closing: '05' },
    sopStages: {
      opening: {
        title: enLike ? '01 Understand the client before reading' : `${languagePack.understand}`,
        intent: languagePack.noQuestion,
        scriptStructured: (topic, pain, goal, tool) => `${languagePack.topic}${topic} ${languagePack.pain}${pain} ${languagePack.goal}${goal}. I will first listen to one example, then use ${tool} to locate where this pattern is forming.`,
        scriptFallback: (tool) => `We do not need technical terms first. I will help you clarify the situation, then use ${tool} as a map rather than a judgment.`,
        questions: ['What answer do you most want to leave with today?'],
        notes: 'Repeat the client question first. Do not show expertise before the client feels understood.',
      },
      gift: { title: enLike ? '02 Name one usable strength' : languagePack.strengths, intent: languagePack.strengths, script: (anchor) => `${anchor} is not a label. It points to one ability that works better when used at the right pace.`, questions: ['Where does this show up most clearly: work, relationships, or self-image?'], notes: 'Name one strength and let the member give the real example.' },
      shadow: { title: enLike ? '03 Name the block gently' : languagePack.shadows, intent: languagePack.shadows, script: 'I will say this gently: this is not a flaw. It looks more like a repeated pattern we can observe together.', questions: ['Does this feel accurate, or does part of you resist it?'], notes: 'Use “you may notice” instead of “you are”.' },
      action: { title: enLike ? '04 Close with one small action' : languagePack.sop, intent: languagePack.sop, script: 'Let us make this small enough to try this week. You do not need to change your whole life today.', questions: ['What is one small change you are willing to try this week?'], notes: 'One action is enough.' },
      closing: { title: enLike ? '05 Leave one sentence' : languagePack.next, intent: languagePack.next, script: 'Today we saw a map, not a verdict. Take the sentence that feels most alive and watch how it appears in daily life.', questions: ['Which sentence do you want to carry after today?'], notes: 'Do not add new information during closing.' },
    },
    beginner: translatedBeginner,
    detail: {
      teacherDeepPrep: enLike ? 'Guide deep prep' : languagePack.chartHighlights,
      humanDesignTitle: enLike ? 'Human Design gates: active, open, and hanging themes' : `${labels.humandesign} gates`,
      humanDesignIntro: enLike ? 'Plain version: active gates are lights that turn on often; open gates are not weaknesses, they are switches that can be activated by people and environments.' : `${labels.humandesign}: explain gates as switches, not labels.`,
      missingTitle: enLike ? 'Open counterpart gates: what situations may activate them' : `${labels.humandesign}: open counterpart gates`,
      missingIntro: enLike ? 'These are not fixed settings. They are amplifiers that may appear around certain people, workplaces, or relationships.' : 'These are situational amplifiers, not fixed identity.',
      channelTitle: enLike ? 'Defined channels: more stable energy circuits' : `${labels.humandesign}: channels`,
      channelIntro: enLike ? 'A full channel is more stable than one gate. Still return to type, strategy, and authority.' : 'Full channels are steadier patterns; keep them practical.',
      activeFixed: enLike ? 'Active · steadier pattern' : 'Active',
      activeHalf: enLike ? 'Active · half switch' : 'Half switch',
      missingLabel: enLike ? 'Open · activated by field' : 'Open',
      channelLabel: enLike ? 'Defined channel' : 'Channel',
      bodyIntro: enLike ? 'Plain version' : languagePack.plainGuide,
      fixedSwitch: (partner) => `Gate ${partner} is also active, like both switches are connected. This theme is more stable and may appear naturally in daily life.`,
      halfSwitch: (partner) => `Gate ${partner} is not fixed, so this is like a half-connected switch: the member feels the theme, but people or places with Gate ${partner} can amplify it.`,
      issueFocus: (topic, pain) => `Bring it back to the client: this reading is about ${topic} and ${pain}, so ask how the gate affects choices, relationships, or action.`,
      lifeFocus: 'Bring it back to daily life before naming the gate.',
      teacherQuestion: 'Guide question: where is this theme most visible now: work, relationships, or how you feel about yourself?',
      missingBody: 'This does not mean the ability is missing. It means the switch is not fixed. Certain people or environments may turn it on.',
      channelBody: 'When both ends are active, the circuit is connected. Ask whether it helps the client, repeats as a habit, or appears under pressure.',
      noPartner: 'No clear counterpart was found; read this through its center and planet source.',
    },
  };
}

function briefCopyFor(locale: Locale = DEFAULT_LOCALE): BriefLocaleCopy {
  return makeBriefLocaleCopy(locale);
}

const HD_CENTER_LABELS: Record<string, string> = {
  Head: '頂輪',
  Ajna: '邏輯中心',
  Throat: '喉嚨中心',
  G: 'G 中心',
  Heart: '意志中心',
  Sacral: '薦骨中心',
  SolarPlexus: '情緒中心',
  Spleen: '脾臟中心',
  Root: '根部中心',
};

const HD_GATE_TO_CENTER: Record<number, string> = {
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

const HD_CHANNEL_PAIRS = [
  [64, 47], [61, 24], [63, 4],
  [17, 62], [43, 23], [11, 56],
  [16, 48], [20, 57], [20, 10], [20, 34], [31, 7], [8, 1],
  [33, 13], [35, 36], [12, 22], [45, 21],
  [25, 51], [10, 34], [10, 57], [15, 5], [2, 14], [46, 29],
  [40, 37], [26, 44],
  [34, 57], [59, 6], [9, 52], [3, 60], [42, 53], [27, 50],
  [22, 12], [30, 41], [55, 39], [49, 19],
  [44, 26], [32, 54], [28, 38], [18, 58],
] as const;

const HD_GATE_BRIEFS: Record<number, { title: string; body: string }> = {
  1: { title: '創造', body: '用獨特方式表達自己，當不急著證明時，創造力會自然被看見。' },
  2: { title: '方向', body: '對人生方向與資源接收敏感，適合先確認內在感受再前進。' },
  3: { title: '起始混沌', body: '新循環開始時容易混亂，但也能把混亂整理成新的秩序。' },
  4: { title: '解答', body: '會尋找邏輯答案，也要辨認問題是否真的屬於自己。' },
  5: { title: '節奏', body: '需要穩定節奏與規律，節奏被打亂時能量容易消耗。' },
  6: { title: '情緒邊界', body: '關係中的親近與距離很重要，情緒清楚後再承諾會更穩。' },
  7: { title: '角色方向', body: '容易感覺群體方向與角色，適合以服務整體的方式帶路。' },
  8: { title: '貢獻風格', body: '透過個人風格帶來貢獻，越真實越容易吸引適合的舞台。' },
  9: { title: '專注', body: '有細節專注力，適合把注意力放在少數真正重要的事情上。' },
  10: { title: '自我行為', body: '課題是活出真實自我，而不是只扮演別人期待的樣子。' },
  11: { title: '想法', body: '腦中有很多故事與靈感，適合分享啟發，但不必每個想法都立刻執行。' },
  12: { title: '謹慎表達', body: '表達需要對的情緒與時機；狀態對了，話語會很有感染力。' },
  13: { title: '聆聽', body: '容易承接別人的故事，適合成為理解者，也要保護自己的情緒容量。' },
  14: { title: '資源動能', body: '有把能量投入資源與工作的能力，重點是投入真正有回應的方向。' },
  15: { title: '極端節奏', body: '節奏可能不固定，適合接納變化，同時找到可持續的生活框架。' },
  16: { title: '技藝熱情', body: '適合透過練習養成技能，熱情加上重複會變成真正的才華。' },
  17: { title: '觀點', body: '擅長形成觀點與分類，但需要用溫和方式讓別人願意聽見。' },
  18: { title: '修正', body: '能看見可改善之處，重點是讓批判變成修正，而不是挑剔。' },
  19: { title: '需求敏感', body: '對歸屬、親密與資源需求敏感，適合誠實說出需要。' },
  20: { title: '當下', body: '需要活在此刻，身體在場時，表達與行動會更精準。' },
  21: { title: '掌控', body: '需要在資源與責任中有掌控感，適合清楚談條件與界線。' },
  22: { title: '優雅情緒', body: '魅力與情緒狀態連動，狀態對了自然有吸引力。' },
  23: { title: '簡化', body: '能把複雜洞見說得簡單，但需要等待他人準備好接收。' },
  24: { title: '反覆思考', body: '會反覆咀嚼靈感，直到它變成可理解的答案。' },
  25: { title: '純真', body: '力量在於不帶條件的心與真誠，也要學會保護自己。' },
  26: { title: '影響與說服', body: '擅長包裝價值與說服他人，誠實會讓影響力更長久。' },
  27: { title: '照顧', body: '有照顧與滋養的本能，也要記得先讓自己有足夠能量。' },
  28: { title: '生命意義', body: '會追問值得不值得，當找到意義時能非常有韌性。' },
  29: { title: '承諾', body: '有投入經驗的力量，但承諾前需要確認身體真的願意。' },
  30: { title: '渴望', body: '容易被強烈渴望推動，適合把慾望看成方向訊號而不是命令。' },
  31: { title: '領導之聲', body: '能透過表達帶領群體，但真正的領導需要被群體認可。' },
  32: { title: '延續', body: '對可持續性和風險有敏銳度，適合判斷什麼值得長期投入。' },
  33: { title: '退隱回顧', body: '需要時間消化經驗；退一步整理後，故事才會變成智慧。' },
  34: { title: '強大動能', body: '生命動能強，適合投入有回應的事，避免為了忙而忙。' },
  35: { title: '經驗變化', body: '渴望新經驗，重點是讓每次變化都帶來成熟，而不是只追求刺激。' },
  36: { title: '情緒經驗', body: '在未知與情緒波動中學習，越能放慢，越能穿越混亂。' },
  37: { title: '家庭與承諾', body: '重視互惠、情感安全與承諾，關係中的公平會影響穩定感。' },
  38: { title: '奮戰', body: '會為有意義的事情奮戰，先確認值得，力量才不會浪費。' },
  39: { title: '挑動', body: '可能觸動他人的情緒或創意，目的不是挑釁，而是喚醒真正感受。' },
  40: { title: '獨立與休息', body: '需要在承諾與獨處間取得平衡，休息會讓意志力回來。' },
  41: { title: '想像起點', body: '是情緒經驗的起點，想像力會推動你走向新的故事。' },
  42: { title: '完成循環', body: '適合把開始的事情走到完成，完成後才知道經驗真正帶來什麼。' },
  43: { title: '突破洞見', body: '有突如其來的洞見，但需要等待對的時機與語言讓人聽懂。' },
  44: { title: '模式辨識', body: '能感覺過去模式是否會重演，適合辨認人與合作的可靠度。' },
  45: { title: '資源管理', body: '適合管理資源與分配價值，真正的安全感來自互惠而不是佔有。' },
  46: { title: '身體之愛', body: '成長透過身體與經驗發生，適合相信自己正在對的位置學習。' },
  47: { title: '理解壓力', body: '會把混亂片段整理成理解，別急著在壓力中立刻得出結論。' },
  48: { title: '深度', body: '有追求深度與專業的潛力，也要避免因覺得自己不夠好而停住。' },
  49: { title: '原則', body: '對關係中的原則很敏感，當價值不合時會需要重新定義界線。' },
  50: { title: '價值守護', body: '關心責任、照顧與倫理，適合建立讓人安心的規範。' },
  51: { title: '震撼啟動', body: '可能透過突發事件被喚醒，真正的勇氣是回到心的方向。' },
  52: { title: '靜止', body: '需要停下來集中能量；靜止不是沒進展，而是在累積定力。' },
  53: { title: '開始', body: '有開啟新循環的壓力，開始前先確認是否有資源走完。' },
  54: { title: '野心', body: '有向上提升的動力，適合把野心放進清楚合作與長期策略。' },
  55: { title: '豐盛情緒', body: '精神狀態影響豐盛感，情緒自由比外在擁有更重要。' },
  56: { title: '故事旅行', body: '適合用故事、經驗與敘事啟發他人，分享前先消化自己的感受。' },
  57: { title: '直覺清明', body: '有當下的生存直覺，越安靜越能聽見真正的身體訊號。' },
  58: { title: '生命喜悅', body: '會想改善生活並追求活力，批判背後其實是想讓事情更好。' },
  59: { title: '親密破冰', body: '能打開親密與合作的入口，也需要尊重自己與對方的界線。' },
  60: { title: '限制', body: '會感覺到限制，但限制也能逼出新的形式與突破。' },
  61: { title: '內在真理', body: '會追問不可見的真理，答案需要時間在內在慢慢成形。' },
  62: { title: '細節表達', body: '能把細節說清楚，適合用精準語言讓抽象想法落地。' },
  63: { title: '懷疑', body: '懷疑能幫助檢查邏輯，重點是把懷疑變成驗證，而不是焦慮。' },
  64: { title: '未解之謎', body: '腦中常有大量片段與疑問，需要時間讓靈感自己拼成意義。' },
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
  return '';
}

function firstText(source: Record<string, unknown>, keys: string[], fallback = '') {
  for (const key of keys) {
    const value = text(source[key]);
    if (value) return value;
  }
  return fallback;
}

function parseClientIssueContext(rawValue: string, locale: Locale = DEFAULT_LOCALE): ClientIssueContext {
  const raw = text(rawValue);
  const lines = raw.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const prefixSets = [briefCopyFor(locale), ...LOCALES.filter((item) => item !== locale).map((item) => briefCopyFor(item))]
    .map((copy) => copy.issuePrefixes);
  const readLine = (key: keyof BriefLocaleCopy['issuePrefixes']) => {
    for (const prefixes of prefixSets) {
      const prefix = prefixes[key];
      const hit = lines.find((line) => line.startsWith(prefix));
      if (hit) return hit.slice(prefix.length).trim();
    }
    return '';
  };
  const copy = briefCopyFor(locale);
  const topicLabel = readLine('topic');
  const painLabel = readLine('pain');
  const goalLabel = readLine('goal');
  const freeText = readLine('note') || (!topicLabel && !painLabel && !goalLabel ? raw : '');

  return {
    raw,
    topicLabel: topicLabel || copy.issueFallbacks.topic,
    painLabel: painLabel || copy.issueFallbacks.pain,
    goalLabel: goalLabel || copy.issueFallbacks.goal,
    freeText,
    hasStructuredContext: Boolean(topicLabel || painLabel || goalLabel),
  };
}

function clientIssueSummary(issue: ClientIssueContext, locale: Locale = DEFAULT_LOCALE) {
  const copy = briefCopyFor(locale);
  if (issue.hasStructuredContext) {
    return copy.uiWords.issueSummaryStructured(issue.topicLabel, issue.painLabel, issue.goalLabel);
  }
  if (issue.raw && !issue.raw.includes('尚未填寫')) return copy.uiWords.issueSummaryPlain(issue.raw);
  return copy.uiWords.issueSummaryMissing;
}

function clientIssueOpeningQuestion(issue: ClientIssueContext, locale: Locale = DEFAULT_LOCALE) {
  const copy = briefCopyFor(locale);
  if (issue.freeText) {
    return copy.uiWords.openingFromNote(issue.freeText);
  }
  if (issue.hasStructuredContext) {
    return copy.uiWords.openingFromStructured(issue.topicLabel, issue.painLabel);
  }
  return copy.uiWords.openingMissing;
}

function joinKnown(values: Array<string | number | null | undefined>, separator = '、') {
  return values.map((item) => text(item)).filter(Boolean).join(separator);
}

function nestedMeaning(draw: Record<string, unknown>, source: Record<string, unknown>) {
  const direct = text(draw.meaning);
  if (direct) return direct;
  const position = text(draw.position);
  const upright = record(source.upright);
  const reversed = record(source.reversed);
  return position === 'reversed'
    ? firstText(reversed, ['text', 'meaning'], '這個位置提醒先看阻礙與需要重新整理的地方。')
    : firstText(upright, ['text', 'meaning'], '這個位置提醒先看可用資源與下一步。');
}

function keywordsFrom(draw: Record<string, unknown>, source: Record<string, unknown>) {
  const direct = list(draw.keywords).map(text).filter(Boolean);
  if (direct.length) return direct;
  const sourceKeywords = list(source.keywords).map(text).filter(Boolean);
  return sourceKeywords.length ? sourceKeywords : [];
}

function gateNumber(value: unknown): number | null {
  if (typeof value === 'number' && value >= 1 && value <= 64) return value;
  if (typeof value === 'string') {
    const match = value.match(/\d+/);
    if (!match) return null;
    const num = Number(match[0]);
    return num >= 1 && num <= 64 ? num : null;
  }
  const item = record(value);
  return gateNumber(item.gate ?? item.number ?? item.id);
}

function bodyGateRecords(source: unknown, layer: string) {
  return Object.entries(record(source))
    .map(([key, value]) => {
      const item = record(value);
      const gate = gateNumber(item.gate);
      if (!gate) return null;
      const label = firstText(item, ['label', 'planet', 'name'], key);
      const line = text(item.line);
      return { gate, label: `${layer}${label ? `・${label}` : ''}${line ? `・${line} 爻` : ''}` };
    })
    .filter(Boolean) as Array<{ gate: number; label: string }>;
}

function extractHumanDesignGateRecords(data: Record<string, unknown>) {
  const records = new Map<number, string[]>();
  const add = (gate: number | null, label: string) => {
    if (!gate) return;
    const existing = records.get(gate) ?? [];
    if (!existing.includes(label)) existing.push(label);
    records.set(gate, existing);
  };

  for (const raw of list(data.activatedGates ?? data.gates)) {
    const gate = gateNumber(raw);
    const item = record(raw);
    const sourceLabel = firstText(item, ['source', 'planet', 'label'], '啟動');
    const line = text(item.line);
    add(gate, `${sourceLabel}${line ? `・${line} 爻` : ''}`);
  }

  for (const item of bodyGateRecords(data.personalityBodies, '人格')) add(item.gate, item.label);
  for (const item of bodyGateRecords(data.designBodies, '設計')) add(item.gate, item.label);

  return records;
}

function normalizeChannelKey(value: unknown): string | null {
  if (Array.isArray(value) && value.length >= 2) {
    const a = gateNumber(value[0]);
    const b = gateNumber(value[1]);
    if (!a || !b) return null;
    return [a, b].sort((left, right) => left - right).join('-');
  }
  if (typeof value === 'string') {
    const matches = value.match(/\d+/g);
    if (!matches || matches.length < 2) return null;
    const a = gateNumber(matches[0]);
    const b = gateNumber(matches[1]);
    if (!a || !b) return null;
    return [a, b].sort((left, right) => left - right).join('-');
  }
  const item = record(value);
  const candidate = item.gates ?? item.channel ?? item.key;
  return candidate === undefined ? null : normalizeChannelKey(candidate);
}

function humanDesignGatePartner(gate: number) {
  const pairs = HD_CHANNEL_PAIRS
    .filter(([a, b]) => a === gate || b === gate)
    .map(([a, b]) => (a === gate ? b : a));
  return pairs[0] ?? null;
}

function humanDesignGateTitle(gate: number, locale: Locale = DEFAULT_LOCALE) {
  const brief = HD_GATE_BRIEFS[gate];
  if (locale === 'zh-TW') return brief ? `第 ${gate} 閘門｜${brief.title}` : `第 ${gate} 閘門`;
  return brief ? `Gate ${gate} | ${brief.title}` : `Gate ${gate}`;
}

function buildHumanDesignDetailSections(data: Record<string, unknown>, issue: ClientIssueContext, locale: Locale): TeacherDetailSection[] {
  const copy = briefCopyFor(locale).detail;
  const gateRecords = extractHumanDesignGateRecords(data);
  const activeGates = [...gateRecords.keys()].sort((a, b) => a - b);
  if (!activeGates.length) return [];

  const activeSet = new Set(activeGates);
  const definedChannelKeys = new Set(
    list(data.definedChannels ?? data.channels)
      .map(normalizeChannelKey)
      .filter(Boolean) as string[],
  );
  const allDefinedChannelKeys = new Set(
    HD_CHANNEL_PAIRS
      .filter(([a, b]) => activeSet.has(a) && activeSet.has(b))
      .map(([a, b]) => [a, b].sort((left, right) => left - right).join('-')),
  );
  const effectiveChannelKeys = new Set([...definedChannelKeys, ...allDefinedChannelKeys]);

  const activeItems: TeacherDetailItem[] = activeGates.map((gate) => {
    const brief = HD_GATE_BRIEFS[gate] ?? { title: '能量主題', body: '這個閘門描述一種被啟動的能量，需要放回類型、策略與權威下理解。' };
    const center = HD_CENTER_LABELS[HD_GATE_TO_CENTER[gate] ?? ''] ?? '未標示中心';
    const partner = humanDesignGatePartner(gate);
    const channelKey = partner ? [gate, partner].sort((a, b) => a - b).join('-') : '';
    const hasPartner = partner ? activeSet.has(partner) || effectiveChannelKeys.has(channelKey) : false;
    const partnerCopy = partner
      ? hasPartner
        ? copy.fixedSwitch(partner)
        : copy.halfSwitch(partner)
      : copy.noPartner;
    const issueCopy = issue.hasStructuredContext
      ? copy.issueFocus(issue.topicLabel, issue.painLabel)
      : copy.lifeFocus;
    return {
      label: hasPartner ? copy.activeFixed : copy.activeHalf,
      title: `${humanDesignGateTitle(gate, locale)}｜${center}`,
      body: `${copy.bodyIntro}：${locale === 'zh-TW' ? brief.body : copy.channelBody} ${partnerCopy} ${issueCopy} ${copy.teacherQuestion}`,
      meta: gateRecords.get(gate)?.join('、'),
    };
  });

  const missingPartnerItems: TeacherDetailItem[] = Array.from(new Set(
    activeGates
      .map(humanDesignGatePartner)
      .filter((gate) => gate !== null && !activeSet.has(gate)) as number[],
  )).slice(0, 12).map((gate) => {
    const brief = HD_GATE_BRIEFS[gate] ?? { title: '能量主題', body: '這個閘門描述一種可能被環境觸發的能量。' };
    const center = HD_CENTER_LABELS[HD_GATE_TO_CENTER[gate] ?? ''] ?? '未標示中心';
    return {
      label: copy.missingLabel,
      title: `${humanDesignGateTitle(gate, locale)}｜${center}`,
      body: `${copy.bodyIntro}：${copy.missingBody}${locale === 'zh-TW' ? ` ${brief.body}` : ''}`,
      meta: locale === 'zh-TW' ? '來自已啟動閘門的對面端，適合用來看關係互動與被觸發點。' : 'Counterpart of an active gate; useful for relationship and field activation.',
    };
  });

  const channelItems: TeacherDetailItem[] = Array.from(effectiveChannelKeys).slice(0, 8).map((key) => {
    const [left, right] = key.split('-').map(Number);
    return {
      label: copy.channelLabel,
      title: `${humanDesignGateTitle(left, locale)} ↔ ${humanDesignGateTitle(right, locale)}`,
      body: `${copy.bodyIntro}：${copy.channelBody}`,
      meta: locale === 'zh-TW' ? '可優先放進諮詢主軸，不需要一次講完所有閘門。' : 'Use as a consultation theme; do not explain every gate at once.',
    };
  });

  return [
    {
      title: copy.humanDesignTitle,
      intro: copy.humanDesignIntro,
      items: activeItems,
    },
    ...(missingPartnerItems.length ? [{
      title: copy.missingTitle,
      intro: copy.missingIntro,
      items: missingPartnerItems,
    }] : []),
    ...(channelItems.length ? [{
      title: copy.channelTitle,
      intro: copy.channelIntro,
      items: channelItems,
    }] : []),
  ];
}

function buildDetailSections(source: TeacherBriefSource, data: Record<string, unknown>, clientIntent: string, locale: Locale): TeacherDetailSection[] {
  const issue = parseClientIssueContext(clientIntent, locale);
  if (source === 'humandesign') return buildHumanDesignDetailSections(data, issue, locale);
  return [];
}

function buildBazi(data: Record<string, unknown>): BriefBlueprint {
  const dayMaster = firstText(data, ['dayMaster', 'day_master'], '日主');
  const wuxing = record(data.wuxing ?? data.elements);
  const wuxingText = Object.entries(wuxing)
    .map(([key, value]) => `${key} ${text(value)}`)
    .filter((item) => !item.endsWith(' '))
    .join('、');
  const pillars = list(data.pillars).map(text).filter(Boolean).join('、');
  return {
    label: SOURCE_LABELS.bazi,
    anchor: dayMaster,
    highlights: [
      `日主重點：${dayMaster}`,
      wuxingText ? `五行分布：${wuxingText}` : '五行分布需要老師再確認原始盤面。',
      pillars ? `四柱：${pillars}` : '四柱資料不足，先以日主與五行作為諮詢起點。',
    ],
    strengths: [
      `可以從 ${dayMaster} 的性質切入，幫客人理解自己做決定時的自然節奏。`,
      '五行分布能用來看資源、壓力、表達與行動之間是否平衡。',
      '適合把抽象命盤翻成生活習慣、工作方式與關係互動。',
    ],
    shadows: [
      '若只講五行強弱，客人容易聽成被定型，需要帶回生活例子。',
      '不要把缺某個五行說成缺陷，應說成需要被照顧的能力。',
      '遇到健康、投資、法律問題時，只能做自我理解提醒，不能給專業判斷。',
    ],
    questions: [
      '你最近最常感覺自己是被推著走，還是有餘裕選擇？',
      '工作與關係裡，哪一種壓力最容易讓你失去原本的節奏？',
      '如果把五行看成生活資源，你覺得自己最缺的是休息、行動、表達、界線還是支持？',
    ],
    avoidSayings: ['你命裡就是這樣。', '你缺某個五行所以一定會不好。', '這個盤保證會發生某件事。'],
  };
}

function buildZiwei(data: Record<string, unknown>): BriefBlueprint {
  const ming = firstText(data, ['mingGong', '命宮'], '命宮');
  const shen = firstText(data, ['shenGong', '身宮'], '身宮');
  const stars = list(data.mainStars ?? data.stars).map(text).filter(Boolean).slice(0, 4);
  return {
    label: SOURCE_LABELS.ziwei,
    anchor: `${ming}${shen ? `、${shen}` : ''}`,
    highlights: [
      `命宮：${ming}`,
      `身宮：${shen}`,
      stars.length ? `主星：${stars.join('、')}` : '主星資料不足，先以命宮與身宮切入。',
    ],
    strengths: [
      '紫微適合幫客人看角色定位，理解自己在人生場景裡常扮演什麼位置。',
      '命宮可作為自我感受的入口，身宮可作為實際行動模式的入口。',
      stars.length ? `可從 ${stars[0]} 的象徵談客人的天賦與慣性。` : '可用宮位主題引導客人說出近期最在意的場域。',
    ],
    shadows: [
      '不要一開始就丟大量星曜術語，客人會覺得自己被命盤壓住。',
      '宮位與星曜要轉成生活語言，不要直接斷職業、婚姻或壽命。',
      '若客人對某個宮位焦慮，先穩定情緒再談提醒。',
    ],
    questions: [
      '你現在最想看的是自己、關係、工作，還是下一階段的選擇？',
      '你覺得自己在別人眼中常被期待扮演什麼角色？',
      '近期哪個人生場域讓你覺得最需要重新整理？',
    ],
    avoidSayings: ['這顆星一定不好。', '你的婚姻或工作注定如此。', '照盤面看你沒有選擇。'],
  };
}

function buildAstro(data: Record<string, unknown>): BriefBlueprint {
  const sun = firstText(data, ['sun'], '太陽');
  const moon = firstText(data, ['moon'], '月亮');
  const asc = firstText(data, ['ascendant', 'rising'], '上升');
  const mc = firstText(data, ['midheaven', 'mc'], '天頂');
  return {
    label: SOURCE_LABELS.astro,
    anchor: joinKnown([sun, moon, asc]),
    highlights: [`太陽：${sun}`, `月亮：${moon}`, `上升：${asc}`, `天頂：${mc}`],
    strengths: [
      '太陽適合談自我方向，月亮適合談情緒需求，上升適合談外在互動方式。',
      '占星可以把客人的內在需求與外在表現分開，降低自我矛盾感。',
      '天頂能協助老師把議題帶到工作定位、被看見的方式與長期目標。',
    ],
    shadows: [
      '不要把星座講成單一性格標籤，重點是不同需求如何互相拉扯。',
      '若客人帶著關係問題，避免用星座直接判定適不適合。',
      '行運提醒要回到選擇與準備，不要講成無法改變的事件。',
    ],
    questions: [
      '你覺得自己現在比較卡在方向、情緒安全感，還是外界怎麼看你？',
      '你在關係裡最需要被理解的是哪一種感受？',
      '如果今年要被更多人看見，你希望被看見的是哪個面向？',
    ],
    avoidSayings: ['因為你是某星座，所以你一定怎樣。', '你們星座不合。', '某個行運一定會帶來壞事。'],
  };
}

function buildHumanDesign(data: Record<string, unknown>): BriefBlueprint {
  const type = firstText(data, ['type'], '類型');
  const authority = firstText(data, ['authority'], '內在權威');
  const profile = firstText(data, ['profile'], '人生角色');
  const strategy = firstText(data, ['strategy'], '策略');
  const gates = list(data.gates).map(text).filter(Boolean).slice(0, 6);
  const channels = list(data.channels).map(text).filter(Boolean).slice(0, 4);
  return {
    label: SOURCE_LABELS.humandesign,
    anchor: `${type}、${authority}`,
    highlights: [
      `類型：${type}`,
      `權威：${authority}`,
      `策略：${strategy}`,
      `人生角色：${profile}`,
      gates.length ? `啟動閘門：${gates.join('、')}` : '閘門資料不足，先看類型、策略與權威。',
      channels.length ? `通道：${channels.join('、')}` : '通道資料不足，避免硬解。',
    ],
    strengths: [
      `${type} 的重點是理解自己如何跟世界互動，而不是逼自己照別人的節奏。`,
      `${authority} 可以當成客人做決定前的身體或情緒檢查點。`,
      `${profile} 適合轉成生命角色與學習節奏，而不是用來貼標籤。`,
    ],
    shadows: [
      '人類圖很容易被客人聽成限制，要不斷提醒這是操作說明，不是命令。',
      '閘門與通道不要逐條堆資訊，先挑跟問題最相關的 2 到 3 個。',
      '若客人期待快速答案，仍要帶回策略與權威，讓他練習自己的決策方式。',
    ],
    questions: [
      '你最近做決定時，是聽身體、聽情緒，還是聽腦袋比較多？',
      '當你照自己的節奏走時，身體通常會有什麼反應？',
      '你覺得哪一種互動最容易讓你失去能量？',
    ],
    avoidSayings: ['你的人類圖說你不能做這件事。', '你的類型就是比較好或比較差。', '你只要照公式就會成功。'],
  };
}

function buildMaya(data: Record<string, unknown>): BriefBlueprint {
  const kin = firstText(data, ['kin'], 'Kin');
  const tone = firstText(data, ['tone'], '音調');
  const seal = firstText(data, ['seal'], '印記');
  const guide = firstText(data, ['guide'], '引導力量');
  const analog = firstText(data, ['analog', 'support'], '支持力量');
  const antipode = firstText(data, ['antipode', 'challenge'], '挑戰力量');
  const occult = firstText(data, ['occult', 'hidden'], '隱藏力量');
  return {
    label: SOURCE_LABELS.maya,
    anchor: `Kin ${kin} ${tone} ${seal}`,
    highlights: [
      `本命 Kin：${kin}`,
      `主印記：${tone} ${seal}`,
      `引導：${guide}`,
      `支持：${analog}`,
      `挑戰：${antipode}`,
      `隱藏：${occult}`,
    ],
    strengths: [
      `${seal} 可以作為客人自然展現自己的方式，先從「這像不像你」開始。`,
      `${tone} 音調適合談生命節奏，幫客人理解自己如何推動事情。`,
      `${analog} 是支持位，可以變成客人低潮時可借力的提醒。`,
    ],
    shadows: [
      `${antipode} 不要說成敵人，可以說成會反覆提醒客人成長的課題。`,
      '瑪雅曆若只講名詞會變空泛，必須連到客人近期事件。',
      '不同流派可能有差異，若客人已有 Kin 值，要尊重並說明採用版本。',
    ],
    questions: [
      `聽到 ${seal} 這個主題，你想到自己生活中的哪一面？`,
      `${antipode} 這個挑戰力量最近有沒有透過某個人或事件出現？`,
      `如果把 ${analog} 當成支持，你現在最需要它幫你穩住什麼？`,
    ],
    avoidSayings: ['這個 Kin 就代表你只能這樣。', '挑戰力量就是壞東西。', '不同網站算不同就是對方錯。'],
  };
}

function buildNumerology(data: Record<string, unknown>): BriefBlueprint {
  const lifePath = firstText(data, ['lifePathDisplay', 'lifePath', 'life_path'], '生命靈數');
  const birthDay = firstText(data, ['birthDay', 'birthdayNumber'], '生日數');
  const archetype = firstText(data, ['lifePathArchetype', 'archetype'], '核心原型');
  return {
    label: SOURCE_LABELS.numerology,
    anchor: `生命靈數 ${lifePath}`,
    highlights: [`生命靈數：${lifePath}`, `生日數：${birthDay}`, `核心原型：${archetype}`],
    strengths: [
      `生命靈數 ${lifePath} 適合用來看客人的人生學習主題。`,
      `${archetype} 可以轉成客人熟悉的角色語言，讓他更快理解自己。`,
      '生日數可作為日常表現方式，適合連到工作、溝通與關係習慣。',
    ],
    shadows: [
      '不要把數字講成高低好壞，數字只是不同的學習路徑。',
      '若客人對某個數字有成見，要先把它翻成具體生活狀態。',
      '避免用單一生命靈數解釋全部人生，需要連同當下問題一起看。',
    ],
    questions: [
      '這個數字描述的學習主題，最近在哪個生活場景最明顯？',
      '你覺得自己最常重複的模式是什麼？',
      '如果這個數字是一個提醒，它現在最想提醒你慢下來還是往前走？',
    ],
    avoidSayings: ['某個數字比較高級。', '你是這個數字所以一定會成功或失敗。', '只看生命靈數就能定義你整個人。'],
  };
}

function buildTarot(data: Record<string, unknown>): BriefBlueprint {
  const draws = list(data.cards).map(record);
  const first = draws[0] ?? {};
  const card = record(first.card);
  const name = firstText(card, ['name_zh', 'name_en'], '牌面');
  const meaning = nestedMeaning(first, card);
  const keywords = keywordsFrom(first, card).slice(0, 4);
  const spread = draws.map((draw, index) => {
    const itemCard = record(draw.card);
    const itemName = firstText(itemCard, ['name_zh', 'name_en'], `第 ${index + 1} 張牌`);
    const slot = firstText(draw, ['spread_position', 'slot'], `位置 ${index + 1}`);
    const position = text(draw.position) === 'reversed' ? '逆位' : '正位';
    return `${slot}：${itemName} ${position}`;
  });
  return {
    label: SOURCE_LABELS.tarot,
    anchor: name,
    highlights: spread.length ? spread : [`主牌：${name}`],
    strengths: [
      `${name} 適合當成故事入口，先問客人這張牌像不像他現在的處境。`,
      meaning,
      keywords.length ? `可用關鍵字切入：${keywords.join('、')}` : '可從牌位、正逆位與客人提問建立故事線。',
    ],
    shadows: [
      '不要把單張牌講成結局，塔羅更適合看當下狀態與可調整方向。',
      '逆位不一定是壞事，可以說成能量卡住、需要換角度看。',
      '若客人問感情或工作結果，先把問題拉回他的選擇與行動。',
    ],
    questions: [
      `你看到 ${name} 時，第一個想到的是哪個人、事件或感覺？`,
      '這張牌比較像在描述你、對方，還是你們之間的狀態？',
      '如果牌面只給你一個下一步，你覺得它會叫你先停、先說清楚，還是先行動？',
    ],
    avoidSayings: ['這張牌代表一定會分手或一定會成功。', '逆位就是壞。', '牌已經決定你的未來。'],
  };
}

function buildRunes(data: Record<string, unknown>, sourceLabel = SOURCE_LABELS.runes): BriefBlueprint {
  const draws = list(data.runes).map(record);
  const first = draws[0] ?? {};
  const rune = record(first.rune);
  const name = firstText(rune, ['zh', 'name', 'glyph'], '符文');
  const material = firstText(record(data.meta), ['material'], 'stone');
  const meaning = nestedMeaning(first, rune);
  const keywords = keywordsFrom(first, rune).slice(0, 4);
  const spread = draws.map((draw, index) => {
    const itemRune = record(draw.rune);
    const itemName = firstText(itemRune, ['zh', 'name', 'glyph'], `第 ${index + 1} 枚符文`);
    const slot = firstText(draw, ['spread_position', 'slot'], `位置 ${index + 1}`);
    const position = text(draw.position) === 'reversed' ? '逆位' : '正位';
    return `${slot}：${itemName} ${position}`;
  });
  return {
    label: sourceLabel,
    anchor: name,
    highlights: [
      ...spread.length ? spread : [`主符文：${name}`],
      `材質：${material === 'crystal' ? '水晶' : material === 'wood' ? '木頭' : '石面'}`,
    ],
    strengths: [
      `${name} 適合當成一句簡短提醒，幫客人看見眼前最需要整理的資源或阻力。`,
      meaning,
      keywords.length ? `可用關鍵字切入：${keywords.join('、')}` : '盧恩適合用來看提醒、阻礙與下一步。',
    ],
    shadows: [
      '不要把符文講成絕對預言，它更像一個濃縮提醒。',
      '逆位可以說成能量需要調整，不要直接說成不吉利。',
      '抽石適合短程觀察，不適合取代完整命盤或專業決策。',
    ],
    questions: [
      `這枚 ${name} 比較像在提醒你哪件事？`,
      '你現在最需要穩住的是資源、界線、溝通還是行動？',
      '如果今天只做一個小調整，你願意先從哪裡開始？',
    ],
    avoidSayings: ['這顆符文保證會發生某件事。', '逆位就是壞兆頭。', '你只要照符文做就一定沒問題。'],
  };
}

function blueprintFor(tool: CalcTool, data: Record<string, unknown>): BriefBlueprint {
  switch (tool) {
    case 'bazi':
      return buildBazi(data);
    case 'ziwei':
      return buildZiwei(data);
    case 'astro':
      return buildAstro(data);
    case 'humandesign':
      return buildHumanDesign(data);
    case 'maya':
      return buildMaya(data);
    case 'numerology':
      return buildNumerology(data);
    case 'tarot':
      return buildTarot(data);
    case 'runes':
      return buildRunes(data);
    default:
      return buildNumerology(data);
  }
}

function buildClientFriendlyScript(
  source: TeacherBriefSource,
  blueprint: BriefBlueprint,
  clientIntent: string,
  locale: Locale = DEFAULT_LOCALE,
) {
  const copy = briefCopyFor(locale);
  const anchor = blueprint.anchor;
  const issue = parseClientIssueContext(clientIntent, locale);
  const intent = issue.raw.includes('尚未填寫')
    ? copy.uiWords.coreIntentMissing
    : clientIssueSummary(issue, locale);
  const baseQuestion = clientIssueOpeningQuestion(issue, locale);
  const sourceName = copy.sourceLabels[source] ?? blueprint.label;
  const beginnerTranslations: Partial<Record<TeacherBriefSource, {
    meaning: string;
    scene: string;
    stuck: string;
    teacherLine: string;
  }>> = {
    bazi: {
      meaning: '你不是沒方向，而是最近太常配合別人，自己的節奏被打亂了。',
      scene: '像是明明心裡有答案，卻因為怕麻煩別人、怕衝突，最後又照別人的步調走。',
      stuck: '卡住的點不是能力不足，而是力氣用錯地方：該休息時硬撐，該表達時又忍住。',
      teacherLine: '最近哪一件事，讓你覺得自己一直在配合，卻沒有真的舒服？',
    },
    ziwei: {
      meaning: '你不是不知道自己要什麼，而是太常被放進別人期待的角色裡。',
      scene: '像是大家習慣找你負責、安排或撐場，久了你會忘記自己其實也想被照顧。',
      stuck: '卡住的點不是你不夠好，而是同一個角色演太久，已經很難自由換位置。',
      teacherLine: '你最近最累的是哪一個角色：照顧者、決定者、和事佬，還是撐住場面的人？',
    },
    astro: {
      meaning: '你不是矛盾，而是外在表現、內在感受和真正想走的方向還沒對齊。',
      scene: '像是表面上可以好好說話、好好工作，但心裡其實有另一個需求一直沒有被看見。',
      stuck: '卡住的點不是想太多，而是你同時在照顧形象、情緒和關係，所以很難只選一邊。',
      teacherLine: '這件事裡，你最想被看見的是表現、情緒，還是關係裡的安全感？',
    },
    humandesign: {
      meaning: '你不是不能決定，而是需要等身體和情緒也點頭，再往前走。',
      scene: '像是腦袋說可以，但身體很緊；或你太快答應，過幾天才發現自己其實不想。',
      stuck: '卡住的點不是你沒效率，而是你常用別人的速度要求自己，反而消耗更快。',
      teacherLine: '最近哪一個決定，是你嘴巴答應了，但身體其實沒有跟上？',
    },
    maya: {
      meaning: '你不是卡住，而是這一段正在練習一種新的力量使用方式。',
      scene: '像是以前靠意志力可以推過去，但現在同樣方法不太有用，需要換角度看自己。',
      stuck: '卡住的點不是運氣不好，而是舊方法已經不夠用，生命在提醒你換一種回應。',
      teacherLine: '最近哪件事一直重複出現，好像在逼你換一種做法？',
    },
    numerology: {
      meaning: '你不是一直犯同樣的錯，而是同一個人生功課又換了形式出現。',
      scene: '像是在不同工作、不同關係裡，總會遇到很像的情境，讓你有熟悉的無力感。',
      stuck: '卡住的點不是你沒進步，而是你還在用舊反應處理新情境。',
      teacherLine: '最近有沒有一件事，讓你心裡冒出「怎麼又來了」的感覺？',
    },
    tarot: {
      meaning: '這張牌不是結局，而是把你現在最說不出口的拉扯照出來。',
      scene: '像是你其實有感覺、有答案，但還不確定能不能相信自己。',
      stuck: '卡住的點不是牌好不好，而是你現在有一個情緒或真相還沒被說清楚。',
      teacherLine: '這張牌比較像你、像對方，還是像你們之間的狀態？',
    },
    runes: {
      meaning: '這枚符文不是預言，而是提醒你先整理眼前最重要的一個阻力。',
      scene: '像是事情還沒到要做大決定，但已經有一個地方在提醒你不要再忽略。',
      stuck: '卡住的點不是凶吉，而是你需要先看清楚：現在缺的是資源、界線、溝通還是行動。',
      teacherLine: '如果這枚符文只提醒一件事，你覺得它最像在提醒你哪裡？',
    },
    daily_tarot: {
      meaning: '今天這張牌不是答案，而是提醒你先照顧最有感的情緒。',
      scene: '像是今天不用急著解決全部，只要先承認自己其實有一個感受很明顯。',
      stuck: '卡住的點不是今天會不好，而是你可能太急著找答案，忘了先聽見自己。',
      teacherLine: '今天這張牌讓你第一個想到的人、事或感覺是什麼？',
    },
    daily_runes: {
      meaning: '今天這枚符文不是大事預告，而是一個先穩住自己的小提醒。',
      scene: '像是出門前有人輕輕提醒你：今天先顧好一件小事，不要把自己弄亂。',
      stuck: '卡住的點不是符文在警告你，而是提醒你今天少一點急、多一點覺察。',
      teacherLine: '今天如果只穩住一件事，你最想先穩住什麼？',
    },
    daily_stone: {
      meaning: '今天這顆石面不是壓力，而是提醒你先補回一種需要的養分。',
      scene: '像是身體或心情在說：我需要被照顧一下，不要一直只往前衝。',
      stuck: '卡住的點不是你狀態差，而是你可能太久沒有補充真正需要的支持。',
      teacherLine: '今天你最需要補回的是休息、安全感、勇氣，還是被理解？',
    },
  };

  const scripts: Partial<Record<TeacherBriefSource, {
    core: string;
    gift: string;
    shadow: string;
    next: string;
  }>> = {
    bazi: {
      core: `可以先跟客人說：「我先不用五行強弱來定義你。從這張八字看，${anchor} 比較像是在提醒你：你做決定很吃狀態與節奏，當你太急著配合外界，就容易忘記自己真正舒服的步調。」`,
      gift: '可以這樣說：你不是沒有能力，而是需要把力氣放回對的位置；當節奏對了，你其實很能穩住事情。',
      shadow: '可以這樣說：卡住的地方不是缺陷，比較像是某一種生活資源用太多或太少了，我們先找出是哪一種。',
      next: '讓客人先選一個生活資源來調整：休息、行動、表達、界線或支持。',
    },
    ziwei: {
      core: `可以先跟客人說：「我不會一開始就講很多星曜。這張紫微比較像在看你在人生裡常被放到什麼位置，${anchor} 可以幫我們理解你為什麼常用某一種角色面對事情。」`,
      gift: '可以這樣說：你身上有一種角色感，可能很會承擔、安排、照顧或判斷局勢，這是可以被好好使用的能力。',
      shadow: '可以這樣說：如果你一直被期待扮演同一種角色，久了會累，也會忘記自己其實可以換一種方式回應。',
      next: '請客人說出最近最累的角色，先從那個角色開始鬆動。',
    },
    astro: {
      core: `可以先跟客人說：「這張星盤不是要說你是哪一種人，而是幫你分辨：你的外在表現、內在需求和真正想走的方向，可能正在拉扯。${anchor} 是我們今天可以先看的入口。」`,
      gift: '可以這樣說：你其實有不同面向，有一面想被理解，有一面想表現好，也有一面需要安全感。',
      shadow: '可以這樣說：你卡住時不一定是矛盾，而是不同需求在搶方向；我們先不要急著選邊站。',
      next: '讓客人分辨現在最需要處理的是方向、情緒安全感，還是關係互動。',
    },
    humandesign: {
      core: `可以先跟客人說：「人類圖我會把它當成使用說明，不是規定。${anchor} 比較像在提醒你：你不是不能做，而是需要用比較適合自己的方式做決定、用能量。」`,
      gift: '可以這樣說：你身上有自己的運作節奏，當你不硬逼自己照別人的速度走，反而比較容易穩定發揮。',
      shadow: '可以這樣說：卡住時，你可能不是方向錯，而是太快答應、太快用腦袋決定，沒有等身體或情緒跟上。',
      next: '請客人回想最近一個決定，看看他是用身體、情緒還是頭腦在答應。',
    },
    maya: {
      core: `可以先跟客人說：「瑪雅曆我會把它講成一個生命提醒，不會把你貼標籤。${anchor} 比較像在問：你這一階段最需要練習的力量是什麼？」`,
      gift: '可以這樣說：你有一個自然會散發的生命主題，不一定要用力證明，它可能已經在你的選擇和關係裡出現。',
      shadow: '可以這樣說：挑戰力量不是壞東西，它比較像是反覆出現的提醒，幫你看見哪裡需要換角度。',
      next: '請客人把支持、挑戰、隱藏力量各對應到一個最近的人或事件。',
    },
    numerology: {
      core: `可以先跟客人說：「生命靈數不是在算你高低好壞，而是在看你常重複的人生練習。${anchor} 像是一條主線，幫我們理解你為什麼常在某些題目上繞回來。」`,
      gift: '可以這樣說：你不是一直重複錯誤，而是有一個很熟悉的學習模式；看懂它之後，就比較能選新的做法。',
      shadow: '可以這樣說：同一個特質用得太用力，會變成壓力；我們先把它放輕，不急著否定自己。',
      next: '讓客人說出最近反覆出現的一件小事，從那裡找模式。',
    },
    tarot: {
      core: `可以先跟客人說：「我們先把牌面當成一個畫面，不把它講成結局。${anchor} 比較像是在描述你現在故事裡最明顯的情緒或拉扯。」`,
      gift: '可以這樣說：這張牌先讓你看見自己現在其實已經知道一些事，只是還沒整理成清楚的答案。',
      shadow: '可以這樣說：牌面提醒的不是好壞，而是現在有哪個地方卡住、哪個地方還沒有被說清楚。',
      next: '請客人先說這張牌像他、像對方，還是像兩人之間的狀態。',
    },
    runes: {
      core: `可以先跟客人說：「盧恩我會把它當成一句短提醒，不是預言。${anchor} 比較像在指出：你眼前最需要先整理的是哪一個阻力或資源。」`,
      gift: '可以這樣說：這枚符文不是要你一次解決全部，而是提醒你先抓住眼前最重要的一件事。',
      shadow: '可以這樣說：如果它看起來比較沉重，也不代表不好，可能只是提醒你先停一下，把資源整理好。',
      next: '讓客人選一個今天就能做的小調整，不要把符文說成重大結論。',
    },
    daily_tarot: {
      core: `可以先跟客人說：「今天這張牌不用當成完整命盤，它比較像今天的情緒天氣。${anchor} 先幫我們看你此刻最需要被照顧的地方。」`,
      gift: '可以這樣說：今天先不用追答案，先看哪個感覺最需要被你承認。',
      shadow: '可以這樣說：如果今天狀態比較亂，也只是提醒你慢一點，不代表事情就會不好。',
      next: '請客人選一句今天要帶走的提醒。',
    },
    daily_runes: {
      core: `可以先跟客人說：「今天這枚盧恩像一句小提醒，不是大預言。${anchor} 先幫我們看今天要穩住哪件事。」`,
      gift: '可以這樣說：今天只要先抓一個方向，不需要一次把所有問題處理完。',
      shadow: '可以這樣說：如果提醒比較直接，可以把它當作檢查點，不要急著責備自己。',
      next: '請客人把提醒落成一個今天可以做的小動作。',
    },
    daily_stone: {
      core: `可以先跟客人說：「今天這顆石面像一個狀態提示，不是完整解盤。${anchor} 先讓我們看見你現在最需要穩住的能量。」`,
      gift: '可以這樣說：石面提醒的是滋養，不是壓力；先看它想補給你哪一種力量。',
      shadow: '可以這樣說：如果你覺得沒感覺也沒關係，我們先從今天身體最明顯的反應開始。',
      next: '請客人用一個詞描述今天需要的養分。',
    },
  };

  const script = locale === 'zh-TW'
    ? scripts[source] ?? scripts.numerology!
    : {
      core: `${sourceName}: ${copy.beginner[source].meaning}`,
      gift: copy.beginner[source].gift,
      shadow: copy.beginner[source].shadow,
      next: copy.beginner[source].next,
    };
  const beginner = locale === 'zh-TW'
    ? beginnerTranslations[source] ?? beginnerTranslations.numerology!
    : copy.beginner[source];
  const plainOneLiner = beginner.meaning;
  const simpleGift = script.gift.replace(/^可以這樣說：/, '');
  const simpleShadow = script.shadow.replace(/^可以這樣說：/, '');
  const issueCardBody = issue.hasStructuredContext
    ? copy.uiWords.structuredUnderstand(issue.topicLabel, issue.painLabel, issue.goalLabel, issue.freeText)
    : copy.uiWords.unstructuredUnderstand;
  const topicFocus = issue.hasStructuredContext ? issue.topicLabel : copy.issueFallbacks.topic;
  const painFocus = issue.hasStructuredContext ? issue.painLabel : copy.issueFallbacks.pain;
  const goalFocus = issue.hasStructuredContext ? issue.goalLabel : copy.issueFallbacks.goal;
  return {
    beginnerCards: [
      {
        label: copy.cardLabels.understand,
        title: issue.hasStructuredContext ? `${topicFocus}｜${painFocus}` : copy.cardTitles.understandFallback,
        body: issueCardBody,
      },
      {
        label: copy.cardLabels.oneLine,
        title: copy.cardTitles.oneLine,
        body: plainOneLiner,
      },
      {
        label: copy.cardLabels.scene,
        title: copy.cardTitles.scene,
        body: beginner.scene,
      },
      {
        label: copy.cardLabels.stuck,
        title: copy.cardTitles.stuck,
        body: beginner.stuck,
      },
      {
        label: copy.cardLabels.next,
        title: copy.cardTitles.next,
        body: beginner.teacherLine || baseQuestion,
      },
    ],
    plainOneLiner,
    conversationBreakdown: [
      `${copy.breakdownLabels[0]}：${clientIssueSummary(issue, locale)}`,
      `${copy.breakdownLabels[1]}：${beginner.scene}`,
      `${copy.breakdownLabels[2]}：${sourceName} / ${anchor}`,
      `${copy.breakdownLabels[3]}：${copy.uiWords.painByIssue(painFocus, beginner.stuck)}`,
      `${copy.breakdownLabels[4]}：${beginner.teacherLine || baseQuestion}`,
      `${copy.breakdownLabels[5]}：${copy.uiWords.actionByGoal(goalFocus, script.next)}`,
    ],
    coreSummary: [
      intent,
      '',
      clientIssueSummary(issue, locale),
      issue.freeText ? copy.uiWords.issueSummaryPlain(issue.freeText) : copy.uiWords.issueSummaryMissing,
      '',
      `${copy.cardLabels.oneLine}：${plainOneLiner}`,
      `${copy.cardLabels.scene}：${beginner.scene}`,
      `${copy.copySections.chartHighlights}：${sourceName} / ${anchor}`,
      '',
      copy.uiWords.teacherNote(topicFocus, painFocus),
    ].join('\n'),
    strengths: [
      copy.uiWords.strengthByIssue(topicFocus),
      `${copy.cardLabels.oneLine}：${simpleGift}`,
      `${copy.cardLabels.scene}：${beginner.scene}`,
      `${copy.copySections.questions}：「${beginner.teacherLine || baseQuestion}」`,
      copy.uiWords.teacherNote(topicFocus, painFocus),
    ],
    shadows: [
      copy.uiWords.shadowByIssue(painFocus),
      `${copy.cardLabels.stuck}：${beginner.stuck}`,
      simpleShadow,
      copy.uiWords.shadowByIssue(painFocus),
      copy.uiWords.avoidYouAre,
    ],
    questions: [
      baseQuestion,
      copy.uiWords.questionByPain(painFocus),
      copy.uiWords.questionByGoal(goalFocus),
      beginner.teacherLine || baseQuestion,
      baseQuestion,
      script.next,
      copy.uiWords.questionByGoal(goalFocus),
    ],
    avoidSayings: [
      copy.uiWords.avoidYouAre,
      copy.uiWords.avoidFate,
      copy.uiWords.avoidGuarantee,
      ...blueprint.avoidSayings.slice(0, 2),
    ],
    sourceName,
  };
}

function buildSopStages(blueprint: BriefBlueprint, clientIntent: string, locale: Locale = DEFAULT_LOCALE): TeacherSopStage[] {
  const copy = briefCopyFor(locale);
  const issue = parseClientIssueContext(clientIntent, locale);
  const questionOne = blueprint.questions[0] ?? '你今天最想先被理解的是哪一件事？';
  const intentQuestion = issue.raw.includes('尚未填寫')
    ? '你今天最想先談哪個生活面向？'
    : clientIssueOpeningQuestion(issue, locale);
  const sop = copy.sopStages;
  return [
    {
      key: 'opening',
      title: sop.opening.title,
      intent: sop.opening.intent,
      script: issue.hasStructuredContext
        ? sop.opening.scriptStructured(issue.topicLabel, issue.painLabel, issue.goalLabel, blueprint.label)
        : sop.opening.scriptFallback(blueprint.label),
      questions: [
        intentQuestion,
        ...sop.opening.questions,
      ],
      notes: sop.opening.notes,
    },
    {
      key: 'gift',
      title: sop.gift.title,
      intent: sop.gift.intent,
      script: sop.gift.script(blueprint.anchor),
      questions: [
        questionOne,
        ...sop.gift.questions,
      ],
      notes: sop.gift.notes,
    },
    {
      key: 'shadow',
      title: sop.shadow.title,
      intent: sop.shadow.intent,
      script: sop.shadow.script,
      questions: [
        blueprint.shadows[0] ?? '哪一個提醒最像你最近反覆遇到的狀態？',
        ...sop.shadow.questions,
      ],
      notes: sop.shadow.notes,
    },
    {
      key: 'action',
      title: sop.action.title,
      intent: sop.action.intent,
      script: sop.action.script,
      questions: sop.action.questions,
      notes: sop.action.notes,
    },
    {
      key: 'closing',
      title: sop.closing.title,
      intent: sop.closing.intent,
      script: sop.closing.script,
      questions: sop.closing.questions,
      notes: sop.closing.notes,
    },
  ];
}

function buildCopyText(brief: Omit<TeacherConsultationBrief, 'copyText'>, locale: Locale = DEFAULT_LOCALE) {
  const copy = briefCopyFor(locale).copySections;
  const lines = [
    '━━━━━━━━━━━━━━━━━━━━━',
    copy.title,
    '━━━━━━━━━━━━━━━━━━━━━',
    '',
    `${copy.source}：${brief.sourceLabel}`,
    `${copy.subject}：${brief.title}`,
    '',
    `◆ ${copy.plainGuide}`,
    ...brief.beginnerCards.flatMap((card) => [
      `${card.label}｜${card.title}`,
      card.body,
      '',
    ]),
    `◆ ${copy.oneLiner}`,
    brief.plainOneLiner,
    '',
    `◆ ${copy.breakdown}`,
    ...brief.conversationBreakdown.map((item) => `- ${item}`),
    '',
    ...brief.detailSections.flatMap((section) => [
      `◆ ${section.title}`,
      section.intro,
      ...section.items.flatMap((item) => [
        `- ${item.label}｜${item.title}`,
        `  ${item.body}`,
        item.meta ? `  ${copy.origin}：${item.meta}` : '',
      ].filter(Boolean)),
      '',
    ]),
    `◆ ${copy.clientIntent}`,
    brief.clientIntent,
    '',
    `◆ ${copy.coreSummary}`,
    brief.coreSummary,
    '',
    `◆ ${copy.chartHighlights}`,
    ...brief.chartHighlights.map((item) => `- ${item}`),
    '',
    `◆ ${copy.strengths}`,
    ...brief.strengths.map((item) => `- ${item}`),
    '',
    `◆ ${copy.shadows}`,
    ...brief.shadows.map((item) => `- ${item}`),
    '',
    `◆ ${copy.questions}`,
    ...brief.questions.map((item) => `- ${item}`),
    '',
    `◆ ${copy.avoidSayings}`,
    ...brief.avoidSayings.map((item) => `- ${item}`),
    '',
    `◆ ${copy.sop}`,
    ...brief.sopStages.flatMap((stage) => [
      stage.title,
      `${copy.script}：${stage.script}`,
      `${copy.ask}：${stage.questions.join(' / ')}`,
      `${copy.note}：${stage.notes}`,
      '',
    ]),
  ];
  return lines.join('\n').trim();
}

function localizedHighlights(source: TeacherBriefSource, data: Record<string, unknown>, blueprint: BriefBlueprint, locale: Locale) {
  if (locale === 'zh-TW') return blueprint.highlights;
  const copy = briefCopyFor(locale);
  const labels = copy.sourceLabels;
  const items: string[] = [];
  if (source === 'bazi') {
    items.push(`Day master: ${firstText(data, ['dayMaster', 'day_master'], '-')}`);
    const wuxing = record(data.wuxing ?? data.elements);
    if (Object.keys(wuxing).length) items.push(`Five element balance: ${Object.entries(wuxing).map(([key, value]) => `${key} ${text(value)}`).join(', ')}`);
    const pillars = list(data.pillars).map(text).filter(Boolean).join(', ');
    if (pillars) items.push(`Four pillars: ${pillars}`);
  } else if (source === 'ziwei') {
    items.push(`Life palace: ${firstText(data, ['mingGong', 'ming_gong'], '-')}`);
    items.push(`Body palace: ${firstText(data, ['shenGong', 'shen_gong'], '-')}`);
    const stars = list(data.mainStars ?? data.majorStars).map(text).filter(Boolean).join(', ');
    if (stars) items.push(`Main stars: ${stars}`);
  } else if (source === 'astro') {
    items.push(`Sun: ${firstText(data, ['sun'], '-')}`);
    items.push(`Moon: ${firstText(data, ['moon'], '-')}`);
    items.push(`Ascendant: ${firstText(data, ['ascendant', 'rising'], '-')}`);
    items.push(`Midheaven: ${firstText(data, ['midheaven', 'mc'], '-')}`);
  } else if (source === 'humandesign') {
    items.push(`Type: ${firstText(data, ['type'], '-')}`);
    items.push(`Authority: ${firstText(data, ['authority'], '-')}`);
    items.push(`Strategy: ${firstText(data, ['strategy'], '-')}`);
    items.push(`Profile: ${firstText(data, ['profile'], '-')}`);
    const gates = extractHumanDesignGateRecords(data);
    if (gates.size) items.push(`Active gates: ${[...gates.keys()].sort((a, b) => a - b).join(', ')}`);
  } else if (source === 'maya') {
    ['kin', 'tone', 'seal', 'guide', 'analog', 'antipode', 'occult'].forEach((key) => {
      const value = text(data[key]);
      if (value) items.push(`${key}: ${value}`);
    });
  } else if (source === 'numerology') {
    items.push(`Life path: ${firstText(data, ['lifePathDisplay', 'lifePath', 'life_path'], '-')}`);
    items.push(`Birth day: ${firstText(data, ['birthDay', 'birth_day'], '-')}`);
    const archetype = firstText(data, ['lifePathArchetype', 'archetype']);
    if (archetype) items.push(`Archetype: ${archetype}`);
  } else if (source === 'tarot' || source === 'daily_tarot') {
    const cards = list(data.cards).slice(0, 3).map(record);
    cards.forEach((draw, index) => {
      const card = record(draw.card);
      items.push(`Card ${index + 1}: ${firstText(card, ['name_en', 'name', 'name_zh'], 'Tarot card')} / ${firstText(draw, ['spread_position', 'position'], '-')}`);
    });
  } else if (source === 'runes' || source === 'daily_runes' || source === 'daily_stone') {
    const runes = list(data.runes).slice(0, 3).map(record);
    runes.forEach((draw, index) => {
      const rune = record(draw.rune);
      items.push(`Rune ${index + 1}: ${firstText(rune, ['name', 'zh'], 'Rune')} / ${firstText(draw, ['spread_position', 'position'], '-')}`);
    });
  }
  return items.length ? items : [`${labels[source]}: chart data is incomplete, use the member question first.`];
}

export function buildTeacherConsultationBrief(input: BuildBriefInput): TeacherConsultationBrief {
  const locale = input.locale ?? DEFAULT_LOCALE;
  const copy = briefCopyFor(locale);
  const source = input.source ?? input.result.tool;
  const data = record(input.result.data);
  const blueprint = source === 'daily_stone'
    ? buildRunes(data, copy.sourceLabels.daily_stone)
    : source === 'daily_runes'
      ? buildRunes(data, copy.sourceLabels.daily_runes)
      : source === 'daily_tarot'
        ? { ...buildTarot(data), label: copy.sourceLabels.daily_tarot }
        : blueprintFor(input.result.tool, data);
  const clientIntent = text(input.customerQuestion) || text(input.result.input?.question) || copy.uiWords.noQuestion;
  const sourceLabel = copy.sourceLabels[source] ?? blueprint.label;
  const tags = [
    sourceLabel,
    locale === 'zh-TW' ? '老師備課' : 'Guide prep',
    source.startsWith('daily_') ? (locale === 'zh-TW' ? '諮詢開場素材' : 'Daily opener') : (locale === 'zh-TW' ? '完整解盤素材' : 'Full reading prep'),
  ];
  const friendly = buildClientFriendlyScript(source, blueprint, clientIntent, locale);
  const detailSections = buildDetailSections(source, data, clientIntent, locale);
  const title = locale === 'zh-TW' ? `${sourceLabel}白話備課` : `${sourceLabel} guide brief`;
  const coreSummary = friendly.coreSummary;
  const sopStages = buildSopStages({ ...blueprint, label: sourceLabel }, clientIntent, locale);
  const briefWithoutCopy = {
    source,
    sourceLabel,
    title,
    clientIntent,
    beginnerCards: friendly.beginnerCards,
    plainOneLiner: friendly.plainOneLiner,
    conversationBreakdown: friendly.conversationBreakdown,
    coreSummary,
    chartHighlights: [
      ...friendly.conversationBreakdown,
      copy.uiWords.rawClues,
      ...localizedHighlights(source, data, blueprint, locale),
    ],
    strengths: friendly.strengths,
    shadows: friendly.shadows,
    questions: friendly.questions,
    avoidSayings: friendly.avoidSayings,
    sopStages,
    detailSections,
    tags,
  };

  return {
    ...briefWithoutCopy,
    copyText: buildCopyText(briefWithoutCopy, locale),
  };
}

export function buildDailyConsultationBrief(input: BuildDailyBriefInput): TeacherConsultationBrief {
  const locale = input.locale ?? DEFAULT_LOCALE;
  const copy = briefCopyFor(locale);
  const labelLocalized = copy.sourceLabels[input.kind];
  const question = text(input.customerQuestion) || (locale === 'zh-TW' ? `今日 ${input.date} 的狀態觀察` : `${labelLocalized} state for ${input.date}`);
  const brief = buildTeacherConsultationBrief({
    result: input.result,
    customerQuestion: question,
    source: input.kind,
    locale: input.locale,
  });
  const title = locale === 'zh-TW' ? `${labelLocalized}諮詢開場：${brief.title.split('：').pop() ?? labelLocalized}` : `${labelLocalized} opener: ${brief.title}`;
  const summary = locale === 'zh-TW'
    ? `今日 ${input.date} 的 ${labelLocalized} 不當成完整命盤，而是用來觀察客人當下狀態、情緒入口與下一個小行動。\n\n${brief.coreSummary}`
    : `${labelLocalized} for ${input.date} is a present-state opener, not a full destiny reading. Use it to observe mood, entry point, and one small next action.\n\n${brief.coreSummary}`;
  return {
    ...brief,
    title,
    coreSummary: summary,
    tags: Array.from(new Set([...brief.tags, locale === 'zh-TW' ? '今日狀態觀察' : 'Daily state', locale === 'zh-TW' ? '諮詢開場素材' : 'Consultation opener'])),
    copyText: buildCopyText({
      ...brief,
      title,
      coreSummary: summary,
      tags: Array.from(new Set([...brief.tags, locale === 'zh-TW' ? '今日狀態觀察' : 'Daily state', locale === 'zh-TW' ? '諮詢開場素材' : 'Consultation opener'])),
    }, locale),
  };
}

function cloneStage(stage: TeacherSopStage): TeacherSopStage {
  return {
    ...stage,
    questions: [...stage.questions],
  };
}

export function mergeTeacherBriefDraft(
  generated: TeacherConsultationBrief,
  draft: TeacherBriefDraft,
): TeacherConsultationBrief {
  const sopStages = generated.sopStages.map((stage) => {
    const override = draft.sopStages?.[stage.key];
    if (!override) return cloneStage(stage);
    return {
      ...cloneStage(stage),
      ...override,
      questions: override.questions ? [...override.questions] : [...stage.questions],
    };
  });
  const mergedWithoutCopy = {
    ...generated,
    title: draft.title ?? generated.title,
    clientIntent: draft.clientIntent ?? generated.clientIntent,
    beginnerCards: [...generated.beginnerCards],
    plainOneLiner: draft.plainOneLiner ?? generated.plainOneLiner,
    conversationBreakdown: draft.conversationBreakdown ? [...draft.conversationBreakdown] : [...generated.conversationBreakdown],
    coreSummary: draft.coreSummary ?? generated.coreSummary,
    chartHighlights: draft.chartHighlights ? [...draft.chartHighlights] : [...generated.chartHighlights],
    strengths: draft.strengths ? [...draft.strengths] : [...generated.strengths],
    shadows: draft.shadows ? [...draft.shadows] : [...generated.shadows],
    questions: draft.questions ? [...draft.questions] : [...generated.questions],
    avoidSayings: draft.avoidSayings ? [...draft.avoidSayings] : [...generated.avoidSayings],
    tags: draft.tags ? [...draft.tags] : [...generated.tags],
    sopStages,
    detailSections: generated.detailSections.map((section) => ({
      ...section,
      items: section.items.map((item) => ({ ...item })),
    })),
  };

  return {
    ...mergedWithoutCopy,
    copyText: buildCopyText(mergedWithoutCopy),
  };
}
