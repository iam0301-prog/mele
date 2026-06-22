import { DEFAULT_LOCALE, type Locale } from '@/lib/i18n/config';
import type { CalcTool } from '@/lib/api';

/** 占卜結果頁所有寫死的靜態 UI 文字，抽成 i18n 結構 */
export type ToolResultCopy = {
  /** AR 視覺展示載入中區塊 */
  arLoading: {
    kicker: string;
    title: string;
    body: string;
  };

  /** MemberResonancePanel */
  resonance: {
    questionPrefix: string;
    understandPrefix: string;
  };

  /** ResultInsightPanel */
  insight: {
    memberNoteKicker: string;
    memberNoteTitle: string;
    memberNoteEmpty: string;
    memberNoteCount: string; // 含 {count} 佔位符
    cardSubtitleFallback: string;
    cardExpand: string;
    cardCollapse: string;
    cardResonate: string;
    cardResonated: string;
    expandAll: string; // 含 {count}
    collapseAll: string;
  };

  /** PersonalReadingPanel */
  personalReading: {
    thisReminder: string;
    setReminder: string;
    reminderSet: string;
  };

  /** ResultGamePanel */
  game: {
    kicker: string;
    title: string;
    plainNote: string;
    arLink: string;
    stepPrefix: string;
  };

  /** ResultNextSteps */
  nextSteps: {
    kicker: string;
    title: string;
    bookTeacher: string;
    viewHistory: string;
  };

  /** MemberActionPath */
  actionPath: {
    kicker: string;
    title: string;
    body: string;
    saveTitle: string;
    saveLabel: string;
    dailyTitle: string;
    dailyBody: string;
    dailyLabel: string;
    consultTitle: string;
    consultBody: string;
    consultLabel: string;
    footerSave: string;
    footerConsult: string;
  };

  /** PointUnlockPanel */
  unlock: {
    kicker: string;
    title: string;
    body: string;
    memberStatusLabel: string;
    memberLoggedIn: string;
    memberPending: string;
    memberGuest: string;
    guestBody: string;
    guestLogin: string;
    dailyTitle: string;
    dailyDone: string;
    dailyPending: string;
    claimBtn: string;
    claimedBtn: string;
    claimingBtn: string;
    alreadyViewed: string;
    loadingContent: string;
    viewBtn: string; // 含 {label}
    loadBtn: string;
    noticeAlreadyUnlocked: string; // 含 {label}
    noticeUnlocked: string; // 含 {label}
  };

  /** MEMBER_UNLOCK_OPTIONS 各選項的六語言文字 */
  unlockOptions: Record<
    'deep_reading' | 'transit_day' | 'transit_month' | 'transit_year',
    { label: string; title: string; body: string }
  >;

  /** 各工具的「下一步建議」（三條），六語言版本 */
  nextStepsTools: Record<CalcTool, Array<{ title: string; body: string }>>;

  /** ZiweiPlainGuide */
  ziweiGuide: {
    kicker: string;
    title: string;
    body: string;
    noMajorStar: string;
    mingGongLabel: string;
    shenGongLabel: string;
    wuxingLabel: string;
    mingGongDesc: string;
    shenGongDesc: string;
    wuxingDesc: string;
    questionRoutes: Array<{ topic: string; palace: string; body: string }>;
  };

  /** 空狀態 - 宮位無主星 */
  palaceNoStar: string;

  /** 免責聲明 */
  disclaimer: string;

  /** ToolError / ToolLoading */
  error: {
    title: string;
    apiHint: string;
  };
  loading: {
    label: string;
  };

  /** 錯誤訊息 */
  notices: {
    insufficientPoints: string;
    notAuthenticated: string;
    generic: string;
    claimSuccess: string;
    claimAlready: string;
    signInFirst: string;
  };
};

const zhTW: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: '正在整理視覺結果展示',
    body: '這裡會用穩定的 2D 盤面、牌面或石面呈現結果；AR / 3D 正式版完成後再開放。',
  },
  resonance: {
    questionPrefix: '帶去問老師：',
    understandPrefix: '你可以先這樣理解',
  },
  insight: {
    memberNoteKicker: 'MEMBER NOTE',
    memberNoteTitle: '把有感的訊息收進本次解讀',
    memberNoteEmpty: '點開一張卡，留下真正有共鳴的訊息。',
    memberNoteCount: '已標記 {count} 張，預約老師時可以回頭看。',
    cardSubtitleFallback: '解讀卡片',
    cardExpand: '展開解讀',
    cardCollapse: '收起解讀',
    cardResonate: '這張有共鳴',
    cardResonated: '已加入本次筆記',
    expandAll: '展開全部 {count} 個重點',
    collapseAll: '收合重點卡片',
  },
  personalReading: {
    thisReminder: '本次提醒',
    setReminder: '設為提醒',
    reminderSet: '已設為提醒',
  },
  game: {
    kicker: 'READING MAP',
    title: '這份結果怎麼看？',
    plainNote: '不用一次讀完所有名詞。先照三步抓主軸：先看核心摘要，再看視覺盤面，最後選一個今天可以練習的提醒。',
    arLink: '看視覺盤面',
    stepPrefix: 'STEP',
  },
  nextSteps: {
    kicker: 'READING FLOW',
    title: '接下來可以這樣看',
    bookTeacher: '預約老師解讀',
    viewHistory: '查看我的解讀紀錄',
  },
  actionPath: {
    kicker: 'MEMBER ONBOARDING',
    title: '下一步很清楚，會員才會留下來',
    body: '看完結果後，先保存、再回訪、最後把有感的問題交給老師深度解讀。',
    saveTitle: '保存這次解讀',
    saveLabel: '登入並保存',
    dailyTitle: '回到每日儀式',
    dailyBody: '明天回來抽一張每日牌或盧恩，讓網站有持續陪伴感，而不是一次性工具。',
    dailyLabel: '今日儀式',
    consultTitle: '找老師深度解讀',
    consultBody: '如果某張卡或某個命盤重點很有感，可以直接帶著問題找適合的老師。',
    consultLabel: '找老師深度解讀',
    footerSave: '保存這次解讀',
    footerConsult: '找老師深度解讀',
  },
  unlock: {
    kicker: 'MEMBER EXTENDED',
    title: '延伸解讀',
    body: '登入會員後可查看深入解釋、流日、流月、流年等延伸解讀。免費工具本身就完整，延伸內容是選項。',
    memberStatusLabel: '會員狀態',
    memberLoggedIn: '已登入',
    memberPending: '...',
    memberGuest: '-',
    guestBody: '登入會員後可查看延伸解讀，每項工具的流日、流月、流年都會保存在你的會員紀錄。',
    guestLogin: '登入查看',
    dailyTitle: '每日儀式',
    dailyDone: '今天已完成每日簽到。',
    dailyPending: '完成每日儀式可開啟今日延伸解讀。',
    claimBtn: '完成每日簽到',
    claimedBtn: '今日已完成',
    claimingBtn: '處理中...',
    alreadyViewed: '已查看',
    loadingContent: '載入中...',
    viewBtn: '查看{label}',
    loadBtn: '載入內容',
    noticeAlreadyUnlocked: '{label}已經可以查看。',
    noticeUnlocked: '{label}內容已載入。',
  },
  ziweiGuide: {
    kicker: '紫微白話導讀',
    title: '先看這三件事，再進十二宮',
    body: '紫微不是一次把全部宮位背起來，而是先抓主軸，再依照你真正想問的問題看對應宮位。',
    noMajorStar: '暫無主星，需看對宮與三方四正。',
    mingGongLabel: '命宮',
    shenGongLabel: '身宮',
    wuxingLabel: '五行局',
    mingGongDesc: '命宮像人生主軸，代表你習慣怎麼面對世界，以及別人第一眼容易感受到的氣質。',
    shenGongDesc: '身宮像落地方式，表示你長大後更常用哪種方式做選擇、承擔責任與累積人生。',
    wuxingDesc: '五行局像命盤底色，幫你理解整張盤的節奏，不是吉凶判決，而是運作方式。',
    questionRoutes: [
      { topic: '感情', palace: '夫妻宮', body: '看關係模式、相處安全感與伴侶互動。' },
      { topic: '事業', palace: '官祿宮', body: '看工作風格、職涯方向與適合投入的位置。' },
      { topic: '財務', palace: '財帛宮', body: '看賺錢方式、資源流動與金錢壓力。' },
      { topic: '家庭', palace: '田宅 / 父母 / 兄弟', body: '看家族支持、居住安全感與親近關係。' },
      { topic: '外界', palace: '遷移宮', body: '看出外發展、合作機會與環境變動。' },
    ],
  },
  palaceNoStar: '暫無主星，需看對宮與三方四正。',
  disclaimer: '工具結果僅供自我探索參考，不構成任何診斷、治療、醫療或心理專業建議。若有身心不適，請尋求專業醫療或心理協助。',
  error: {
    title: '解讀失敗',
    apiHint: '請確認後端 API 正在執行，或稍後重新送出一次。',
  },
  loading: {
    label: '正在整理解讀...',
  },
  notices: {
    insufficientPoints: '目前無法查看，請明天再回來或先完成每日儀式。',
    notAuthenticated: '請先登入會員，再查看延伸內容。',
    generic: '操作暫時失敗，請稍後再試。',
    claimSuccess: '今日簽到完成，可以繼續查看延伸內容。',
    claimAlready: '今天已完成簽到，明天再回來。',
    signInFirst: '請先完成今日簽到再查看延伸內容。',
  },
  unlockOptions: {
    deep_reading: {
      label: '深入解釋',
      title: '查看本次完整解釋',
      body: '查看更完整的白話解讀：優勢、卡點、目前最該注意的地方，以及今天可以做的一個小行動。',
    },
    transit_day: {
      label: '流日',
      title: '查看今天的流日視角',
      body: '查看今天適合怎麼使用這份結果：哪裡可以前進、哪裡先不要急，避免把情緒當成答案。',
    },
    transit_month: {
      label: '流月',
      title: '查看本月流月解讀',
      body: '查看本月主題：適合累積什麼、要避開什麼消耗，以及每週可以檢查的方向。',
    },
    transit_year: {
      label: '流年',
      title: '查看今年流年解讀',
      body: '查看今年大方向：哪些事值得長期投入、哪些慣性要調整，幫你把一年拆成可走的階段。',
    },
  },
  nextStepsTools: {
    numerology: [
      { title: '先看核心數字', body: '生命靈數先看生命數、生日數與原型，再回頭理解你常用的行動模式。' },
      { title: '往下看 2D 視覺盤', body: '視覺展示會把核心數字整理成儀式星盤，先確保手機上清楚可讀。' },
      { title: '補充生活情境', body: '若要深入職涯、關係或年度主題，可以帶著結果預約老師深談。' },
    ],
    maya: [
      { title: '先看一句命中感', body: '不要先研究名詞。先看「你順的時候怎麼動、卡住時怎麼反應」那段，有刺中再往下看。' },
      { title: '再看神諭板怎麼借力', body: '本命是主軸，指引是下一步，支持是補給，挑戰是卡點，隱藏力量是低潮裡會冒出的資源。再前往視覺展示，用穩定 2D 看五個位置怎麼互相牽動。' },
      { title: '今天只做一個小實驗', body: '把結果轉成一個 24 小時內能做的動作：說一句話、放掉一件事、整理一個界線，觀察自己的感受與回饋。' },
    ],
    bazi: [
      { title: '先看日主與五行', body: '日主代表你站在世界中的基本質地，五行分布則看資源與壓力來源。' },
      { title: '往下看 2D 四柱盤', body: '視覺展示會把四柱與五行整理成可讀圖像，方便整體感受命盤結構。' },
      { title: '再看實際議題', body: '八字很適合延伸到事業節奏、關係互動與長期決策。' },
    ],
    ziwei: [
      { title: '先看命宮身宮', body: '命宮像人生主軸，身宮像實際落地方式，再搭配主星理解性格。' },
      { title: '往下看 2D 命盤', body: '視覺展示會用清楚盤面呈現命宮、身宮與宮位入口，降低初學者看盤門檻。' },
      { title: '挑一個宮位深看', body: '不要一次讀完全部，先從事業、感情或財務其中一個問題切入。' },
    ],
    tarot: [
      { title: '先看問題與位置', body: '塔羅要先回到你問的問題，再看每張牌落在過去、現在或未來的位置。' },
      { title: '往下看 2D 牌面', body: '視覺展示會顯示牌名、正逆位、關鍵字與你選的牌組風格。' },
      { title: '把答案化成行動', body: '最後整理成今天能做的一步，不要只停在觀察。' },
    ],
    runes: [
      { title: '先看符文與正逆位', body: '盧恩訊息通常直接，先看符文主題，再看它提醒的是阻礙或資源。' },
      { title: '往下看 2D 石面', body: '視覺展示會依石面、木頭或水晶材質呈現符文，讓抽石更有儀式感。' },
      { title: '留下今日行動句', body: '把結果整理成一句今天可執行的提醒，最容易養成回訪習慣。' },
    ],
    astro: [
      { title: '先看太陽月亮上升', body: '太陽看核心意志，月亮看情緒需求，上升看外在應對方式。' },
      { title: '往下看 2D 星盤', body: '視覺展示會把行星重點轉成星盤摘要，幫你先建立整體感。' },
      { title: '再看宮位與相位', body: '想深入解讀人生事件時，再進一步看宮位與相位互動。' },
    ],
    humandesign: [
      { title: '先看類型與權威', body: '類型決定互動方式，內在權威決定你如何做決策。' },
      { title: '往下看 2D BodyGraph', body: '先用清楚的 2D BodyGraph 整理中心、通道與閘門，建立整體架構感。' },
      { title: '挑啟動閘門深讀', body: '先從已啟動閘門挑三個最有感的主題，不需要一次讀完全部。' },
    ],
  },
};

const en: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: 'Preparing the visual result stage',
    body: 'Results will appear as a clear 2D chart, card layout, or stone face. The full AR / 3D experience will open when it is ready.',
  },
  resonance: {
    questionPrefix: 'Ask your teacher: ',
    understandPrefix: 'A useful way to start',
  },
  insight: {
    memberNoteKicker: 'MEMBER NOTE',
    memberNoteTitle: 'Collect the messages that resonate',
    memberNoteEmpty: 'Open a card and mark the ones that feel true.',
    memberNoteCount: '{count} marked — come back to these when you meet your teacher.',
    cardSubtitleFallback: 'Reading card',
    cardExpand: 'Open reading',
    cardCollapse: 'Close reading',
    cardResonate: 'This resonates',
    cardResonated: 'Added to this session',
    expandAll: 'Show all {count} cards',
    collapseAll: 'Collapse cards',
  },
  personalReading: {
    thisReminder: 'Your reminder',
    setReminder: 'Set as reminder',
    reminderSet: 'Reminder set',
  },
  game: {
    kicker: 'READING MAP',
    title: 'How to read this result',
    plainNote: 'No need to read every term at once. Follow three steps: read the key summary, view the visual chart, then pick one reminder to try today.',
    arLink: 'View visual chart',
    stepPrefix: 'STEP',
  },
  nextSteps: {
    kicker: 'READING FLOW',
    title: 'What to do next',
    bookTeacher: 'Book a teacher',
    viewHistory: 'View my reading history',
  },
  actionPath: {
    kicker: 'MEMBER ONBOARDING',
    title: 'Three clear next steps',
    body: 'Save first, revisit later, then bring your most resonant question to a teacher for a deeper session.',
    saveTitle: 'Save this reading',
    saveLabel: 'Log in and save',
    dailyTitle: 'Return to daily ritual',
    dailyBody: 'Come back tomorrow for a daily card or rune so the platform stays a steady companion, not a one-time tool.',
    dailyLabel: 'Daily ritual',
    consultTitle: 'Book a deeper reading',
    consultBody: 'If a card or chart section really lands, bring that question to a teacher for a focused session.',
    consultLabel: 'Find a teacher',
    footerSave: 'Save this reading',
    footerConsult: 'Find a teacher',
  },
  unlock: {
    kicker: 'MEMBER EXTENDED',
    title: 'Extended readings',
    body: 'Log in to access in-depth explanations and daily, monthly, and yearly extended readings. The free tool is already complete — this is optional.',
    memberStatusLabel: 'Member status',
    memberLoggedIn: 'Logged in',
    memberPending: '...',
    memberGuest: '—',
    guestBody: 'Log in to view extended readings. Daily, monthly, and yearly insights for every tool will be saved to your member account.',
    guestLogin: 'Log in to view',
    dailyTitle: 'Daily ritual',
    dailyDone: 'Daily check-in done for today.',
    dailyPending: 'Complete the daily ritual to unlock extended readings for today.',
    claimBtn: 'Complete daily check-in',
    claimedBtn: 'Done for today',
    claimingBtn: 'Processing...',
    alreadyViewed: 'Viewed',
    loadingContent: 'Loading...',
    viewBtn: 'View {label}',
    loadBtn: 'Load content',
    noticeAlreadyUnlocked: '{label} is already available.',
    noticeUnlocked: '{label} content loaded.',
  },
  ziweiGuide: {
    kicker: 'Zi Wei Plain Guide',
    title: 'Look at these three things before the twelve palaces',
    body: 'Zi Wei is not about memorising all twelve palaces at once. Start with the main axis, then go to the palace that matches your real question.',
    noMajorStar: 'No major star. Check the opposite palace and the four major triangles.',
    mingGongLabel: 'Life Palace',
    shenGongLabel: 'Body Palace',
    wuxingLabel: 'Five-Element Cycle',
    mingGongDesc: 'The Life Palace is your personal axis — it shows how you naturally meet the world and the impression others tend to get at first glance.',
    shenGongDesc: 'The Body Palace reveals your landing style — how you make decisions, take on responsibility, and build your life as you grow.',
    wuxingDesc: 'The Five-Element Cycle is the undertone of the chart. It helps you understand the chart\'s rhythm, not as a verdict of luck or misfortune but as the way energy moves.',
    questionRoutes: [
      { topic: 'Relationships', palace: 'Spouse Palace', body: 'Relationship patterns, emotional safety, and partner dynamics.' },
      { topic: 'Career', palace: 'Career Palace', body: 'Work style, career direction, and where to invest energy.' },
      { topic: 'Finance', palace: 'Wealth Palace', body: 'How you earn, resource flow, and financial pressure.' },
      { topic: 'Family', palace: 'Property / Parents / Siblings', body: 'Family support, sense of home, and close relationships.' },
      { topic: 'External', palace: 'Migration Palace', body: 'Development outside home, partnerships, and environmental shifts.' },
    ],
  },
  palaceNoStar: 'No major star. Check the opposite palace and the four major triangles.',
  disclaimer: 'Results are for self-exploration only and do not constitute any diagnosis, treatment, medical, or professional psychological advice. If you are experiencing physical or mental distress, please seek professional medical or psychological support.',
  error: {
    title: 'Reading failed',
    apiHint: 'Please confirm the backend API is running, or try submitting again later.',
  },
  loading: {
    label: 'Preparing your reading...',
  },
  notices: {
    insufficientPoints: 'Unable to view right now. Come back tomorrow or complete the daily ritual first.',
    notAuthenticated: 'Please log in to view extended content.',
    generic: 'Something went wrong. Please try again.',
    claimSuccess: 'Daily check-in complete. You can now view extended content.',
    claimAlready: 'Already checked in today. Come back tomorrow.',
    signInFirst: 'Please complete the daily ritual before viewing extended content.',
  },
  unlockOptions: {
    deep_reading: {
      label: 'Deep reading',
      title: 'View the full reading',
      body: 'Read a fuller plain-language interpretation: strengths, stuck points, what to watch right now, and one small action for today.',
    },
    transit_day: {
      label: 'Daily transit',
      title: "View today's daily transit",
      body: 'See how to use this result today: where to move forward, where to slow down, and how to avoid letting emotions call the shots.',
    },
    transit_month: {
      label: 'Monthly transit',
      title: "View this month's transit reading",
      body: "See this month's theme: what to build steadily, what drains to avoid, and a direction to check in with each week.",
    },
    transit_year: {
      label: 'Yearly transit',
      title: "View this year's transit reading",
      body: "See the big picture for the year: what's worth long-term investment, which habits to shift, and how to break the year into walkable stages.",
    },
  },
  nextStepsTools: {
    numerology: [
      { title: 'Start with the core numbers', body: 'Look at your Life Path number, Birthday number, and archetype first — then go back to understand your usual patterns of action.' },
      { title: 'Explore the 2D visual chart', body: 'The visual display arranges your core numbers into a ritual chart. Make sure it reads clearly on your device before diving deeper.' },
      { title: 'Bring in a life context', body: 'If you want to explore career, relationships, or a yearly theme, bring these results to a teacher for a deeper conversation.' },
    ],
    maya: [
      { title: 'Find the line that lands', body: "Don't start with the terminology. Find the part that describes how you move when things flow — and how you react when stuck. If it resonates, read on." },
      { title: 'See how the oracle board works together', body: 'Your birth seal is the main axis. Guidance is your next step, Support is your resource, Challenge is the stuck point, and Hidden Power is what surfaces in low moments. Then check the 2D display to see how all five positions interact.' },
      { title: 'Run one small experiment today', body: 'Translate the result into one action within the next 24 hours: say something, let something go, set a boundary. Notice what shifts in how you feel.' },
    ],
    bazi: [
      { title: 'Start with Day Master and Five Elements', body: 'Your Day Master shows your core quality in relation to the world. The Five Element balance reveals where your resources and pressures come from.' },
      { title: 'Explore the 2D Four Pillars chart', body: 'The visual display organises the Four Pillars and Five Elements into a readable image so you can take in the overall structure.' },
      { title: 'Connect it to a real situation', body: "Ba Zi works well for career timing, relationship dynamics, and long-term decisions. Bring a specific question to make it practical." },
    ],
    ziwei: [
      { title: 'Start with Life Palace and Body Palace', body: 'The Life Palace is your main axis; the Body Palace is how that energy lands in practice. Pair them with the major star to understand your character.' },
      { title: 'Explore the 2D chart', body: 'The visual display shows the Life Palace, Body Palace, and palace entrances on a clear grid — a good starting point before going palace by palace.' },
      { title: 'Pick one palace to go deep', body: "Don't try to read everything at once. Start with the palace that matches your current question — career, relationships, or finances." },
    ],
    tarot: [
      { title: 'Return to your question and position', body: 'Go back to what you asked, then look at where each card sits — past, present, or future.' },
      { title: 'Explore the 2D card spread', body: 'The visual display shows card names, upright or reversed orientation, key words, and the deck style you chose.' },
      { title: 'Turn the answer into one action', body: 'Finish by identifying one step you can take today. The reading is most useful when it moves you forward.' },
    ],
    runes: [
      { title: 'Start with the rune and its orientation', body: "Rune messages tend to be direct. Look at the core theme first, then see whether it's pointing to an obstacle or a resource." },
      { title: 'Explore the 2D stone display', body: 'The visual display renders each rune on the material you chose — stone, wood, or crystal — to give the reading a more grounded feel.' },
      { title: 'Write one action sentence for today', body: 'Distil the result into a single reminder you can act on today. That habit builds the most natural reason to return.' },
    ],
    astro: [
      { title: 'Start with Sun, Moon, and Ascendant', body: 'Sun shows core intent, Moon shows emotional needs, Ascendant shows how you meet the outside world.' },
      { title: 'Explore the 2D chart', body: 'The visual display turns the key planetary positions into a chart summary so you can build a sense of the whole before zooming in.' },
      { title: 'Then look at houses and aspects', body: 'When you want to understand specific life events more precisely, go deeper into house placements and planetary aspects.' },
    ],
    humandesign: [
      { title: 'Start with Type and Authority', body: 'Your Type shapes how you engage with the world; your Inner Authority guides how you make decisions that feel right.' },
      { title: 'Explore the 2D BodyGraph', body: 'Use the clear 2D BodyGraph to orient yourself around the centres, channels, and gates before going into detail.' },
      { title: 'Pick three activated gates to explore', body: "Choose the three activated gates that resonate most strongly. There's no need to work through everything at once." },
    ],
  },
};

const vi: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: 'Đang chuẩn bị giai đoạn trực quan',
    body: 'Kết quả sẽ hiển thị dưới dạng sơ đồ 2D rõ ràng, bố cục bài, hoặc mặt đá. AR / 3D đầy đủ sẽ mở khi sẵn sàng.',
  },
  resonance: {
    questionPrefix: 'Hỏi giáo viên: ',
    understandPrefix: 'Cách bắt đầu hữu ích',
  },
  insight: {
    memberNoteKicker: 'GHI CHÚ HỘI VIÊN',
    memberNoteTitle: 'Thu thập những thông điệp có cộng hưởng',
    memberNoteEmpty: 'Mở một thẻ và đánh dấu những cái cảm thấy đúng.',
    memberNoteCount: 'Đã đánh dấu {count} thẻ — quay lại xem khi gặp giáo viên.',
    cardSubtitleFallback: 'Thẻ giải đọc',
    cardExpand: 'Mở giải đọc',
    cardCollapse: 'Đóng giải đọc',
    cardResonate: 'Điều này có cộng hưởng',
    cardResonated: 'Đã thêm vào phiên này',
    expandAll: 'Hiện tất cả {count} thẻ',
    collapseAll: 'Thu gọn thẻ',
  },
  personalReading: {
    thisReminder: 'Nhắc nhở của bạn',
    setReminder: 'Đặt làm nhắc nhở',
    reminderSet: 'Đã đặt nhắc nhở',
  },
  game: {
    kicker: 'BẢN ĐỒ ĐỌC',
    title: 'Cách đọc kết quả này',
    plainNote: 'Không cần đọc mọi thuật ngữ ngay. Theo ba bước: đọc tóm tắt chính, xem sơ đồ trực quan, rồi chọn một nhắc nhở để thử hôm nay.',
    arLink: 'Xem sơ đồ trực quan',
    stepPrefix: 'BƯỚC',
  },
  nextSteps: {
    kicker: 'LUỒNG ĐỌC',
    title: 'Tiếp theo nên làm gì',
    bookTeacher: 'Đặt lịch với giáo viên',
    viewHistory: 'Xem lịch sử giải đọc',
  },
  actionPath: {
    kicker: 'HƯỚNG DẪN HỘI VIÊN',
    title: 'Ba bước tiếp theo rõ ràng',
    body: 'Lưu trước, xem lại sau, rồi mang câu hỏi ấn tượng nhất đến giáo viên để có buổi sâu hơn.',
    saveTitle: 'Lưu lần đọc này',
    saveLabel: 'Đăng nhập và lưu',
    dailyTitle: 'Quay lại nghi lễ hàng ngày',
    dailyBody: 'Quay lại ngày mai rút bài hoặc rune hàng ngày để nền tảng là người bạn đồng hành ổn định.',
    dailyLabel: 'Nghi lễ hàng ngày',
    consultTitle: 'Đặt buổi đọc sâu hơn',
    consultBody: 'Nếu một thẻ hoặc phần sơ đồ thực sự ấn tượng, mang câu hỏi đó đến giáo viên.',
    consultLabel: 'Tìm giáo viên',
    footerSave: 'Lưu lần đọc này',
    footerConsult: 'Tìm giáo viên',
  },
  unlock: {
    kicker: 'MỞ RỘNG HỘI VIÊN',
    title: 'Đọc mở rộng',
    body: 'Đăng nhập để truy cập giải thích chuyên sâu và đọc mở rộng theo ngày, tháng, năm. Công cụ miễn phí đã đầy đủ — đây là tùy chọn.',
    memberStatusLabel: 'Trạng thái hội viên',
    memberLoggedIn: 'Đã đăng nhập',
    memberPending: '...',
    memberGuest: '—',
    guestBody: 'Đăng nhập để xem đọc mở rộng. Thông tin hàng ngày, hàng tháng, hàng năm sẽ được lưu vào tài khoản hội viên.',
    guestLogin: 'Đăng nhập để xem',
    dailyTitle: 'Nghi lễ hàng ngày',
    dailyDone: 'Đã hoàn thành check-in hôm nay.',
    dailyPending: 'Hoàn thành nghi lễ hàng ngày để mở khóa đọc mở rộng.',
    claimBtn: 'Hoàn thành check-in hàng ngày',
    claimedBtn: 'Đã xong hôm nay',
    claimingBtn: 'Đang xử lý...',
    alreadyViewed: 'Đã xem',
    loadingContent: 'Đang tải...',
    viewBtn: 'Xem {label}',
    loadBtn: 'Tải nội dung',
    noticeAlreadyUnlocked: '{label} đã có thể xem.',
    noticeUnlocked: 'Nội dung {label} đã được tải.',
  },
  ziweiGuide: {
    kicker: 'Hướng Dẫn Tử Vi',
    title: 'Xem ba điều này trước mười hai cung',
    body: 'Tử Vi không phải thuộc lòng tất cả mười hai cung. Bắt đầu với trục chính, rồi đi đến cung phù hợp câu hỏi thực của bạn.',
    noMajorStar: 'Không có chính tinh. Kiểm tra cung đối diện và tứ chính tam hợp.',
    mingGongLabel: 'Mệnh Cung',
    shenGongLabel: 'Thân Cung',
    wuxingLabel: 'Ngũ Hành Cục',
    mingGongDesc: 'Mệnh Cung như trục chính cuộc đời — thể hiện cách bạn quen đối mặt với thế giới và ấn tượng người khác dễ cảm nhận ngay từ cái nhìn đầu tiên.',
    shenGongDesc: 'Thân Cung như cách tiếp đất — cho thấy bạn ngày càng dùng phong cách nào để ra quyết định, gánh vác trách nhiệm và tích lũy cuộc sống.',
    wuxingDesc: 'Ngũ Hành Cục như nền tảng của lá số — giúp bạn hiểu nhịp điệu của toàn bộ lá số, không phải là phán quyết về may rủi mà là cách năng lượng vận hành.',
    questionRoutes: [
      { topic: 'Tình cảm', palace: 'Phu Thê Cung', body: 'Mô hình quan hệ, an toàn cảm xúc và năng động bạn đời.' },
      { topic: 'Sự nghiệp', palace: 'Quan Lộc Cung', body: 'Phong cách làm việc, hướng sự nghiệp và nơi đầu tư năng lượng.' },
      { topic: 'Tài chính', palace: 'Tài Bạch Cung', body: 'Cách kiếm tiền, dòng chảy tài nguyên và áp lực tài chính.' },
      { topic: 'Gia đình', palace: 'Điền Trạch / Phụ Mẫu / Huynh Đệ', body: 'Hỗ trợ gia đình, cảm giác nhà và các mối quan hệ thân thiết.' },
      { topic: 'Bên ngoài', palace: 'Thiên Di Cung', body: 'Phát triển bên ngoài, hợp tác và thay đổi môi trường.' },
    ],
  },
  palaceNoStar: 'Không có chính tinh. Kiểm tra cung đối diện và tứ chính tam hợp.',
  disclaimer: 'Kết quả chỉ để tham khảo tự khám phá, không cấu thành bất kỳ chẩn đoán, điều trị, lời khuyên y tế hoặc tâm lý chuyên nghiệp nào. Nếu bạn gặp khó khăn về thể chất hoặc tinh thần, hãy tìm kiếm sự hỗ trợ chuyên nghiệp.',
  error: {
    title: 'Giải đọc thất bại',
    apiHint: 'Vui lòng xác nhận backend API đang chạy, hoặc thử gửi lại sau.',
  },
  loading: {
    label: 'Đang chuẩn bị giải đọc...',
  },
  notices: {
    insufficientPoints: 'Không thể xem ngay. Quay lại ngày mai hoặc hoàn thành nghi lễ hàng ngày trước.',
    notAuthenticated: 'Vui lòng đăng nhập để xem nội dung mở rộng.',
    generic: 'Có lỗi xảy ra. Vui lòng thử lại.',
    claimSuccess: 'Check-in hàng ngày hoàn thành. Bạn có thể xem nội dung mở rộng.',
    claimAlready: 'Đã check-in hôm nay. Quay lại ngày mai.',
    signInFirst: 'Vui lòng hoàn thành nghi lễ hàng ngày trước khi xem nội dung mở rộng.',
  },
  unlockOptions: {
    deep_reading: {
      label: 'Đọc sâu',
      title: 'Xem toàn bộ giải thích',
      body: 'Đọc giải thích đầy đủ hơn: điểm mạnh, điểm kẹt, điều cần chú ý hiện tại và một hành động nhỏ cho hôm nay.',
    },
    transit_day: {
      label: 'Vận ngày',
      title: 'Xem vận ngày hôm nay',
      body: 'Xem cách sử dụng kết quả này hôm nay: nơi có thể tiến, nơi nên từ từ, tránh để cảm xúc quyết định.',
    },
    transit_month: {
      label: 'Vận tháng',
      title: 'Xem vận tháng này',
      body: 'Xem chủ đề tháng này: nên tích lũy gì, tránh tiêu hao gì và hướng kiểm tra mỗi tuần.',
    },
    transit_year: {
      label: 'Vận năm',
      title: 'Xem vận năm nay',
      body: 'Xem bức tranh lớn của năm: điều gì đáng đầu tư dài hạn, thói quen nào cần điều chỉnh.',
    },
  },
  nextStepsTools: {
    numerology: [
      { title: 'Bắt đầu với các con số cốt lõi', body: 'Xem số Đường Đời, số Ngày Sinh và nguyên mẫu trước — rồi quay lại hiểu các kiểu hành động thường dùng của bạn.' },
      { title: 'Khám phá biểu đồ 2D', body: 'Màn hình trực quan sắp xếp các con số cốt lõi thành sơ đồ. Hãy đảm bảo nó hiển thị rõ ràng trên thiết bị trước khi đọc sâu hơn.' },
      { title: 'Kết nối với bối cảnh thực tế', body: 'Nếu muốn khám phá sự nghiệp, các mối quan hệ hoặc chủ đề năm, hãy mang kết quả này đến gặp thầy để trao đổi sâu hơn.' },
    ],
    maya: [
      { title: 'Tìm câu chạm đúng tim', body: 'Đừng bắt đầu bằng thuật ngữ. Tìm đoạn mô tả cách bạn vận động khi thuận — và phản ứng khi kẹt. Nếu cộng hưởng, hãy đọc tiếp.' },
      { title: 'Xem cách bảng thần chú kết nối', body: 'Mệnh là trục chính, Hướng dẫn là bước tiếp, Hỗ trợ là nguồn lực, Thách thức là điểm kẹt, Sức mạnh ẩn là thứ nổi lên lúc khó khăn. Sau đó xem màn hình 2D để thấy năm vị trí tương tác thế nào.' },
      { title: 'Chỉ làm một thử nghiệm nhỏ hôm nay', body: 'Biến kết quả thành một hành động trong 24 giờ: nói điều gì đó, buông bỏ điều gì đó, thiết lập một ranh giới. Quan sát cảm nhận và phản hồi của bạn.' },
    ],
    bazi: [
      { title: 'Bắt đầu với Nhật Chủ và Ngũ Hành', body: 'Nhật Chủ cho thấy chất lượng cốt lõi của bạn. Phân bố Ngũ Hành cho thấy nguồn lực và áp lực từ đâu đến.' },
      { title: 'Khám phá biểu đồ 2D Tứ Trụ', body: 'Màn hình trực quan tổ chức Tứ Trụ và Ngũ Hành thành hình ảnh dễ đọc để bạn nắm bắt cấu trúc tổng thể.' },
      { title: 'Kết nối với tình huống thực tế', body: 'Bát Tự phù hợp để khám phá nhịp điệu sự nghiệp, động lực mối quan hệ và quyết định dài hạn. Hãy mang câu hỏi cụ thể để đi sâu hơn.' },
    ],
    ziwei: [
      { title: 'Bắt đầu với Mệnh Cung và Thân Cung', body: 'Mệnh Cung là trục chính; Thân Cung là cách năng lượng đó thể hiện trong thực tế. Kết hợp với chính tinh để hiểu tính cách.' },
      { title: 'Khám phá biểu đồ 2D', body: 'Màn hình trực quan hiển thị Mệnh Cung, Thân Cung và các cung trên lưới rõ ràng — điểm khởi đầu tốt trước khi đi vào từng cung.' },
      { title: 'Chọn một cung để đi sâu', body: 'Đừng cố đọc tất cả mọi thứ cùng lúc. Bắt đầu với cung phù hợp với câu hỏi hiện tại của bạn — sự nghiệp, các mối quan hệ hoặc tài chính.' },
    ],
    tarot: [
      { title: 'Quay lại câu hỏi và vị trí', body: 'Nhớ lại điều bạn hỏi, rồi xem mỗi lá bài nằm ở đâu — quá khứ, hiện tại hay tương lai.' },
      { title: 'Khám phá trải bài 2D', body: 'Màn hình trực quan hiển thị tên lá bài, xuôi hay ngược, từ khóa và phong cách bộ bài bạn chọn.' },
      { title: 'Biến câu trả lời thành hành động', body: 'Kết thúc bằng cách xác định một bước bạn có thể thực hiện hôm nay. Bài đọc hữu ích nhất khi nó giúp bạn tiến về phía trước.' },
    ],
    runes: [
      { title: 'Bắt đầu với rune và chiều hướng', body: 'Thông điệp rune thường trực tiếp. Xem chủ đề cốt lõi trước, rồi xem nó đang chỉ ra trở ngại hay nguồn lực.' },
      { title: 'Khám phá màn hình đá 2D', body: 'Màn hình trực quan hiển thị mỗi rune trên chất liệu bạn chọn — đá, gỗ hoặc pha lê — để buổi bói đá có cảm giác nghi thức hơn.' },
      { title: 'Viết một câu hành động cho hôm nay', body: 'Cô đọng kết quả thành một lời nhắc bạn có thể thực hiện hôm nay. Thói quen đó xây dựng lý do tự nhiên nhất để quay lại.' },
    ],
    astro: [
      { title: 'Bắt đầu với Mặt Trời, Mặt Trăng và Ascendant', body: 'Mặt Trời cho thấy ý chí cốt lõi, Mặt Trăng cho thấy nhu cầu cảm xúc, Ascendant cho thấy cách bạn gặp gỡ thế giới bên ngoài.' },
      { title: 'Khám phá biểu đồ 2D', body: 'Màn hình trực quan chuyển các vị trí hành tinh quan trọng thành tóm tắt biểu đồ để bạn xây dựng cảm nhận tổng thể trước khi đi vào chi tiết.' },
      { title: 'Rồi xem cung và khía cạnh', body: 'Khi muốn hiểu chính xác hơn các sự kiện trong cuộc sống, hãy đi sâu vào vị trí cung và các khía cạnh hành tinh.' },
    ],
    humandesign: [
      { title: 'Bắt đầu với Loại và Thẩm quyền', body: 'Loại của bạn định hình cách bạn tương tác với thế giới; Thẩm quyền Nội tâm hướng dẫn cách bạn ra quyết định cảm thấy đúng.' },
      { title: 'Khám phá BodyGraph 2D', body: 'Dùng BodyGraph 2D rõ ràng để định hướng các trung tâm, kênh và cổng trước khi đi vào chi tiết.' },
      { title: 'Chọn ba cổng được kích hoạt để khám phá', body: 'Chọn ba cổng được kích hoạt mà bạn cộng hưởng mạnh nhất. Không cần phải xem qua tất cả mọi thứ cùng một lúc.' },
    ],
  },
};

const id: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: 'Menyiapkan tahap visual',
    body: 'Hasil akan ditampilkan sebagai diagram 2D yang jelas, tata letak kartu, atau permukaan batu. AR / 3D lengkap akan dibuka saat siap.',
  },
  resonance: {
    questionPrefix: 'Tanyakan ke guru: ',
    understandPrefix: 'Cara mulai yang berguna',
  },
  insight: {
    memberNoteKicker: 'CATATAN ANGGOTA',
    memberNoteTitle: 'Kumpulkan pesan yang beresonansi',
    memberNoteEmpty: 'Buka satu kartu dan tandai yang terasa benar.',
    memberNoteCount: '{count} ditandai — kembali ke sini saat bertemu guru.',
    cardSubtitleFallback: 'Kartu bacaan',
    cardExpand: 'Buka bacaan',
    cardCollapse: 'Tutup bacaan',
    cardResonate: 'Ini beresonansi',
    cardResonated: 'Ditambahkan ke sesi ini',
    expandAll: 'Tampilkan semua {count} kartu',
    collapseAll: 'Ciutkan kartu',
  },
  personalReading: {
    thisReminder: 'Pengingat Anda',
    setReminder: 'Jadikan pengingat',
    reminderSet: 'Pengingat sudah diatur',
  },
  game: {
    kicker: 'PETA BACAAN',
    title: 'Cara membaca hasil ini',
    plainNote: 'Tidak perlu membaca semua istilah sekaligus. Ikuti tiga langkah: baca ringkasan utama, lihat diagram visual, lalu pilih satu pengingat untuk dicoba hari ini.',
    arLink: 'Lihat diagram visual',
    stepPrefix: 'LANGKAH',
  },
  nextSteps: {
    kicker: 'ALUR BACAAN',
    title: 'Apa yang harus dilakukan selanjutnya',
    bookTeacher: 'Pesan guru',
    viewHistory: 'Lihat riwayat bacaan',
  },
  actionPath: {
    kicker: 'ORIENTASI ANGGOTA',
    title: 'Tiga langkah jelas berikutnya',
    body: 'Simpan dulu, kunjungi lagi nanti, lalu bawa pertanyaan paling berkesan ke guru untuk sesi yang lebih dalam.',
    saveTitle: 'Simpan bacaan ini',
    saveLabel: 'Masuk dan simpan',
    dailyTitle: 'Kembali ke ritual harian',
    dailyBody: 'Kembali besok untuk kartu atau rune harian agar platform menjadi teman tetap, bukan alat sekali pakai.',
    dailyLabel: 'Ritual harian',
    consultTitle: 'Pesan bacaan lebih dalam',
    consultBody: 'Jika sebuah kartu atau bagian diagram benar-benar mendarat, bawa pertanyaan itu ke guru.',
    consultLabel: 'Cari guru',
    footerSave: 'Simpan bacaan ini',
    footerConsult: 'Cari guru',
  },
  unlock: {
    kicker: 'DIPERLUAS ANGGOTA',
    title: 'Bacaan diperluas',
    body: 'Masuk untuk mengakses penjelasan mendalam dan bacaan harian, bulanan, dan tahunan yang diperluas. Alat gratis sudah lengkap — ini opsional.',
    memberStatusLabel: 'Status anggota',
    memberLoggedIn: 'Masuk',
    memberPending: '...',
    memberGuest: '—',
    guestBody: 'Masuk untuk melihat bacaan diperluas. Wawasan harian, bulanan, dan tahunan akan disimpan ke akun anggota Anda.',
    guestLogin: 'Masuk untuk melihat',
    dailyTitle: 'Ritual harian',
    dailyDone: 'Check-in harian selesai untuk hari ini.',
    dailyPending: 'Selesaikan ritual harian untuk membuka bacaan diperluas.',
    claimBtn: 'Selesaikan check-in harian',
    claimedBtn: 'Selesai untuk hari ini',
    claimingBtn: 'Memproses...',
    alreadyViewed: 'Sudah dilihat',
    loadingContent: 'Memuat...',
    viewBtn: 'Lihat {label}',
    loadBtn: 'Muat konten',
    noticeAlreadyUnlocked: '{label} sudah tersedia.',
    noticeUnlocked: 'Konten {label} dimuat.',
  },
  ziweiGuide: {
    kicker: 'Panduan Zi Wei',
    title: 'Lihat tiga hal ini sebelum dua belas istana',
    body: 'Zi Wei bukan tentang menghafal semua dua belas istana sekaligus. Mulai dengan sumbu utama, lalu pergi ke istana yang sesuai pertanyaan nyata Anda.',
    noMajorStar: 'Tidak ada bintang utama. Periksa istana berlawanan dan empat segitiga utama.',
    mingGongLabel: 'Istana Kehidupan',
    shenGongLabel: 'Istana Raga',
    wuxingLabel: 'Siklus Lima Elemen',
    mingGongDesc: 'Istana Kehidupan adalah sumbu utama hidup Anda — menunjukkan cara Anda biasa menghadapi dunia dan kesan yang mudah dirasakan orang lain saat pertama kali bertemu Anda.',
    shenGongDesc: 'Istana Raga adalah cara Anda mendarat — menunjukkan gaya yang makin sering Anda gunakan saat membuat keputusan, memikul tanggung jawab, dan menumpuk pengalaman hidup.',
    wuxingDesc: 'Siklus Lima Elemen adalah warna dasar peta nasib Anda — membantu Anda memahami ritme seluruh peta, bukan sebagai vonis baik-buruk melainkan sebagai cara energi bekerja.',
    questionRoutes: [
      { topic: 'Hubungan', palace: 'Istana Pasangan', body: 'Pola hubungan, keamanan emosional, dan dinamika pasangan.' },
      { topic: 'Karier', palace: 'Istana Karier', body: 'Gaya kerja, arah karier, dan di mana menginvestasikan energi.' },
      { topic: 'Keuangan', palace: 'Istana Kekayaan', body: 'Cara mendapat penghasilan, aliran sumber daya, dan tekanan keuangan.' },
      { topic: 'Keluarga', palace: 'Properti / Orang Tua / Saudara', body: 'Dukungan keluarga, rasa rumah, dan hubungan dekat.' },
      { topic: 'Eksternal', palace: 'Istana Migrasi', body: 'Pengembangan di luar rumah, kemitraan, dan pergeseran lingkungan.' },
    ],
  },
  palaceNoStar: 'Tidak ada bintang utama. Periksa istana berlawanan dan empat segitiga utama.',
  disclaimer: 'Hasil hanya untuk eksplorasi diri dan tidak merupakan diagnosis, perawatan, saran medis, atau psikologis profesional apa pun. Jika Anda mengalami kesulitan fisik atau mental, carilah dukungan profesional.',
  error: {
    title: 'Bacaan gagal',
    apiHint: 'Harap konfirmasi backend API sedang berjalan, atau coba kirim ulang nanti.',
  },
  loading: {
    label: 'Menyiapkan bacaan Anda...',
  },
  notices: {
    insufficientPoints: 'Tidak dapat melihat sekarang. Kembali besok atau selesaikan ritual harian terlebih dahulu.',
    notAuthenticated: 'Harap masuk untuk melihat konten diperluas.',
    generic: 'Terjadi kesalahan. Silakan coba lagi.',
    claimSuccess: 'Check-in harian selesai. Anda dapat melihat konten diperluas.',
    claimAlready: 'Sudah check-in hari ini. Kembali besok.',
    signInFirst: 'Harap selesaikan ritual harian sebelum melihat konten diperluas.',
  },
  unlockOptions: {
    deep_reading: {
      label: 'Bacaan mendalam',
      title: 'Lihat penjelasan lengkap',
      body: 'Baca interpretasi bahasa sederhana yang lebih lengkap: kekuatan, titik macet, apa yang perlu diperhatikan sekarang, dan satu tindakan kecil untuk hari ini.',
    },
    transit_day: {
      label: 'Transit harian',
      title: 'Lihat transit harian hari ini',
      body: 'Lihat cara menggunakan hasil ini hari ini: di mana bisa maju, di mana harus pelan, dan hindari membiarkan emosi mengambil keputusan.',
    },
    transit_month: {
      label: 'Transit bulanan',
      title: 'Lihat bacaan transit bulan ini',
      body: 'Lihat tema bulan ini: apa yang perlu dibangun secara bertahap, apa yang perlu dihindari, dan arah untuk diperiksa setiap minggu.',
    },
    transit_year: {
      label: 'Transit tahunan',
      title: 'Lihat bacaan transit tahun ini',
      body: 'Lihat gambaran besar tahun ini: apa yang layak investasi jangka panjang, kebiasaan mana yang perlu disesuaikan.',
    },
  },
  nextStepsTools: {
    numerology: [
      { title: 'Mulai dengan angka inti', body: 'Lihat Angka Jalur Kehidupan, Angka Hari Lahir, dan arketipe dulu — lalu kembali untuk memahami pola tindakan yang biasa Anda gunakan.' },
      { title: 'Jelajahi diagram 2D', body: 'Tampilan visual menyusun angka-angka inti ke dalam diagram ritual. Pastikan terbaca jelas di perangkat Anda sebelum membaca lebih dalam.' },
      { title: 'Hubungkan dengan konteks nyata', body: 'Jika ingin menjelajahi karier, hubungan, atau tema tahunan, bawa hasil ini ke guru untuk percakapan yang lebih mendalam.' },
    ],
    maya: [
      { title: 'Temukan kalimat yang tepat sasaran', body: 'Jangan mulai dengan istilah. Temukan bagian yang menggambarkan cara Anda bergerak saat lancar — dan bereaksi saat terjebak. Jika beresonansi, lanjutkan membaca.' },
      { title: 'Lihat cara papan oracle bekerja bersama', body: 'Kelahiran adalah sumbu utama, Panduan adalah langkah berikutnya, Dukungan adalah sumber daya, Tantangan adalah titik macet, Kekuatan Tersembunyi adalah yang muncul di saat sulit. Lalu cek tampilan 2D untuk melihat bagaimana kelima posisi berinteraksi.' },
      { title: 'Lakukan satu percobaan kecil hari ini', body: 'Ubah hasil menjadi satu tindakan dalam 24 jam: katakan sesuatu, lepaskan sesuatu, tetapkan batas. Perhatikan perasaan dan umpan balik Anda.' },
    ],
    bazi: [
      { title: 'Mulai dengan Tuan Hari dan Lima Elemen', body: 'Tuan Hari menunjukkan kualitas inti Anda. Distribusi Lima Elemen menunjukkan dari mana sumber daya dan tekanan Anda berasal.' },
      { title: 'Jelajahi diagram 2D Empat Pilar', body: 'Tampilan visual mengatur Empat Pilar dan Lima Elemen menjadi gambar yang mudah dibaca agar Anda dapat memahami struktur secara keseluruhan.' },
      { title: 'Hubungkan dengan situasi nyata', body: 'Ba Zi cocok untuk mengeksplorasi ritme karier, dinamika hubungan, dan keputusan jangka panjang. Bawa pertanyaan spesifik untuk lebih mendalam.' },
    ],
    ziwei: [
      { title: 'Mulai dengan Istana Kehidupan dan Istana Raga', body: 'Istana Kehidupan adalah sumbu utama; Istana Raga adalah cara energi itu mendarat dalam praktik. Padukan dengan bintang utama untuk memahami karakter.' },
      { title: 'Jelajahi diagram 2D', body: 'Tampilan visual menunjukkan Istana Kehidupan, Istana Raga, dan pintu masuk istana pada kisi yang jelas — titik awal yang baik sebelum melihat per istana.' },
      { title: 'Pilih satu istana untuk diperdalam', body: 'Jangan coba membaca semuanya sekaligus. Mulailah dengan istana yang sesuai pertanyaan Anda saat ini — karier, hubungan, atau keuangan.' },
    ],
    tarot: [
      { title: 'Kembali ke pertanyaan dan posisi', body: 'Ingat apa yang Anda tanyakan, lalu lihat di mana setiap kartu berada — masa lalu, sekarang, atau masa depan.' },
      { title: 'Jelajahi spread kartu 2D', body: 'Tampilan visual menunjukkan nama kartu, tegak atau terbalik, kata kunci, dan gaya deck yang Anda pilih.' },
      { title: 'Ubah jawaban menjadi satu tindakan', body: 'Akhiri dengan mengidentifikasi satu langkah yang bisa Anda ambil hari ini. Bacaan paling berguna ketika mendorong Anda maju.' },
    ],
    runes: [
      { title: 'Mulai dengan rune dan orientasinya', body: 'Pesan rune cenderung langsung. Lihat tema inti dulu, lalu apakah menunjuk ke hambatan atau sumber daya.' },
      { title: 'Jelajahi tampilan batu 2D', body: 'Tampilan visual menampilkan setiap rune pada material yang Anda pilih — batu, kayu, atau kristal — memberi nuansa ritual lebih kuat.' },
      { title: 'Tulis satu kalimat tindakan untuk hari ini', body: 'Rangkum hasil menjadi satu pengingat yang bisa Anda lakukan hari ini. Kebiasaan itu membangun alasan paling alami untuk kembali.' },
    ],
    astro: [
      { title: 'Mulai dengan Matahari, Bulan, dan Ascendant', body: 'Matahari menunjukkan niat inti, Bulan menunjukkan kebutuhan emosional, Ascendant menunjukkan cara Anda menghadapi dunia luar.' },
      { title: 'Jelajahi diagram 2D', body: 'Tampilan visual mengubah posisi planet utama menjadi ringkasan diagram agar Anda dapat membangun gambaran keseluruhan sebelum memperbesar detail.' },
      { title: 'Lalu lihat rumah dan aspek', body: 'Saat ingin memahami peristiwa kehidupan tertentu dengan lebih tepat, perdalam penempatan rumah dan aspek planet.' },
    ],
    humandesign: [
      { title: 'Mulai dengan Tipe dan Otoritas', body: 'Tipe Anda membentuk cara Anda terlibat dengan dunia; Otoritas Batin membimbing cara membuat keputusan yang terasa tepat.' },
      { title: 'Jelajahi BodyGraph 2D', body: 'Gunakan BodyGraph 2D yang jelas untuk mengorientasikan diri pada pusat-pusat, saluran, dan gerbang sebelum masuk ke detail.' },
      { title: 'Pilih tiga gerbang aktif untuk dijelajahi', body: 'Pilih tiga gerbang aktif yang paling beresonansi kuat. Tidak perlu mengerjakan semuanya sekaligus.' },
    ],
  },
};

const ja: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: 'ビジュアル結果ステージを準備しています',
    body: '結果は明確な 2D チャート、カードレイアウト、またはストーン面として表示されます。フル AR / 3D は準備ができ次第公開されます。',
  },
  resonance: {
    questionPrefix: '先生に聞く: ',
    understandPrefix: 'まずこう理解してみてください',
  },
  insight: {
    memberNoteKicker: 'メンバーノート',
    memberNoteTitle: '響いたメッセージを集めましょう',
    memberNoteEmpty: 'カードを開いて、真実と感じるものをマークしてください。',
    memberNoteCount: '{count} 件マーク済み — 先生に会う時に戻ってみましょう。',
    cardSubtitleFallback: 'リーディングカード',
    cardExpand: 'リーディングを開く',
    cardCollapse: 'リーディングを閉じる',
    cardResonate: '響きます',
    cardResonated: 'このセッションに追加済み',
    expandAll: 'すべての {count} 枚を表示',
    collapseAll: 'カードをたたむ',
  },
  personalReading: {
    thisReminder: 'あなたへのリマインダー',
    setReminder: 'リマインダーに設定',
    reminderSet: '設定済み',
  },
  game: {
    kicker: 'リーディングマップ',
    title: 'この結果の読み方',
    plainNote: '全ての用語を一度に読む必要はありません。3 ステップで: キーサマリーを読む、ビジュアルチャートを見る、今日試すリマインダーを一つ選ぶ。',
    arLink: 'ビジュアルチャートを見る',
    stepPrefix: 'ステップ',
  },
  nextSteps: {
    kicker: 'リーディングフロー',
    title: '次にすること',
    bookTeacher: '先生を予約する',
    viewHistory: 'リーディング履歴を見る',
  },
  actionPath: {
    kicker: 'メンバーオンボーディング',
    title: '3 つの明確な次のステップ',
    body: 'まず保存し、後で見直し、最も響いた質問を先生に持っていきましょう。',
    saveTitle: 'このリーディングを保存',
    saveLabel: 'ログインして保存',
    dailyTitle: 'デイリーリチュアルに戻る',
    dailyBody: '明日戻ってデイリーカードやルーンを引き、プラットフォームを一度きりのツールではなく安定した伴走者にしましょう。',
    dailyLabel: 'デイリーリチュアル',
    consultTitle: '深いリーディングを予約',
    consultBody: 'カードやチャートの一部が心に刺さったら、その質問を先生に持っていきましょう。',
    consultLabel: '先生を探す',
    footerSave: 'このリーディングを保存',
    footerConsult: '先生を探す',
  },
  unlock: {
    kicker: 'メンバー拡張',
    title: '拡張リーディング',
    body: 'ログインして詳細な説明と日次・月次・年次の拡張リーディングにアクセスできます。無料ツールは既に完全です — これはオプションです。',
    memberStatusLabel: 'メンバーステータス',
    memberLoggedIn: 'ログイン中',
    memberPending: '...',
    memberGuest: '—',
    guestBody: 'ログインして拡張リーディングを閲覧。毎日・毎月・毎年のインサイトはメンバーアカウントに保存されます。',
    guestLogin: 'ログインして閲覧',
    dailyTitle: 'デイリーリチュアル',
    dailyDone: '本日のチェックイン完了。',
    dailyPending: 'デイリーリチュアルを完了して拡張リーディングを解放してください。',
    claimBtn: 'デイリーチェックインを完了',
    claimedBtn: '本日分完了',
    claimingBtn: '処理中...',
    alreadyViewed: '閲覧済み',
    loadingContent: '読み込み中...',
    viewBtn: '{label} を閲覧',
    loadBtn: 'コンテンツを読み込む',
    noticeAlreadyUnlocked: '{label} はすでに閲覧可能です。',
    noticeUnlocked: '{label} コンテンツを読み込みました。',
  },
  ziweiGuide: {
    kicker: '紫微斗数ガイド',
    title: '12 の宮に入る前にこの 3 つを見てください',
    body: '紫微斗数は 12 宮すべてを一度に覚えることではありません。まずメインの軸から始め、次に実際の質問に合う宮に進みましょう。',
    noMajorStar: '主星なし。対宮と四正三合を確認してください。',
    mingGongLabel: '命宮',
    shenGongLabel: '身宮',
    wuxingLabel: '五行局',
    mingGongDesc: '命宮は人生の主軸です。あなたが世界とどのように向き合うかの習慣と、他者が第一印象で感じやすい雰囲気を示します。',
    shenGongDesc: '身宮は着地の方法です。成長するにつれてより多く使うようになる意思決定や責任の担い方、人生の積み上げ方のスタイルを表します。',
    wuxingDesc: '五行局は命盤の地色です。命盤全体のリズムを理解するためのもので、吉凶の判決ではなく、エネルギーの働き方です。',
    questionRoutes: [
      { topic: '恋愛', palace: '夫妻宮', body: '関係パターン、感情的な安全、パートナーの動態。' },
      { topic: '仕事', palace: '官禄宮', body: '仕事スタイル、キャリアの方向、エネルギーを投資する場所。' },
      { topic: '財務', palace: '財帛宮', body: '稼ぎ方、リソースの流れ、財務的なプレッシャー。' },
      { topic: '家族', palace: '田宅 / 父母 / 兄弟', body: '家族のサポート、ホームの感覚、親しい関係。' },
      { topic: '外部', palace: '遷移宮', body: '外での発展、パートナーシップ、環境の変化。' },
    ],
  },
  palaceNoStar: '主星なし。対宮と四正三合を確認してください。',
  disclaimer: '結果は自己探求のためのみであり、いかなる診断、治療、医療上または専門的な心理的アドバイスも構成しません。身体的または精神的な苦痛を経験している場合は、専門的なサポートを求めてください。',
  error: {
    title: 'リーディング失敗',
    apiHint: 'バックエンド API が実行中か確認するか、後ほど再送信してください。',
  },
  loading: {
    label: 'リーディングを準備しています...',
  },
  notices: {
    insufficientPoints: 'ただいまご覧いただけません。明日戻るか、デイリーリチュアルを先に完了してください。',
    notAuthenticated: '拡張コンテンツを閲覧するにはログインしてください。',
    generic: 'エラーが発生しました。もう一度お試しください。',
    claimSuccess: 'デイリーチェックイン完了。拡張コンテンツを閲覧できます。',
    claimAlready: '本日はすでにチェックイン済みです。明日また来てください。',
    signInFirst: '拡張コンテンツを閲覧する前にデイリーリチュアルを完了してください。',
  },
  unlockOptions: {
    deep_reading: {
      label: '詳細リーディング',
      title: '完全な解説を見る',
      body: 'より完全な平易な解説を読む: 強み、詰まりポイント、今注意すべきこと、今日できる小さなアクション。',
    },
    transit_day: {
      label: '日次トランジット',
      title: '今日の日次トランジットを見る',
      body: '今日この結果をどう活かすか: どこで前進できるか、どこでペースを落とすか、感情に判断させないために。',
    },
    transit_month: {
      label: '月次トランジット',
      title: '今月のトランジットリーディングを見る',
      body: '今月のテーマ: 着実に積み上げるべきこと、消耗を避けること、毎週チェックする方向性。',
    },
    transit_year: {
      label: '年次トランジット',
      title: '今年のトランジットリーディングを見る',
      body: '今年の全体像: 長期投資に値するもの、調整すべき習慣、年を歩きやすい段階に分ける方法。',
    },
  },
  nextStepsTools: {
    numerology: [
      { title: 'まずコアナンバーから', body: 'ライフパスナンバー、バースデーナンバー、アーキタイプを先に見てから、普段の行動パターンへ戻りましょう。' },
      { title: '2D ビジュアルチャートを確認', body: 'ビジュアル表示がコアナンバーをまとめた儀式的なチャートを作ります。深く読む前にデバイス上で読みやすいことを確認してください。' },
      { title: 'リアルなテーマに結びつける', body: 'キャリア・関係・年のテーマを深く探りたいなら、この結果を持って先生に相談してみましょう。' },
    ],
    maya: [
      { title: '刺さる一文を見つける', body: '用語から入らないで。「調子がいいときどう動くか、詰まるとどう反応するか」の部分を先に読んで、響いたら続けましょう。' },
      { title: 'オラクルボードのつながりを見る', body: '本命が主軸、ガイダンスが次の一歩、サポートが補給、チャレンジが詰まり、ヒドゥンパワーが低潮期に現れるもの。その後 2D 表示でどう相互作用するかを確認しましょう。' },
      { title: '今日ひとつだけ小さな実験を', body: '結果を 24 時間以内にできる行動に変えましょう：何か言う、手放す、境界を整える。自分の感覚やフィードバックをそのまま観察してください。' },
    ],
    bazi: [
      { title: 'まず日主と五行から', body: '日主は世界に対するあなたの基本的な質を示します。五行の分布はリソースとプレッシャーの出どころを教えてくれます。' },
      { title: '2D 四柱盤を確認', body: 'ビジュアル表示は四柱と五行をわかりやすい図像にまとめ、命盤の全体構造を把握しやすくします。' },
      { title: '実際の場面と結びつける', body: '八字はキャリアのリズム、関係の動き、長期的な意思決定の探求に向いています。具体的な問いを持ってくると深く読めます。' },
    ],
    ziwei: [
      { title: 'まず命宮と身宮から', body: '命宮は人生の主軸、身宮はそのエネルギーが実際に着地する方法。主星と組み合わせて性格を理解しましょう。' },
      { title: '2D 命盤を確認', body: 'ビジュアル表示は命宮・身宮・宮位の入り口を明確なグリッドで表示します。宮位ごとに読む前の良い出発点です。' },
      { title: '一つの宮位を深く読む', body: '全部一度に読もうとしないで。今の問い（キャリア・関係・財務）に合う宮位から始めましょう。' },
    ],
    tarot: [
      { title: '問いと位置に戻る', body: '何を聞いたかを思い出してから、各カードがどの位置（過去・現在・未来）にあるかを見ましょう。' },
      { title: '2D カードスプレッドを確認', body: 'ビジュアル表示はカード名、正逆位、キーワード、選んだデッキスタイルを表示します。' },
      { title: '答えを一つの行動に変える', body: '今日できる一歩を特定して終わりましょう。リーディングは前へ進む力になってこそ役立ちます。' },
    ],
    runes: [
      { title: 'まずルーンと向きから', body: 'ルーンのメッセージはたいてい直接的です。まずコアテーマを見て、障害を指しているのかリソースを指しているのかを確認しましょう。' },
      { title: '2D ストーン表示を確認', body: 'ビジュアル表示は選んだ素材（石・木・クリスタル）でルーンを描き出し、儀式感のある読み方ができます。' },
      { title: '今日の行動文を一つ書く', body: '結果を今日実行できるひとつのリマインダーに凝縮しましょう。その習慣が自然な再訪の動機になります。' },
    ],
    astro: [
      { title: 'まず太陽・月・アセンダントから', body: '太陽はコアの意志、月は感情的なニーズ、アセンダントは外の世界との出会い方を示します。' },
      { title: '2D チャートを確認', body: 'ビジュアル表示は主要な惑星の配置をチャートサマリーにまとめ、細部に入る前に全体感を掴めます。' },
      { title: 'それからハウスとアスペクトへ', body: 'より具体的な人生の出来事を理解したいときに、ハウスの配置と惑星アスペクトを深く見ていきましょう。' },
    ],
    humandesign: [
      { title: 'まずタイプと権威から', body: 'タイプは世界との関わり方を形作り、内なる権威は自分らしい意思決定の方法を示します。' },
      { title: '2D BodyGraph を確認', body: '明確な 2D BodyGraph でセンター・チャンネル・ゲートを把握してから、詳細に入りましょう。' },
      { title: '共鳴する3つのゲートを選んで深く読む', body: '最も強く響いた活性化ゲートを3つ選びましょう。すべてを一度にこなす必要はありません。' },
    ],
  },
};

const ko: ToolResultCopy = {
  arLoading: {
    kicker: 'VISUAL RESULT STAGE',
    title: '비주얼 결과 스테이지 준비 중',
    body: '결과는 명확한 2D 차트, 카드 레이아웃 또는 돌 면으로 표시됩니다. 전체 AR / 3D는 준비되면 열립니다.',
  },
  resonance: {
    questionPrefix: '선생님께 물어보세요: ',
    understandPrefix: '이렇게 시작하면 좋아요',
  },
  insight: {
    memberNoteKicker: '멤버 노트',
    memberNoteTitle: '공명하는 메시지를 모으세요',
    memberNoteEmpty: '카드를 열고 진실하다고 느끼는 것을 표시하세요.',
    memberNoteCount: '{count}개 표시됨 — 선생님을 만날 때 다시 확인하세요.',
    cardSubtitleFallback: '리딩 카드',
    cardExpand: '리딩 열기',
    cardCollapse: '리딩 닫기',
    cardResonate: '공명합니다',
    cardResonated: '이 세션에 추가됨',
    expandAll: '전체 {count}개 카드 표시',
    collapseAll: '카드 접기',
  },
  personalReading: {
    thisReminder: '나의 알림',
    setReminder: '알림으로 설정',
    reminderSet: '설정 완료',
  },
  game: {
    kicker: '리딩 맵',
    title: '이 결과 읽는 방법',
    plainNote: '모든 용어를 한 번에 읽을 필요는 없습니다. 세 단계를 따라가세요: 핵심 요약 읽기, 비주얼 차트 보기, 오늘 시도할 알림 하나 선택.',
    arLink: '비주얼 차트 보기',
    stepPrefix: '단계',
  },
  nextSteps: {
    kicker: '리딩 흐름',
    title: '다음에 할 일',
    bookTeacher: '선생님 예약',
    viewHistory: '리딩 기록 보기',
  },
  actionPath: {
    kicker: '멤버 온보딩',
    title: '세 가지 명확한 다음 단계',
    body: '먼저 저장하고, 나중에 다시 방문하고, 가장 인상 깊은 질문을 선생님에게 가져가 더 깊은 세션을 받으세요.',
    saveTitle: '이 리딩 저장',
    saveLabel: '로그인하고 저장',
    dailyTitle: '일일 의식으로 돌아가기',
    dailyBody: '내일 돌아와 일일 카드나 룬을 뽑아 플랫폼을 일회성 도구가 아닌 안정적인 동반자로 만드세요.',
    dailyLabel: '일일 의식',
    consultTitle: '더 깊은 리딩 예약',
    consultBody: '카드나 차트 섹션이 정말 와닿았다면, 그 질문을 선생님에게 가져가세요.',
    consultLabel: '선생님 찾기',
    footerSave: '이 리딩 저장',
    footerConsult: '선생님 찾기',
  },
  unlock: {
    kicker: '멤버 확장',
    title: '확장 리딩',
    body: '로그인하여 심층 설명과 일간, 월간, 연간 확장 리딩에 액세스하세요. 무료 도구는 이미 완전합니다 — 이것은 선택 사항입니다.',
    memberStatusLabel: '멤버 상태',
    memberLoggedIn: '로그인됨',
    memberPending: '...',
    memberGuest: '—',
    guestBody: '로그인하여 확장 리딩을 볼 수 있습니다. 일간, 월간, 연간 인사이트는 멤버 계정에 저장됩니다.',
    guestLogin: '로그인하여 보기',
    dailyTitle: '일일 의식',
    dailyDone: '오늘의 체크인 완료.',
    dailyPending: '일일 의식을 완료하여 확장 리딩을 열어보세요.',
    claimBtn: '일일 체크인 완료',
    claimedBtn: '오늘 완료',
    claimingBtn: '처리 중...',
    alreadyViewed: '이미 봄',
    loadingContent: '로딩 중...',
    viewBtn: '{label} 보기',
    loadBtn: '콘텐츠 불러오기',
    noticeAlreadyUnlocked: '{label}은 이미 볼 수 있습니다.',
    noticeUnlocked: '{label} 콘텐츠가 로드되었습니다.',
  },
  ziweiGuide: {
    kicker: '자미두수 가이드',
    title: '12궁에 들어가기 전에 세 가지를 보세요',
    body: '자미두수는 모든 12궁을 한 번에 외우는 것이 아닙니다. 주 축부터 시작한 후 실제 질문에 맞는 궁으로 이동하세요.',
    noMajorStar: '주성 없음. 반대 궁과 사정삼합을 확인하세요.',
    mingGongLabel: '명궁',
    shenGongLabel: '신궁',
    wuxingLabel: '오행국',
    mingGongDesc: '명궁은 인생의 주축과 같습니다. 당신이 세상을 대하는 습관과 타인이 처음에 쉽게 느끼는 분위기를 나타냅니다.',
    shenGongDesc: '신궁은 착지 방식과 같습니다. 성장하면서 점점 더 자주 사용하게 되는 선택 방식, 책임 수용, 인생 축적의 방법을 보여줍니다.',
    wuxingDesc: '오행국은 명반의 바탕색입니다. 명반 전체의 리듬을 이해하는 데 도움을 주며, 길흉의 판결이 아니라 에너지가 작용하는 방식입니다.',
    questionRoutes: [
      { topic: '연애', palace: '부처궁', body: '관계 패턴, 감정 안전, 파트너 역학.' },
      { topic: '커리어', palace: '관록궁', body: '업무 스타일, 커리어 방향, 에너지를 투자할 곳.' },
      { topic: '재정', palace: '재백궁', body: '수입 방식, 자원 흐름, 재정 압박.' },
      { topic: '가족', palace: '전택 / 부모 / 형제', body: '가족 지원, 집의 감각, 친밀한 관계.' },
      { topic: '외부', palace: '천이궁', body: '집 밖에서의 발전, 파트너십, 환경 변화.' },
    ],
  },
  palaceNoStar: '주성 없음. 반대 궁과 사정삼합을 확인하세요.',
  disclaimer: '결과는 자기 탐구용으로만 사용되며, 진단, 치료, 의료 또는 전문적인 심리적 조언을 구성하지 않습니다. 신체적 또는 정신적 어려움을 겪고 있다면 전문적인 지원을 구하세요.',
  error: {
    title: '리딩 실패',
    apiHint: '백엔드 API가 실행 중인지 확인하거나 나중에 다시 제출해 보세요.',
  },
  loading: {
    label: '리딩 준비 중...',
  },
  notices: {
    insufficientPoints: '지금 볼 수 없습니다. 내일 다시 오거나 먼저 일일 의식을 완료하세요.',
    notAuthenticated: '확장 콘텐츠를 보려면 로그인하세요.',
    generic: '오류가 발생했습니다. 다시 시도해 주세요.',
    claimSuccess: '일일 체크인 완료. 확장 콘텐츠를 볼 수 있습니다.',
    claimAlready: '오늘 이미 체크인했습니다. 내일 다시 오세요.',
    signInFirst: '확장 콘텐츠를 보기 전에 일일 의식을 완료하세요.',
  },
  unlockOptions: {
    deep_reading: {
      label: '심층 리딩',
      title: '전체 해석 보기',
      body: '더 완전한 쉬운 언어 해석 읽기: 강점, 막힌 지점, 지금 주의할 것, 오늘 할 수 있는 작은 행동.',
    },
    transit_day: {
      label: '일간 트랜짓',
      title: '오늘의 일간 트랜짓 보기',
      body: '오늘 이 결과를 어떻게 활용할지: 어디서 앞으로 나아갈 수 있고, 어디서 천천히 해야 하며, 감정이 결정을 내리지 않도록.',
    },
    transit_month: {
      label: '월간 트랜짓',
      title: '이번 달 트랜짓 리딩 보기',
      body: '이번 달 주제: 꾸준히 쌓을 것, 소모를 피할 것, 매주 확인할 방향.',
    },
    transit_year: {
      label: '연간 트랜짓',
      title: '올해 트랜짓 리딩 보기',
      body: '올해 큰 그림: 장기 투자할 가치가 있는 것, 조정해야 할 습관, 한 해를 걷기 좋은 단계로 나누는 방법.',
    },
  },
  nextStepsTools: {
    numerology: [
      { title: '핵심 숫자부터 시작', body: '생명수, 생일수, 원형을 먼저 보고 — 평소 행동 패턴으로 돌아가 이해하세요.' },
      { title: '2D 비주얼 차트 탐색', body: '비주얼 화면이 핵심 숫자를 의식적인 차트로 정리합니다. 더 깊이 읽기 전에 기기에서 잘 보이는지 확인하세요.' },
      { title: '실제 상황과 연결', body: '커리어, 관계, 연간 주제를 더 탐구하고 싶다면, 이 결과를 가지고 선생님과 깊은 대화를 나눠보세요.' },
    ],
    maya: [
      { title: '공명하는 문장 찾기', body: '용어부터 시작하지 마세요. 잘 흘러갈 때 어떻게 움직이는지, 막힐 때 어떻게 반응하는지 설명하는 부분을 먼저 읽고 공명하면 계속 읽어보세요.' },
      { title: '오라클 보드가 어떻게 연결되는지 보기', body: '출생 인장은 주축, 가이드는 다음 단계, 서포트는 자원, 도전은 막힌 지점, 숨겨진 힘은 힘든 순간에 떠오르는 것. 이후 2D 화면에서 다섯 위치가 어떻게 상호작용하는지 확인하세요.' },
      { title: '오늘 작은 실험 하나만', body: '결과를 24시간 내 실행 가능한 행동 하나로 바꿔보세요: 뭔가 말하거나, 뭔가 내려놓거나, 경계 하나를 정하세요. 자신의 느낌과 반응을 그대로 관찰해보세요.' },
    ],
    bazi: [
      { title: '일주와 오행부터 시작', body: '일주는 세상에서 당신의 기본적인 질을 나타냅니다. 오행 분포는 자원과 압박이 어디서 오는지 알려줍니다.' },
      { title: '2D 사주 차트 탐색', body: '비주얼 화면이 사주와 오행을 읽기 쉬운 이미지로 정리해 전체 구조를 파악하기 쉽게 합니다.' },
      { title: '실제 상황과 연결', body: '사주는 커리어 리듬, 관계 역학, 장기 결정 탐구에 잘 맞습니다. 구체적인 질문을 가져오면 더 깊이 읽을 수 있습니다.' },
    ],
    ziwei: [
      { title: '명궁과 신궁부터 시작', body: '명궁은 주축, 신궁은 그 에너지가 실제로 착지하는 방식. 주성과 결합해 성격을 이해하세요.' },
      { title: '2D 명반 탐색', body: '비주얼 화면이 명궁, 신궁, 궁위 입구를 명확한 격자로 표시합니다. 궁위별로 읽기 전 좋은 출발점입니다.' },
      { title: '한 궁위를 골라 깊이 읽기', body: '한 번에 모두 읽으려 하지 마세요. 지금 질문(커리어, 관계, 재정)에 맞는 궁위부터 시작하세요.' },
    ],
    tarot: [
      { title: '질문과 위치로 돌아가기', body: '무엇을 물었는지 떠올리고, 각 카드가 어느 위치(과거, 현재, 미래)에 있는지 보세요.' },
      { title: '2D 카드 스프레드 탐색', body: '비주얼 화면이 카드 이름, 정방향/역방향, 키워드, 선택한 덱 스타일을 보여줍니다.' },
      { title: '답을 행동 하나로 바꾸기', body: '오늘 할 수 있는 한 걸음을 찾아 마무리하세요. 리딩은 앞으로 나아가게 할 때 가장 유용합니다.' },
    ],
    runes: [
      { title: '룬과 방향부터 시작', body: '룬 메시지는 대체로 직접적입니다. 핵심 테마를 먼저 보고, 장애물을 가리키는지 자원을 가리키는지 확인하세요.' },
      { title: '2D 돌 화면 탐색', body: '비주얼 화면이 선택한 재질(돌, 나무, 크리스탈)로 각 룬을 렌더링해 더 의식적인 느낌을 줍니다.' },
      { title: '오늘의 실행 문장 하나 쓰기', body: '결과를 오늘 실행 가능한 리마인더 하나로 압축하세요. 그 습관이 자연스러운 재방문 동기가 됩니다.' },
    ],
    astro: [
      { title: '태양, 달, 어센던트부터 시작', body: '태양은 핵심 의지, 달은 감정적 필요, 어센던트는 외부 세계와 만나는 방식을 보여줍니다.' },
      { title: '2D 차트 탐색', body: '비주얼 화면이 주요 행성 위치를 차트 요약으로 변환해, 세부 사항에 들어가기 전에 전체적인 감을 잡을 수 있습니다.' },
      { title: '그 다음 하우스와 어스펙트 보기', body: '특정 인생 사건을 더 정확하게 이해하고 싶을 때, 하우스 배치와 행성 어스펙트를 깊이 살펴보세요.' },
    ],
    humandesign: [
      { title: '타입과 권위부터 시작', body: '타입은 세계와 관계 맺는 방식을 형성하고, 내면 권위는 자신에게 맞는 결정 방법을 안내합니다.' },
      { title: '2D BodyGraph 탐색', body: '명확한 2D BodyGraph로 센터, 채널, 게이트를 파악한 후 세부 사항에 들어가세요.' },
      { title: '공명하는 게이트 3개 골라 탐구', body: '가장 강하게 공명하는 활성화된 게이트 3개를 선택하세요. 모든 것을 한 번에 다룰 필요는 없습니다.' },
    ],
  },
};

const allCopies: Record<Locale, ToolResultCopy> = {
  'zh-TW': zhTW,
  en,
  vi,
  id,
  ja,
  ko,
};

export function getToolResultCopy(locale: Locale): ToolResultCopy {
  return allCopies[locale] ?? allCopies[DEFAULT_LOCALE];
}
